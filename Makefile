.PHONY: install test clean schemas generate-stadiums

COUNT ?= 125

install:
	npm install

test:
	npm test

schemas:
	npm run schemas --workspace=@sjge/core

generate-stadiums:
	node products/baseball/bin/generate-stadiums.js --numStadiums $(COUNT)

clean:
	npm run --workspaces --if-present clean
