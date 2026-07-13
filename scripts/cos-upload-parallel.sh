#!/usr/bin/env bash
# 并发上传 VuePress 产物到腾讯云 COS（coscmd + xargs -P 多进程）。
#
# 为什么这样做：coscmd 对整目录是逐文件串行上传，本站大量小文件时极慢。
# 这里按文件用 `xargs -P N` 并行起多个 coscmd 进程，并发数可控。
#
# 前置条件（调用方负责）：
#   - 已执行 `coscmd config -a ... -s ... -b ... -r ...`（写入 ~/.cos.conf）
#   - 已构建出产物目录（含 index.html 与 assets/）
#
# 用法：  bash scripts/cos-upload-parallel.sh <dist-dir>
# 并发数：环境变量 COS_CONCURRENCY 控制（默认 8）
set -euo pipefail

DIST="${1:?用法: cos-upload-parallel.sh <dist-dir>}"
DIST="${DIST%/}"                    # 去掉可能的结尾斜杠，保证前缀裁剪一致
CONCURRENCY="${COS_CONCURRENCY:-8}"

# 两级缓存策略（沿用已验证的 -H 头格式）：
#   静态资源带 hash → 长缓存 immutable；HTML 入口 → 短缓存 must-revalidate。
export LONG_CACHE='{"Cache-Control":"public, max-age=31536000, immutable"}'
export SHORT_CACHE='{"Cache-Control":"public, max-age=60, must-revalidate"}'
export DIST

# 单文件上传：$1=本地文件绝对/相对路径 $2=Cache-Control 头（JSON 串）
# 计算相对 DIST 的 key，保留目录结构；-s 跳过内容未变更的文件。
upload_one() {
  local f="$1" header="$2"
  local key="${f#"$DIST"/}"
  coscmd upload -s -H "$header" "$f" "/$key" >/dev/null
}
export -f upload_one

# 关键顺序：先并发传静态资源，全部完成后再并发覆盖 HTML，
# 避免"新 index 引用尚未上传的 chunk"导致的 404。
echo "==> 并发上传静态资源（长缓存, -P ${CONCURRENCY}）"
find "$DIST" -type f ! -name '*.html' -print0 \
  | xargs -0 -P "$CONCURRENCY" -n1 bash -c 'upload_one "$@" "$LONG_CACHE"' _

echo "==> 并发上传 HTML（短缓存, -P ${CONCURRENCY}）"
find "$DIST" -type f -name '*.html' -print0 \
  | xargs -0 -P "$CONCURRENCY" -n1 bash -c 'upload_one "$@" "$SHORT_CACHE"' _

echo "==> COS 上传完成"
