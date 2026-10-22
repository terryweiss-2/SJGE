# System Logger

## Requirements

- **Log Level**. The logger level determines what logs are printed. Define these levels
    - Most visible

    * error
    * warning
    * log, info - these are the same level
    * start, end, success - these are all the same level
    * trace
    * debug

    - Least visible

- **API**
    - Provide one function per level i.e. `logger.success(msg:string, context:any)`,
      `logger.end(msg:string, context:any)` that accept a single string parameter which is the message to log
        - `msg` The message to log
        - `context` Optional. Additional context to log. If this parameter is an error object it should print the stack
          trace and the complete error message. All others should be printed as a string or as JSON if an array or
          object
    - `getLogger(name[, level][, streams])` returns a configured logger. All loggers are unique, two loggers with the
      same name are still 2 different loggers.
        - `name` The name of the logger. This will be printed to the log stream with each entry
        - `level` Optional. The level of the logger. If not specified, the logger will use the default level. The values
          should map directly to the levels above with a provided enum called `LoggerLeverls`
        - 'stream' an optional array of streams to write to. The only requirement for these streams is that they
          implement node `stream.Writable`. These streams are added to the default stream.

- **Behavior**
    - The default log level should be `start`. The logger should also look for an environment variable called
      `SJGE_LOGGER_LEVEL` that can override the default level. By default trace and debug levels are disabled.
    - The output should adhere to this template: `<UTC Formatted Date>|<name>|<level>|<message>`
    - Output should be colored. The color would only apply to the `<level>` part of the message. Assume only ANSI colors
      are available
    - All logs should write to a stream. The default stream is to the console, `error` and `debug` maps to `stderr`,
      everything else goes to `stdout`. Other streams provided by `getLogger` are added to the default stream and do not
      care about the distinction between `stderr` and `stdout` streams.
