import {expect, test} from '@oclif/test'
import * as nock from 'nock'

// const windows = process.platform === 'win32'
// const skipOnWindows = windows ? test.skip : test

describe('api', () => {
  test
  .nock('https://api.heroku.com', api => api
  .get('/hello')
  .reply(200, 'hello!'),
  )
  .stdout()
  .command(['api', '/hello'])
  .do(({stdout}) => expect(stdout).to.equal('hello!\n'))
  .it('receives string')

  test
  .add('api', () => nock('https://api.heroku.com', {
    reqheaders: {accept: 'application/vnd.heroku+json; version=3.foobar'},
  }))
  .do(({api}) => {
    api.get('/hello')
    .reply(200, 'hello!')
  })
  .stdout()
  .command(['api', '/hello', '--version=3.foobar'])
  .do(({stdout}) => expect(stdout).to.equal('hello!\n'))
  .it('--version=v3.foobar')

  test
  .nock('https://api.heroku.com', {reqheaders: {'Accept-Inclusion': 'foobar'}}, api => api
  .get('/hello')
  .reply(200, 'hello!'),
  )
  .stdout()
  .command(['api', '/hello', '--accept-inclusion=foobar'])
  .it('--accept-inclusion=foobar')

  describe('404', () => {
    test
    .skip()
    .nock('https://api.heroku.com', api => api
    .get('/uhoh')
    .reply(404, 'uhoh!'),
    )
    .command(['api', '/uhoh'])
    .catch(/FOOBAR/)
    .it('throws error')
    // expect(err.message).toEqual('HTTP Error 404 for GET https://api.heroku.com:443/uhoh\nuhoh!')
  })

  // describe('GET /apps', () => {
  //   beforeEach(() => {
  //     api
  //       .get('/apps')
  //       .reply(200, [{name: 'myapp'}])
  //   })

  //   test
  //   .it('GETs by default', async () => {
  //     let cmd = await API.mock('/apps')
  //     let app = JSON.parse(cmd.out.stdout.output)[0]
  //     expect(app).toMatchObject({name: 'myapp'})
  //   })

  //   test
  //   .it('GETs', async () => {
  //     let cmd = await API.mock('GET', '/apps')
  //     let app = JSON.parse(cmd.out.stdout.output)[0]
  //     expect(app).toMatchObject({name: 'myapp'})
  //   })

  //   it('adds leading slash', async () => {
  //     let cmd = await API.mock('GET', 'apps')
  //     let app = JSON.parse(cmd.out.stdout.output)[0]
  //     expect(app).toMatchObject({name: 'myapp'})
  //   })
  // })

  // describe('with next-range header', () => {
  //   beforeEach(() => {
  //     api.get('/apps')
  //       .reply(206, [1, 2, 3], {
  //         'next-range': '4'
  //       })
  //       .get('/apps')
  //       .matchHeader('range', '4')
  //       .reply(206, [4, 5, 6], {
  //         'next-range': '7'
  //       })
  //       .get('/apps')
  //       .matchHeader('range', '7')
  //       .reply(206, [7, 8, 9])
  //   })
  //   test('gets next body when next-range is set', async () => {
  //     let cmd = await API.mock('GET', '/apps')
  //     let app = JSON.parse(cmd.out.stdout.output)[8]
  //     expect(app).toEqual(9)
  //   })
  // })

  // describe('stdin', () => {
  //   beforeEach(() => {
  //     api
  //       .post('/apps', {FOO: 'bar'})
  //       .reply(201, {name: 'myapp'})
  //   })

  //   skipOnWindows('POST', async () => {
  //     // $FlowFixMe
  //     process.stdin.isTTY = false
  //     process.nextTick(() => {
  //       process.stdin.push('{"FOO": "bar"}')
  //       process.stdin.emit('end')
  //     })
  //     let cmd = await API.mock('POST', '/apps')
  //     let app = JSON.parse(cmd.out.stdout.output)
  //     expect(app).toMatchObject({name: 'myapp'})
  //   })
  // })

  // describe('--body', () => {
  //   beforeEach(() => {
  //     api
  //       .post('/apps', {FOO: 'bar'})
  //       .reply(201, {name: 'myapp'})
  //   })

  //   it('POST', async () => {
  //     let cmd = await API.mock('POST', '/apps', '--body', '{"FOO": "bar"}')
  //     let app = JSON.parse(cmd.out.stdout.output)
  //     expect(app).toMatchObject({name: 'myapp'})
  //   })
  // })

  // describe('500 error', () => {
  //   beforeEach(() => {
  //     api
  //       .get('/apps')
  //       .reply(500, {message: 'uh oh'})
  //   })

  //   it('errors', async () => {
  //     expect.assertions(1)
  //     try {
  //       await API.mock('GET', '/apps')
  //     } catch (err) {
  //       expect(err).toMatchObject({message: 'uh oh'})
  //     }
  //   })
  // })
})
