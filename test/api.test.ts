import {expect, test} from '@oclif/test'
import * as nock from 'nock'

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
    .nock('https://api.heroku.com', api => api
      .get('/hello')
      .reply(200, 'hello!'),
    )
    .stdout()
    .command(['api', 'hello'])
    .do(({stdout}) => expect(stdout).to.equal('hello!\n'))
    .it('adds leading slash')

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

  test
    .stderr()
    .nock('https://api.heroku.com', api => api
      .get('/uhoh')
      .reply(404, 'uhoh!'),
    )
    .command(['api', '/uhoh'])
    .catch((error: Error) => {
      expect(error.message).to.contain('HTTP Error 404 for GET https://api.heroku.com/uhoh\nuhoh!')
    })
    .it('throws error when it receives an error response')

  test
    .stdout()
    .nock('https://api.heroku.com', api => api
      .get('/hello')
      .reply(206, [1, 2, 3], {'next-range': '4'})
      .get('/hello')
      .matchHeader('range', '4')
      .reply(206, [4, 5, 6], {'next-range': '7'})
      .get('/hello')
      .matchHeader('range', '7')
      .reply(206, [7, 8, 9])
    )
    .command(['api', '/hello'])
    .it('gets next body when next-range is set', ({stdout}) => {
      expect(stdout).to.equal('[\n  1,\n  2,\n  3,\n  4,\n  5,\n  6,\n  7,\n  8,\n  9\n]\n')
    })
})
