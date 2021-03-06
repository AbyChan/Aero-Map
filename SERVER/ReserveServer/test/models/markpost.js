var assert = require('assert'),
    MarkPost = require('../../models/markpost'),
    Comment = require('../../models/markpost_comment'),
    knex = require('../../db').knex;

var st = require('knex-postgis')(knex);

require('../../utils/addDate');

describe('Mark Post Module Model Test', function() {

    var today = new Date();

    var markPostData1 = {
        type: 1,
        User_id: 1,
        title: 'hjhijhoihjio',
        context: 'I have a hotel table, and an amenity table. The only way they are "related" is via location, using PostGIS for PostgreSQL. In SQL I use a query like this to find the 5 nearest amenities to a hotel',
        deadline: today.addDays(3).toJSON(),
        longitude: 0.1234567,
        latitude: 0.1234567,
        //location: 'ST_GeographyFromText("SRID=4326;POINT(0 49)")',
        images: ['/img/1.jpg', '/img/2.jpg'],
        accuracy: 10.0,
    };
    var markPostData2 = {
        type: 1,
        User_id: 1,
        title: 'h',
        context: 'I have a hotel table, and an amenity table. The only way they are "related" is via location, using PostGIS for PostgreSQL. In SQL I use a query like this to find the 5 nearest amenities to a hotel',
        deadline: today.addDays(3).toJSON(),
        longitude: 0,
        latitude: 0,
        //location: 'ST_GeographyFromText("SRID=4326;POINT(0 49)")',
        images: ['/img/1.jpg', '/img/2.jpg'],
        accuracy: 10.0,
    };


    describe('#user knex postgis insert generate', function() {
        it('should return success promise', function(done) {
            var sql1 = knex.insert({
                type: 1,
                User_id: 1,
                title: 'h',
                context: 'I have a hotel table, and an amenity table. The only way they are "related" is via location, using PostGIS for PostgreSQL. In SQL I use a query like this to find the 5 nearest amenities to a hotel',
                deadline: today.addDays(3).toJSON(),
                location: st.geomFromText('Point(0 0)', 4326),
                images: ['/img/1.jpg', '/img/2.jpg'],
                accuracy: 10.0,
            }).into('MarkPost').toString();
            console.log(sql1);
            done();
        });
    });

    /**********************************************************
     * CREATE MARKPODT TEST
     ***********************************************************/
    describe('#create markpost object', function() {
        it('should return success promise', function(done) {
            new MarkPost(markPostData1).saveWithPoint().then(function(markpost) {
                console.log('success', markpost);
                done();
            }, function(error) {
                console.log('error', error);
                //done();
            });
        });

        it('should return error promise(error data)', function(done) {
            new MarkPost(markPostData2).saveWithPoint().then(function(markpost) {
                console.log('success', markpost);

            }, function(error) {
                console.log('error', error);
                done();
            });
        });
    });
    /**********************************************************
     * FETCH MARKPODT TEST
     ***********************************************************/
    describe('#fetch markpost object', function() {
        it('should return success promise ', function(done) {
            new MarkPost({
                id: 1
            }).fetch().then(function(markpost) {
                console.log('success', markpost);
                done();
            }, function(error) {
                console.log('error', error);
            });
        });
    });

    describe.skip('#fetch markpost object collection by distance', function() {
        it('should return success promise', function(done) {
            var coordinate = {
                longitude: 0.01,
                latitude: 0.01
            };
            var pointstr = coordinate.longitude + ' ' + coordinate.latitude;
            var distancekm = 1000 * 1000;
            MarkPost.collection().query().where('ST_DWithin(location, ST_GeographyFromText(' +
                '"SRID =4326;POINT(' + pointstr + ')"), ' + distancekm + ')').fetch().then(function(markposts) {
                console.log('success', markposts);
                done();
            }, function(error) {
                console.log('error', error);
            });
            // new MarkPost().distancePoints(coordinate, 1000).then(function(markposts){
            //   console.log('success', markposts);
            //   done();
            // }, function(error){
            //   console.log('error', error);
            // });
        });
    });

    /**********************************************************
     * DELETE MARKPODT TEST
     ***********************************************************/
    describe('#Delete markpost', function() {
        it('should return success promise', function(done) {

            var id = 1;

            // new  MarkPost({
            //     id: id
            // }).fetch().then(function(model) {
            //     model.destroy().then(function(resp) {
            //         console.log('info', resp);
            //         done();
            //     });
            // })

          new  MarkPost({
            id: id
          }).destroy().then(function(resp){
            done();
          });

        });
    });



});