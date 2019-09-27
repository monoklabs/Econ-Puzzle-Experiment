var config = require('./config');
var resultSolver = require('./resultSolver.js');
var shuffleSeed = require('shuffle-seed');
var async =  require('async');
var express  = require('express');
var mongoose = require('mongoose');
var app      = express();
var server   = require('http').Server(app);
var io       = require('socket.io')(server);
var cors = require('cors');
var rand = require('randy');
const fs = require('fs');
var multer = require('multer');
var AdmZip = require('adm-zip');
var moment = require('moment');
var colors = require('colors');
var flatten = require('flatten-obj')({ separator: '-' })
const empty = require('empty-folder');

var p = console.log

var globalBoard = [1,2,3,7,8,4,5,6,0]
var finishedBoard = [1,2,3,4,5,6,7,8,null]

app.use(cors());
p("Server started")

var Admin = mongoose.mongo.Admin

db = mongoose.createConnection(config.database.url+config.database.index);
//Connect to database

// mongoose.connect(config.database.url+config.database.index);
p("Connected to database".green)
p('DB INDEX: '+config.database.index)
// create a schema for a move
var ProfileSchema = mongoose.Schema({
  created: Date,
  name: String,
  seat: String,
  education: String,
  field: String,
  gender: String,
  ethnicity: String,
  world: String,
  age: String,
  practice:Number,
  peerEstimate: Array
});

// create a schema for a move
var MoveSchema = mongoose.Schema({
  created: Date,
  board: String,
  newBoard: String,
  player: String,
  room: String
});

// create a schema for a move
var PmoveSchema = mongoose.Schema({
  created: Date,
  board: String,
  newBoard: String,
  player: String,
  boardName: String
});


// create a schema for a room
var RoomSchema = mongoose.Schema({
  created: Date,
  started: Date,
  players: [String],
  name: String,
  board: [Number],
  turn: Number,
  finished:  Date
});

var ResultSchema = mongoose.Schema({
  result: Number,
  netResult: Number,
  moves: [String],
  player: String,
  room: String
});

var EstimateSchema = mongoose.Schema({
  estimate: Number,
  fuzzy: String,
  created: Date,
  player: String,
  room: String
});

// create a model from the move schema
var Move = db.model('Move', MoveSchema);

var Pmove = db.model('Pmove', PmoveSchema);

// create a model from the room schema
var Room = db.model('Room', RoomSchema);

// create a model from the room schema
var Result = db.model('Result', ResultSchema);

var Estimate = db.model('Estimate', EstimateSchema);

var Profile = db.model('Profile', ProfileSchema);


// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, '../public/img/people')
//   },
//   filename: function (req, file, cb) {
//     // file.fieldname
//     cb(null, req.query.name+".jpg")
//   }
// })

// const upload = multer({
//     storage: storage,
//     // dest:'img/', 
//     limits: {fileSize: 10000000, files: 1},
//     fileFilter:  (req, file, callback) => {
    
//         if (!file.originalname.match(/\.(jpg|jpeg)$/)) {

//             return callback(new Error('Only Images are allowed !'), false)
//         }

//         callback(null, true);
//     }
// }).single('image')

// app.post('/images/upload', (req, res) => {
//    // var upload = multer({
//    //      storage: storage
//    //  }).array('file', 12);

//     upload(req, res, function (err) {

//         if (err) {
//           console.log(err)
//             res.status(400).json({message: err.message})

//         } else {

//             let path = `/img/${req.file.filename}`
//             res.status(200).json({message: 'Image Uploaded Successfully !', path: path})
//         }
//     })
// })


function transformBoardForFrontend(board){
          return board.map(function(i){
          if(i===0){
            return ""
          }else{
            return i
          }
        })
}
function transformBoardForBackend(board){
          return board.map(function(i){
          if(i==="" || !i){
            return 0
          }else{
            return parseInt(i)
          }
        })
}

function boardDone(board){
  return transformBoardForFrontend(board).toString() === finishedBoard.toString()
}

function updateRoom(roomObj, field, callback){
  Room.update({ _id: roomObj._id }, field, { multi: false }, function(err, numAffected){callback(err, roomObj)})
}

function joinARoom(room, player, callback){

  Room.find({'name': room}).exec(function(err, obj) {
    obj = obj[0] //First result
    if(obj && obj.name===room){
      if(roomAlive(obj) && !boardDone(obj.board)){
        if(obj.players.indexOf(player)>-1){
          p("player tried to join room they're already in")
          callback(null, obj)
        }else if(obj.players.indexOf(player)==-1 && obj.players.length>1){
          p(player+" tried to enter a room that doesn't belong to them")
          callback("We're sorry, you're not a member of this room", null)
        }else if(obj.players.indexOf(player)==-1 && obj.players.length<config.puzzle.numberOfPlayers){
          p(player + " entering a room")
          obj.players.push(player)
          var field = { players: obj.players}
          if(obj.players.length===config.puzzle.numberOfPlayers){
            field.started = new Date()
            obj.started = new Date() //for callback to clients
          }
          updateRoom(obj, field, callback)
        }
      }else{
        p(player + " tried to enter a room that has expired!".yellow)
        callback("We're sorry, you can't enter this room, it has expired",null)
      }
    }else{
      var board = globalBoard
      if(config.puzzle.boards[room.split("-")[0]]){
        board = config.puzzle.boards[room.split("-")[0]]
      }
      createARoom(room, player, board, callback)
    }
  })
}

function roomAlive(roomObj){
  if(roomObj.started){
    var now = moment(new Date()); //todays date
    var end = moment(roomObj.started); // another date
    var duration = moment.duration(now.diff(end));
    var minutes = duration.asMinutes();
    return (minutes<config.puzzle.minuteLimit)
  }else{
    return true
  }
}

function createARoom(room, player, board, callback){
  var room = {
    created: new Date(),
    players: player ? [player] : [],
    name: room,
    board: board,
    solved: 0,
    turn: config.experiment.firstInFirstMove ? 0 : Math.round(Math.random())
  }
  var newRoom = new Room(room);
  //Call save to insert the ŕoom
  newRoom.save(callback)
}

