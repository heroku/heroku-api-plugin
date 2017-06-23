exports.topic = {
  name: 'api',
  description: 'call the Heroku API directly'
}

exports.commands = [
  require('./commands/api')
]
