# Heroku API Plugin for Heroku Toolbelt [![Circle CI](https://circleci.com/gh/heroku/heroku-api/tree/master.svg?style=svg)](https://circleci.com/gh/heroku/heroku-api/tree/master)

[![npm version](https://badge.fury.io/js/heroku-api.svg)](http://badge.fury.io/js/heroku-api)

[Dev Center: Developing CLI Plugins](https://devcenter.heroku.com/articles/developing-toolbelt-plug-ins)


## How to install this plugin

```
$ heroku plugins:install heroku-api
```

## Usage: heroku api METHOD PATH

   -v, --version VERSION # version to use (e.g. 2, 3, or 3.variant)

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

      $ export HEROKU_HEADERS
      $ HEROKU_HEADERS='
      Content-Type: application/x-www-form-urlencoded
      Accept: application/json
      '
      $ printf 'type=web&qty=2' | heroku api POST /apps/myapp/ps/scale
      2



      Usage: heroku api METHOD PATH

         -v, --version VERSION # version to use (e.g. 2, 3, or 3.variant)

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

            $ export HEROKU_HEADERS
            $ HEROKU_HEADERS='
            Content-Type: application/x-www-form-urlencoded
            Accept: application/json
            '
            $ printf 'type=web&qty=2' | heroku api POST /apps/myapp/ps/scale
            2
