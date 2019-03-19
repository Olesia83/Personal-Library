/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      var project = 'library';
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection(project).find({}).project({"_id":1, "title":1, "commentcount":1}).toArray((err, arr) => {
          if(err) {
           res.send(err); 
          }
          res.status(200).json(arr);
        });
      });
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      var title = req.body.title;
      var project = 'library';
      if (title === undefined) {
        res.send("missing title");
      } else {
        var insert = {
           title: title,
           commentcount: 0,
           comments: []
        }
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
            db.collection(project).insertOne(insert, (err, data) => {
              if(err) {
               res.send(err); 
              }
              console.log(insert);
              res.status(200).json({"_id":insert._id, "title":insert.title, "comments":insert.comments});
            });
          });
      }
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
    var project = "library";
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
            db.collection(project).remove({}, (err, data) => {
              if(err) {
               res.send(err); 
              }
                console.log("deleted");
                res.send("complete delete successful");
            });
          });
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      if (bookid) {bookid = new ObjectId(bookid)};
      console.log(bookid +" get");
      var project = 'library';
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection(project).findOne({"_id":bookid}, {"_id":1, "title":1, "comments":1}, (err, data) => {
          if(err) {
            console.log("error");
           res.send(err); 
          }
          if (data) {
          console.log(data);
            res.status(200).json(data);
          } else {
             res.send("no book exists");
          }
          
        });
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      var project = "library";
      //
      if (bookid === undefined) {
        res.send("_id error");
      } else {
        if (bookid) {bookid = new ObjectId(bookid)}
        console.log("ok db now");
          MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {          
              db.collection(project).findOneAndUpdate({"_id":ObjectId(bookid)},
                                                {$push: {"comments":comment}, $inc:{"commentcount":1}},
                                                {returnOriginal:false, projection:{"_id":1, "title":1, "comments":1}}, (err, object) => {
                if (err) {
                  res.send(err); 
                }
                if (object.value !== null) {
                  res.status(200).json(object.value);
                } else {
                  res.send("no book exists");
                }
                });                
         });
      }
    //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      var project = "library";
      if (bookid === undefined) {
        res.send("_id error");
      } else {
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          db.collection(project).findOneAndDelete({"_id":ObjectId(bookid)}, (err, data) => {
            if (err) {
              res.send(err);             
            }
            console.log("deleted " + bookid);
            res.send("delete successful");
                
          });            
        });
      //if successful response will be 'delete successful'
      }
  });
};
