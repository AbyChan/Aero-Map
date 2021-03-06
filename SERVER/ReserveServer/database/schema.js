var winston = require('winston'),
    user_schema = require('./schema/user'),
    markpost_schema = require('./schema/markpost'),
    friends_schema = require('./schema/friends'),
    async = require('async');

exports.create_all_tables = function(callback) {
    async.series([
        /****************************************************
         *Create User module tables
         ****************************************************/
        function(call) {
            user_schema.create_all_tables(function(err, result) {
                if (err || !result) return call(new Error(), null)
                return call(null, true)
            })
        },
        /*****************************************************
         *Create MarkPost module tables
         ******************************************************/
        function(call) {
            markpost_schema.create_all_tables(function(err, result) {
                if (err || !result) return call(new Error(), null);
                return call(null, true);
            });
        },

        /*****************************************************
         *Create Friends module tables
         ******************************************************/
        function(call) {
            friends_schema.create_all_tables(function(err, result) {
                if (err || !result) return call(new Error(), null);
                return call(null, true);
            });
        }
    ], function(err, results) {
        if (err || !results.every(function(result) {
                return result
            })) {
            winston.log('error', 'Create all tables Error!')
            return callback(new Error(), false)
        }
        return callback(null, true)

    })
}

exports.drop_all_tables = function(callback) {
    async.series([
        /****************************************************
         *Drop Friends module tables
         ****************************************************/
        function(call) {
            friends_schema.drop_all_tables(function(err, result) {
                if (err || !result) return call(new Error(), null)
                return call(null, true)
            })
        },
        /****************************************************
         *Drop MarkPost module tables
         ****************************************************/
        function(call) {
            markpost_schema.drop_all_tables(function(err, result) {
                if (err || !result) return call(new Error(), null)
                return call(null, true)
            })
        },
        /****************************************************
         *Drop User module tables
         ****************************************************/
        function(call) {
            user_schema.drop_all_tables(function(err, result) {
                if (err || !result) return call(new Error(), null)
                return call(null, true)
            })
        }


    ], function(err, results) {
        if (err || !results.every(function(result) {
                return result
            })) {
            winston.log('error', 'drop all tables Error!')
            return callback(new Error(), false)
        }
        return callback(null, true)
    })
}

exports.truncate_all_tables = function(callback) {
    async.series([
        function(call) {
            exports.drop_all_tables(function(err, result) {
                if (err || !result) {
                    winston.log('error', 'truncate: drop all table fail')
                    return call(new Error())
                }
                return call(null, true)
            })
        },
        function(call) {
            exports.create_all_tables(function(err, result) {
                if (err || !result) {
                    winston.log('error', 'truncate: create all table fail')
                    return call(new Error())
                }
                return call(null, true)
            })
        }
    ], function(err, results) {
        if (err || !results.every(function(result) {
                return result
            })) {
            winston.log('error', 'drop all tables Error!')
            return callback(new Error(), false)
        }
        return callback(null, true)
    })
}

function main(command) {

    switch (command) {
        case 'create':
            exports.create_all_tables(function(err, result) {
                if (err || !result) {
                    winston.log('error', 'Create all tables fail!')
                } else {
                    winston.log('info', 'Create all tables success!')
                    process.exit(0);
                }
            })

            break

        case 'truncate':
            exports.truncate_all_tables(function(err, result) {
                if (err || !result) {
                    winston.log('error', 'Truncate all tables fail!')
                } else {
                    winston.log('info', 'Truncate all tables success!')
                    process.exit(0);
                }
            })

            break

        case 'drop':
            exports.drop_all_tables(function(err, result) {
                if (err || !result) {
                    winston.log('error', 'Drop all tables fail!')
                } else {
                    winston.log('info', 'Drop all tables success!')
                    process.exit(0);
                }
            })

            break
    }
}

if (process.argv.length != 3)
    console.log('Usage: node schema < create(all) | truncate(all) | drop(all) >')
winston.log('info', process.argv[2])
main(process.argv[2])