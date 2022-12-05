const { Customer } = require("../models/Customer");
const { CustomerStatus } = require("../models/CustomerStatus");
const { Condition } = require("../utils/condition");
const CustomError = require("../utils/errors");
const { OrderBy } = require("../utils/order");

class CustomerControllerClass {

    async createCustomer(input) {
        var response;
        try {
            const props = Object.assign({}, input);
            const user = new Customer(props);
            if(await user.insert())
                response = user;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async updateCustomer(input) {
        var response;
        try {
            const props = Object.assign({}, input);
            const user = await Customer.get(props?.id);
            if(!user)
                throw new CustomError("Cannot find customer");
            if(props.hasOwnProperty('phoneNumber'))
                user.phoneNumber = props.phoneNumber;
            if(props.hasOwnProperty('name'))
                user.name = props.name;
            if(props.hasOwnProperty('pwd'))
                user.pwd = props.pwd;
            if(props.hasOwnProperty('statusId'))
                user.status = await CustomerStatus.get(props.statusId);
            if(await user.update())
                response = user;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async deleteCustomer(id) {
        var response;
        try {
            const user = await Customer.get(id);
            if(!user)
                throw new CustomError("Cannot find customer");
            if(await user.delete())
                response = user;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getCustomer(id) {
        var response;
        try {
            response = await Customer.get(id);
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getAllCustomers({ page, limit, where, orderBy }) {
        var response;
        try {
            const condition = Condition.from(where);
            orderBy = OrderBy.from(orderBy);
            response = {
                rows: await Customer.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await Customer.count(condition),
                total: await Customer.count()
            };
        } catch (err) { console.log(err);
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

}

const CustomerController = new CustomerControllerClass;

module.exports = CustomerController;
