const { GraphQLNonNull, GraphQLInt, GraphQLString } = require("graphql");
const UserController = require("../../controllers/UserController");
const { Privilege } = require("../../models/Privilege");
const { User } = require("../../models/User");
const { UserRole } = require("../../models/UserRole");
const CustomError = require("../../utils/errors");
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
        resolve: (_, args, { token }) => {
            return UserController.getAllUsers(token, args);
        }
    },
    user: {
        type: GQLObject_User,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { id }, { token }) => {
            return UserController.getUser(token, id);
        }
    },
    userToken: {
        type: GraphQLString,
        args: {
            phoneNumber: { type: new GraphQLNonNull(GraphQLString) },
            pwd: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (_, { phoneNumber, pwd }) => {
            return UserController.fromCredentials(phoneNumber, pwd);
        }
    }
}

module.exports = GQLQueries_User;