// function finishRoom(roomName, solved, callback){
//      var query = {'name':roomName};
        
//       Room.findOne(query, function (err, theRoom) {
//         theRoom.finished=new Date()
//         Profile.findOneAndUpdate(query, oldProfile, {}, callback);
//       });  



//   var room = {
//     created: new Date(),
//     players: player ? [player] : [],
//     name: room,
//     board: board,
//     turn: config.experiment.firstInFirstMove ? 0 : Math.round(Math.random())
//   }
//   var newRoom = new Room(room);
//   //Call save to insert the ŕoom
//   newRoom.save(callback)
// }


app.get('/compressalldata', function(req, res) {
  saveAllSessionData(req, res, function(){
    res.send("OK, Data zipped");
  })
})


app.get('/clearimages', function(req, res) {

  empty('../public/img/people', false, function(o){
     res.send('OK, Images cleared!')
  })

})


function saveAllSessionData(req, res, callback){
  //CSV
  allscoredmoves(req, res, function(err, allmoves){
      allmoves.forEach(function(move,i){
        allmoves[i].board="\""+allmoves[i].board.toString()+"\""
        allmoves[i].newBoard="\""+allmoves[i].newBoard.toString()+"\""
      })

      toCSV(allmoves,"moves", function(err, movesCSVfile){
         saveCSV(function(roomsCSVfile){

             var zip = new AdmZip();
              
              // add file directly
              // var content = "inner content of the file";
              // zip.addFile("test.txt", Buffer.alloc(content.length, content), "entry comment goes here");
              // add local file
              zip.addLocalFolder("../public/img/people");
              try{
                zip.addLocalFile("../public/img/all-" + config.database.index+".csv");
                zip.addLocalFile("../public/img/moves-" + config.database.index+".csv");
              }catch (e){

              }
             
              // get everything as a buffer
              var willSendthis = zip.toBuffer();
              // or write everything to disk
              zip.writeZip("../public/"+config.database.index+".zip");
              callback()

         })
      })
  })
}


function makeAMove(room, player, newBoard, callback){
  //Does this room exist?
  Room.find({
  'name': room
  }).exec(function(err, obj) {
    obj = obj[0] //First result
    if(obj && obj.name===room){
      //Is it your turn?
      if(roomAlive(obj)){
        if(obj.players[obj.turn]===player){
          var newTurn = (obj.turn + 1) % obj.players.length
          let bDone = boardDone(newBoard)
          newBoard = transformBoardForBackend(newBoard)
          p("newBoard:" +newBoard + " - old board: "+obj.board+" - player: "+player)
          let changes = { turn: newTurn, board:newBoard}
          if(bDone){
            changes.finished=new Date()
          }
          updateRoom(obj, changes, function(err, res){
            if(!err){
              saveAMove(room, player, obj.board, newBoard, callback)
            }else{
              p(err)
            } 
          })
        }else{
          p(("It's not " + player + " turn to play").red)
          callback(null,null) //not important to give an error message for that
        }
      }else{
        p(player + " tried to make a move in a room that has expired!".yellow)
        callback(null, 'expired')
        // callback("We're sorry, Time is up, this room has expired",true) //true means broadcast for all
      }
      
    }else{
      p(("The Room: " + room + " does not exist").red)
      callback("We're sorry, this room does not exist",null)
    }
  });
}

function savePracticeMove(board, newBoard, player, boardName, callback){
    var move = {
      created: new Date(),
      board: board,
      newBoard: newBoard,
      player:  player,
      boardName: boardName
    }

    var newPmove = new Pmove(move);
    //Call save to insert the chat
    newPmove.save(callback);
}

function saveAMove(room, player, board, newBoard, callback){

    var move = {
      created: new Date(),
      board: board,
      newBoard: newBoard,
      player:  player,
      room: room
    }
    var newMove = new Move(move);
    //Call save to insert the chat
    newMove.save(callback);
  
}


function answerEstimate(room, player, estimate, fuzzy, callback){
  var est = {
    created: new Date(),
    estimate: estimate,
    fuzzy:fuzzy,
    player:  player,
    room: room
  }
  var newEst = new Estimate(est);
  //Call save to insert the chat
  newEst.save(callback);

}


//############# RESULT API #################

app.get('/result/:room/:player', function(req, res) {
  calcResult(req.params.room, req.params.player, function(err, result){
    if(result){
        res.json(result);
     }else{
        res.json("No moves found for this player and room");
     }
  })
 

});

function calcResult(roomName, playerName, callback){
   p("RESULT request from: ".green+ playerName +" for game: " +roomName)
  //Find
  Result.find({
    'room': roomName,
    'player': playerName
  }).exec(function(err, obj) {
    if(obj[0]){
      //Result is saved and exists
      p("Result found in cache for ".green + playerName + " in room ".blue+ roomName)
      callback(null, obj);
    }else{
      //Doesn't exists, we need to calculate it
      Move.find({
        'room': roomName,
        'player': playerName
      }).exec(function(err, obj) {

        if(obj.length>0){
          resultSolver.result(obj,function(err, result){
           p("Result calculated for ".green + playerName + " in room ".blue+ roomName)
          var resultObj = {
            result: result.result,
            netResult: result.netResult,
            moves: result.moves,
            room: roomName,
            player: playerName
          }
          var newResult = new Result(resultObj);
          //Call save to insert the result
          newResult.save(function(err, re){
            //Send back

            callback(null, resultObj);
          })

          })
        }else{
          p("No moves found for ".red+ playerName)
          callback(null, null)
        }

      });


    }
  })
}

function destringObj(o){
  var p = clone(o)
  Object.keys(p).forEach(function(k){
    p[k] = destring(k,p[k])
    return p[k]
  })
  return p
}

//################ ALL API #################

