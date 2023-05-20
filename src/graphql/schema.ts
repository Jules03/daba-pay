import { buildSchema } from "graphql";

export const schema = buildSchema(`
    type Query {
        account(email: String!, password: String!): Account
        balance(accountID: ID!): Float!
        transactions(accountID: ID!): [Transaction]
    }

    type Mutation {
        createAccount(name: String!, email: String!, password: String!): Account
        login(email: String!, password: String!): Account
        transfer(senderID: ID!, email: String!, amount: Float!): Transaction
    }

    type Account {
        id: ID!
        name: String!
        email: String!
        password: String!
    }

    type Transaction {
        id: ID!
        sender: Account!
        recipient: Account!
        amount: Float!
        timestamp: String!
    }
`);
