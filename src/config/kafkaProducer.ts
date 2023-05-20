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

// Create a Kafka producer
const producer = kafka.producer();

// Method to produce messages to confluence cluster
export const produceMessage = async (topic: string, message: string) => {
	try {
		await producer.connect();
		console.log("Producer connected");
		await producer.send({
			topic,
			messages: [{ value: message }],
		});
		console.log("Message produced:", message);
	} catch (error) {
		console.error("Error encountered: ", error);
	} finally {
		producer.disconnect();
	}
};
