/**
 * @module scripts/emit-schemas
 * Emits `*.schema.json` documents next to the stadium source files.
 */
import {writeFileSync} from 'node:fs';
import {baseballStadiumSchema} from '../src/stadium/baseballStadiumSchema.js';

const out = new URL('../src/stadium/baseballStadiumSchema.schema.json', import.meta.url);
writeFileSync(out, JSON.stringify({$jsonSchema: baseballStadiumSchema}, null, 2) + '\n');
console.log(`wrote ${out.pathname}`);
