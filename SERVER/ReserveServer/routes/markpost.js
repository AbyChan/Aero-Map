var express = require('express'),
    router = express.Router(),
    MarkPostService = require('../services/markpost'),
    UserService = require('../services/user'),
    logger = require('../logger');

require('../utils/addDate');

router.get('/markpost/:id', function(req, res, next) {
  console.log('hah');
    var id = req.params.id;
    MarkPostService.getMarkPointWithUserDetailById(id).then(function(markpost) {
        res.json(markpost);
        res.end();
    }, function(error) {
        next(error);
    });
});

router.get('/markposts', function(req, res, next) {
    var coords = {
        longitude: req.query.longitude,
        latitude: req.query.latitude
    };
    MarkPostService.getAreaMarkersRaw(coords, 5)
        .then(function(markposts) {
            res.send(markposts.rows);
        }, function(error) {
            next(error);
        });
});

router.get('/friendsmarkposts', function(req, res, next) {
  var coords = {
    longitude: req.query.longitude,
    latitude: req.query.latitude
  };
  MarkPostService.getAreaMarkersRawByFriends(coords, 5, req.session.user.id)
    .then(function(markposts) {
      res.send(markposts.rows);
    }, function(error) {
      next(error);
    });
});

router.get('/timemarkposts', function(req, res, next) {
  var coords = {
    longitude: req.query.longitude,
    latitude: req.query.latitude
  };
  MarkPostService.getAreaMarkersRawByTime(coords, 5)
    .then(function(markposts) {
      res.send(markposts.rows);
    }, function(error) {
      next(error);
    });
});

router.post('/markposts', function(req, res, next) {
    if (!req.session.user) {
        return res.send({
            error: 'not login!'
        });
    }
    var data = {
        type: req.body.type,
        User_id: req.session.user.id,
        title: req.body.title,
        context: req.body.context,
        images: req.body.images,
        deadline: new Date().addDays(req.body.days),
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        accuracy: req.body.accuracy,
    };
    MarkPostService.saveMarkPost(data).then(function(markpost) {
        res.send({
            success: 'success!'
        });
    }, function(error) {
        next(error);
    });
});

router.post('/markpost/uploadimg', function(req, res, next) {
    logger.log('info', JSON.stringify(req.cookies));
    logger.log('info', JSON.stringify(req.session.user));
    if (!req.session.user) {
        return res.send({
            error: 'not login!'
        });
    } else {
        var keys = [];
        for (var key in req.files) {
            keys.push(key);
        }
        //I only want first element, may be can opti..
        req.session.uploadPic = req.files[keys[0]].path;
        res.send({
            src: req.files[keys[0]].path
        } || {
            Error: 'unkown!'
        });
        res.end();
    }
});

router.post('/markpost/:markpostId/comments', function(req, res, next) {
    if (!req.session.user) {
        return next(new Error('not loing'));
    }
    var commentData = {
        User_id: req.session.user.id,
        MarkPost_id: req.params.markpostId,
        context: req.body.context,
    };
  logger.log('info', commentData);
    MarkPostService.saveComment(commentData).then(function(comment) {
      res.send(comment);
        }, function(error) {
            next(error);
        });
});

router.get('/markpost/:markpostId/comments', function(req, res, next){
  var markpostId = req.params.markpostId;
  MarkPostService.getMarkPostComment(markpostId).then(function(comments){
    res.send(comments);
  }, function(error){
    next(error);
  });
});

router.get('/user/:userId/markposts', function(req, res, next){
  var userId = req.params.userId;
  UserService.getUser(userId, function(error, user){
    return user.fetch({
      withRelated: ['markposts', 'detail']
    }).then(function(user_markposts_detail){
      res.send(user_markposts_detail);
    }, function(error){
      next(error);
    });
  });
});

module.exports = router;