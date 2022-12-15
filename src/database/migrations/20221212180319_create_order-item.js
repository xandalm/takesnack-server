/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('OrderItem', function(table) {
    table.string('order', 32).notNullable();
    table.string('product', 32).notNullable();
    table.integer('quantity').notNullable();
    table.decimal('price', 2).notNullable();
    table.dateTime('createdAt').notNullable();
    table.dateTime('updatedAt');
    table.dateTime('deletedAt');
    table.foreign('order').references('Order.id').withKeyName('fk_order-item_order');
    table.foreign('product').references('Product.id').withKeyName('fk_order-item_product');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('OrderItem');
};
