import {runCommand} from '@heroku-cli/test-utils'
import {expect} from 'chai'
import nock from 'nock'

import API from '../src/commands/api.js'

describe('api', function () {
  afterEach(function () {
    nock.cleanAll()
  })

  it('receives string', async function () {
    nock('https://api.heroku.com')
      .get('/hello')
      .reply(200, 'hello!')

    const {stdout} = await runCommand(API, ['/hello'])
    expect(stdout).to.contain('hello!')
  })

  it('adds leading slash', async function () {
    nock('https://api.heroku.com')
      .get('/hello')
      .reply(200, 'hello!')

    const {stdout} = await runCommand(API, ['hello'])
    expect(stdout).to.contain('hello!')
  })

  it('--version=3.foobar', async function () {
    nock('https://api.heroku.com', {
      reqheaders: {accept: 'application/vnd.heroku+json; version=3.foobar'},
    })
      .get('/hello')
      .reply(200, 'hello!')

    const {stdout} = await runCommand(API, ['/hello', '--version=3.foobar'])
    expect(stdout).to.contain('hello!')
  })

  it('--accept-inclusion=foobar', async function () {
    nock('https://api.heroku.com', {
      reqheaders: {'Accept-Inclusion': 'foobar'},
    })
      .get('/hello')
      .reply(200, 'hello!')

    await runCommand(API, ['/hello', '--accept-inclusion=foobar'])
  })

  it('sends JSON body with --body flag on POST', async function () {
    nock('https://api.heroku.com')
      .post('/apps/myapp/config-vars', {FOO: 'bar'})
      .reply(200, {FOO: 'bar'})

    const {stdout} = await runCommand(API, ['POST', '/apps/myapp/config-vars', '--body', '{"FOO": "bar"}'])
    expect(stdout).to.contain('FOO')
    expect(stdout).to.contain('bar')
  })

  it('warns when no body is provided for POST', async function () {
    nock('https://api.heroku.com')
      .post('/apps/myapp/config-vars')
      .reply(200, {ok: true})

    const {stderr} = await runCommand(API, ['POST', '/apps/myapp/config-vars'])
    expect(stderr).to.contain('no stdin provided')
  })

  it('sends body with PUT method', async function () {
    nock('https://api.heroku.com')
      .put('/apps/myapp/config-vars', {FOO: 'baz'})
      .reply(200, {FOO: 'baz'})

    const {stdout} = await runCommand(API, ['PUT', '/apps/myapp/config-vars', '--body', '{"FOO": "baz"}'])
    expect(stdout).to.contain('FOO')
  })

  it('throws error for invalid JSON body', async function () {
    const {error} = await runCommand(API, ['POST', '/apps/myapp/config-vars', '--body', 'not-json'])
    expect(error?.message).to.contain('Request body must be valid JSON')
  })

  it('uses GET when only path is provided', async function () {
    nock('https://api.heroku.com')
      .get('/apps')
      .reply(200, [{name: 'myapp'}])

    const {stdout} = await runCommand(API, ['/apps'])
    expect(stdout).to.contain('myapp')
  })

  it('throws error when it receives an error response', async function () {
    nock('https://api.heroku.com')
      .get('/uhoh')
      .reply(404, 'uhoh!')

    const {error} = await runCommand(API, ['/uhoh'])
    expect(error?.message).to.contain('HTTP Error 404 for GET https://api.heroku.com/uhoh')
  })

  it('gets next body when next-range is set', async function () {
    nock('https://api.heroku.com')
      .get('/hello')
      .reply(206, [1, 2, 3], {'next-range': '4'})
      .get('/hello')
      .matchHeader('range', '4')
      .reply(206, [4, 5, 6], {'next-range': '7'})
      .get('/hello')
      .matchHeader('range', '7')
      .reply(206, [7, 8, 9])

    const {stdout} = await runCommand(API, ['/hello'])
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      expect(stdout).to.contain(String(n))
    }
  })
})
