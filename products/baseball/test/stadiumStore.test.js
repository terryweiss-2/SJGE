import t from 'tap';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {
    DEFAULT_NUM_STADIUMS,
    DEFAULT_STADIUMS_DIR,
    loadStadiums,
    resolveCount,
    syncStadiums,
} from '../src/stadium/stadiumStore.js';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'stadiums-'));
const svgs = (dir) => fs.readdirSync(dir).filter((f) => f.endsWith('.svg')).sort();

t.test('resolveCount defaults to 125 and accepts numStadiums or n', (t) => {
    t.equal(DEFAULT_NUM_STADIUMS, 125);
    t.equal(resolveCount({}), 125);
    t.equal(resolveCount({numStadiums: 10}), 10);
    t.equal(resolveCount({n: 10}), 10);
    t.equal(resolveCount({numStadiums: 7, n: 10}), 7);
    t.throws(() => resolveCount({numStadiums: 0}), /positive integer/);
    t.throws(() => resolveCount({n: 'abc'}), /positive integer/);
    t.throws(() => resolveCount({n: 2.5}), /positive integer/);
    t.throws(() => resolveCount(null), Error);
    t.end();
});

t.test('sync from empty writes 125 stadiums and one SVG each', (t) => {
    const dir = tmp();
    const result = syncStadiums({dir, count: 125});
    t.equal(result.total, 125);
    t.equal(result.added, 125);
    const stadiums = loadStadiums(path.join(dir, 'stadiums.yaml'));
    t.equal(stadiums.length, 125);
    t.same(svgs(dir), stadiums.map((s) => `${s._id}.svg`).sort());
    t.end();
});

t.test('rerun with the same count changes nothing', (t) => {
    const dir = tmp();
    syncStadiums({dir, count: 12});
    const before = fs.readFileSync(path.join(dir, 'stadiums.yaml'), 'utf8');
    const result = syncStadiums({dir, count: 12});
    t.equal(result.added, 0);
    t.equal(result.svgsWritten, 0);
    t.equal(fs.readFileSync(path.join(dir, 'stadiums.yaml'), 'utf8'), before);
    t.end();
});

t.test('larger count keeps existing and adds only the shortfall', (t) => {
    const dir = tmp();
    syncStadiums({dir, count: 10});
    const first = loadStadiums(path.join(dir, 'stadiums.yaml'));
    const result = syncStadiums({dir, count: 25});
    t.equal(result.added, 15);
    t.equal(result.svgsWritten, 15);
    const second = loadStadiums(path.join(dir, 'stadiums.yaml'));
    t.equal(second.length, 25);
    t.same(second.slice(0, 10), first);
    t.equal(svgs(dir).length, 25);
    t.end();
});

t.test('smaller count leaves existing stadiums untouched', (t) => {
    const dir = tmp();
    syncStadiums({dir, count: 10});
    const before = loadStadiums(path.join(dir, 'stadiums.yaml'));
    const result = syncStadiums({dir, count: 3});
    t.equal(result.added, 0);
    t.same(loadStadiums(path.join(dir, 'stadiums.yaml')), before);
    t.equal(svgs(dir).length, 10);
    t.end();
});

t.test('orphan SVGs are deleted and missing SVGs are recreated', (t) => {
    const dir = tmp();
    syncStadiums({dir, count: 5});
    const [victim] = loadStadiums(path.join(dir, 'stadiums.yaml'));
    fs.writeFileSync(path.join(dir, 'orphan-park.svg'), '<svg/>');
    fs.unlinkSync(path.join(dir, `${victim._id}.svg`));
    const result = syncStadiums({dir, count: 5});
    t.same(result.orphansDeleted, ['orphan-park.svg']);
    t.equal(result.svgsWritten, 1);
    t.ok(!fs.existsSync(path.join(dir, 'orphan-park.svg')));
    t.ok(fs.existsSync(path.join(dir, `${victim._id}.svg`)));
    t.end();
});

t.test('sync validates arguments', (t) => {
    t.throws(() => syncStadiums({dir: '', count: 1}), Error);
    t.throws(() => syncStadiums({dir: tmp(), count: 0}), Error);
    t.throws(() => loadStadiums(''), Error);
    t.end();
});

t.test('bundled dataset is valid and fully covered by SVGs', (t) => {
    const dir = fileURLToPath(DEFAULT_STADIUMS_DIR);
    const stadiums = loadStadiums(path.join(dir, 'stadiums.yaml'));
    t.ok(stadiums.length >= 10);
    t.equal(new Set(stadiums.map((s) => s._id)).size, stadiums.length);
    t.same(svgs(dir), stadiums.map((s) => `${s._id}.svg`).sort());
    t.end();
});

t.test('CLI honours --numStadiums, -n and the default count', (t) => {
    const cli = fileURLToPath(new URL('../bin/generate-stadiums.js', import.meta.url));
    const original = fs.readdirSync(fileURLToPath(DEFAULT_STADIUMS_DIR));
    const bundled = fileURLToPath(DEFAULT_STADIUMS_DIR);
    const yamlBefore = fs.readFileSync(path.join(bundled, 'stadiums.yaml'), 'utf8');
    const total = loadStadiums(path.join(bundled, 'stadiums.yaml')).length;
    // counts at or below the current total are no-ops, so the bundled dataset is not modified
    for (const flag of [['--numStadiums', '1'], ['-n', '1']]) {
        const out = execFileSync(process.execPath, [cli, ...flag], {encoding: 'utf8'});
        t.match(out, new RegExp(`${total} total, 0 generated`));
    }
    t.equal(fs.readFileSync(path.join(bundled, 'stadiums.yaml'), 'utf8'), yamlBefore);
    t.same(fs.readdirSync(bundled), original);
    t.end();
});
