const { GraphQLNonNull, GraphQLInt, GraphQLString } = require("graphql");
const CustomerController = require("../../controllers/CustomerController");
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
        resolve: (_, args) => {
            return CustomerController.getAllCustomers(args);
        }
    },
    customer: {
        type: GQLObject_Customer,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { id }) => {
            return CustomerController.getCustomer(id);
        }
    }
}

module.exports = GQLQueries_Customer;
