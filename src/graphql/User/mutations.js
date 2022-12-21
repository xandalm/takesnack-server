const { GraphQLNonNull, GraphQLString, Token } = require("graphql");
const UserController = require("../../controllers/UserController");
const { GQLObject_User, GQLInput_User } = require("./types");

const GQLMutations_User = {
    createUser: {
        type: GQLObject_User,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_User) }
        },
        resolve: (_, { input }, { token }) => {
            return UserController.createUser(token, input);
        }
    },
    updateUser: {
        type: GQLObject_User,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_User) }
        },
        resolve: (_, { input }, { token }) => {
            return UserController.updateUser(token, input);
        }
    },
    deleteUser: {
        type: GQLObject_User,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { id }, { token }) => {
            return UserController.deleteUser(token, id);
        }
    }
}

module.exports = GQLMutations_User;
