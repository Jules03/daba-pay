import { Hasher, ValidateHash } from "../misc";
import Account from "../models/Account";
import validator from "validator";
import Transaction from "../models/Transaction";
import mongoose from "mongoose";
import { produceMessage } from "../config/kafkaProducer";

// Method to create new account
const createAccount = async (payload: any) => {
	if (
		!validator.isEmpty(payload.name) &&
		!validator.isEmpty(payload.password) &&
		validator.isEmail(payload.email)
	) {
		payload.password = await Hasher(payload.password.trim());
		const account = new Account({
			name: payload.name.trim(),
			email: payload.email.trim(),
			password: payload.password,
		});
		return account.save();
	} else throw new Error("Invalid data input");
};

// Method to login
const login = async (payload: any) => {
	if (
		validator.isEmail(payload.email) &&
		!validator.isEmpty(payload.password)
	) {
		let account = await Account.findOne({ email: payload.email.trim() });
		if (account) {
			// Validate password
			if (await ValidateHash(payload.password.trim(), account.password))
				return account;
			else throw new Error("Invalid credentials");
		} else throw new Error("Account not found");
	} else throw new Error("Invalid data input");
};

// Method to fetch balance
const balance = async (payload: any) => {
	if (validator.isMongoId(payload.accountID)) {
		let account = await Account.findById(payload.accountID.trim());
		if (account) return account.balance;
		else throw new Error("Account not found");
	} else throw new Error("Invalid Account ID");
};

// Method to transfer money
const transfer = async (payload: any) => {
	if (
		validator.isMongoId(payload.senderID) &&
		validator.isEmail(payload.email) &&
		payload.amount > 0
	) {
		let senderAccount, recipientAccount;

		try {
			// retrieve sender account and check if balance is enough
			senderAccount = await Account.findById(payload.senderID.trim());
			recipientAccount = await Account.findOne({
				email: payload.email.trim(),
			});
			if (senderAccount && recipientAccount) {
				// check if sender has enough balance.
				if (senderAccount.balance >= payload.amount) {
					// perform debit of sender and credit of recipient
					senderAccount.balance = senderAccount.balance - payload.amount;

					recipientAccount.balance =
						recipientAccount.balance + payload.amount;

					// update sender and recipient accounts
					await Account.updateOne(
						{ _id: senderAccount.id },
						{ balance: senderAccount.balance }
					);

					await Account.updateOne(
						{ _id: recipientAccount._id },
						{ balance: recipientAccount.balance }
					);

					// create new Transaction
					let transaction = new Transaction({
						sender: senderAccount._id,
						recipient: recipientAccount._id,
						amount: payload.amount,
					});
					let transactionObj = await transaction.save();

					//insert producer here
					produceMessage("transfers", JSON.stringify(transactionObj));

					if (transactionObj) {
						return {
							id: transactionObj._id,
							sender: senderAccount,
							recipient: recipientAccount,
							amount: payload.amount,
							timestamp: transactionObj.timestamp,
						};
					} else throw new Error("Transaction error");
				}
				throw new Error("Insufficient balance");
			} else throw new Error("Invalid sender or recipient account");
		} catch (error) {
			console.error("Error performing transfer:", error);
			throw new Error("Transaction error");
		} finally {
		}
	} else throw new Error("Invalid data input");
};

// Method to fetch transactions
const transactions = async (payload: any) => {
	if (validator.isMongoId(payload.accountID)) {
		let account = await Account.findById(payload.accountID.trim());
		if (account) {
			// retrieve transactions of user
			let transactionsList = await Transaction.find({
				sender: account._id,
			}).populate(["sender", "recipient"]);
			return transactionsList;
		} else throw new Error("Account not found");
	}
	throw new Error("Invalid Account ID");
};

export const root = {
	createAccount: createAccount,
	login: login,
	balance: balance,
	transfer: transfer,
	transactions: transactions,
};
