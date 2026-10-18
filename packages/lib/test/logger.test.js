import t from 'tap';
import {Writable} from 'node:stream';
import {getLogger, LoggerLevels} from '../src/logger.js';

function capture() {
    const lines = [];
    const stream = new Writable({
        write(chunk, enc, cb) {
            lines.push(chunk.toString());
            cb();
        },
    });
    return {lines, stream};
}

t.test('default level hides trace and debug', (t) => {
    const {lines, stream} = capture();
    const log = getLogger('x', undefined, [stream]);
    log.success('a');
    log.trace('b');
    log.debug('c');
    t.equal(lines.length, 1);
    t.match(lines[0], /^\d{4}-\d\d-\d\dT[\d:.]+Z\|x\|\x1b\[32msuccess\x1b\[0m\|a\n$/);
    t.end();
});

t.test('level filtering and context formatting', (t) => {
    const {lines, stream} = capture();
    const log = getLogger('x', 'warning', [stream]);
    log.info('hidden');
    log.error('boom', new Error('bad'));
    log.warning('obj', {a: 1});
    t.equal(lines.length, 2);
    t.match(lines[0], /Error: bad\n\s+at /);
    t.match(lines[1], /obj \{"a":1\}/);
    t.end();
});

t.test('loggers are unique and enum is exported', (t) => {
    t.not(getLogger('a'), getLogger('a'));
    t.equal(LoggerLevels.log, LoggerLevels.info);
    t.throws(() => getLogger('a', 'nope'));
    t.end();
});
