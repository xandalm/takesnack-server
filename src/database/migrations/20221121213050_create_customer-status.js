/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('CustomerStatus', function(table) {
        table.increments('id');
        table.string('name', 30).unique().notNullable();
        table.string('description', 100);
        table.dateTime('createdAt').notNullable();
    }).then(() => {
        return knex('CustomerStatus').insert([
            { name: 'ACTIVE', createdAt: new Date().toISOString() },
            { name: 'INACTIVE', createdAt: new Date().toISOString() },
            { name: 'RESTRICTED', createdAt: new Date().toISOString() }
        ])
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('CustomerStatus');
};
