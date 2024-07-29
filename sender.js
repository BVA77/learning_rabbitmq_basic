const amqp = require('amqplib')
const { v4: uuidv4 } = require('uuid')

async function sendOrder(reservation_order) {
	// connect to rabbitmq
  const connection = await amqp.connect('amqp://boss:password@localhost:5672')
  const channel = await connection.createChannel()

  const queue = 'reservation'

  // durable: true คือ เขียนลง disk เอาไว้ กรณีที่ queue ดับ
  await channel.assertQueue(queue, { durable: true })

  // ใส่ persistent + durable จะได้ข้อมูล queue เดิมออกมาได้ ในกรณีที่ container down
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(reservation_order)), { persistent: true })
	console.log('send to queue ===>>', reservation_order)
  setTimeout(() => {
    connection.close()
    process.exit(0)
	// process.exit(0) is close node process
  }, 500)
}

for (let index = 0; index < 10; index++) {
	const reservation_order = {
		orderNumber: uuidv4(),
		room: parseInt(Math.random() * (10 - 1) + 1).toString(),
		quantity: 1,
		timeReserved: new Date().toString()
	  }
	  
	  sendOrder(reservation_order)
}
