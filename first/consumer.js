const redis_client = require('redis').createClient()
const redis_pub = require('redis').createClient()
const { promisify } = require('util')

const lrange_async = promisify(redis_client.lrange).bind(redis_client)
const publish_async = promisify(redis_pub.publish).bind(redis_pub)
const brpopAsync = promisify(redis_client.brpop).bind(redis_client)

module.exports = class Consumer {
  constructor(produce_consume_client) {
    this.produce_consume_client = produce_consume_client
  }

  async consume() {
    try {
      while (true) {
        const [, msg] = (await brpopAsync('messages_queue', 2)) || []
        if (msg) {
            if (this.isError() !== -1) {
                await this.produce_consume_client.err_queue('corrupted_messages', msg)
            } else {
                await this.produce_consume_client.res_queue('results', msg)
                console.log('\x1b[34m%s\x1b[0m', msg)
            }
        } else {
          const has_producer = await publish_async('producer_exist', 'ping')
          if (!has_producer) {
            this.produce_consume_client.changeState('produce')
            return
          }
        }
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async activate() {
    try {
      await this.consume()
    } catch (error) {
      throw new Error(error)
    }
  }

  isError(chance = 5) {
    const error_chance = Math.random() * 100
    return error_chance < chance ? 1 : -1
  }
}
