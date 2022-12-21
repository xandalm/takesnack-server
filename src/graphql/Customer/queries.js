const { GraphQLNonNull, GraphQLInt, GraphQLString } = require("graphql");
const CustomerController = require("../../controllers/CustomerController");
const { Privilege } = require("../../models/Privilege");
const CustomError = require("../../utils/errors");
const { GQLInput_Condition, GQLInput_OrderBy } = require("../types");
const { GQLObject_Customer, GQLObject_CustomerPage } = require("./types");

const GQLQueries_Customer = {
    customers: {
        type: GQLObject_CustomerPage,
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: GQLInput_Condition },
            orderBy: { type: GQLInput_OrderBy }
        },
        resolve: (_, args, { token }) => {
            return CustomerController.getAllCustomers(token, args);
        }
    },
    customer: {
        type: GQLObject_Customer,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { id }, { token }) => {
            return CustomerController.getCustomer(token, id);
        }
    },
    customerToken: {
        type: GraphQLString,
        args: {
            phoneNumber: { type: new GraphQLNonNull(GraphQLString) },
            pwd: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (_, { phoneNumber, pwd }) => {
            return CustomerController.fromCredentials(phoneNumber, pwd);
        }
    }
}

module.exports = GQLQueries_Customer;
