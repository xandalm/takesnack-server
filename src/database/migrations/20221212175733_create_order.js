/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('Order', function(table) {
    table.string('id', 32).primary();
    table.string('customer', 32).notNullable();
    table.integer('deliveryType').notNullable();
    table.string('deliveryTo', 50).notNullable();
    table.decimal('total', 2).notNullable();
    table.smallint('status').notNullable();
    table.dateTime('createdAt').notNullable();
    table.dateTime('updatedAt');
    table.dateTime('deletedAt');
    table.foreign('customer').references('Customer.id').withKeyName('fk_order_customer');
    table.foreign('deliveryType').references('DeliveryType.id').withKeyName('fk_order_delivery-type');
    table.foreign('status').references('OrderStatus.id').withKeyName('fk_order_order-status');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('Order');
};
