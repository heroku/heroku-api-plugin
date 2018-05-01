# API Plugin for Heroku Toolbelt [![Circle CI](https://circleci.com/gh/heroku/heroku-api-plugin/tree/master.svg?style=svg)](https://circleci.com/gh/heroku/heroku-api-plugin/tree/master)

[![npm version](https://badge.fury.io/js/heroku-api-plugin.svg)](http://badge.fury.io/js/heroku-api-plugin)
[![codecov](https://codecov.io/gh/heroku/heroku-api-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/heroku/heroku-api-plugin)
[![CircleCI](https://circleci.com/gh/heroku/heroku-api-plugin/tree/master.svg?style=svg)](https://circleci.com/gh/heroku/heroku-api-plugin/tree/master)
[![Build status](https://ci.appveyor.com/api/projects/status/9i6wk4i1pe2hsss0/branch/master?svg=true)](https://ci.appveyor.com/project/Heroku/heroku-api-plugin/branch/master)

## How to install this plugin

```shell
$ heroku plugins:install api
```

## Usage

```shell
$ heroku api [--version VERSION] METHOD PATH
```

  The api command is a convenient but low-level way to send requests
  to the Heroku API. It sends an HTTP request to the Heroku API
  using the given method on the given path. For methods PUT, PATCH,
  and POST, it uses stdin unmodified as the request body. It prints
  the response unmodified on stdout.

  Method name input will be upcased, so both 'heroku api GET /apps' and
  'heroku api get /apps' are valid commands.

  Examples:

      $ heroku api GET /apps/myapp
      { created_at: "2011-11-11T04:17:13-00:00",
        id: "12345678-9abc-def0-1234-456789012345",
        name: "myapp",
        …
      }

      $ heroku api -v 3.variant /apps
      # Something different

      $ export HEROKU_HEADERS
      $ HEROKU_HEADERS='
      Content-Type: application/x-www-form-urlencoded
      Accept: application/json
      '
      $ printf 'type=web&qty=2' | heroku api POST /apps/myapp/ps/scale
      2
