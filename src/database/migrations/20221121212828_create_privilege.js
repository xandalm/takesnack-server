/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('Privilege', function(table) {
    table.integer('id').unique().notNullable();
    table.string('name', 30).unique().notNullable();
    table.string('description', 100);
    table.dateTime('createdAt').notNullable();
  }).then(() => {
    return knex('Privilege').insert([
        { id: 1, name: 'read_privilege', createdAt: new Date().toISOString() },
        { id: 2, name: 'read_user_role', createdAt: new Date().toISOString() },
        { id: 3, name: 'write_user_role', createdAt: new Date().toISOString() },
        { id: 4, name: 'read_user_status', createdAt: new Date().toISOString() },
        { id: 5, name: 'read_user', createdAt: new Date().toISOString() },
        { id: 6, name: 'write_user', createdAt: new Date().toISOString() },
        { id: 7, name: 'read_customer_status', createdAt: new Date().toISOString() },
        { id: 8, name: 'read_customer', createdAt: new Date().toISOString() },
        { id: 9, name: 'write_customer', createdAt: new Date().toISOString() },
        { id: 10, name: 'read_ingredient', createdAt: new Date().toISOString() },
        { id: 11, name: 'write_ingredient', createdAt: new Date().toISOString() },
        { id: 12, name: 'read_product_status', createdAt: new Date().toISOString() },
        { id: 13, name: 'read_product_category', createdAt: new Date().toISOString() },
        { id: 14, name: 'write_product_category', createdAt: new Date().toISOString() },
        { id: 15, name: 'read_product', createdAt: new Date().toISOString() },
        { id: 16, name: 'write_product', createdAt: new Date().toISOString() },
        { id: 17, name: 'read_delivery_type', createdAt: new Date().toISOString() },
        { id: 18, name: 'read_order_status', createdAt: new Date().toISOString() },
        { id: 19, name: 'read_order', createdAt: new Date().toISOString() },
        { id: 20, name: 'write_order', createdAt: new Date().toISOString() },
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
