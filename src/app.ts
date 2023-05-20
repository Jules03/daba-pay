const dotenv = require("dotenv");
dotenv.config();
import express from "express";
import { graphqlHTTP } from "express-graphql";
import { dbConnector } from "./config/db";
import { schema } from "./graphql/schema";
import { root } from "./graphql/resolver";
import { connectConsumer, consumeMessages } from "./config/kafkaConsumer";

const PORT = process.env.PORT || 8080,
	DB_URI = "mongodb://127.0.0.1:27017/",
	DB_NAME = "dabaPay";

let app: express.Application = express();
// Connect to database
dbConnector(DB_URI, DB_NAME);
app.use(
	"/graphql",
	graphqlHTTP({
		schema,
		rootValue: root,
		graphiql: true,
	})
);

const InitConsumer = () => {
	connectConsumer().then(consumeMessages);
};

InitConsumer();
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
