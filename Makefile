install:
	npm link rss-news-feed

publish:
	npm publish --dry-run

lint:
	npx eslint .

dev:
	npm run dev

build:
	npm run build