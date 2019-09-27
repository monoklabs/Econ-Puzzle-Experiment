/*
semsomi AB 2016-2017 (Monok since 2019)
*/


"use strict";

import ReactDOM from 'react-dom';
import React from 'react';

// console.log("last commit:\n" + process.env.LAST_COMMIT);

//To disable all console log in prod
// console.log = function() {}

var appComponent = require('./components/app.jsx');
var config = require('../settings/config.json');


import { Router, Route, Link, browserHistory, hashHistory } from 'react-router'
var app = document.getElementById('container');



ReactDOM.render(

  	<Router  history={hashHistory}>
  	    
  	    <Route path="/" component={appComponent}>
  	    <Route path="/:roomName/:player" component={appComponent}/>
  	    <Route path="/:roomName/:player/:reply" component={appComponent}/>

  	    </Route>
  	</Router>

, app);




