var logger = require('../logger'),
    MarkPost = require('../models/markpost'),
    User = require('../models/user'),
    Comment = require('../models/markpost_comment'),
    Promise = require('bluebird'),
    knex = require('../db').knex;

var MarkPostService = {


    //Todo: time!
    getAreaMarkPointsRaw: function(coordinate, distance) {
        var pointstr = coordinate.longitude + ' ' + coordinate.latitude;
        var distancekm = distance * 1000;
        var sql = 'SELECT * FROM "MarkPost" WHERE ST_DWithin(' +
            'location,  ST_GeographyFromText(\'SRID=4326;POINT(' + pointstr + ')\'), ' + distancekm + ')' +
            'and valid=true;';

        return knex.raw(sql);
    },

  //and deadline<now();
  getAreaMarkPointsRawByTime: function(coordinate, distance) {
    var pointstr = coordinate.longitude + ' ' + coordinate.latitude;
    var distancekm = distance * 1000;
    var sql = 'SELECT * FROM "MarkPost" WHERE ST_DWithin(' +
          'location,  ST_GeographyFromText(\'SRID=4326;POINT(' + pointstr + ')\'), ' + distancekm + ')' +
          'and valid=true and deadline>now();';

    return knex.raw(sql);
  },

  // and "MarkPost"."User_id" in (select "Friends"."Friend_id" FROM "Friends" where "Friends"."User_id" = 2 );
  getAreaMarkPointsRawByFriends: function(coordinate, distance, userId) {
    var pointstr = coordinate.longitude + ' ' + coordinate.latitude;
    var distancekm = distance * 1000;
    var sql = 'SELECT * FROM "MarkPost" WHERE ST_DWithin(' +
          'location,  ST_GeographyFromText(\'SRID=4326;POINT(' + pointstr + ')\'), ' + distancekm + ')' +
          'and valid=true and deadline>now()  and "MarkPost"."User_id" in ' +
          '(select "Friends"."Friend_id" FROM "Friends" where "Friends"."User_id" = ' +
          userId + ' );';

    return knex.raw(sql);
  },

    getAreaMarkersRaw: function(coordinate, distance) {
        var pointstr = coordinate.longitude + ' ' + coordinate.latitude;
        var distancekm = distance * 1000;
        var sql = 'SELECT * FROM "MarkPost", "UserDetail"  WHERE "MarkPost"."User_id" = "UserDetail"."User_id"   AND ST_DWithin(' +
            'location,  ST_GeographyFromText(\'SRID=4326;POINT(' + pointstr + ')\'), ' + distancekm + ')' +
            'and valid=true;';
        console.log(sql);
        return knex.raw(sql);
    },


  getAreaMarkersRawByTime: function(coordinate, distance) {
    var pointstr = coordinate.longitude + ' ' + coordinate.latitude;
    var distancekm = distance * 1000;
    var sql = 'SELECT * FROM "MarkPost", "UserDetail"  WHERE "MarkPost"."User_id" = "UserDetail"."User_id"   AND ST_DWithin(' +
          'location,  ST_GeographyFromText(\'SRID=4326;POINT(' + pointstr + ')\'), ' + distancekm + ')' +
          'and valid=true and deadline>now();';
    console.log(sql);
    return knex.raw(sql);
  },


  getAreaMarkersRawByFriends: function(coordinate, distance, userId) {
    var pointstr = coordinate.longitude + ' ' + coordinate.latitude;
    var distancekm = distance * 1000;
    var sql = 'SELECT * FROM "MarkPost", "UserDetail"  WHERE "MarkPost"."User_id" = "UserDetail"."User_id"   AND ST_DWithin(' +
          'location,  ST_GeographyFromText(\'SRID=4326;POINT(' + pointstr + ')\'), ' + distancekm + ')' +
          'and valid=true and deadline>now()  and "MarkPost"."User_id" in ' +
          '(select "Friends"."Friend_id" FROM "Friends" where "Friends"."User_id" = ' +
          userId + ' );';
    console.log(sql);
    return knex.raw(sql);
  },

    getAreaMarkPointsRawFilterByFriend: function(coordinate, userId) {

    },

    getAreaMarkPointsRawFilterByType: function(coordinate, distance, type) {
        var pointstr = coordinate.longitude + ' ' + coordinate.latitude;
        var distancekm = distance * 1000;
        var sql = 'SELECT * FROM "MarkPost" WHERE ST_DWithin(' +
            'location,  ST_GeographyFromText(\'SRID=4326;POINT(' + pointstr + ')\'), ' + distancekm + ')' +
            'and valid=true ' +
            'and type =' + type + ';';

        return knex.raw(sql);
    },


    /*
     * Bookshelf not supported
     */
    getAreaMarkPointsObject: function(coordinate, distance) {

    },

    getMarkPointById: function(id) {
        return new Promise(function(resolve, reject) {
            logger.log('info', 'query markpost by id:', id, 'start');
            new MarkPost({
                id: id
            }).fetch().then(function(markpost) {
                logger.log('info', 'query markpost by id:', id, 'success');
                resolve(markpost);
            }, function(error) {
                logger.log('error', 'query markpost by id:', id, 'fail!');
                reject(error);
            });
        });
    },

    getMarkPointWithUserDetailById: function(id) {
        return new Promise(function(resolve, reject) {
            logger.log('info', 'query markpost by id:', id, 'start');
            new MarkPost({
                id: id
            }).fetch({
                withRelated: ['user.detail']
            }).then(function(markpost) {
                logger.log('info', 'query markpost by id:', id, 'success');
                resolve(markpost);
            }, function(error) {
                logger.log('error', 'query markpost by id:', id, 'fail!');
                reject(error);
            });
        });
    },


    deleteMarkPointById: function(id) {
        // return new Promise(function(resolve, reject){
        logger.log('info', 'delete markpost by id:', id, 'start');
        return new MarkPost({
            id: id
        }).destory();
        // });
    },

    saveMarkPost: function(data) {
        return new MarkPost(data).saveWithPoint();
    },

    /***********************************************************
     * Fix(edit) Markpost only support user fix context , title,  pic
     *  return bookshelf object
     ***********************************************************/
    fixMarkPost: function(data) {
        return new Promise(function(resolve, reject) {
            new MarkPost({
                id: data.id
            }).fetch().then(function(markpost) {
                logger.log('info', 'fix markpost :fetch success');
                logger.log('debug', markpost);
                markpost.save(data).then(function(markpost) {
                    logger.log('info', 'fix markpost :fix success');
                    logger.log('debug', markpost);
                    resolve(markpost);
                }, function(error) {
                    logger.log('error', 'fixmarkpost faill');
                    logger.log('error', data);
                    logger.log('error', error);
                    reject(error);
                });
            }, function(error) {
                logger.log('error', 'fixmarkpost faill');
                logger.log('error', data);
                logger.log('error', error);
                reject(error);
            });
        });
    },

    getMarkPostComment: function(markpostId) {
        //return new Promise(function(resolve, reject){
        return Comment.collection().fetch({
            MarkPost_id: markpostId,
            withRelated: ['user.detail'],
        });
        //});
    },

    saveComment: function(commentData) {
        return new Comment(commentData).save();
    },


    /*
     * Not implement this feature, there is no need
     */
    fixComment: function() {

    },

    getTimeLine: function() {
        return MarkPost.collection().fetch();
    },

  /***********************************************************
   * Fix(edit) Markpost only support user fix context , title,  pic
   *  return bookshelf object
   ***********************************************************/
    getPlaceUser: function() {

    },

  /***********************************************************
   * Fix(edit) Markpost only support user fix context , title,  pic
   *  return bookshelf object
   ***********************************************************/
    getPlaceMarkpost: function() {

    },

  getUserMarkpost: function(userId,  callback){
    new User({
      id: userId
    }).fetch({
      'withRelated': ['markposts', 'detail']
    }).then(function(user) {
      callback(null, user);
    }, function(error) {
      callback(error);
    });
  },


};

module.exports = MarkPostService;