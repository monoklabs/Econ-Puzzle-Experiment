var config = require('./config');
var solver = require('./solver.js');
var async =  require('async');
var mongoose = require('mongoose');

var p = console.log

var mongo = mongoose.createConnection(config.database.url+config.solver.cache);

p("Connected to solver cache database")

var Solution = mongo.model('Model', new mongoose.Schema({
  board: String,
  moves: Number
}));

exports.result = function(moves, callback){
  p(config.solver.mapLimit)
  async.mapLimit(moves, config.solver.mapLimit, calcContribution, function(err, f){
    p(f)
    var result = f.reduce(function(a, b){
      return a+b
    })
    //You can't have negative help/contribution to a solution
    callback(null, {result:(result < 0 ? 0 : result), netResult:result, moves:f})
  })

}

function calcContribution(move, callback){

  solver.solve(move.board, Solution, function(err, before){
    p(before)
    p(move.board)
    solver.solve(move.newBoard, Solution, function(err, after){
      p(after)
      callback(null, before-after)
    })
  })
}