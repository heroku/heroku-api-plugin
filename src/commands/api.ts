import {color} from '@heroku-cli/color'
import {Command, flags} from '@heroku-cli/command'
import {Args, ux} from '@oclif/core'
import {HTTPRequestOptions} from 'http-call'
import heredoc from 'tsheredoc'
import {URL} from 'url'
import {inspect} from 'util'

import getStdin = require('get-stdin')
const edit = require('edit-string')

export default class API extends Command {
  static args = {
    method: Args.string({
      description: 'GET, POST, PUT, PATCH, or DELETE',
      required: true,
    }),
    path: Args.string({
      description: 'endpoint to call',
    }),
  }

  static description = `make a manual API request
The api command is a convenient but low-level way to send requests
to the Heroku API. It sends an HTTP request to the Heroku API
using the given method on the given path. For methods PUT, PATCH,
and POST, it uses stdin unmodified as the request body. It prints
the response unmodified on stdout.

It is essentially like curl for the Heroku API.

Method name input will be upcased, so both 'heroku api GET /apps' and
'heroku api get /apps' are valid commands.`

  static examples = [heredoc`
    $ heroku api GET /apps/myapp
    {
      created_at: "2011-11-11T04:17:13-00:00",
      id: "12345678-9abc-def0-1234-456789012345",
      name: "myapp",
      …
    }
  `, heredoc`
    $ heroku api PATCH /apps/myapp/config-vars --body '{"FOO": "bar"}'
    {
      FOO: "bar"
      …
    }
    `, heredoc`
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
    `]

  static flags = {
    'accept-inclusion': flags.string({char: 'a', description: 'Accept-Inclusion header to use'}),
    body: flags.string({char: 'b', description: 'JSON input body'}),
    version: flags.string({char: 'v', description: 'version to use (e.g. 2, 3, or 3.variant)'}),
  }

  async run() {
    const {args, flags} = await this.parse(API)
    const getBody = async (): Promise<string | undefined> => {
      const body = flags.body || await getStdin()
      if (!body) {
        this.warn('no stdin provided')
        return
      }

      try {
        return JSON.parse(body as string)
      } catch {
        const err = new Error(`Request body must be valid JSON
  Received:
  ${inspect(body)}`)
        if (process.stdin.isTTY) {
          this.warn(err)
          return JSON.parse(await edit(body, {postfix: '.json'}))
        }

        throw err
      }
    }

    const request: HTTPRequestOptions = {headers: {}}
    let {method, path} = args
    request.method = method
    if (!path) {
      path = request.method
      request.method = 'GET'
    }

    request.method = request.method!.toUpperCase()
    const uri = this.parseURL(path)
    const version = flags.version || '3'
    request.headers!.accept = `application/vnd.heroku+json; version=${version}`
    if (flags['accept-inclusion']) {
      request.headers!['Accept-Inclusion'] = flags['accept-inclusion']
    }

    if (request.method === 'PATCH' || request.method === 'PUT' || request.method === 'POST') {
      request.body = await getBody()
    }

    const fetch = async (body: unknown[] = []): Promise<string | unknown | unknown[]> => {
      ux.action.start(color`{cyanBright ${request.method!}} ${uri.host!}${uri.pathname}`)
      let response
      try {
        response = await this.heroku.request<unknown>(uri.toString(), request)
      } catch (error) {
        if (!error.http || !error.http.statusCode) throw error
        ux.action.stop(color`{redBright ${error.http.statusCode}}`)
        throw error
      }

      let msg = color`{greenBright ${response.response!.statusCode!.toString()}}`
      if (Array.isArray(response.body)) msg += ` ${response.body.length + body.length} items`
      ux.action.stop(msg)
      if (Array.isArray(response.body) && response.response.headers['next-range']) {
        request.headers!.range = response.response.headers['next-range'] as string
        return fetch([...body, ...response.body])
      }

      return Array.isArray(response.body) ? [...body, ...response.body] : response.body
    }

    const body = await fetch()
    if (typeof body === 'string') {
      ux.log(body)
    } else {
      ux.styledJSON(body)
    }
  }

  private parseURL(path: string): URL {
    try {
      return new URL(path)
    } catch {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`
      const protocol = this.heroku.defaults.protocol || 'https:'
      const normalizedURL = `${protocol}//${this.heroku.defaults.host!}${normalizedPath}`
      return new URL(normalizedURL)
    }
  }
}
