var pythonsolver = require('./pythonsolver.js');
var javasolver = require('./javasolver.js');
var config = require('./config');

var p = console.log

function run(board,SolutionMDBobj,callback){

  var solverModule = javasolver

  if(config.solver.language==="java"){
    solverModule = javasolver
  }
  if(config.solver.language==="python"){
    solverModule = pythonsolver
  }

  //Look in mongoDB cache
  SolutionMDBobj.find({'board': board}).exec(function(err, obj){
    if(err){
      p("ERROR: " + err)
      callback(err,null);
    }else{
      if(obj[0]){
        p("Retrieved solution ("+obj[0].moves+") from cache!")
        callback(err, obj[0].moves)
      }else{
        solverModule.run(board,function(err, res){
          if(err){
            p("ERROR: " + err)
            callback(err,null);
          }else{
            var movesToSolution = res
            var solution = {
              board: board,
              moves: movesToSolution
            }
            var newSolution = new SolutionMDBobj(solution);
            //Call save to insert the ŕoom
            newSolution.save(function(err, res){
               callback(err, movesToSolution);
            })
          } 
        })
     
      }
    }
    
  })
}

exports.solve = function(board, SolutionMDBobj, callback){
  run(board, SolutionMDBobj, callback)
}