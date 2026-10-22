# Config Manager

## Requirements

The **`config`** manager is responsible for managing run time configuration. Its job is to capture multiple sources of
configuration and present them as a single unified object. It also can choose a configuration source based on the
requested environment. Put this in packages/lib.

## Configuration Environments

Environments map config values to execution environments. These environments are defined:

* `development` - the environment coding and testing
* `test` - A QA environment for testing.
* `production` - The live system
* `staging` - Deployment staging
* `<others>` - the system may define other environments later on, so the check for environment is really just to match a
  string with a set of configurations

## Configuration sources

- **`config.yaml`** This is the core repository for configuration. The system should load all config files from the cwd
  up the project root. Precedence is defined from inside out. Each path to root is added to the config, where the root
  file has the least precedence. Each file is merged with the previous file in the path for all values not present in
  the current config as it is being built.
- **Environment Variables** Environment variables are the next highest precedence. The system will prefer `dotenv` for
  loading environment variables, but will accept any environment variables. The config module should call dotenv on
  every initialization. The config module only interprets variables that start with `SJGE_` and converts from snake case
  to camel case and overwrites a config value if it already exists, or just adds to the config object if it doesn't
  match anything.
- **Command Line** The command line arguments are the highest precedence. They override all other configuration sources.
  The system will use `yargs` for cli parsing and all conventions that `yargs` provides will be preferred if another
  module/thing offers the same feature. This is also true for environment variables.

## API

- **`loadConfig([environment:string]):object`** Initializes the config module. This should be called before any other
  config
  functions are called. Its output is the config object. It is a POJO with no methods or any other properties except
  what is found in the config. Load should be idempotent. Every time I call it with the same parameters, I get the same
  object back. The `environment` parameter is optional and defaults to the value of `SJGE_ENV` environmet variable or it
  defaults to a constant of `development`.
    - **`config`** The object that is returned from `loadConfig ()` is shaped by the config.yaml file. It has no other
      schema.
      It is mutable

## `config.yaml`

This is the primary vehicle for configuring the system. The top level items define environments we can work with. Within
each will be config options tbd later.

### sample file

```yaml
development:
  option1: value1
  option2: value2
staging:
  option1: value3
  option2: value4
  option3:
    nest1: value5
    nest2: value6
```

Options from the command line should leverage yargs dot notation.

## Implementation

- No type coercion except to check for `isNumber()` or `isBoolean()`, everything else is a string.
- a top-level key is an environment section if its value is a plain object AND (it equals the requested environment).
  Other object-valued top-level keys (e.g. a shared options: map) are shared values; other environment sections are
  simply ignored
- When merging config files, do per-file flatten first, then merge parent.
- When travesing parent directories, root package.json has workspaces — good. Stop at first dir with workspaces; fall
  back to .git; if neither found, stop at filesystem root is risky — instead use only cwd (fail-safe) and log a warning.
- `yargs` has tools built in to handle parsing the environment, prefer yargs to custom code.
- Environment variables like SJGE_ENV should be loaded after dotenv
- call dotenv.config ({ quiet: true }) inside `loadConfig()`  so tests can set env first.
- Individual modules may also define their own yargs parsers for module-specific cli options.
- The default yargs parser in config.js should define these optional parameters:
    - define parameter `--verbose`, shortcut `-v` which maps to the logger levels, it is ok to use -v -vv -vvvv or
      suggest an alternative. Defaults to `start` from the logger.
    - define parameter `--environment`, shortcut `-e`, which maps to the environment section to load. Defaults to
      `development`.
    - `.help(false).version(false).exitProcess(false)`
- When merging objects, keep it simple, arrays can overwrite each other, objects can be merged.
- Config options may contain credentials; never log the full config. Log only keys/sources via gSJGEogger from
  logger.js.
- check.assert.maybe.* is the correct API for optional params rather than hand-rolled checks. YAML parse errors should
  propagate (fail-fast) with the file path added to the message; missing file is the only recoverable case (ENOENT), so
  catch only that code. 