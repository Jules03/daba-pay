import { Kafka, logLevel } from "kafkajs";

// assign confluence config params
const broker: any = process.env.bootstrap_server,
	mechanism: any = process.env.sasl_mechanism,
	username: any = process.env.sasl_username,
	password: any = process.env.sasl_password;

// Configure Kafka
const kafka = new Kafka({
	clientId: process.env.clientId,
	brokers: [broker],
	ssl: true,
	sasl: {
		mechanism: mechanism,
		username: username,
		password: password,
	},
	logLevel: logLevel.ERROR, // Optional: Set log level
});

// Create a Kafka consumer
const consumer = kafka.consumer({ groupId: "daba-pay-consumer" });

// Method to connect the consumer
export const connectConsumer = async () => {
	await consumer.connect();
	console.log("Consumer connected to Confluent Cloud cluster");

	// Subscribe to topics
	await consumer.subscribe({ topic: "transfers" });
	console.log("Consumer subscribed to topic");
};

// Method to consume the messages from the topic
export const consumeMessages = async () => {
	await consumer.run({
		eachMessage: async ({ topic, partition, message }: any) => {
			const messageValue = message.value.toString();
			console.log(
				`Received message from topic "${topic}" - Partition ${partition} - Offset ${message.offset}: ${messageValue}`
			);
		},
	});
};