function destring(type, value){

  let dict = {
    fuzzy:["Yes - I would have solved it much better on my own","Yes - I would have solved it somewhat better on my own.","No - I think it would have stayed the same","No - I think I would have solved it somewhat worse on my own","No - I think I would have solved it much worse on my own"],
    world:["Africa","Asia","Australia","Europe","North America","South America"],
    gender:["Female","Male"],
    ethnicity:["White / Caucasian (non-Hispanic)","African American (non-Hispanic)","Native American, Aleut or Aboriginal Peoples", "Asian / Pacific Islander", "Latino or Hispanic", "Mixed Race", "Other"],
    education:["High-school degree","Bachelor Degree","Master’s Degree","Other"],
    field:['Economics','Political Science','Mathematics','Psychology','Humanities','Other Social Sciences','Other Natural Sciences','Other']
  }
  return typeof value === 'string' && dict[type] ? dict[type].indexOf(value) : value

}

function dataRes(player, payVar,cb){
 p('Data request for '.green+player)
  //Find
  Room.find({
    'players': player
  }).exec(function(err, rooms) {
    if(!err && rooms.length>0){
    //Send
    var games = JSON.parse(JSON.stringify(rooms))
    games.forEach(function(game, index){
      if(game.players){
        var opponent = game.players.find(function(p){return p!=player})
        games[index].opponent = opponent
        games[index].players = undefined
      }

      games[index].__v = undefined
      if(boardDone(game.board)){
        games[index].board = undefined
        games[index].completed=1
        //If it's done, when was it done?
        var started = moment(games[index].started); 
        var finished = moment(games[index].finished);
        games[index].duration = moment.duration(finished.diff(started)).asSeconds(); 
      }else{
        games[index].duration=config.puzzle.minuteLimit*60
        games[index].completed=0
      }
    })

    //MERGE IN ESTIMATE
    Estimate.find({
    'player': player
    }).exec(function(err, estimates) {
      estimates.forEach(function(est){
        var i = games.findIndex(function(game){
          return game.name === est.room
        })
        if(games[i]){
          games[i].estimate = est.estimate
          games[i].fuzzy = destring('fuzzy',est.fuzzy)
        }
      })

    //MERGE IN RESULTS
    Result.find({
    'player': player
    }).exec(function(err, results) {

      results.forEach(function(result){
        var i = games.findIndex(function(game){
          return game.name === result.room
        })
        //Game exists
        if(games[i]){   
          games[i].result = {netValue: result.netResult, value: result.result, moves: result.moves, nrOfMoves:result.moves.length}
        }
      })

      async.map(games, function(game, callback){

        //Get opponent results
        if(game.opponent && game.result && Number.isInteger(game.result.value)){
          p("getting opponent data for ".blue + game.opponent + " in game ".blue+ game.name)
          Result.find({
          'player': game.opponent,
          'room': game.name
          }).exec(function(err, opponentRes) {
            // p("opponent result is: "+opponentRes)
            if(opponentRes && opponentRes.length>0){
              opponentRes = opponentRes[0]
              // game.result_opponent = opponentRes.result
              var real = 0
              if(game.result.value+opponentRes.result!==0){
                real = game.result.value/(game.result.value+opponentRes.result)
              }
              p("real: "+real+ "your estimate: "+game.estimate + " lambda pre sqr: ")
              var lambda = Math.pow(((parseInt(game.estimate)/100)-(real)),2)
              var uniform = rand.uniform(0,1)
              let resultData = {included:lambda < uniform, opponent_result: opponentRes.result, contribution: (real.toFixed(2)*100), lambda:lambda.toFixed(4), uniform: uniform.toFixed(4)}
              //Retrieve OPPONENT data for EACH GAME
              Profile.find({
                'name': game.opponent 
              }).exec(function(err, opponentData){
                callback(null, {resultData:resultData, opponentData:opponentData})
              })

              
            }
          })
        }else{
          //No relative value was calculated
          callback(null, null)
        }
        }, function(err, results) {
          // results is now an array of stats for each file
          results.forEach(function(r, i){
            if(r){
              if(r.resultData){
                games[i].result.relative=r.resultData
              }
              if(r.opponentData && r.opponentData[0]){
                games[i].opponentData = r.opponentData[0]
                games[i].opponentData.peerEstimate = undefined
                games[i].opponentData.__v = undefined

              }
            }

          })
         
            var earning = config.experiment.baseCharge
            var chosenGame = Math.floor((Math.random() * games.length) + 1)-1;
            var chosenEstimate = Math.floor((Math.random() * games.length) + 1)-1;
            
            if(games[chosenGame].completed===1){
              earning +=config.experiment.gameCompletedCharge
            }
            if(games[chosenEstimate].result && games[chosenEstimate].result.relative.included){
              earning +=config.experiment.contributionQuestionCharge
            }

            //Retrieve profile for this user
            Profile.find({
              'name': player
            }).exec(function(err, pro) {
              p("#############")
              p(pro)
              let profil = destringObj(pro[0])
              //Populate all games with their respective peerEstimate for the opponent
              games.forEach(function(game, index){
                let priorT = profil && profil.peerEstimate ? profil.peerEstimate.find(function(prio){
                  return prio.name===game.opponent
                }) : null
                game.prior = priorT ? priorT.value : null
              })

              if(payVar){
                //################## Chose an opponent average estimate ##################
                  var peerEst 
                  var chosenPeerEstimate
                  //Add practice payment to the earning variable (i.e 20 cent per practice)
                  earning += profil ? profil.practice * config.experiment.perPracticeRoundCharge : 0
                //######### If this player does not even have a profile from which to retrieve the peerEstimates
                //######### Perhaps someone ran a game without creating the profile (skipping demography etc) for testing purpose
                if(profil && profil.peerEstimate){
                  //There's a profile! let's choose a peerestimate
                  chosenPeerEstimate = Math.floor((Math.random() * profil.peerEstimate.length) + 1)-1;
                  peerEst = profil.peerEstimate[chosenPeerEstimate]
                }else{
                  p("Profile for "+player+" could not be found!".red)
                }
                //If a peerEstimation is randomly chosen (given that there was a profile, and with estimations)
                if(peerEst){
                  p(peerEst.name + " -- "+peerEst.value)
                  dataRes(peerEst.name, false, function(err, peerRes){
                    //If the chosen estimated person has a profile and data results
                    if(peerRes && peerRes.games){
                        p(peerRes)
                        //Sum their combined contributions
                        var peerAvg = peerRes.games.map((poo)=> {
                            if(poo.result && poo.result.relative){
                              return poo.result.relative.contribution
                            }else{
                              return 0 //when result has not been calculated for this opponent
                            }
                          })
                        var peerNrGames = peerAvg.length 
                        // p(peerAvg)
                        peerAvg = peerAvg.reduce((a,i) => a += parseInt(i, 10 ))/peerNrGames
                        p(peerEst.name + ", his/her average score is: " + peerAvg)
                        var l = Math.pow(((peerEst.value/100)-(peerAvg/100)),2)
                        var u = rand.uniform(0,1)
                         p("L: "+ l + " U:" +u)
                        if(l < u){
                          earning = earning + config.experiment.peerEstimateQuestionCharge
                        }
                   
                    }
                    var data = {player: player, earning:{payment: earning, chosenGame:chosenGame, chosenEstimate:chosenEstimate, chosenPeerEstimate:chosenPeerEstimate}, profile: profil, games:games}
                    cb(null, data);
                    
                

                  })
               
                }else{
                  var data = {player: player, earning:{payment: earning, chosenGame:chosenGame, chosenEstimate:chosenEstimate, chosenPeerEstimate:"None chosen"}, profile: profil, games:games}
                  cb(null, data);
                }
                
               
              }else{
                var data = {player: player, profile: profil, games:games}
                cb(null, data);
              }
            });
      
          

         
        });
      })
    })
  }else{
    cb(null, {})
  }

  });
}

