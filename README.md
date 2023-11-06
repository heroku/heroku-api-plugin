# API Plugin for Heroku Toolbelt

[![npm version](https://badge.fury.io/js/heroku-api-plugin.svg)](http://badge.fury.io/js/heroku-api-plugin)
![Node CI Suite](https://github.com/heroku/heroku-api-plugin/actions/workflows/ci.yml/badge.svg)
[![Build status](https://ci.appveyor.com/api/projects/status/9i6wk4i1pe2hsss0/branch/master?svg=true)](https://ci.appveyor.com/project/Heroku/heroku-api-plugin/branch/master)

## How to install this plugin

```shell
$ heroku plugins:install api
```

## Usage

<!-- commands -->
* [`heroku api METHOD [PATH]`](#heroku-api-method-path)

## `heroku api METHOD [PATH]`

make a manual API request

```
USAGE
  $ heroku api METHOD [PATH]

ARGUMENTS
  METHOD  GET, POST, PUT, PATCH, or DELETE
  PATH    endpoint to call

OPTIONS
  -a, --accept-inclusion=accept-inclusion  Accept-Inclusion header to use
  -b, --body=body                          JSON input body
  -v, --version=version                    version to use (e.g. 2, 3, or 3.variant)

DESCRIPTION
  The api command is a convenient but low-level way to send requests
  to the Heroku API. It sends an HTTP request to the Heroku API
  using the given method on the given path. For methods PUT, PATCH,
  and POST, it uses stdin unmodified as the request body. It prints
  the response unmodified on stdout.

  It is essentially like curl for the Heroku API.

  Method name input will be upcased, so both 'heroku api GET /apps' and
  'heroku api get /apps' are valid commands.

EXAMPLE
  $ heroku api GET /apps/myapp
  {
     created_at: "2011-11-11T04:17:13-00:00",
     id: "12345678-9abc-def0-1234-456789012345",
     name: "myapp",
     …
  }

  $ heroku api PATCH /apps/myapp/config-vars --body '{"FOO": "bar"}'
  {
     FOO: "bar"
     …
  }

  $ export HEROKU_HEADERS
  $ HEROKU_HEADERS='{
  "Content-Type": "application/x-www-form-urlencoded",
  "Accept": "application/json"
  }'
  $ printf 'type=web&qty=2' | heroku api POST /apps/myapp/ps/scale
  2
```

_See code: [src/commands/api.ts](https://github.com/heroku/heroku-api-plugin/blob/v2.2.0/src/commands/api.ts)_
<!-- commandsstop -->
