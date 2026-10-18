import t from 'tap';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadConfig} from '../src/config.js';

function fixture() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cfg-'));
    fs.writeFileSync(path.join(root, 'package.json'), '{"workspaces":["a"]}');
    fs.writeFileSync(path.join(root, 'config.yaml'),
        'development:\n  a: root\n  b: root\n  n:\n    x: 1\n    y: 1\nstaging:\n  a: staging\n');
    const sub = path.join(root, 'a');
    fs.mkdirSync(sub);
    fs.writeFileSync(path.join(sub, 'config.yaml'), 'development:\n  a: sub\n  n:\n    x: 2\n');
    return {root, sub};
}

t.test('merges files inside-out, env vars, then cli', (t) => {
    const {sub} = fixture();
    process.env.ETL_FOO_BAR = '5';
    process.env.ETL_B = 'fromenv';
    const cfg = loadConfig(undefined, {cwd: sub, argv: ['--a', 'cli', '--n.y', '9', '-vv']});
    t.same(cfg, {a: 'cli', b: 'fromenv', n: {x: 2, y: 9}, fooBar: 5, loggerLevel: 'debug', ...extra(cfg)});
    t.equal(loadConfig(undefined, {cwd: sub, argv: ['--a', 'cli', '--n.y', '9', '-vv']}), cfg);
    delete process.env.ETL_FOO_BAR;
    delete process.env.ETL_B;
    t.end();
});

t.test('selects environment and rejects bad yaml', (t) => {
    const {root, sub} = fixture();
    t.equal(loadConfig('staging', {cwd: root, argv: []}).a, 'staging');
    t.equal(loadConfig(undefined, {cwd: root, argv: ['-e', 'staging']}).a, 'staging');
    fs.writeFileSync(path.join(sub, 'config.yaml'), 'a: [');
    t.throws(() => loadConfig('development', {cwd: sub, argv: []}), {message: /config\.yaml/});
    t.end();
});

function extra(cfg) {
    const out = {};
    for (const k of Object.keys(cfg)) {
        if (!['a', 'b', 'n', 'fooBar', 'loggerLevel'].includes(k)) {
            out[k] = cfg[k];
        }
    }
    return out;
}
