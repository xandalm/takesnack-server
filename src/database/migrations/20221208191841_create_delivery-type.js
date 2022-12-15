/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex) {
    return knex.schema.createTable('DeliveryType', function(table) {
        table.increments('id');
        table.string('name', 30).unique().notNullable();
        table.string('description', 100);
        table.dateTime('createdAt').notNullable();
    }).then(() => {
        return knex('DeliveryType').insert([
            { name: 'LOCAL', createdAt: new Date().toISOString() },
            { name: 'ADDRESS', createdAt: new Date().toISOString() }    
        ])
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTable('DeliveryType')
  ]);
};
