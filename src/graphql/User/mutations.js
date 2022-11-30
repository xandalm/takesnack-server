const { GraphQLNonNull, GraphQLString } = require("graphql");
const UserController = require("../../controllers/UserController");
const { GQLObject_User, GQLInput_User } = require("./types");

const GQLMutations_User = {
    createUser: {
        type: GQLObject_User,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_User) }
        },
        resolve: (_, { input }) => {
            return UserController.createUser(input);
        }
    },
    updateUser: {
        type: GQLObject_User,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_User) }
        },
        resolve: (_, { input }) => {
            return UserController.updateUser(input);
        }
    },
    deleteUser: {
        type: GQLObject_User,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { id }) => {
            return UserController.deleteUser(id);
        }
    }
}

module.exports = GQLMutations_User;
