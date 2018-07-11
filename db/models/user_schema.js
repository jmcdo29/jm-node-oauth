const Knex = require('knex');
const connection = require('../knexfile');
const { Model } = require('objection');

const makeId = require('../../utils/makeId').makeId;

const knexConnection = Knex(connection);

Model.knex(knexConnection);

class User extends Model{
  static get tableName() {
    return 'public.user'
  }

  $beforeInsert() {
    this.id = '00U' + makeId(9);
  }
}

module.exports =  User;