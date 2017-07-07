// @flow

import API from './api'

test('runs the command', async () => {
  let cmd = await API.mock()
  expect(cmd.out.stdout.output).toEqual('hello world!\n')
})
