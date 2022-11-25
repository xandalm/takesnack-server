/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('Customer', function(table) {
    table.string('id', 32).primary();
    table.string('phoneNumber', 25).unique().notNullable();
    table.string('name', 40).notNullable();
    table.string('pwd', 64).notNullable();
    table.integer('status').notNullable();
    table.dateTime('createdAt').notNullable();
    table.dateTime('updatedAt');
    table.dateTime('deletedAt');
    table.foreign('status').references('CustomerStatus.id').withKeyName('fk_customer_customer-status');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('Customer');
};
