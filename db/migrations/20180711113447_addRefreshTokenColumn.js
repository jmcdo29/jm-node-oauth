
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('user', table=> {
      table.string('google_refresh');
      table.string('facebook_refresh');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('user', table=> {
      table.dropColumn('google_refresh');
      table.dropColumn('facebook_refresh');
    })
  ]);
};
