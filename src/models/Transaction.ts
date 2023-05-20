import mongoose, { Schema, Document, Types } from "mongoose";

interface ITransaction extends Document {
	sender: Types.ObjectId;
	recipient: Types.ObjectId;
	amount: number;
	timestamp: string;
}

const TransactionSchema: Schema = new mongoose.Schema({
	sender: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "Account",
	},
	recipient: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "Account",
	},
	amount: {
		type: Number,
		required: true,
		default: 0,
		get: (value: number) => Number((value / 100).toFixed(2)),
		set: (value: number) => Math.round(value * 100),
	},
	timestamp: {
		type: Date,
		default: Date.now(),
	},
});

const Transaction = mongoose.model<ITransaction>(
	"Transaction",
	TransactionSchema
);

export default Transaction;
