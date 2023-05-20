import mongoose, { Schema, Document, Model } from "mongoose";

interface IAccount extends Document {
	name: string;
	email: string;
	password: string;
	balance: number;
}

const AccountSchema: Schema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	balance: {
		type: Number,
		default: 0,
		get: (value: number) => Number((value / 100).toFixed(2)),
		set: (value: number) => Math.round(value * 100),
	},
});

const Account = mongoose.model<IAccount>("Account", AccountSchema);

export default Account;
