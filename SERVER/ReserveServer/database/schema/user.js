var knex = require('../../db').knex,
    async = require('async'),
    winston = require('winston');

exports.createUser = function() {
    return knex.schema.createTable('User', function(table) {
        table.increments().unique();
        table.string('username')
            .unique()
            .notNullable()
            .index();
        table.string('password')
            .notNullable();
        table.string('email')
            .unique()
            .notNullable();
        table.integer('limit')
            .notNullable()
            .defaultTo(1);
        table.timestamps();
    });
};

/*
 * !!Because of dependence relation, truncate is diffcult to execute test
 */

// exports.truncateUsers = function(callback) {
//       async.series([
//           function(call){
//               knex.schema.dropTableIfExists('Users').then(function(success) {
//                 winston.info('drop Users table success', JSON.stringify(success))
//                 call(null, true)
//             }, function(error) {
//                 winston.error('drop Users table fail', JSON.stringify(error))
//                 call(new Error(), false)
//             })
//         },
//           function(call){
//               exports.createUsers().then(
//                 function(success) {
//                     winston.log('info', 'create Users table success', success)
//                     call(null, true)
//                 },
//                 function(error) {
//                     winston.info('error', 'create Users table', JSON.stringify(error))
//                     call(new Error('create Users table error'), false)
//                 })
//         }
//       ], function(err, results){
//         winston.log('debug', err)
//         winston.log('debug', results)
//         if (err) return callback(err)
//         return callback(null, results.every(function(flag) {
//             return flag
//         }))
//     })
// }

exports.createUserDetail = function() {
    return knex.schema.createTable('UserDetail', function(table) {

        table.integer('User_id')
            .unique()
            .unsigned()
            .notNullable()
            .index()
            .references('id')
            .inTable('User')
            .primary();
        table.string('nickname')
            .unique()
            .notNullable();
        table.enu('sex', ['male', 'female', 'secert'])
            .notNullable();
      table.string('avatar');
        table.text('self_description');
        table.integer('city');
        table.integer('school');
        table.string('interest');
        table.string('public_email');
        table.string('photo_number');
        table.string('qq');
        table.timestamps();
    });
};


exports.createUserSetting = function() {
    return knex.schema.createTable('UserSetting', function(table) {
        table.integer('User_id')
            .unique()
            .unsigned()
            .notNullable()
            .index()
            .references('id')
            .inTable('User')
            .primary();
        table.integer('defaultMapView')
            .defaultTo(1);
        table.string('defaultMapZoom')
            .defaultTo(13);
        table.boolean('seePaperPlane')
            .defaultTo(true);
        table.boolean('receiveFriendRequest')
            .defaultTo(true);
        table.timestamps();
    });
};

exports.createUserInfomation = function() {
    return knex.schema.createTable('UserInfomation', function(table) {
        table.integer('User_id')
            .unique()
            .unsigned()
            .notNullable()
            .index()
            .references('id')
            .inTable('User')
            .primary();
        table.boolean('isVIP')
            .defaultTo(false);
        table.time('lastlogin');
        table.timestamps();
    });
};


exports.createUserLimit = function() {
    return knex.schema.createTable('UserLimit', function(table) {
        table.integer('User_id').unique().primary();
        table.integer('limitCode')
            .defaultTo(1);
    });
};


exports.createTrace = function() {
  return knex.schema.createTable('UserTrace', function(table) {
    table.integer('User_id').unique().primary();
    table.specificType('location', 'GEOGRAPHY(POINT,4326)')
      .index()
      .notNullable();
    table.decimal('longitude', 12, 8)
      .notNullable();
    table.decimal('latitude', 12, 8)
      .notNullable();
    table.decimal('accuracy');
  });
};


