var express = require('express');
var app = express();
var nunjucks = require('nunjucks');
var morgan = require('morgan');
var tables = require('./models/');
var routes = require('./routes/wiki');
app.engine('html', nunjucks.render);
app.set('view engine', 'html');
nunjucks.configure('views', {noCache: true});

app.use('/', routes);
//tables.db.sync({force:true}) will drop db
tables.db.sync().then(function(){
      app.listen(3000, function(){console.log('listening on 3000');});
      });;

