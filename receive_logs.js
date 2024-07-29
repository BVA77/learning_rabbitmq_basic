const amqp = require('amqplib')

async function receiveLog() {
	console.log('receiveLog connecting...')
	// connect to rabbitmq
	const connection = await amqp.connect('amqp://boss:password@localhost:5672')
	const channel = await connection.createChannel()

	const exchange = 'logs'

	await channel.assertExchange(exchange, 'fanout', { durable: false })
	console.log('before assert queue...')
	const q = await channel.assertQueue('')
	await channel.bindQueue(q.queue, exchange, '')
	channel.consume(q.queue, (msg) => {
		console.log('in consume queue...')
		if (msg.content) console.log(" [x] %s", msg.content.toString())
	}, {noAck: true})
}

receiveLog()
