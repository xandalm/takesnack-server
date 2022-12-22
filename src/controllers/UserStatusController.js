const { UserStatus } = require("../models/UserStatus");
const { Condition } = require("../utils/condition");
const { OrderBy } = require("../utils/order");
const CustomError = require("../utils/errors");
const Controller = require("./Controller");

class UserStatusControllerClass extends Controller {

    async getUserStatus(accessToken, id) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        var response;
        try {
            response = await UserStatus.get(id);
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getAllUserStatuses(accessToken, { page, limit, where, orderBy }) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        var response;
        try {
            const condition = Condition.from(where);
            orderBy = OrderBy.from(orderBy);
            response = {
                rows: await UserStatus.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await UserStatus.count(condition),
                total: await UserStatus.count()
            };
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

}

const UserStatusController = new UserStatusControllerClass;

module.exports = UserStatusController;
