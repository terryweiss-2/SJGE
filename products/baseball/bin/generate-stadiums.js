#!/usr/bin/env node
/**
 * @module bin/generate-stadiums
 * CLI: tops up `assets/stadiums/stadiums.yaml` to `--numStadiums <n>` / `-n <n>` stadiums (default 125),
 * writes missing `<id>.svg` images and deletes orphan SVGs.
 */
import {fileURLToPath} from 'node:url';
import {getLogger, loadConfig} from '@sjge/lib';
import {DEFAULT_STADIUMS_DIR, resolveCount, syncStadiums} from '../src/stadium/stadiumStore.js';

const log = getLogger('generate-stadiums');
const config = loadConfig();
const count = resolveCount(config);
const dir = fileURLToPath(DEFAULT_STADIUMS_DIR);

const result = syncStadiums({dir, count});
log.info(
    `Stadiums: ${result.total} total, ${result.added} generated, ${result.svgsWritten} SVG(s) written, ` +
    `${result.orphansDeleted.length} orphan SVG(s) deleted`,
);
