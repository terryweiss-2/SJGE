# Redis Module

## Overview

This module is lightweight wrapper for working with redis. Because best practice for redis is to use a single connection
per process, this module provides a singleton pattern for accessing redis. Since some operations like pub/sub may
require dedicated connections, this module also provides a way to create and manage multiple connections as needed using
ioredis `duplicate`.

## Requirements

- Since the module maintains a single connection, the rest of this document assumes that every call that requires a
  connection uses the singleton connection.
- The `config` object *must* contain a `redis` property that is an object with a `url` property that is a valid redis
  url. But this module doesn't care about it, the url may be passed by the caller; when omitted this module reads it
  with
  `loadConfig()` from the config module. On disk, that url will be contained in an execution environment section. But
  since config flattens the file based on the requested environment, this module can assume the url and options for
  redis are at the root level of the configuration.
- The `config` object *may* contain an `options` property that provides defaults for the ioredis connection. Any options
  passed to this module overwrite the defaults. Once a connection is established, any further calls to getRedis return
  the singleton object and ignore any further options passed to getRedis. If options are passed and ignored, they are
  logged as a warning.
- The connection is lazy loaded. This means that the connection is not established until the first call to getRedis. If
  the caller calls `closeRedis`, the next call to getRedis will create a new connection.

## Behaviors

- This module does not contemplate wrapping all of ioredis. The connection returned by getRedis is an ioredis instance.
  Additional functionality provides syntactic sugar for common operations.
- When internal methods need an instance, they use the same `getRedis` method.
- Attempt to connect 3 times. On the 4th failure, throw an error.
- All parameters with a specified type should be validated for type, but not for format or content. This applies mostly
  to urls, but also channel names and any other value that may cause ioredis to throw. We want the throw to pass thu
  without management or interpretation
- ioredis emits `error` events; unhandled ones are noisy. Specify attaching a handler that logs via `logger.error` (fail
  fast per AGENTS.md), and retry/reconnect options defaults.
- pub/sub messages are fire and forget. These are broadcast messages.
- pub.sub async generators should unsubscribe when the generator is done.
- Always return string values from `scan` functions through JSON.parse ()

## Error Handling

- Fail fast. Only attempt recovery when creating a new connection as per requirements to attempt to connect 3 times. If
  a connection fails, log the error and throw an error. If a connection is invalid, call getRedis again and let it
  follow the logic for getting a new connection.

## Tech Stack

- ioredis
- `config` module
- `logger` module
- All technologies in AGENTS.md are also available to this module.

## API

- **`getRedis(url: string[, options:object]):ioredis`** This is the primary access point. This will return a single
  connection. The return value is an ioredis instance.
    - `url` any valid redis url. Do not validate this, let ioredis validate it and surface the error to the caller.
    - `options` any valid options to pass to ioredis. Theses are merged with any default options from the config module
      and take precedence.
- **`getNewRedis()`**. Accepts no arguments. Returns a new ioredis instance from ioredis `duplicate` method against the
  singleton connection. If no connection exists, call `getRedis` to create one. this channel is open until a called
- specifically closes it.
- **`closeRedis([instance:ioredis])`**. Closes a connection. If no instance is provided, closes the singleton
  connection. If the connection is already closed, this is a no-op.
- **`closeAll()`**. Closes all open connections. If the connections are already closed, this is a no-op.
- **`listenTo(channel:string):object`**. Listens to a single channel. Returns an object that contains an asynchronous
  generator that yields every message in the channel. It also contains a function to stopListening. It should call
  `getNewRedis` internally to get a dedicated channel for pub/sub. This must handle backpressure. A connection failure
  is an error that should be surfaced to the caller.
    - `channel` any valid Redis channel. Do not validate this, let ioredis validate it and surface the error to the
      caller.
    - returns an object that contains
        - `stopListening` a function that stops listening to the channel and closes the duplicated connection
        - `messages` an asynchronous generator that yields every message in the channel. This yeilds the raw data from
          ioredis without interpretation.
- **`listen(channels:array<string>)`** Engages redis `psubscribe` with an array of channel names, any of which may
  contain an asterisk pattern. Semantics are identical to `listenTo` (including the returned `messages`,
  `stopListening` and `ready`) but the input parameter is an array of strings.
- **`send(channel:string, msg:string):number`** Sends a message to a channel
    - `channel` any valid Redis channel. Do not validate this, let ioredis validate it and surface the error to the
      caller.
    - Returns the output from ioredis publish
- **`scanHash(key: string, [, options:object])`** Returns an async generator that yields every member in the hash
    - `key` any valid redis key.
    - `options` options passed through to `hscanStream`
    - The values returned should be each a pojo of `{field: value}`. Here is an example implementation:

```javascript
export async function* scanHash( key, options = {} ) {
  const stream = redis.hscanStream( key, { count: 500, ...options } );
  for await ( const batch of stream ) {
    for ( let i = 0; i < batch.length; i += 2 ) {
      yield { [ batch[ i ] ]: JSON.parse( batch[ i + 1 ] ) };
    }
  }
}
```

- **`scanSet(key: string, [, options:object])`** Returns an async generator that yields every member in the set
    - `key` any valid redis key.
    - `options` options passed through to `sscanStream`
    - This returns the raw output for each yielded value
- **`scanList(key: string, [, options:object])`** Returns an async generator that yields every member in the list
    - `key` any valid redis key.
    - `options.batchSize` page size, default 500.
    - ioredis does not provide a stream for lists, so this pages through the list with `lrange` and yields the parsed
      values one at a time. Here is example code:

```javascript
export async function* scanList( key, options = {} ) {
  const batch = options.batchSize ?? 500;
  for ( let start = 0; ; start += batch ) {
    const page = await redis.lrange( key, start, start + batch - 1 );
    if ( page.length === 0 ) {
      return;
    }
    for ( const value of page ) {
      yield JSON.parse( value );
    }
  }
}
```

Paging is not atomic: concurrent changes to the list while scanning may skip or repeat members. No copy of the key is
made.

## Testing

- Assume Ubuntu as the exclusive development and execution environments
- Assume local redis is installed, but may not be running.
- If local redis is not running, start it with `redis-server` and kill it when testing is done.
- Testing fixtures are:
    - packages/etl-lib/test/fixtures/redis.hash.json - 1000 simple hashes
    - packages/etl-lib/test/fixtures/redis.lists.csv - 1000 simple members for a list
    - packages/etl-lib/test/fixtures/redis.set.csv - 1000 members with duplicates
- If necessary, you may run multiple child processes to test pub/sub

## OptionsConfig

On disk in `config.yaml` the mongo hive will be contained in an environment

```yaml
development:
  mongoUrl: mongodb://localhost:27017/dataExtractor_etl25
  redis:
    url: redis://localhost:6379
    options:
      db: 0
  rabbitUrl: amqp://localhost:5672
```

That will be flatted by the config module so that at runtime it will look like this:

```yaml
mongoUrl: mongodb://localhost:27017/dataExtractor_etl25
redis:
  url: redis://localhost:6379
  options:
    db: 0
rabbitUrl: amqp://localhost:5672
```
