import color from '@heroku-cli/color'
import {Command, flags} from '@heroku-cli/command'
import cli from 'cli-ux'
import {HTTPRequestOptions} from 'http-call'
import {inspect} from 'util'

export default class API extends Command {
  static description = `make a manual API request
The api command is a convenient but low-level way to send requests
to the Heroku API. It sends an HTTP request to the Heroku API
using the given method on the given path. For methods PUT, PATCH,
and POST, it uses stdin unmodified as the request body. It prints
the response unmodified on stdout.

It is essentially like curl for the Heroku API.

Method name input will be upcased, so both 'heroku api GET /apps' and
'heroku api get /apps' are valid commands.`
  static examples = [`$ heroku api GET /apps/myapp
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
2`]

  static flags = {
    version: flags.string({char: 'v', description: 'version to use (e.g. 2, 3, or 3.variant)'}),
    'accept-inclusion': flags.string({char: 'a', description: 'Accept-Inclusion header to use'}),
    body: flags.string({char: 'b', description: 'JSON input body'})
  }
  static args = [
    {name: 'method', description: 'GET, POST, PUT, PATCH, or DELETE', required: true},
    {name: 'path', description: 'endpoint to call'}
  ]

  async run() {
    const {args, flags} = this.parse(API)
    const getBody = async (): Promise<string | undefined> => {
      const getStdin = require('get-stdin')
      const edit = require('edit-string')

      let body = flags.body || await getStdin()
      if (!body) {
        this.warn('no stdin provided')
        return
      }
      try {
        return JSON.parse(body)
      } catch {
        let err = new Error(`Request body must be valid JSON
  Received:
  ${inspect(body)}`)
        if (process.stdin.isTTY) {
          this.warn(err)
          return JSON.parse(await edit(body, {postfix: '.json'}))
        } else throw err
      }
    }
    let request: HTTPRequestOptions = {headers: {}}
    let path = args.path
    request.method = args.method
    if (!path) {
      path = request.method
      request.method = 'GET'
    }
    request.method = request.method!.toUpperCase()
    if (!path.startsWith('/')) path = `/${path}`
    let version = flags.version || '3'
    request.headers!.accept = `application/vnd.heroku+json; version=${version}`
    if (flags['accept-inclusion']) {
      request.headers!['Accept-Inclusion'] = flags['accept-inclusion']
    }
    if (request.method === 'PATCH' || request.method === 'PUT' || request.method === 'POST') {
      request.body = await getBody()
    }
    const fetch = async (body: any[] = []): Promise<string | any[]> => {
      cli.action.start(color`{cyanBright ${request.method!}} ${this.heroku.defaults.host!}${path}`)
      let response
      try {
        response = await this.heroku.request<any>(path, request)
      } catch (err) {
        if (!err.http || !err.http.statusCode) throw err
        cli.action.stop(color`{redBright ${err.http.statusCode}}`)
        throw err
      }
      let msg = color`{greenBright ${response.response!.statusCode!.toString()}}`
      if (Array.isArray(response.body)) msg += ` ${response.body.length + body.length} items`
      cli.action.stop(msg)
      if (Array.isArray(response.body) && response.response.headers['next-range']) {
        request.headers!.range = response.response.headers['next-range']
        return fetch(body.concat(response.body))
      }
      return Array.isArray(response.body) ? body.concat(response.body) : response.body
    }
    let body = await fetch()
    if (typeof body === 'string') {
      cli.log(body)
    } else {
      cli.styledJSON(body)
    }
  }
}
