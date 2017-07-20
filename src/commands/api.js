// @flow

import type {HTTPRequestOptions} from 'http-call'
import {Command, flags} from 'cli-engine-heroku'
import {inspect} from 'util'
import color from 'heroku-cli-color'

export default class API extends Command {
  static topic = 'api'
  static description = 'make a manual API request'
  static flags = {
    version: flags.string({char: 'v', description: 'version to use (e.g. 2, 3, or 3.variant)'}),
    'accept-inclusion': flags.string({char: 'a', description: 'Accept-Inclusion header to use'}),
    body: flags.string({char: 'b', description: 'JSON input body'})
  }
  static args = [
    {name: 'method', description: 'GET, POST, PUT, PATCH, or DELETE'},
    {name: 'path', description: 'endpoint to call', optional: true}
  ]

  static help = `The api command is a convenient but low-level way to send requests
to the Heroku API. It sends an HTTP request to the Heroku API
using the given method on the given path. For methods PUT, PATCH,
and POST, it uses stdin unmodified as the request body. It prints
the response unmodified on stdout.

It is essentially like curl for the Heroku API.

Method name input will be upcased, so both 'heroku api GET /apps' and
'heroku api get /apps' are valid commands.

Examples:

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
    $ HEROKU_HEADERS='
    Content-Type: application/x-www-form-urlencoded
    Accept: application/json
    '
    $ printf 'type=web&qty=2' | heroku api POST /apps/myapp/ps/scale
    2
`

  async run () {
    let request: HTTPRequestOptions = {headers: {}}
    let path = this.args.path
    request.method = (this.args.method: any)
    if (!path) {
      path = request.method
      request.method = 'GET'
    }
    request.method = request.method.toUpperCase()
    if (!path.startsWith('/')) path = `/${path}`
    let version = this.flags.version || '3'
    request.headers['accept'] = `application/vnd.heroku+json; version=${version}`
    if (this.flags['accept-inclusion']) {
      request.headers['Accept-Inclusion'] = this.flags['accept-inclusion']
    }
    if (request.method === 'PATCH' || request.method === 'PUT' || request.method === 'POST') {
      request.body = await this.getBody()
    }
    this.out.action.start(color`{cyanBright ${request.method}} ${this.heroku.host}${path}`)
    let body
    try {
      if (request.method === 'GET') {
        // GET requests must use .get() to paginate
        body = await this.heroku.get(path, request)
        this.out.action.stop()
      } else {
        let response = await this.heroku.request(path, request)
        this.out.action.stop(color`{greenBright ${response.response.statusCode}}`)
        body = response.body
      }
    } catch (err) {
      if (!err.http || !err.http.statusCode) throw err
      this.out.action.stop(color`{redBright ${err.http.statusCode}}`)
      throw err
    }

    if (typeof body === 'string') {
      this.out.log(body)
    } else {
      this.out.styledJSON(body)
    }
  }

  async getBody (): Promise<?string> {
    const getStdin = require('get-stdin')
    const edit = require('edit-string')

    let body = this.flags.body || await getStdin()
    if (!body) {
      this.out.warn('no stdin provided')
      return
    }
    try {
      return JSON.parse(body)
    } catch (e) {
      let err = new Error(`Request body must be valid JSON
Received:
${inspect(body)}`)
      if (process.stdin.isTTY) {
        this.out.warn(err)
        return JSON.parse(await edit(body, {postfix: '.json'}))
      } else throw new Error(err)
    }
  }
}
