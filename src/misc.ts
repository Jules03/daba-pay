import bcrypt from "bcryptjs";

const SALT_ROUNDS = 8;

export const Hasher = async (payload: string) => {
	let hash = await bcrypt.hash(payload, SALT_ROUNDS);
	return hash;
};

export const ValidateHash = async (data: string, hashedData: string) => {
	return bcrypt.compare(data, hashedData);
};
