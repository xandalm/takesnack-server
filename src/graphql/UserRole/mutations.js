const { GraphQLInt, GraphQLBoolean, GraphQLNonNull } = require("graphql");
const UserRoleController = require("../../controllers/UserRoleController");
const { GQLObject_UserRole, GQLInput_UserRole, GQLObject_UserRoleGrant } = require("./types");

const GQLMutations_UserRole = {
    createUserRole: {
        type: GQLObject_UserRole,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_UserRole) }
        },
        resolve: (_, { input }, { token }) => {
            return UserRoleController.createUserRole(token, input);
        }
    },
    updateUserRole: {
        type: GQLObject_UserRole,
        args: {
            input:  { type: new GraphQLNonNull(GQLInput_UserRole) }
        },
        resolve: (_, { input }, { token }) => {
            return UserRoleController.updateUserRole(token, input);
        }
    },
    deleteUserRole: {
        type: GQLObject_UserRole,
        args: {
            id: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { id }, { token }) => {
            return UserRoleController.deleteUserRole(token, id);
        }
    },
    grantPrivilege: {
        type: GQLObject_UserRoleGrant,
        args: {
            roleId: { type: new GraphQLNonNull(GraphQLInt) },
            privilegeId: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { roleId, privilegeId }, { token }) => {
            return UserRoleController.grantPrivilege(token, roleId, privilegeId);
        }
    },
    removePrivilege: {
        type: GraphQLBoolean,
        args: {
            roleId: { type: new GraphQLNonNull(GraphQLInt) },
            privilegeId: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { roleId, privilegeId }, { token }) => {
            return UserRoleController.removePrivilege(token, roleId, privilegeId);
        }
    }
}

module.exports = GQLMutations_UserRole;
