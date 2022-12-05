const { GraphQLNonNull, GraphQLString } = require("graphql");
const CustomerController = require("../../controllers/CustomerController");
const { GQLObject_Customer, GQLInput_Customer } = require("./types");

const GQLMutations_Customer = {
    createCustomer: {
        type: GQLObject_Customer,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_Customer) }
        },
        resolve: (_, { input }) => {
            return CustomerController.createCustomer(input);
        }
    },
    updateCustomer: {
        type: GQLObject_Customer,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_Customer) }
        },
        resolve: (_, { input }) => {
            return CustomerController.updateCustomer(input);
        }
    },
    deleteCustomer: {
        type: GQLObject_Customer,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { id }) => {
            return CustomerController.deleteCustomer(id);
        }
    }
}

module.exports = GQLMutations_Customer;
