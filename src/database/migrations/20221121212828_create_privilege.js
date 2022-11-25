/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('Privilege', function(table) {
    table.increments('id');
    table.string('name', 30).unique().notNullable();
    table.string('description', 100);
    table.dateTime('createdAt').notNullable();
    table.dateTime('updatedAt');
    table.dateTime('deletedAt');
  }).then(() => {
    return knex('Privilege').insert([
        { name: 'read_privilege', createdAt: new Date().toISOString() },
        { name: 'write_privilege', createdAt: new Date().toISOString() },
        { name: 'read_user-role', createdAt: new Date().toISOString() },
        { name: 'write_user-role', createdAt: new Date().toISOString() },
        { name: 'read_user-status', createdAt: new Date().toISOString() },
        { name: 'write_user-status', createdAt: new Date().toISOString() },
        { name: 'read_user', createdAt: new Date().toISOString() },
        { name: 'write_user', createdAt: new Date().toISOString() },
        { name: 'read_customer-status', createdAt: new Date().toISOString() },
        { name: 'write_customer-status', createdAt: new Date().toISOString() },
        { name: 'read_customer', createdAt: new Date().toISOString() },
        { name: 'write_customer', createdAt: new Date().toISOString() },
        { name: 'read_ingredient', createdAt: new Date().toISOString() },
        { name: 'write_ingredient', createdAt: new Date().toISOString() },
        { name: 'read_product-status', createdAt: new Date().toISOString() },
        { name: 'write_product-status', createdAt: new Date().toISOString() },
        { name: 'read_product', createdAt: new Date().toISOString() },
        { name: 'write_product', createdAt: new Date().toISOString() },
    ])
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('Privilege');
};
