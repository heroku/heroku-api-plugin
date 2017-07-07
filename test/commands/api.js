'use strict'

let cli = require('heroku-cli-util')
let nock = require('nock')
let cmd = require('../../commands/api')
let mockStdin = require('mock-stdin')
let expect = require('chai').expect

describe('api', function () {
  let stdin

  beforeEach(function () {
    cli.mockConsole()
    stdin = mockStdin.stdin()
  })

  afterEach(function () {
    stdin.restore()
  })

  it('displays the app info', function () {
    let method = 'get'
    let path = '/apps/myapp'
    let app = {name: 'myapp', web_url: 'https://myapp.herokuapp.com/'}

    nock('https://api.heroku.com')
    .get('/apps/myapp')
    .reply(200, app)

    return cmd.run({args: {method, path}, flags: {}})
    .then(function () {
      expect(cli.stdout).to.equal(
`{
  "name": "myapp",
  "web_url": "https://myapp.herokuapp.com/"
}
`)
    })
  })

  it('creates the app with params', function () {
    let method = 'post'
    let path = '/apps'
    let app = {name: 'myapp', web_url: 'https://myapp.herokuapp.com/'}

    nock('https://api.heroku.com')
    .post('/apps', {name: 'myapp'})
    .reply(200, app)

    // this is magic I do not know why this works, it just does
    process.nextTick(function mockResponse () {
      stdin.send('{"name": "myapp"}')
      stdin.end()
    })

    stdin.read()
    // end magic

    return cmd.run({args: {method, path}, flags: {}})
    .then(function () {
      expect(cli.stdout).to.equal(
`{
  "name": "myapp",
  "web_url": "https://myapp.herokuapp.com/"
}
`)
    })
  })
})
