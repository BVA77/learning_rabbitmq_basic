const amqp = require('amqplib')

async function sendLog(log_message) {
	// connect to rabbitmq
  const connection = await amqp.connect('amqp://boss:password@localhost:5672')
  const channel = await connection.createChannel()

  const exchange = 'logs'

  await channel.assertExchange(exchange, 'fanout', { durable: false })
  await channel.publish(exchange, '', Buffer.from(log_message))
  console.log(" [x] Sent %s", log_message);

  setTimeout(() => {
    connection.close()
    process.exit(0)
	// process.exit(0) is close node process
  }, 500)
}

const log_message = 'testing log'

// sendLog(log_message)

for (let index = 0; index < 10; index++) {
	sendLog(log_message)
}
