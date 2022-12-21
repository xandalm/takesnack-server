const { GraphQLNonNull, GraphQLString } = require("graphql");
const CustomerController = require("../../controllers/CustomerController");
const { GQLObject_Customer, GQLInput_Customer } = require("./types");

const GQLMutations_Customer = {
    createCustomer: {
        type: GQLObject_Customer,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_Customer) }
        },
        resolve: (_, { input }, { token }) => {
            return CustomerController.createCustomer(token, input);
        }
    },
    updateCustomer: {
        type: GQLObject_Customer,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_Customer) }
        },
        resolve: (_, { input }, { token }) => {
            return CustomerController.updateCustomer(token, input);
        }
    },
    deleteCustomer: {
        type: GQLObject_Customer,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { id }, { token }) => {
            return CustomerController.deleteCustomer(token, id);
        }
    }
}

module.exports = GQLMutations_Customer;
