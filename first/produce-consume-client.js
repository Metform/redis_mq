const { promisify } = require('util')
const redis_client = require('redis').createClient()
const el_range_async = promisify(redis_client.lrange).bind(redis_client)
const el_del_async = promisify(redis_client.del).bind(redis_client)
const rpush_async = promisify(redis_client.rpush).bind(redis_client)


const Producer = require('./producer.js')
const Consumer = require('./consumer.js')

class ProduceConsumeClient {
  constructor(options) {
    this.options = options // host port of redis server ...
    this.err_queue = rpush_async
    this.res_queue = rpush_async
    this.currentState = null
    this.states = {
      produce: new Producer(this),
      consume: new Consumer(this),
    }
    this.changeState('produce')
  }

  changeState(state) {
    console.log('Activating state: ' + state)
    this.currentState = this.states[state]
    this.currentState.activate()
  }

  static async printErrors() {
    try {
      const listErrors = await el_range_async('corrupted_messages', 0, -1)
      while (listErrors.length) {
        console.log('\x1b[31m%s\x1b[0m', listErrors.splice(0, 20))
      }
      await el_del_async('corrupted_messages')
      console.log('No more corrupted messages')
    } catch (err) {
      throw new Error(err)
    }
  }
}

module.exports = options => options === 'getErrors' ? ProduceConsumeClient.printErrors() : new ProduceConsumeClient(options)
