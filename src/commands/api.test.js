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

describe('POST /apps', () => {
  beforeEach(() => {
    api
      .post('/apps')
      .reply(201, {name: 'myapp'})
  })

  it('POST', async () => {
    // $FlowFixMe
    process.stdin.isTTY = false
    process.nextTick(() => {
      process.stdin.push('{"FOO": "bar"}')
      process.stdin.emit('end')
    })
    let cmd = await API.mock('POST', '/apps')
    let app = JSON.parse(cmd.out.stdout.output)
    expect(app).toMatchObject({name: 'myapp'})
  })
})
