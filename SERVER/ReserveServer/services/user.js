var logger = require('../logger'),
    User = require('../models/user'),
    UserDetail = require('../models/userdetail'),
    UserSetting = require('../models/usersetting'),
    UserInfomation = require('../models/userinfomation'),
    UserFriendsInfo = require('../models/userfriendinfo'),
    UserLimit = require('../models/userlimit'),
    Promise = require('bluebird'),
    async = require("async"),
    Bookshelf = require('../db').orm,
    bcrypt = require('bcrypt');

var UserService = {

    getUser: function(userId, callback) {
        new User({
            id: userId
        }).fetch(function(user) {
            callback(null, user);
        }, function(error) {
            callback(error);
        });
    },

    getUserDetail: function(userDetailId) {
        new UserDetail({
            id: userId
        }).fetch(function(user) {
            callback(null, user);
        }, function(error) {
            callback(error);
        });
    },



    /**************************************************
     * @deprecated!
     *
     **************************************************/
    signIn: function(data, callback) {
        bcrypt.genSalt(11, function(err, salt) {
            bcrypt.hash(data.password, salt, function(err, hash) {
                //data.password = hash
                new User(data).save({
                    password: hash
                }).then(function(user) {
                    logger.log('debug', user);
                    callback(null, user);
                }, function(error) {
                    logger.log('error', error);
                    callback(error);
                });
            });
        });
    },

    createUser: function(data) {
        return Bookshelf.transaction(function(transaction) {
            return new Promise(function(resolve, reject) {
                async.waterfall([
                    //create user
                    function(callback) {
                        bcrypt.genSalt(11, function(err, salt) {
                            bcrypt.hash(data.password, salt, function(err, hash) {
                                //data.password = hash
                                new User(data).save({
                                    password: hash
                                }).then(function(user) {
                                    logger.log('debug', user);
                                    callback(null, user);
                                }, function(error) {
                                    logger.log('error', error);
                                    callback(error);
                                });
                            });
                        });
                    },
                    //create user setting(default)
                    function(user, callback) {
                        new UserSetting({
                            User_id: user.get('id')
                        }).save(null, {
                            method: "insert"
                        }).then(function(usersetting) {
                            callback(null, user);
                        }, function(error) {
                            logger.log('error', error);
                            callback(error);
                        });
                    },
                    //create user infomation(default)
                    function(user, callback) {
                        new UserInfomation({
                            User_id: user.get('id')
                        }).save(null, {
                            method: 'insert'
                        }).then(function(userinfomation) {
                            callback(null, user);
                        }, function(error) {
                            logger.log('error', error);
                            callback(error);
                        });
                    },
                    //create user friendinfo(default)
                    function(user, callback) {
                        new UserFriendsInfo({
                            User_id: user.get('id')
                        }).save(null, {
                            method: "insert"
                        }).then(function(userfriendinfo) {
                            callback(null, user);
                        }, function(error) {
                            logger.log('error', error);
                            callback(error);
                        });
                    }
                ], function(error, result) {
                    if (error) {
                        transaction.rollback(error);
                    }
                    if (result) {
                        //@Todo instanceof user
                        resolve(result);
                    }
                    return reject(new Error('unknown error!'));
                });
            });
        });
    },


    loginByUserName: function(username, password, callback) {
        if (!username || !password) throw new Error('Username and password are both required!');
        new User({
            username: username
        }).fetch({
            require: true
        }).then(function(user) {
            bcrypt.compare(password, user.get('password'), function(err, res) {
                if (err) callback(err);
                if (res) return callback(null, user);
                return callback(null, null);
            });
        }, function(err) {
            callback(err);
        });
    },

    loginByEmail: function(email, password, callback) {
        if (!email || !password) throw new Error('Email and password are both required!');
        new User({
            email: email
        }).fetch({
            require: true
        }).then(function(user) {
            bcrypt.compare(password, user.get('password'), function(err, res) {
                if (err) callback(err);
                if (res) return callback(null, user);
                return callback(null, null);
            });
        }, function(err) {
            callback(err);
        });
    },

    saveUserDetail: function(data) {
        return new UserDetail(data).save(null, {
            method: 'insert'
        });
    },

    getUserAvatar: function(userid) {
        return new Promise(function(resolve, reject) {
            new UserDetail({
                User_id: userid
            }).fetch().then(function(userDetail) {
                resolve(userDetail.get('avatar'));
            }, function(error) {
                reject(error);
            });
        });
    },

  saveUserAvatar: function(userId, imgPath){
    return new Promise(function(resolve, reject){

    });
  }
};

module.exports = UserService;