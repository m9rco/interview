# 9 年后台经验归档 · VuePress 站点
# 用法：make <target>，或直接 make 查看帮助

.DEFAULT_GOAL := help
.PHONY: help install dev build build-pages build-cos preview clean deploy-cos pages-enable pages-status ci-watch

NPM ?= npm
DIST := docs/.vuepress/dist
REPO := m9rco/interview

help: ## 显示本帮助
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## 安装依赖
	$(NPM) install

dev: ## 本地预览（热更新）
	$(NPM) run docs:dev

build: build-pages ## 构建（默认 Pages 目标）

build-pages: ## 构建 Pages 目标（base=/interview/）
	$(NPM) run docs:build:pages

build-cos: ## 构建 COS 目标（base=/，interview.0x06.cn）
	$(NPM) run docs:build:cos

preview: build-pages ## 构建后按 base 路径本地预览（http://localhost:4174/interview/）
	@rm -rf /tmp/vp-preview && mkdir -p /tmp/vp-preview/interview
	@cp -r $(DIST)/* /tmp/vp-preview/interview/
	@echo "预览： http://localhost:4174/interview/  （Ctrl-C 结束）"
	@cd /tmp/vp-preview && python3 -m http.server 4174

clean: ## 清理构建产物与缓存
	$(NPM) run docs:clean

deploy-cos: ## 本地发布到腾讯云 COS（需 .cos.conf 或环境变量）
	./scripts/deploy-cos.sh

pages-enable: ## 启用 GitHub Pages（source=GitHub Actions）
	gh api -X POST repos/$(REPO)/pages \
		-f 'build_type=workflow' \
		|| gh api -X PUT repos/$(REPO)/pages -f 'build_type=workflow'

pages-status: ## 查看 GitHub Pages 状态与地址
	gh api repos/$(REPO)/pages

ci-watch: ## 跟踪最近一次 Actions 运行
	gh run watch $$(gh run list --repo $(REPO) --limit 1 --json databaseId --jq '.[0].databaseId')
