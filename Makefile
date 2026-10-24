.PHONY: install test clean schemas

install:
	npm install

test:
	npm test

schemas:
	npm run schemas --workspace=@sjge/core

clean:
	npm run --workspaces --if-present clean
