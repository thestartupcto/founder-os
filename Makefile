VERSION := $(shell node -p "require('./package.json').version")
PLATFORM := $(shell uname -s | tr '[:upper:]' '[:lower:]')

.PHONY: dev setup build build-backend build-app release patch minor bump-patch bump-minor clean

# ── Dev ──────────────────────────────────────────
dev:
	npm start

setup:
	npm install
	pip3 install -r backend/requirements.txt
	pip3 install -r requirements-build.txt

# ── Build ─────────────────────────────────────────
build: build-backend build-app

build-backend:
	pyinstaller founder-os-backend.spec --clean --noconfirm

build-app:
	npx electron-builder --$(PLATFORM)

# ── Release (daily) ──────────────────────────────
# Usage: make release        (patch bump: 0.1.0 -> 0.1.1)
#        make release BUMP=minor  (0.1.0 -> 0.2.0)
BUMP ?= patch

release: bump-$(BUMP) build
	@NEW_VERSION=$$(node -p "require('./package.json').version"); \
	echo "Releasing v$$NEW_VERSION..."; \
	gh release create "v$$NEW_VERSION" \
		--title "v$$NEW_VERSION" \
		--generate-notes \
		dist/*/FounderOS*.dmg \
		dist/*/FounderOS*.exe \
		dist/*/FounderOS*.AppImage \
		dist/*/FounderOS*.zip \
		2>/dev/null || true; \
	echo "Released v$$NEW_VERSION"

bump-patch:
	npm version patch --no-git-tag-version

bump-minor:
	npm version minor --no-git-tag-version

# ── Clean ─────────────────────────────────────────
clean:
	rm -rf dist build __pycache__ backend/__pycache__ backend/routers/__pycache__
