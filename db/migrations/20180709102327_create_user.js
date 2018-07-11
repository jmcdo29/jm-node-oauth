
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('user', table => {
      table.string('id').primary();
      table.string('email');
      table.string('password');
      table.string('facebook_id');
      table.string('facebook_token');
      table.string('facebook_name');
      table.string('facebook_email');
      table.string('google_id');
      table.string('google_token');
      table.string('google_email');
      table.string('google_name');
      table.unique(['id', 'email', 'facebook_id', 'facebook_email', 'google_id', 'google_email']);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.droptable('user')
  ]);
};
