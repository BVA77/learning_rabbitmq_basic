const amqp = require('amqplib')
const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rootpassword',
  database: 'test_rabbitmq'
})

connection.connect()

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function receiveOrders() {
	// connect to rabbitmq
  const conn = await amqp.connect('amqp://boss:password@localhost:5672')
  const channel = await conn.createChannel()

  const queue = 'reservation'
  await channel.assertQueue(queue, { durable: true })

  console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue)

  // use prefetch for waiting 1 queue finish first then take next queue
  channel.prefetch(1)
  // use consume to be receiver on the queue
  channel.consume(queue, async (msg) => {
    try {
		// buffer will contain in content and use toString to convert buffer back to string
      const reservation_order = JSON.parse(msg.content.toString())
      console.log(" [x] Received %s", reservation_order)

	  // add sleep for delay assume this is a time for manage some process
      await sleep(3000)

      const sql = 'INSERT INTO orders SET ?'
      connection.query(sql, reservation_order, (error, results) => {
        if (error) throw error
		console.log('Order saved to database with id: ' + results.insertId)
		
		// บอกว่าได้ message แล้ว
		channel.ack(msg)
      })

    } catch (error) {
      console.log('Error:', error.message)
    }
  })
}

receiveOrders()