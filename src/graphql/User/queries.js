const { GraphQLNonNull, GraphQLInt, GraphQLString } = require("graphql");
const UserController = require("../../controllers/UserController");
const { GQLInput_Condition, GQLInput_OrderBy } = require("../types");
const { GQLObject_User, GQLObject_UserPage } = require("./types");

const GQLQueries_User = {
    users: {
        type: GQLObject_UserPage,
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: GQLInput_Condition },
            orderBy: { type: GQLInput_OrderBy }
        },
        resolve: (_, args) => {
            return UserController.getAllUsers(args);
        }
    },
    user: {
        type: GQLObject_User,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { id }) => {
            return UserController.getUser(id);
        }
    }
}

module.exports = GQLQueries_User;
