//this is our routes file
var express = require('express');
var routes = express.Router();
var models = require('../models');
var Page = models.Page;
var User = models.User;
var bodyParser = require('body-parser');
routes.use(bodyParser.urlencoded({extended: false}));
routes.use(bodyParser.json());

routes.get("/", function(req,res,next){
  //get all pages
   Page.findAll().then(function(val){
    res.render('index', {
      pages: val
    });
  });
});

routes.use("/wiki", routes)
routes.post("/", function(req,res,next){
    //add new page

    User.findOrCreate({
      where: {
        name: req.body.name,
        email: req.body.email
      }
    })
    .then(function (values) {

      var user = values[0];
      var page = Page.build({
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags.split(" ")
      });
      return page.save().then(function (page) {
        return page.setAuthor(user);
      });

    })
    .then(function (page) {
      res.redirect(page.urlTitle);
    })
   
  });

routes.get("/add", function(req,res,next){
  //go to add form
    var name = User.name;
    var email = User.email;
    var content = Page.content;
    var status = Page.status;

    res.render('addpage', {
      name: name,
      email: email,
      content: content,
      status: status
    });
  });

routes.get("/users", function(req,res,next){
  User.findAll().then(function(val){
    res.render('users', {
      users: val
    });
  });
});

routes.get('/:title', function(req,res,next){
    var title = req.params.title;
    Page.findOne({
      where: {
        urlTitle: title
      },
      include: [
        {model: User, as: 'author'}
      ]
    })
    .then(function(singlePage){
      console.log(singlePage);
      if (singlePage === null) res.status(404).send();
      else res.render('wikipage', {
        page: singlePage.dataValues,
        user: singlePage.dataValues.author.dataValues,
        tags: singlePage.dataValues.tags
      });
    });

    // Page.findAll({
    //   where: {
    //     urlTitle: title
    //   }
    // })
    //   .then(function(val){
    //     res.render('wikipage', {
    //     page: val[0].dataValues
    //     })
    //   });
  });

routes.get("/users/:id", function(req,res,next){
  var id = req.params.id;
  User.findAll({
    where: {
      id: id
    }
  }).then(function(user){
    if (user.length !== 0){
      Page.findAll({
        where: {
          authorId: id
        }
      })
      .then(function(val){
        res.render('articles', {
          authorName: user[0].dataValues.name,
          authorEmail: user[0].dataValues.email,
          articles: val
        })
      })
    }
  })
  // var userPromise = User.findById(req.params.userId);
  // var pagesPromise = Page.findAll({
  //   where: {
  //     authorId: req.params.userId
  //   }
  // });

  // Promise.all([
  //   userPromise, 
  //   pagesPromise
  // ])
  // .then(function(values) {
  //   var user = values[0];
  //   var pages = values[1];
  //   res.render('user', { user: user, pages: pages });
  // })
  // .catch(next);
});

routes.get("/tags/search", function(req,res,next){
  res.render('tagsearch');
});

routes.post("/tags/search", function(req,res,next){
  var tags = req.body.tagsearch.split(" ");
  Page.findAll({
    where: {
      tags: {
        $overlap: tags
      }
    }
  }).then(function(pages){
    res.render('tagsearch', {
      pages: pages
    })
  }).catch(function(err){ console.log(err.message); });
});

module.exports = routes;