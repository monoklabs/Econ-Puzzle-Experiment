var PythonShell = require('python-shell');
var config = require('./config');

var p = console.log

function run(board,callback) {
	var options = {
	    mode: 'text',
	    pythonPath: './deps/pythonvenv/python',
	    // pythonOptions: ['-u'],
	    scriptPath: '.',
	    args: [config.solver.boardSize, board]
  	};


   	PythonShell.run('solver.py', options, function (err, results) {
          if(err){
            callback(err, null)
          }else{
            var movesToSolution = parseInt(results[4].split(":")[1].trim())
            callback(null, movesToSolution)
          } 
    })


}

exports.run = function(board, callback){
  run(board, callback)
}