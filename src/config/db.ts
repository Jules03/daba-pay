import mongoose from "mongoose";

export const dbConnector = async (url: string, dbName: string) => {
	const conn = await mongoose.connect(`${url}${dbName}`);
	console.log(`DB connected: ${conn.connection.host} `);
};
