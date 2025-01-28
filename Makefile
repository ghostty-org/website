SHELL := /usr/bin/env bash

.PHONY: dev
dev: node_modules/.installed .env.local
	source .env.local && npm run dev

node_modules/.installed: package.json
	npm i && touch node_modules/.installed

.env.local:
	cp .env.sample .env.local

.PHONY: sync-webdata
sync-webdata:
	test -d "$(GHOSTTY_BUILD_DIR)"  # if this fails, set GHOSTTY_BUILD_DIR to the ghostty output directory
	cp $(GHOSTTY_BUILD_DIR)/share/ghostty/webdata/config.mdx ./docs/config/reference.mdx
	cp $(GHOSTTY_BUILD_DIR)/share/ghostty/webdata/actions.mdx ./docs/config/keybind/reference.mdx

# ====================================
# ======= Docker Configuration =======
# ====================================

.PHONY: docker
docker: .env.local docker-build
	source .env.local && docker compose up

.PHONY: docker-build
docker-build:
	docker compose build