exports.drop_all_tables = function(callback) {
    async.series([

        function(next) {
            knex.schema.dropTableIfExists('UserLimit').then(function(success) {
                winston.info('drop UserLimit table success ', JSON.stringify(success));
                next(null, true);
            }, function(error) {
                winston.error('drop UserLimit table error', JSON.stringify(error));
                next(new Error('drop UserLimit error error'), false);
            });
        },
        function(next) {
            knex.schema.dropTableIfExists('UserDetail').then(function(success) {
                winston.info('drop UserDetail table success ', JSON.stringify(success));
                next(null, true);
            }, function(error) {
                winston.error('drop UserDetail table error', JSON.stringify(error));
                next(new Error('drop UserDetail error error'), false);
            });
        },
        function(next) {
            knex.schema.dropTableIfExists('UserInfomation').then(function(success) {
                winston.info('drop UserDetail table success', JSON.stringify(success));
                next(null, true);
            }, function(error) {
                winston.error('drop UserInfomation table error ', JSON.stringify(error));
                next(new Error('drop UserInfomation error'), false);
            });
        },
        function(next) {
            knex.schema.dropTableIfExists('UserSetting').then(function(success) {
                winston.info('drop UserSetting table success', JSON.stringify(success));
                next(null, true);
            }, function(error) {
                winston.error('drop UserSetting table error', JSON.stringify(error));
                next(new Error('drop UserSetting error'), false);
            });
        },
        function(next) {
            knex.schema.dropTableIfExists('User').then(function(success) {
                winston.info('drop User table success', JSON.stringify(success));
                next(null, true);
            }, function(error) {
                winston.error('drop User table error', JSON.stringify(error));
                next(new Error(), false);
            });
        },
      function(next) {
        knex.schema.dropTableIfExists('UserTrace').then(function(success) {
          winston.info('drop UserTrace table success', JSON.stringify(success));
          next(null, true);
        }, function(error) {
          winston.error('drop UserTrace table error', JSON.stringify(error));
          next(new Error(), false);
        });
      }

    ], function(err, result) {
        winston.info('error', err);
        if (err) {
            return callback(err);
        }
        winston.info(result);
        return callback(null, result.every(function(flag) {
            return flag;
        }));
    });
};

exports.create_all_tables = function(callback) {
    async.series([
        function(call) {
            exports.createUser().then(
                function(success) {
                    winston.log('info', 'create User table success', success);
                    call(null, true);
                },
                function(error) {
                    winston.info('error', 'create User table', JSON.stringify(error));
                    call(new Error('create User table error'), false);
                });
        },
        function(call) {
            exports.createUserDetail().then(
                function(success) {
                    winston.log('info', 'create UserDetail table success', success);
                    call(null, true);
                },
                function(error) {
                    winston.log('error', 'create UserDetail table error', JSON.stringify(error));
                    call(new Error('create User table error'), false);
                });
        },
        function(call) {
            exports.createUserSetting().then(
                function(success) {
                    winston.log('info', 'create UserSetting table success', success);
                    call(null, true);
                },
                function(error) {
                    winston.log('error', 'create UserSetting table error', JSON.stringify(error));
                    call(new Error('create UserSetting table error'), false);
                });
        },
        function(call) {
            exports.createUserInfomation().then(
                function(success) {
                    winston.log('info', 'create Infomation table success', success);
                    call(null, true);
                },
                function(error) {
                    winston.log('error', 'create Infomation table error', JSON.stringify(error));
                    call(new Error('create  Infomation table error'), false);
                });
        },
        function(call) {
            exports.createUserLimit().then(
                function(success) {
                    winston.log('info', 'create UserLimit table success', success);
                    call(null, true);
                },
                function(error) {
                    winston.log('error', 'create UserLimit table error', JSON.stringify(error));
                    call(new Error('create  UserLimit table error'), false);
                });
        },
      function(call) {
        exports.createUserLimit().then(
          function(success) {
            winston.log('info', 'create UserTrace table success', success);
            call(null, true);
          },
          function(error) {
            winston.log('error', 'create UserTrace table error', JSON.stringify(error));
            call(new Error('create  UserTrace table error'), false);
          });
      }


    ], function(err, results) {
        winston.log('debug', err);
        winston.log('debug', results);
        if (err) return callback(err);
        return callback(null, results.every(function(flag) {
            return flag;
        }));
    });
};

exports.truncate_all_tables = function(callback) {
    async.series([
        function(call) {
            exports.drop_all_tables(function(err, result) {
                if (err) return call(err);
                if (result) {
                    return call(null, true);
                } else {
                    return call(new Error('Drop All Tables Error!'));
                }
            });
        },
        function(call) {
            exports.create_all_tables(function(err, result) {
                if (err) return call(err);
                if (result) {
                    return call(null, true);
                } else {
                    return call(new Error('Create All Tables Error!'));
                }
            });
        }
    ], function(err, results) {
        winston.log('debug', err);
        winston.log('debug', results);
        if (err) return callback(err);
        return callback(null, results.every(function(flag) {
            return flag;
        }));
    });
};