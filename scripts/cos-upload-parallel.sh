#!/usr/bin/env bash
# 并发上传 VuePress 产物到腾讯云 COS（coscmd + xargs -P 多进程）。
#
# 为什么这样做：coscmd 对整目录是逐文件串行上传，本站大量小文件时极慢。
# 这里按文件用 `xargs -P N` 并行起多个 coscmd 进程，并发数可控。
#
# 健壮性：每个文件失败自动重试（默认 3 次，退避 1s/2s），仍失败才记入失败清单；
# 全批跑完后若有失败则打印明细并退出非零，便于在 CI 日志里定位是哪个文件/什么错误。
#
# 前置条件（调用方负责）：
#   - 已执行 `coscmd config -a ... -s ... -b ... -r ...`（写入 ~/.cos.conf）
#   - 已构建出产物目录（含 index.html 与 assets/）
#
# 用法：  bash scripts/cos-upload-parallel.sh <dist-dir>
# 环境变量：
#   COS_CONCURRENCY  并发进程数（xargs -P），默认 8
#   COS_RETRY        单文件最大重试次数，默认 3
set -uo pipefail

DIST="${1:?用法: cos-upload-parallel.sh <dist-dir>}"
DIST="${DIST%/}"                    # 去掉可能的结尾斜杠，保证前缀裁剪一致
CONCURRENCY="${COS_CONCURRENCY:-4}"
RETRY="${COS_RETRY:-3}"

# 两级缓存策略（沿用已验证的 -H 头格式）：
#   静态资源带 hash → 长缓存 immutable；HTML 入口 → 短缓存 must-revalidate。
export LONG_CACHE='{"Cache-Control":"public, max-age=31536000, immutable"}'
export SHORT_CACHE='{"Cache-Control":"public, max-age=60, must-revalidate"}'
export DIST RETRY

# 失败清单（各并发进程追加写入，行级追加对 append 是原子的）
FAIL_LOG="$(mktemp)"
export FAIL_LOG

# 单文件上传：$1=本地文件 $2=Cache-Control 头（JSON 串）
# 计算相对 DIST 的 key，保留目录结构。
# 注意：不加 -s（--sync）。coscmd 的 sync 依赖共享本地状态，多进程并发下会互相
# 干扰导致随机失败；这里每次全量覆盖上传（资源名带 hash，本就极少变更）。
# 失败重试 RETRY 次；最终失败则把错误写入 FAIL_LOG 并打到 stderr（便于 CI 定位）。
upload_one() {
  local f="$1" header="$2"
  local key="${f#"$DIST"/}"
  local attempt out
  for (( attempt = 1; attempt <= RETRY; attempt++ )); do
    if out="$(coscmd upload -H "$header" "$f" "/$key" 2>&1)"; then
      return 0
    fi
    (( attempt < RETRY )) && sleep "$attempt"   # 线性退避：1s, 2s, ...
  done
  {
    echo "FAILED /$key"
    printf '%s\n' "$out" | tail -n 4 | sed 's/^/    /'
  } >>"$FAIL_LOG"
  printf '!! 上传失败(重试 %d 次仍失败): /%s\n' "$RETRY" "$key" >&2
  printf '%s\n' "$out" | tail -n 4 >&2
  return 1
}
export -f upload_one

# 并发跑一批文件；不因单文件失败而中断整批（失败已记入 FAIL_LOG）。
# 用 bash -c 时：$0=_（占位）$1=header 值  $2=文件（xargs -n1 追加在末尾）。
run_batch() {                       # $1=header 值  其余=find 谓词
  local header="$1"; shift
  find "$DIST" -type f "$@" -print0 \
    | xargs -0 -P "$CONCURRENCY" -n1 \
        bash -c 'upload_one "$2" "$1"' _ "$header" || true
}

# 打印 coscmd 自身日志尾部（coscmd 把错误详情写到日志文件而非控制台，
# 故并发失败时控制台捕获为空——这里兜底把日志翻出来便于定位真实原因）。
dump_coscmd_log() {
  local lp
  for lp in "$HOME/.cos.log" /tmp/coscmd.log "$HOME/.coscmd.log" ./coscmd.log; do
    if [ -f "$lp" ]; then
      echo "----- coscmd 日志 $lp (末尾 40 行) -----" >&2
      tail -n 40 "$lp" >&2
      return 0
    fi
  done
  echo "（未找到 coscmd 日志文件）" >&2
}

# 关键顺序：先并发传静态资源，确认全部成功后再并发覆盖 HTML，
# 避免"新 index 引用尚未上传的 chunk"导致的 404。
echo "==> 并发上传静态资源（长缓存, -P ${CONCURRENCY}, 重试 ${RETRY}）"
run_batch "$LONG_CACHE" ! -name '*.html'
if [ -s "$FAIL_LOG" ]; then
  echo "==> 静态资源存在上传失败，终止（不覆盖 HTML，避免线上 404）：" >&2
  cat "$FAIL_LOG" >&2
  dump_coscmd_log
  exit 1
fi

echo "==> 并发上传 HTML（短缓存, -P ${CONCURRENCY}, 重试 ${RETRY}）"
run_batch "$SHORT_CACHE" -name '*.html'
if [ -s "$FAIL_LOG" ]; then
  echo "==> HTML 存在上传失败：" >&2
  cat "$FAIL_LOG" >&2
  dump_coscmd_log
  exit 1
fi

echo "==> COS 上传完成"
