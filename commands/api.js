'use strict'

const cli = require('heroku-cli-util')
const fs = require('fs')
const {inspect} = require('util')

module.exports = {
  topic: 'api',
  description: 'make a single API request',
  help: `The api command is a convenient but low-level way to send requests
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
`,
  needsApp: false,
  needsAuth: true,
  args: [
    {name: 'method', description: 'GET, POST, PUT, PATCH, or DELETE'},
    {name: 'path', description: 'endpoint to call', optional: true}
  ],
  flags: [
    {name: 'version', char: 'v', description: 'version to use (e.g. 2, 3, or 3.variant)', hasValue: true},
    {name: 'accept-inclusion', char: 'a', description: 'Accept-Inclusion header to use', hasValue: true}
  ],
  run: cli.command(async function (context, heroku) {
    let request = {}
    request.path = context.args.path
    request.method = context.args.method
    if (!request.path) {
      request.path = request.method
      request.method = 'GET'
    }
    request.method = request.method.toUpperCase()
    let version = context.flags.version || '3'
    request.headers = { 'Accept': `application/vnd.heroku+json; version=${version}` }
    if (context.flags['accept-inclusion']) {
      request.headers['Accept-Inclusion'] = context.flags['accept-inclusion']
    }
    if (request.method === 'PATCH' || request.method === 'PUT' || request.method === 'POST') {
      let body = fs.readFileSync('/dev/stdin', 'utf8')
      let parsedBody
      try {
        parsedBody = JSON.parse(body)
      } catch (e) {
        throw new Error('Request body must be valid JSON')
      }
      request.body = parsedBody
    }
    let response
    try {
      response = await heroku.request(request)
    } catch (err) {
      if (!err.statusCode) throw err
      throw new Error(`HTTP: ${err.statusCode} ${request.path}\n${inspect(err.body)}`)
    }

    if (typeof response === 'object') { cli.styledJSON(response) } else { cli.log(response) }
  })
}
