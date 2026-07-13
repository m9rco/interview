#!/usr/bin/env bash
# 本地发布：构建 COS 目标产物并同步到腾讯云 COS（绑定域名 interview.0x06.cn，根路径）。
#
# 密钥绝不入库：从环境变量读取，或从被 .gitignore 排除的 .cos.conf。
#   必需环境变量：
#     COS_SECRET_ID     腾讯云 SecretId
#     COS_SECRET_KEY    腾讯云 SecretKey
#     COS_BUCKET        桶名，形如 interview-1250000000
#     COS_REGION        地域，如 ap-guangzhou
#
# 用法：
#   COS_SECRET_ID=xxx COS_SECRET_KEY=yyy COS_BUCKET=zzz COS_REGION=ap-guangzhou ./scripts/deploy-cos.sh
#   或先 `cp .cos.conf.example .cos.conf` 填好再直接运行 ./scripts/deploy-cos.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# 载入本机凭据（若存在），该文件被 .gitignore 排除
if [ -f "$ROOT/.cos.conf" ]; then
  # shellcheck disable=SC1091
  set -a; . "$ROOT/.cos.conf"; set +a
fi

: "${COS_SECRET_ID:?需要 COS_SECRET_ID}"
: "${COS_SECRET_KEY:?需要 COS_SECRET_KEY}"
: "${COS_BUCKET:?需要 COS_BUCKET}"
: "${COS_REGION:?需要 COS_REGION}"

DIST="$ROOT/docs/.vuepress/dist"

echo "==> [1/4] 构建 COS 目标产物（base=/）"
npm run docs:build:cos

echo "==> [2/4] 校验构建产物"
if [ ! -f "$DIST/index.html" ] || [ ! -d "$DIST/assets" ]; then
  echo "构建产物不完整（缺 index.html 或 assets/），中止发布。" >&2
  exit 1
fi

echo "==> [3/4] 配置 coscmd"
# 依赖 coscmd：pip install coscmd
coscmd config -a "$COS_SECRET_ID" -s "$COS_SECRET_KEY" -b "$COS_BUCKET" -r "$COS_REGION" >/dev/null

# 发布顺序：先传带 hash 的静态资源（长缓存），最后覆盖入口 HTML（短缓存），
# 降低发布过程中"新 index 引用尚未上传的 chunk"导致的 404。
echo "==> [4/4] 同步到 COS（先资源后 HTML）"

# 4.1 先上传除 *.html 外的所有静态资源，长缓存
coscmd upload -rs \
  --ignore "*.html" \
  -H '{"Cache-Control":"public, max-age=31536000, immutable"}' \
  "$DIST/" / >/dev/null
echo "    静态资源已上传（长缓存）"

# 4.2 最后上传 HTML，短缓存，覆盖入口
coscmd upload -rs \
  --include "*.html" \
  -H '{"Cache-Control":"public, max-age=60, must-revalidate"}' \
  "$DIST/" / >/dev/null
echo "    HTML 已覆盖（短缓存）"

echo "==> 完成：https://interview.0x06.cn/"