app.get('/data/:player', function(req, res){
  dataRes(req.params.player,true, function(err, data){
    res.send(JSON.stringify(data));
  })
});


app.get('/indicies', function(req, res){


  new Admin(db.db).listDatabases(function(err, result) {
        console.log('listDatabases succeeded');
        // database list stored in result.databases
        var allDatabases = result.databases;   
          res.send(JSON.stringify(allDatabases.filter(function(d){
            return !d.empty
          }))); 
    });
  
  
  

});

//############### ESTIMATE API #############

app.get('/estimate/:room/:player', function(req, res) {
  //Find
  Estimate.find({
    'room': req.params.room,
    'player': req.params.player
  }).exec(function(err, obj) {
    //Send
    res.json(obj);
  });
});

//############### EARNING API #############

app.get('/final', function(req, res) {

  calcAllResults(function(err, final){
    payment(function(err, simpleList){
     res.json(simpleList);
    })
  })

});

app.get('/payment', function(req, res) {
  payment(function(err, simpleList){
   res.json(simpleList);
  })
});


app.get('/movescsv', function(req, res) {
  allscoredmoves(req, res, function(err, allmoves){
      allmoves.forEach(function(move,i){
        allmoves[i].board="\""+allmoves[i].board.toString()+"\""
        allmoves[i].newBoard="\""+allmoves[i].newBoard.toString()+"\""
      })

      toCSV(allmoves,"moves", function(err, csvfile){
         res.send(csvfile);
      })
  })
})

function toCSV(data,path, callback){
     //Generate a header
      let header = []
      Object.keys(data).forEach((key)=>{
        let candidateHeader = Object.keys(data[key])// kv[key].map((obj)=>{return Object.keys(obj)[0]})
        header = arrayUnique(header.concat(candidateHeader));
      })
   // kv.header = header
      let csvfile = header+"\n"
      data.forEach((p)=>{
        header.forEach((h, i)=>{
          if(i>0){
            csvfile += ', '+ p[h]
          }else{
            csvfile += p[h]
          }
          
        })
        csvfile+='\n'
      })

      fs.writeFile("../public/img/"+path+"-" + config.database.index+".csv", csvfile, function(err) {
        if(err) {
          p(err+" Save failed!".red);
        }else{
          p("The file was saved!");
        }
        callback(null,csvfile)  
      });
}


app.get('/csv', function(req, res) {
  saveCSV(function(err, csvfile){
    res.send(csvfile);
  })
})

function saveCSV(callback){
  p("CSV REQUEST".green)
  allProfiles((err, profiles)=>{
    async.map(profiles, function(profile, callback){
      dataRes(profile.name, true, callback)
    },
    function(err, data){
      let kv = {}
      let players = data.map((p)=>{
        return p.name
      })
      data = data.filter((d)=>{return d && d.player && d.profile && d.profile.peerEstimate})
      data.forEach((pl)=>{

        let player = kv[pl.player] = {}
        // player.push({'name':pl.player})
        // player.push({'seat':pl.profile.seat})
        player['name']=pl.player
        pl.profile.__v = undefined
        // pl.profile._id = undefined
        // pl.profile = JSON.parse(JSON.stringify(pl.profile))
        pl.profile=destringObj(pl.profile)

        Object.keys(pl.earning).forEach((i)=>{
          player[i] = pl.earning[i]
        })

        
        Object.keys(pl.profile).forEach((i)=>{
          if(i==='peerEstimate'){
            peer = JSON.parse(JSON.stringify(pl.profile[i]))
            peer.forEach((obj, j)=>{
              Object.keys(obj).forEach((key)=>{
                player['peerEstimate-'+key+'-'+j] = obj[key]
              })
            })
          }else{
            player[i] = pl.profile[i]
          }
         
        })

        pl.games.forEach((game,ind)=>{
          // game._id = undefined
          game = JSON.parse(JSON.stringify(game))
          Object.keys(game).forEach((i)=>{
              if(i==="board"){
                // p(game[i])
                player['game-'+ind+'-'+i] = game[i].reduce((agg, val)=>{return agg + ' ' + val})
              }else if(i==='result'){
                Object.keys(game[i]).forEach((j)=>{
                  if(j==="relative"){
                     Object.keys(game[i][j]).forEach((k)=>{
                      player['game-'+ind+'-'+k+'-'+j+'-'+i] = game[i][j][k]
                     })
                  }else if(j === 'moves'){
                    
                    player['game-'+ind+'-'+j+'-'+i] = game[i][j].reduce((agg, val)=>{return agg + ' ' + val})
                    // p(game[i][j].reduce((agg, val)=>{return agg + ' ' + val}))
                  }else{
                    player['game-'+ind+'-'+j+'-'+i] = game[i][j]
                  }
                })
              }else if(i==='opponentData'){
                game[i]=destringObj(game[i])
                Object.keys(game[i]).forEach((j)=>{
                    player['game-'+ind+'-'+j+'-'+i] = game[i][j]
                })
              }else{
                player['game-'+ind+'-'+i] = game[i]
              }
              
          })
        })

       

      })
      //Generate a header
      let header = []
      Object.keys(kv).forEach((key)=>{
        let candidateHeader = Object.keys(kv[key])// kv[key].map((obj)=>{return Object.keys(obj)[0]})
        header = arrayUnique(header.concat(candidateHeader));
      })
      // kv.header = header
      let csvfile = header+"\n"
      data.forEach((p)=>{
        header.forEach((h, i)=>{
          if(i>0){
            csvfile += ', '+ kv[p.player][h]
          }else{
            csvfile += kv[p.player][h]
          }
          
        })
        csvfile+='\n'
      })

      fs.writeFile("../public/img/all-" + config.database.index+".csv", csvfile, function(err) {
        if(err) {
          p(err+" Save failed!".red);
        }else{
          p("The file was saved!");
        }  
      });

      callback(null, csvfile);
    })
  })
}



