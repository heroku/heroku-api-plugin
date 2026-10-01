`heroku api`
============

make a manual API request
The api command is a convenient but low-level way to send requests
to the Heroku API. It sends an HTTP request to the Heroku API
using the given method on the given path. For methods PUT, PATCH,
and POST, it uses stdin unmodified as the request body. It prints
the response unmodified on stdout.

It is essentially like curl for the Heroku API.

Method name input will be upcased, so both 'heroku api GET /apps' and
'heroku api get /apps' are valid commands.

* [`heroku api METHOD [PATH]`](#heroku-api-method-path)

## `heroku api METHOD [PATH]`

make a manual API request

```
USAGE
  $ heroku api METHOD [PATH] [--prompt] [-a <value>] [-b <value>] [-v <value>]

ARGUMENTS
  METHOD  GET, POST, PUT, PATCH, or DELETE
  [PATH]  endpoint to call

FLAGS
  -a, --accept-inclusion=<value>  Accept-Inclusion header to use
  -b, --body=<value>              JSON input body
  -v, --version=<value>           version to use (e.g. 2, 3, or 3.variant)

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  make a manual API request
  The api command is a convenient but low-level way to send requests
  to the Heroku API. It sends an HTTP request to the Heroku API
  using the given method on the given path. For methods PUT, PATCH,
  and POST, it uses stdin unmodified as the request body. It prints
  the response unmodified on stdout.

  It is essentially like curl for the Heroku API.

  Method name input will be upcased, so both 'heroku api GET /apps' and
  'heroku api get /apps' are valid commands.

EXAMPLES
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

  $ printf '{"updates":[{"type":"web", "quantity":2}]}' | heroku api POST /apps/myapp/formation
  [
    {
      "app": {
        "name": "myapp",
        "id": "01234567-89ab-cdef-0123-456789abcdef"
      },
      "quantity": 2,
      "type": "web",
      "updated_at": "2012-01-01T12:00:00Z"
      ...
    }
  ]
```

_See code: [src/commands/api.ts](https://github.com/heroku/heroku-api-plugin/blob/plugin-api-v4.0.3/src/commands/api.ts)_
