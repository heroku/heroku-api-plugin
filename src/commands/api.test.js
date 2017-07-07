// @flow

import API from './api'
import nock from 'nock'

nock.disableNetConnect()

let api

beforeEach(() => {
  api = nock('https://api.heroku.com')
})

afterEach(() => {
  api.done()
})

test('receiving string', async () => {
  api
    .get('/hello')
    .reply(200, 'hello!')
  let cmd = await API.mock('/hello')
  let stdout = cmd.out.stdout.output
  expect(stdout).toEqual('hello!\n')
})

test('--version=v3.foobar', async () => {
  api = nock('https://api.heroku.com', {
    reqheaders: {accept: 'application/vnd.heroku+json; version=3.foobar'}
  })
  api
    .get('/hello')
    .reply(200, 'hello!')
  let cmd = await API.mock('/hello', '--version=3.foobar')
  let stdout = cmd.out.stdout.output
  expect(stdout).toEqual('hello!\n')
})

test('--accept-inclusion=foobar', async () => {
  api = nock('https://api.heroku.com', {
    reqheaders: {'Accept-Inclusion': 'foobar'}
  })
  api
    .get('/hello')
    .reply(200, 'hello!')
  let cmd = await API.mock('/hello', '--accept-inclusion=foobar')
  let stdout = cmd.out.stdout.output
  expect(stdout).toEqual('hello!\n')
})

describe('404', () => {
  beforeEach(() => {
    api
      .get('/uhoh')
      .reply(404, 'uhoh!')
  })

  it('throws error', async () => {
    expect.assertions(1)
    try {
      await API.mock('/uhoh')
    } catch (err) {
      expect(err.message).toEqual("HTTP: 404 /uhoh\n'uhoh!'")
    }
  })
})

describe('GET /apps', () => {
  beforeEach(() => {
    api
      .get('/apps')
      .reply(200, [{name: 'myapp'}])
  })

  it('GETs by default', async () => {
    let cmd = await API.mock('/apps')
    let app = JSON.parse(cmd.out.stdout.output)[0]
    expect(app).toMatchObject({name: 'myapp'})
  })

  it('GETs', async () => {
    let cmd = await API.mock('GET', '/apps')
    let app = JSON.parse(cmd.out.stdout.output)[0]
    expect(app).toMatchObject({name: 'myapp'})
  })

  it('adds leading slash', async () => {
    let cmd = await API.mock('GET', 'apps')
    let app = JSON.parse(cmd.out.stdout.output)[0]
    expect(app).toMatchObject({name: 'myapp'})
  })
})

describe('stdin', () => {
  beforeEach(() => {
    api
      .post('/apps', {FOO: 'bar'})
      .reply(201, {name: 'myapp'})
  })

  it('POST', async () => {
    // $FlowFixMe
    let tty = process.stdin.isTTY
    // $FlowFixMe
    process.stdin.isTTY = false
    process.nextTick(() => {
      process.stdin.push('{"FOO": "bar"}')
      process.stdin.emit('end')
    })
    let cmd = await API.mock('POST', '/apps')
    let app = JSON.parse(cmd.out.stdout.output)
    expect(app).toMatchObject({name: 'myapp'})
    // $FlowFixMe
    process.stdin.isTTY = tty
  })
})

describe('--body', () => {
  beforeEach(() => {
    api
      .post('/apps', {FOO: 'bar'})
      .reply(201, {name: 'myapp'})
  })

  it('POST', async () => {
    let cmd = await API.mock('POST', '/apps', '--body', '{"FOO": "bar"}')
    let app = JSON.parse(cmd.out.stdout.output)
    expect(app).toMatchObject({name: 'myapp'})
  })
})