function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}

function dateWithPay(name, cb){
  dataRes(name, true, cb)
}

function payment(callback){
  p("request for all players".green)
  //Get all players
  getAllPLayers(function(err, players){
    async.map(players, dateWithPay, function(err, result){
      var simpleList = result.map(function(r){
        var e = {pay: r.earning.payment, player: r.player}
        return e
      })
      callback(null, simpleList);
    })
     
  })
}


function nextGame(roomName, player, callback){
  if(roomName.indexOf('-')>-1){
      Profile.find({'name': player}).exec(function(err, data) {
        if(data.length>0){
          var game = roomName.split("-")[0]
          var seat = roomName.split("-")[1]
          p(data)
          if(data[0].seat && data[0].seat.charAt(0) ==='B'){
            let iterateSeat = parseInt(seat.charAt(1))+1
            if(iterateSeat>config.experiment.games){
              iterateSeat=1
            }
            seat = 'A'+iterateSeat
          }
          if(config.experiment.order.indexOf(game)===config.experiment.games-1){
            callback(null,"gameover")
          }else{
            var next = config.experiment.order.indexOf(game)+1
            callback(null, config.experiment.order[next] + '-' + seat)
          }
        }else{
          callback(null, "")
        }

      });

  }else{
    callback(null, "")
  }

}

function getAllPLayers(callback){
    Room.find({}).exec(function(err, rooms) {
    var players = rooms.reduce(
    (acc, val) => acc.concat(
      Array.isArray(val.players) ? val.players : []
    ),[])
    players = players.filter(function(elem, pos) {
        return players.indexOf(elem) == pos;
    })
    p("ALL PLAYERS: ".green + players)
    callback(null, players);
  });
}

function allProfiles(callback){
    Profile.find({}).exec(function(err, profiles) {
    //Send
        p("REQUEST ALL PROFILES: ".green+" Amount: "+profiles.length)
      callback(null, profiles);
  });

}

//############## MOVE API ##################

app.get('/moves/:room/:player', function(req, res) {
  //Find
  Move.find({
    'room': req.params.room,
    'player': req.params.player
  }).exec(function(err, obj) {
    //Send
    res.json(obj);
  });
});

app.get('/practicemoves/:player', function(req, res) {
  //Find
  Pmove.find({
    'player': req.params.player
  }).exec(function(err, obj) {
    //Send
    obj = obj.map(function(o,i){
      if(i===0){
        o.board = config.puzzle.boards[o.boardName]
        return o
      }else{
        let prev = obj[i-1]

        if(o.boardName!==prev.boardName){
          o.board = config.puzzle.boards[o.boardName]
        }else{
          o.board = prev.newBoard
        }
        
        return o
      }
    })

    res.json(obj);


  });
});


function flattenObj(obj, parent){
  if(ob){
    if(typeof obj === 'object'){
      // return flatten(obj)
      Object.keys(obj).forEach(function(k){
        //If value of key is another object
            if(typeof obj[k] === 'object'){

              Object.keys(obj[k]).forEach(function(n){
                obj[k+"-"+n] = obj[k][n]
              })
              
              // flattenObj(obj[o])
            }else if(typeof obj === 'array'){
              let newObj=JSON.parse(JSON.stringify(obj))
              obj={}
              newObj.forEach(function(o,i){
                let flat = flattenObj(o)
                if(flat){
                  Object.keys(flat).forEach(function(fo){
                    obj[fo+"-"+i]
                  })
                }
              })
              return obj
            }
      })
    }else if(typeof obj === 'array'){
      let newObj=JSON.parse(JSON.stringify(obj))
      obj={}
      newObj.forEach(function(o,i){
        let flat = flattenObj(o)
        if(flat){
          Object.keys(flat).forEach(function(fo){
            obj[fo+"-"+i]
          })
        }
      })
      return obj
    }else{
      return obj
    }
  }else{
    return null
  }
}

function clone(obj){
  let newObj ={}
  
  try {
      newObj = JSON.parse(JSON.stringify(obj))
  } catch(e) {
     newObj={}
  }
  return newObj
}

