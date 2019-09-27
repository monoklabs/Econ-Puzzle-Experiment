var cmd = require('child_process')
var config = require('./config');

var p = console.log

function run(board,callback) {
    var error = false
    var b = board.split(',')
    var child = cmd.spawn('java', ['-Xmx1024m','-cp','javasolver', 'ProblemSolver', config.solver.algorithm, b[0],b[1],b[2],b[3],b[4],b[5],b[6],b[7],b[8]]);

    child.stdout.on('data', function(data) {
      var res = data.toString()
      // p(res)
      if(res.indexOf("The cost was:")>-1 && !error){
        callback(null, parseInt(res.split(':')[1].trim()))
      }
      
    });

    child.stderr.on("data", function (data) {
      if(!error){
        error = true
        p(data.toString());
        callback(true, null)
      }
    });

}

exports.run = function(board, callback){
  run(board, callback)
}