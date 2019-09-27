/*
semsomi AB
Copyright (c) 2016-2017
All rights reserved
*/
var argv = require('minimist')(process.argv.slice(2));
var pathOfStaticSite = argv._[argv._.length-1]; //Last argument

var express = require("express");
var app = express();

var compression = require('compression');
var morgan = require('morgan');

var oneDay = 86400000;

app.use(compression());

if(process.env.NODE_ENV=="production"){
  //TODO: For later, only show errors:
  // app.use(morgan("combined", {
  //   skip: function (req, res) { return res.statusCode < 400 }
  // }))
  app.use(morgan("combined"))
}else{
  app.use(morgan("dev"))  
}

app.use(express.static(pathOfStaticSite, { maxAge: oneDay }));

app.listen(argv.p);