function allscoredmoves(rew,res, callback){
  calcAllResults(function(err, allres){
      console.log(allres)
      //add index
      // allres=allres.map(function(r,i){
      //   r.index=i
      //   return r
      // })
      //Iterate all the result-rooms
      async.map(allres,function(scoredRes, cb){
        if(scoredRes){


           let scored =clone(scoredRes[0])

          // let scored=JSON.parse(JSON.stringify(scoredRes[0]))
          Move.find({
            'room': scored.room,
            'player': scored.player
          }).exec(function(err, moveData){


            dataRes(scored.player,false,function(err, datares){
        
              let movesData=JSON.parse(JSON.stringify(moveData))
              
              let playerProfile = destringObj(datares.profile)
              let games = datares.games

              // movesData=datares

              datares.games.forEach(function(g){
                if(scored.room===g.name){

                   playerProfile.opponentData=JSON.parse(JSON.stringify(destringObj(g.opponentData)))
                }
               
              })

              playerProfile.__v=undefined

              console.log(playerProfile)
              movesData.forEach(function(m,i){
                m.__v=undefined
                m.score = parseInt(scored.moves[i])
                
                if(playerProfile){
                  Object.keys(playerProfile).forEach(function(k){
                    if(playerProfile[k] && typeof playerProfile[k] === 'object'){
                        Object.keys(playerProfile[k]).forEach(function(l){


                          if(playerProfile[k][l] && typeof playerProfile[k][l] === 'object'){
                            
                            Object.keys(playerProfile[k][l]).forEach(function(x){
                               m["player-"+k+"-"+l+"-"+x] = playerProfile[k][l][x]
                            })
                          }else{

                            m["player-"+k+"-"+l] = playerProfile[k][l]
                          }



                        })
                    }else if(playerProfile[k] && typeof playerProfile[k] === 'array'){

                       playerProfile[k].forEach(function(l){
                        if(playerProfile[k][l] && typeof playerProfile[k][l] === 'object'){
                          movesData[i].WTF="OMG IT WORKED"
                            Object.keys(playerProfile[k][l]).forEach(function(x){

                        
                                // m["player-"+k+"-"+l+"-"+x] = playerProfile[k][l][x]

                                // if(playerProfile[k][l][x] && typeof playerProfile[k][l][x] === 'object'){
                                // Object.keys(playerProfile[k][l][x]).forEach(function(y){
                                //       m["player-"+k+"-"+l+"-"+x+"-"+y] = playerProfile[k][l][x][y]

                                //   })
                                // }

                            })
                        }else{
                           m["player-"+k+"-"+l] = playerProfile[k][l]
                        }
                           
                        })
                    }else{
                      m["player-"+k] = playerProfile[k]
                    }
                   
                  })
                }
              

              })

             

              cb(err, movesData)

            })



            
          });
        }else{
          cb(null, [])
        }
   
      },function(err, allmoves){
        let merged = allmoves.reduce(function(a,i){
          return a.concat(i)
        },[])
        
        merged.forEach(function(m,i){
          merged[i].nr = i
        })

        fs.writeFile("../public/img/allscoredmoves-" + config.database.index, merged, function(err) {
          if(err) {
            p(err+" Save failed!".red);
          }else{
            p("The file was saved!");
          }  
        });

        callback(err, merged);
      })

    })
}

app.get('/allscoredmoves',function(req,res){

  allscoredmoves(req,res, function(err, data){
    res.json(data);
  })
 
})

// app.get('/allscoredmoves',function(req,res){

//     calcAllResults(function(err, allres){
//       console.log(allres)
//       //add index
//       // allres=allres.map(function(r,i){
//       //   r.index=i
//       //   return r
//       // })
//       //Iterate all the result-rooms
//       async.map(allres,function(scoredRes, callback){
//         let scored=JSON.parse(JSON.stringify(scoredRes[0]))
//         Move.find({
//           'room': scored.room,
//           'player': scored.player
//         }).exec(function(err, moveData){
//           scored.moveData = moveData
//           console.log(scored)
//           console.log(moveData)
//           callback(err, scored)
//         });
//       },function(err, allmoves){

        
//         res.json(allmoves);
//       })

//     })
 
// })

app.get('/allmoves', function(req, res) {
  //Find
  Move.find({}).exec(function(err, obj) {
    //Send
    
    fs.writeFile("../public/img/allmoves-" + config.database.index, obj, function(err) {
        if(err) {
          p(err+" Save failed!".red);
        }else{
          p("The file was saved!");
        }  
    });

    res.send(JSON.stringify(obj));
  });
});


app.get('/move/:room/:player', function(req, res) {
 makeAMove(req.params.room,req.params.player,req.query.board, res)
});

//############ ROOM API ################################

app.get('/players', function(req, res) {
  //Find
   allProfiles(function(err, prof) {
    //Send
    let profiles = prof.map(function(p){
      return p.name
    })
    res.json({names:profiles, amount: profiles.length, profiles:prof});
  });
});

app.get('/rooms', function(req, res) {
  //Find
  Room.find({}).exec(function(err, msgs) {
    //Send
    let rooms= JSON.parse(JSON.stringify(msgs))
    rooms = rooms.map(function(m){
      m.completed=boardDone(m.board) ? 1 : 0
      return m
    })
    res.json(rooms);
  });
});

app.get('/seat/:letter', function(req, res) {
  getBySeat(req.params.letter, function(err, msgs) {
    //Send
    p(msgs)
    res.json(msgs);
  });
});

function getBySeat(letter, cb){
  Profile.find({
    'seat': { $regex : new RegExp('^'+letter) }
  }).exec(cb);
}

app.get('/profile/:name', function(req, res) {
  //Find
  Profile.find({
    'name': req.params.name
  }).exec(function(err, msgs) {
    //Send
    p(msgs)
    res.json(msgs);
  });
});

app.get('/currentsession', function(req, res) {
    getAllPLayers(function(err, players){
    res.json({session:config.database.index,"The current experiment session":config.database.index, players:players, number_of_attendees: players.length, games: config.experiment.games, order:config.experiment.order.slice(0,config.experiment.games)});
  })
})

// app.get('/listsessions', function(req, res) {
//    res.json({"Sessions":db.collection.getIndexes()});
// })



