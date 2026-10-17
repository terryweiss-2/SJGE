.PHONY: install test clean

install:
	npm install

test:
	npm test

clean:
	npm run --workspaces --if-present clean
