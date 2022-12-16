const { Product } = require("../models/Product");
const { Order, OrderItem } = require("../models/Order");
const { OrderStatus } = require("../models/OrderStatus");
const { Condition } = require("../utils/condition");
const CustomError = require("../utils/errors");
const { OrderBy } = require("../utils/order");
const { Customer } = require("../models/Customer");
const { DeliveryType } = require("../models/DeliveryType");

class OrderControllerClass {

    async createOrder(input) {
        var response;
        try {
            const props = {};
            props.deliveryTo = input?.deliveryTo;
            props.deliveryType = await DeliveryType.get(input?.deliveryTypeId);
            if(!props.deliveryType)
                throw new CustomError("Cannot find delivery type");
            props.customer = await Customer.get(input?.customerId);
            if(!props.customer)
                throw new CustomError("Cannot find customer");
            if(Array.isArray(input?.items) && input.items.length === 0)
                throw new CustomError("Cannot create order without any item");
            const order = new Order(props);
            if(await order.insert()) {
                try {
                    for (const item of input.items) {
                        const product = await Product.get(item.productId);
                        await new OrderItem({ order, product, quantity: item.quantity }).insert()
                    }
                    response = await Order.get(order.id);
                } catch (error) {
                    await order.delete();
                    if(err instanceof CustomError)
                        throw err;
                    else
                        throw new CustomError("Some items could not be registered. Please try again =(");
                }
            }
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async updateOrder(input) {
        var response;
        try {
            const props = Object.assign({}, input);
            const order = await Order.get(props?.id);
            if(!order)
                throw new CustomError("Cannot find order");
            if(props.hasOwnProperty('customerId')) {
                order.customer = await Customer.get(props.customerId);
                if(!order.customer)
                    throw new CustomError("Cannot find customer");
            }
            if(props.hasOwnProperty('deliveryTypeId')) {
                order.deliveryType = await DeliveryType.get(props.deliveryTypeId);
                if(!order.deliveryType)
                    throw new CustomError("Cannot find delivery type");
            }
            if(props.hasOwnProperty('deliveryTo'))
                order.deliveryTo = props.deliveryTo;
            if(props.hasOwnProperty('statusId'))
                order.status = await OrderStatus.get(props.statusId);
            if(await order.update())
                response = order;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async deleteOrder(id) {
        var response;
        try {
            const order = await Order.get(id);
            if(!order)
                throw new CustomError("Cannot find order");
            if(await order.delete())
                response = order;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getOrder(id) {
        var response;
        try {
            response = await Order.get(id);
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getAllOrders({ page, limit, where, orderBy }) {
        var response;
        try {
            const condition = Condition.from(where);
            orderBy = OrderBy.from(orderBy);
            response = {
                rows: await Order.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await Order.count(condition),
                total: await Order.count()
            };
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async addOrderItem(orderId, productId, quantity) {
        var response;
        try {
            const order = await Order.get(orderId);
            if(!order)
                throw new CustomError("Cannot find order");
            const product = await Product.get(productId);
            if(!product)
                throw new CustomError("Cannot find product");
            const orderItem = new OrderItem({ order, product, quantity });
            if(await orderItem.insert())
                response = orderItem;
        } catch (err) { console.log(err);
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async updateOrderItem(orderId, productId, quantity) {
        var response;
        try {
            const orderItem = await OrderItem.get(orderId, productId);
            if(!orderItem || orderItem.deletedAt)
                throw new CustomError("Cannot find order item");
            if(quantity) {
                orderItem.quantity = quantity;
                if(await orderItem.update())
                    response = orderItem;
            } else
                throw new CustomError("Nothing to update");
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async removeOrderItem(orderId, productId) {
        var response;
        try {
            const orderItem = await OrderItem.get(orderId, productId);
            if(!orderItem)
                throw new CustomError("Cannot find order item");
            response = await orderItem.delete();
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

}

const OrderController = new OrderControllerClass;

module.exports = OrderController;