app.get('/switchto/:index', function(req, res) {

  config.database.index =  req.params.index
  config.experiment.order = shuffleSeed.shuffle(config.primary.order, config.database.index);

  // db.close();
  db = mongoose.createConnection(config.database.url+config.database.index);

  // create a model from the move schema
   Move = db.model('Move', MoveSchema);

// create a model from the room schema
   Room = db.model('Room', RoomSchema);

// create a model from the room schema
   Result = db.model('Result', ResultSchema);

   Estimate = db.model('Estimate', EstimateSchema);

   Profile = db.model('Profile', ProfileSchema);

   p("SWITCHED TO INDEX:" + config.database.index)
  getAllPLayers(function(err, players){
    res.json({"Switched To":config.database.index,players:players, number_of_attendees: players.length,games:config.experiment.games, order:config.experiment.order.slice(0,config.experiment.games)});
  })
 

});

app.get('/games/:number', function(req, res) {

  config.experiment.games =  parseInt(req.params.number)

  getAllPLayers(function(err, players){
    res.json({games:config.experiment.games,"database_index":config.database.index, players:players, number_of_attendees: players.length, order:config.experiment.order.slice(0,config.experiment.games)});
 })



});

app.get('/allresults', function(req, res) {

  calcAllResults(function(err, final){
      res.json(final);
    })
     
});

function calcAllResults(callback){
  Room.find({}).exec(function(err, rooms) {
    //Send
    p("Calculating all results")
    let flat = rooms.reduce(function(a,room){
      let games = room.players.map(function(player){
        return {player:player, room: room.name}
      })
      return a.concat(games)
    },[])
    p(flat)
    async.mapSeries(flat,function(obj, callback){
     calcResult(obj.room, obj.player, callback)
    },callback)
     
  });
}

//When disconnected reconnect on the new index
 db.on('close', function () {  
  // db = mongoose.createConnection(config.database.url+config.database.index);
 
 });

app.get('/room/:name', function(req, res) {
  //Find
  Room.find({
    'name': req.params.name
  }).exec(function(err, msgs) {
    //Send
    p(msgs)
    res.json(msgs);
  });
});

app.get('/createroom/:name', function(req, res) {
  createARoom(req.params.name,null,globalBoard, function(err, obj){
    p(obj);
    res.json(obj);
  })
});

app.get('/rooms/:name', function(req, res) {
  //Find
  Room.find({
    'players': req.params.name
  }).exec(function(err, msgs) {
    //Send
    p(msgs)
    res.json(msgs);
  });
});

app.get('/deleteProfile/:name', function(req, res) {
  Profile.remove({ name: req.params.name }, function(err) {
    if (!err) {
      allProfiles(function(err, allprof){
          res.json({deleted: req.params.name, remaning: allprof.length,profiles:allprof.map(function(p){return p.name})});
        })
    }else{
      res.json("Failed, something when't wrong");
    }
  });
});

app.get('/peerestimate', function(req, res) {
  allProfiles(function(err, allprof){
    //All 16 or whatever participants have regisitered    
    var peers = {a:{},b:{}}
      allprof.forEach(profile => {
        if(profile.seat.charAt(0)==='A'){
          peers.a[profile.name] = 0
        }else{
          peers.b[profile.name] = 0
        }
        
      })
      io.sockets.emit('peer', peers); 
  });
})

