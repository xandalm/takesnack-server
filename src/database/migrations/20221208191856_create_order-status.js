/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('OrderStatus', function(table) {
        table.smallint('id').primary();
        table.string('name', 30).unique().notNullable();
        table.string('description', 100);
        table.dateTime('createdAt').notNullable();
        table.dateTime('deletedAt');
    }).then(() => {
        return knex('OrderStatus').insert([
            { id: 1, name: 'IN_QUEUE', createdAt: new Date().toISOString() },
            { id: 2, name: 'PROVIDING', createdAt: new Date().toISOString() },
            { id: 3, name: 'READY', createdAt: new Date().toISOString() },
            { id: 4, name: 'IN_DELIVERY', createdAt: new Date().toISOString() },
            { id: 5, name: 'DELIVERED', createdAt: new Date().toISOString() },
            { id: 6, name: 'PAID_OUT', createdAt: new Date().toISOString() }
        ])
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('OrderStatus');
};
