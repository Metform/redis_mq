const { promisify } = require('util')
const uuid = require('uuid')
const redis_client = require('redis').createClient()
const redis_pub = require('redis').createClient()
const redis_sub = require('redis').createClient()
const publish_async = promisify(redis_pub.publish).bind(redis_pub)

module.exports = class Producer {
  constructor(produce_consume_client) {
    this.produce_consume_client = produce_consume_client
    this.counter = 0
  }

  produce() {
    setInterval(() => {
      redis_client.lpush('messages_queue', `${++this.counter} - ${uuid.v4()} - ${uuid.v1()}`)
      console.log('produce:', this.counter)
    }, 500)
  }

  async activate() {
    const has_producer = await publish_async('producer_exist', 'ping')
    if (!has_producer) {
      redis_sub.subscribe('producer_exist')
      this.produce()
    } else {
      this.produce_consume_client.changeState('consume')
    }
  }
}