/*||||||||||||||||SOCKET|||||||||||||||||||||||*/
//Listen for connection
io.on('connection', function(socket) {

  p("NEW CONNECTION")

  //Listens for switch room
  socket.on('answer', function(data) {
    //Handles joining and leaving rooms
    p(data);
    answerEstimate(data.room, data.player, data.estimate, data.fuzzy, function(err, res){
      if(!err){
        p("Sending back a message to " + data.player + " verify answer is accepted")
        //Reveal estimate to partner
        if(config.puzzle.replyBoards.indexOf(data.room.split("-")[0])>-1){
          nextGame(data.room, data.player, function(err, n){
            data.next=n
            io.in(data.room).emit('replyEstimate', data);
          })
        }else{
          //Just reply estimate has been recieved
          nextGame(data.room, data.player, function(err, n){
            socket.emit('next', {msg:"Thank you for answering this question, please move on to the next game", next:n});
          })  
        }
      }
    })
  });

  socket.on('peer', function(data) {
     p(data);
    let letter = data.seat.charAt(0)
    if(letter==='A'){
      letter = 'B'
    }else{
      letter = 'A'
    }
  

    const testFolder = '../public/img/people/'+letter+"/";
    var peers = {}
    fs.readdir(testFolder, (err, files) => {
      files.forEach(file => {
        peers[file.split('.')[0]] = 0
      });
      socket.emit('peer', peers);
    })

    // p(letter)
    // getBySeat(letter,function(err, peerList){
    //   let peers = {}
    //   peerList.forEach((p)=> (peers[p.name]=0))
    //     p(peers)
    //     socket.emit('peer', peers);
    // })
    //Handles joining and leaving rooms
   
  });


  socket.on('peerestimate', function(data) {
      //Handles joining and leaving rooms
      console.log("Saving peer-estimate and starting game")
      savePeerEstimate(data,function(err, doc){
        p(err)
          if (!err){
            let seat = data.seat
            seat = seat.replace('B','A')
            p(seat)
            socket.emit('gamestart', {room: config.experiment.order[0] + "-" + seat, player:data.name});
          }
      })
  });

  socket.on('demography',function(data){
    console.log("demographics recieved!")
    console.log(data)
    saveDemographics(data, function(err, doc){
       socket.emit('survey', {go:true});
    })
  })


// function decodeBase64Image(dataString){
//         var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
//         var response = {};

//         if (matches.length !== 3) 
//         {
//           return new Error('Invalid input string');
//         }

//         response.type = matches[1];
//         response.data = new Buffer(matches[2], 'base64');

//         return response;
// }

 socket.on('saveProfile', function(data) {
  //Handles joining and leaving rooms
  p('PROFILE TO SAVE '.green + data.name)

  saveProfileImage(data, function(err) {
    saveProfile(data, function(err, doc){
        socket.emit('practice', {board:transformBoardForFrontend(config.puzzle.boards[config.experiment.practice[0]])});
        // socket.emit('practice', {boards:config.experiment.practice.map(function(b){return transformBoardForFrontend(config.puzzle.boards[b])})});
        p(err)
        allProfiles(function(err, allprof){
          //All 16 or whatever participants have regisitered
          if(allprof.length===config.experiment.games*2){
                var peers = {a:{},b:{}}
                  allprof.forEach(profile => {
                    if(profile.seat.charAt(0)==='A'){
                      peers.a[profile.name] = null//0
                    }else{
                      peers.b[profile.name] = null//0
                    }
                  })
                  io.sockets.emit('peer', peers);
                  // io.in(data.room).emit('peer', peers);
          }else{
            p('not all players have registered yet, only: '+allprof.length + " have..")
          }
        })
    })
  });

  });

 function saveProfileImage(data, callback){
    if(data && data.image && data.name){
      let base64ImageData = data.image.replace(/^data:image\/jpeg;base64,/, "")  //decodeBase64Image(data.image)
      fs.writeFile('../public/img/people/'+data.name+".jpg", base64ImageData, 'base64', callback)
    }else{
      callback()
    }
 }

  function nextPractice(name, callback){
        var query = {'name':name};
        
        Profile.findOne(query, function (err, oldProfile) {
          oldProfile.practice=oldProfile.practice+1
          Profile.findOneAndUpdate(query, oldProfile, {}, function(v){callback(null, oldProfile.practice)});
        });   
   }

   function savePeerEstimate(data, callback){
        var query = {'name':data.name};
        let peerEstimate = Object.keys(data.peer).map((p)=> ({name:p, value:data.peer[p]}))

        Profile.findOne(query, function (err, oldProfile) {
          oldProfile.peerEstimate=peerEstimate
          Profile.findOneAndUpdate(query, oldProfile, {}, callback);
        });   
   }

   function saveDemographics(data, callback){

        var query = {'name':data.name};
        
        Profile.findOne(query, function (err, oldProfile) {
          oldProfile.education=data.education
          oldProfile.field=data.field
          oldProfile.gender=data.gender
          oldProfile.ethnicity=data.ethnicity
          oldProfile.world=data.world
          oldProfile.age=data.age
          Profile.findOneAndUpdate(query, oldProfile, {}, callback);
        });   
   }

    function saveProfile(data, callback){
        let peerEstimate = Object.keys(data.peer).map((p)=> ({name:p, value:data.peer[p]}))
    
        var profile = {
          created: new Date(),
          field: data.field,
          seat: data.seat,
          name:  data.name,
          education: data.education,
          gender: data.gender,
          ethnicity: data.ethnicity,
          world: data.world,
          age: data.age,
          practice:data.practice,
          peerEstimate: peerEstimate
        }

        p(profile);
        var query = {'name':data.name};

        Profile.findOneAndUpdate(query, profile, {upsert:true}, callback);
    }

  //Listens for switch room
  socket.on('joinroom', function(data) {
    //Handles joining and leaving rooms
    p(data);
    joinARoom(data.room, data.player, function(err, obj){
      if(!err){
        // socket.leave(data.oldRoom);
        socket.join(data.room);
        // io.in(data.oldRoom).emit('user left', data);
        // io.in(data.room).emit('userjoined', data);
        if(obj.players.length>1){
          //We can start the game!!
          obj.board=transformBoardForFrontend(obj.board)
          io.in(data.room).emit('room', obj);
        }else{
          io.in(data.room).emit('userjoined', data);
        }
      }else{
        socket.emit('err', err);
      }
    })
  });

  //Listens for a new move
  socket.on('pmove', function(data) {
    // (board, newBoard, player, boardName, callback)
    let practiceBoards =  config.experiment.practice
    let boardName = practiceBoards[data.round]
    savePracticeMove(null, data.move.newBoard, data.player, boardName, function(err, res){
        if(boardDone(data.move.newBoard)){
          //add 1 to practicerounds done for player
          //send player new practice board
          console.log( data.player + "Solved ".green + boardName + " Board!".green)
          //If there are more practice boards
         
            nextPractice(data.player,function(err, practiceRound){
                if(data.round < practiceBoards.length-1){
                  socket.emit('practice', {board:transformBoardForFrontend(config.puzzle.boards[config.experiment.practice[practiceRound]])});
                }else{
                 socket.emit('practicedone', {});
                }
            })
          
        }else{
          socket.emit('move', data);
        }
    })

  })

  //Listens for a new move
  socket.on('move', function(data) {
    makeAMove(data.room, data.player, data.move.newBoard,function(err, obj){
      if(!err && obj){
        // obj.move=data.move
        p(data.player + " made a move in room ".green + data.room)
        if(boardDone(data.move.newBoard) || obj === "expired"){
          
          p("Board solved or expired in room "+ data.room)
          var r = 1
          if(config.puzzle.replyBoards.indexOf(data.room.split("-")[0])>-1){
            r = 2
          }
          if(obj === "expired"){
            r = r+2
          }
          io.in(data.room).emit('done', {reply:r, msg:"Congratulations, the board has been solved together with your partner "});
        }else{
          p("sending a move")
          io.in(data.room).emit('move', data);
        }
      }else{
        if(obj){ //for all?
           io.in(data.room).emit('err', err);
        }else{
          socket.emit('err', err);
        }
        
      }
    })
  });

  socket.on('disconnect', function() {
      p('Got disconnect!');

      // var i = allClients.indexOf(socket);
      // allClients.splice(i, 1);
   });
});
/*||||||||||||||||||||END SOCKETS||||||||||||||||||*/

server.listen(config.server.port);

//I recommend no one to code like this, but this project was written under great time-stress,
//I appologize for the single-doc mess this is, and commend anyone who whishes to refactor this.
//Sincerely, Adam Sam