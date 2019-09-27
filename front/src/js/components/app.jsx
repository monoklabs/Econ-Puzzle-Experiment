/*
Monok 2017

For non-https runs of this in linux:
google-chrome --user-data-dir=/tmp --unsafely-treat-insecure-origin-as-secure="http://63.142.255.120" http://63.142.255.120

chromium-browser --user-data-dir=/tmp --unsafely-treat-insecure-origin-as-secure="http://63.142.255.120" http://63.142.255.120

in Windows:
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir=C:\ChromeTempFiles --unsafely-treat-insecure-origin-as-secure=http://63.142.255.120  https://harvarddecisionlab.org/comprehension-for-credit-instructions

*/


import React from 'react';
import {Carousel,FormControl, MenuItem, DropdownButton, Glyphicon, Well, Panel, Jumbotron, Button } from 'react-bootstrap';
import Collapse from 'react-collapse';
import Board from './puzzle.jsx'
import io from 'socket.io-client'
// import TimeAgo from 'react-timeago'
import NumericInput from 'react-numeric-input';
import ReactCountdownClock from 'react-countdown-clock';
import Webcam from 'react-webcam';

import Admin from './admin.jsx';

var config = require('../../settings/config.json');
var moment = require('moment');

let socket = io(config.server[(location.host ==='localhost' ? 'dev' : config.server.host)].apiUrl)

let p = console.log

class PapayaApp extends React.Component {

	constructor(props){
    super(props);
    this.move = this.move.bind(this);
    this.setTurn = this.setTurn.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.nextGame = this.nextGame.bind(this);
    this.sendDemography = this.sendDemography.bind(this);
    this.answerForRoom = this.answerForRoom.bind(this);
    this.StartTheGame = this.StartTheGame.bind(this);
    this.showInfo = this.showInfo.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleVal = this.handleVal.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
    this.handleValAge = this.handleValAge.bind(this);
    this.handlePeerEstimate = this.handlePeerEstimate.bind(this);
    this.gotoSurvey = this.gotoSurvey.bind(this);
    this.mainPage = this.mainPage.bind(this);
    this.nextMainPage = this.nextMainPage.bind(this);
    this.previousMainPage = this.previousMainPage.bind(this);
    this.setVal = this.setVal.bind(this);
    this.takePhoto = this.takePhoto.bind(this);
    this.setRef = this.setRef.bind(this);
    this.setFuzzy = this.setFuzzy.bind(this);
 		this.state = {mainForm:{peer:{loading:1},practice:0},
                  practiceRound:-1,
                  boardload:false,
                  estimate: null, 
                  fuzzy: null, 
                  mainFormPage:0,
                  page: 'join', 
                  msg:'', 
                  opponent:'',
                  yourturn:false,
                  board:[], 
                  showInfo:false,
                  time:new Date(),
                  seconds:0,
                  reply:{reply:1,msg:""},
                  replyEstimate:null,
                  password:""};
  }

  componentDidMount() { 
   
    var player = this.props.params.player
    socket.on('err', data => {
      this.setState({ page:"error", msg:data })
    })
    socket.on('replyEstimate', data => {
      if(data.player!==player){
        this.setState({ replyEstimate:data})
        if(this.state.page==='waiting'){
           this.setState({ page:"replyEstimate"})
        }
      }else if(data.player===player){
        this.setState({ msg:data })
      }
    })
    socket.on('gamestart', data => {
      window.location = '/#/'+data.room+'/'+data.player;
      location.reload();
    })  

    socket.on('survey',data=>{
      this.gotoSurvey()
    }) 

    socket.on('practice',data=>{
      let self = this
      console.log("NEW PRACTICE BOARD")
      console.log(data)
      this.setState({page:'practice', board:data.board, yourturn:true, boardload:true, practiceRound:self.state.practiceRound+1})
      self.refreshBoard()
    })

    socket.on('practicedone',data=>{
      //Move on to peer estimate
      this.setState({mainFormPage: 1, page: ''});
    })

    socket.on('peer', data => {
      p(data)
      if(this.state.mainForm.seat.charAt(0)==='A'){
        this.setVal('peer',data.b)
      }else{
        this.setVal('peer',data.a)
      }
     
    })  
    socket.on('gamestart', data => {
      window.location = '/#/'+data.room+'/'+data.player;
      location.reload();
    })
    socket.on('done', data => {
      this.setState({ page:"done", reply:data })
    })

    socket.on('msg', data => {
      p("MESSAGE RECIEVED: "+data)
      this.setState({ page:"msg", msg:data })
    })

    socket.on('next', data => {
      p("MESSAGE RECIEVED: "+data)
      this.setState({ page:"next", msg:data })
    })

    socket.on('userjoined', data => {
    	if(data.player===player){
    		 p("YOU JOINED ROOM " + data.room)
    		this.setState({page:"waiting" })
    	}else{
        this.setState({ opponent:data.player })
				p("User " + data.player + " joined!")
    	}
      // console.log(data)
    })

    socket.on('room', data => {
    	if(data.players.indexOf(player)>-1){
    		p("Your room!")
        var opponent = data.players.filter(name => name!==player).toString()
    		this.setState({time:data.started,page:"board", board:data.board, opponent:opponent,yourturn:data.players[data.turn]===player,seconds:Math.round(moment(data.started).diff(moment())/1000)})
    	}
      // console.log(data)
    })

    socket.on('move', data => {
      // this.setState({yourturn:data.player!==player}) //It's your turn before the animation is done, that's a problem so, even before the board's been updated
      this.refs.pussel.makeAMove(data) //maybe we can activate the board after this is done
    })
  }

  refreshBoard() {
     setTimeout((sdsd)=>{
      this.setState({boardload:false})
     }, 1000) 
  }

	move(position, value, newBoard){
    if(this.state.yourturn && config.blocked.indexOf(value)===-1){
    console.log(value + " at " + position+ " board: "+newBoard)
    if(this.state.page==='practice'){
      socket.emit('pmove', {round:this.state.practiceRound, player:this.state.mainForm.name, move:{position:position, value:value, newBoard:newBoard}})      
    }else{
      socket.emit('move', {room:this.props.params.roomName, player:this.props.params.player, move:{position:position, value:value, newBoard:newBoard}})           
    }
    this.setState({yourturn:false})
    }else if(!this.state.yourturn){
      p("It's not your turn")
    }else if(config.blocked.indexOf(value)>-1){
      p("this particual tile ("+value+") is not allowed to be moved")
    }
  }

  setTurn(data){
    if(this.state.page==='practice'){
      this.setState({yourturn:true})
    }else{
      console.log("Turn switched")
      this.setState({yourturn:data.player!==this.props.params.player })
    }

  }

  joinRoom(){
    socket.emit('joinroom', {room:this.props.params.roomName,player:this.props.params.player})
  }
  nextGame(){
    if(this.state.msg.next!=='gameover'){
      window.location = '/#/'+this.state.msg.next+'/'+this.props.params.player;
      location.reload();
    }

	}
  startGame(){
      window.location = '/#/'+this.state.msg.next+'/'+this.props.params.player;
      location.reload();
  }  
  gotoSurvey(){
      window.location.href = "https://hhs.qualtrics.com/jfe/form/SV_dgRkFEVMs5w8c0R?firstname="+this.props.params.player;
      // location.reload();
  }
  answerForRoom(){
    socket.emit('answer', {room:this.props.params.roomName,player:this.props.params.player, estimate:this.state.estimate, fuzzy:this.state.fuzzy})
    if(this.state.replyEstimate){
      this.setState({ page:"replyEstimate"})
    }else{
      this.setState({page:"waiting" })
    }
  }

  handleChange(valueAsNumber) {
    this.setState({estimate: valueAsNumber});
  } 
  mainPage(page) {
    this.setState({mainFormPage: page});
  }  
  nextMainPage() {
    p('sent profile for save')
    socket.emit('saveProfile', this.state.mainForm)     
    // this.setState({mainFormPage: this.state.mainFormPage+1});
  }
  previousMainPage() {
    this.setState({mainFormPage: this.state.mainFormPage-1});
  }

  setVal(field, val) {
    let newMf = this.state.mainForm
    if(field === 'seat' && config.AisC){
      val = val.replace('C','A')
    }
    newMf[field] = val
    this.setState({mainForm: newMf});
  }
  setFuzzy(val) {
    this.setState({fuzzy: val});
  }
  handleVal(e) {
    let newMf = this.state.mainForm
    newMf.name = e.target.value.toLowerCase().replace(new RegExp(' ', 'g'),'')
    this.setState({mainForm: newMf});
  }  
  handlePassword(e) {
    this.setState({password: e.target.value});
  }
  handleValAge(valueAsNumber) {
    let newMf = this.state.mainForm
    newMf.age = valueAsNumber
    this.setState({mainForm: newMf});
  }
  handlePeerEstimate(valueAsNumber, index) {
    let newMf = this.state.mainForm
    newMf.peer[index] = valueAsNumber
    this.setState({mainForm: newMf});
  }
  myFormat(num) {
    return num + '%';
  }
  showInfo() {
    this.setState({showInfo: true});
  }

  StartTheGame(){
    let mainForm = this.state.mainForm
    if(this.state.password === 'eir' && mainForm.name && mainForm.seat && mainForm.image){
      if(this.state.mainFormPage===1){
        p('starting game')
        //Send peerestimate and start game
        socket.emit('peerestimate', this.state.mainForm)
      }
      if(this.state.mainFormPage===0){
        socket.emit('saveProfile', this.state.mainForm)
      }
    }
  }

  takePhoto(){
    if(this.state.mainForm.image){
      this.setVal('image',null)
    }else{
      this.setVal('image',this.capture())
    }
   
  }




  sendDemography(){
    console.log("SENDING DEMO")
    // console.log(this.state.mainForm)
    let mainForm = this.state.mainForm
    mainForm.name=this.props.params.player
    if(mainForm.field && mainForm.world  && mainForm.age && mainForm.ethnicity && mainForm.gender && mainForm.education){
      socket.emit('demography', mainForm)
    }
  }

  demographics(){
    let mf = this.state.mainForm
    let world = ["Africa","Asia","Australia","Europe","North America","South America"]
    let gender = ["Female","Male"]
    let ethnicity = ["White / Caucasian (non-Hispanic)","African American (non-Hispanic)","Native American, Aleut or Aboriginal Peoples", "Asian / Pacific Islander", "Latino or Hispanic", "Mixed Race", "Other"]
    let education = ["High-school degree","Bachelor Degree","Master’s Degree","Other"]
    let field = ['Economics','Political Science','Mathematics','Psychology','Humanities','Other Social Sciences','Other Natural Sciences','Other']
    var self = this
    return (
      <div>
        <p>The Experiment is now over, please answer these questions and proceed to the survey. thank you.</p>
        <br/><br/>
         What is your age?<br/>
        <NumericInput onChange={self.handleValAge} min={18} max={100} value={mf.age}/>
        <br/><br/>
        In which part of the world did you grow up?<br/>
        <DropdownButton id="world" title={mf.world}>
          {world.map((world,i)=> <MenuItem onClick={function(){self.setVal('world',world)}} key={"world"+i} eventKey="1">{world}</MenuItem>)}
        </DropdownButton>
        <br/><br/>
        What is your gender?<br/>
        <DropdownButton id="gender" title={mf.gender}>
          {gender.map((gender,i)=> <MenuItem onClick={function(){self.setVal('gender',gender)}} key={"gender"+i} eventKey="1">{gender}</MenuItem>)}
        </DropdownButton>
        <br/><br/>
        What is your ethnicity?<br/>
        <DropdownButton id="ethnicity" title={mf.ethnicity}>
          {ethnicity.map((ethnicity,i)=> <MenuItem onClick={function(){self.setVal('ethnicity',ethnicity)}} key={"ethnicity"+i} eventKey="1">{ethnicity}</MenuItem>)}
        </DropdownButton>
        <br/><br/>
        What is the highest level of education you have completed?<br/>
        <DropdownButton id="education" title={mf.education}>
          {education.map((education,i)=> <MenuItem onClick={function(){self.setVal('education',education)}} key={"education"+i} eventKey="1">{education}</MenuItem>)}
        </DropdownButton>
        <br/><br/>
        What is you field of study?<br/>
        <DropdownButton id="field" title={mf.field}>
          {field.map((field,i)=> <MenuItem onClick={function(){self.setVal('field',field)}} key={"field"+i} eventKey="1">{field}</MenuItem>)}
        </DropdownButton>
        <br/><br/>
        <Button bsStyle="primary" onClick={self.sendDemography}>Proceed to Survey</Button>
      </div>
      )
  }

  roomTranslation(seat){
    // return seat
    if(seat && config.AisC){
      return seat.replace('A','C')
    }else{
      return seat
    }
    
  }

  setRef(webcam){
    this.webcam = webcam;
  }

  capture(){
    const imageSrc = this.webcam.getScreenshot();
    return imageSrc
  };

  mainForm(){
    const videoConstraints = {
      width: 350,
      height: 350,
      facingMode: 'user',
    };

    let seatNumbers=config.seatAmount
    let mf = this.state.mainForm
    let seats = []
    // let rooms = ['A','B']

    let rooms = config.AisC ? ['B', 'C'] : ['A','B']
 
    for(let j = 0; j<rooms.length;j++){
      for(let i = 0; i<seatNumbers; i++){
        seats.push(rooms[j]+(i+1))
      }
    }
    var self = this
    return (
      <Panel style={{ width: "550px", margin:"100px auto"}}  header={"Sliding Puzzle"} bsStyle="primary">
    
      What is your first name?<br/>
      <FormControl
        type="text"
        value={mf.name}
        placeholder="Type in your first name"
        onChange={this.handleVal}
        autoComplete="false"
      />
      <br/><br/>
      Your seat number<br/>
      <DropdownButton bsSize="large" id="seat" title={self.roomTranslation(mf.seat)}>
        {seats.map((seat,i)=> <MenuItem  onClick={function(){self.setVal('seat',seat)}} key={"seat"+i} eventKey="1">{seat}</MenuItem>)}
      </DropdownButton>
      <br/><br/>
         {self.state.mainForm.image ? <img style={{margin: "auto",display: "block",borderRadius:'50%'}} src={"data:image/jpeg;" + self.state.mainForm.image} className="avatar"/>  : <Webcam style={{margin: "auto",display: "block",borderRadius:'50%'}}
          audio={false}
          height={350}
          ref={this.setRef}
          screenshotFormat="image/jpeg"
          width={350}
          videoConstraints={videoConstraints}
        />}
        <Button bsStyle="primary" onClick={self.takePhoto}>{self.state.mainForm.image ? "Take a New Photo" : "Snap Photo"}</Button>
        <br/>
        <br/>
      Researcher Signature (please wait for the researcher to sign you in)
      <br/>
       <FormControl
        type="password"
        autoComplete="off"
        value={this.state.password}
        placeholder="Researcher Signature"
        onChange={this.handlePassword}
      />
      <br/>
      <Button bsStyle="primary" onClick={this.StartTheGame}>Start Practice Round</Button>
      </Panel>
      )
  }

  getReplyForm(){
    return (
      <Panel style={{ width: "550px", margin:"100px auto"}}  header={"Sliding Puzzle result for "+ this.props.params.player} bsStyle="primary">
      {this.replyForm()}
      </Panel>
      )
  }

  compileMessage(message, opponent, roomName){
    message = message.replace(new RegExp('\\[partner\\]', 'g'),opponent.toUpperCase())
    message = message.replace(new RegExp('\\[puzzle\\]', 'g'),roomName.toUpperCase())
    return message
  }

  replyForm(){
    let self = this
    let fuzzyAnswer = config.fuzzy
    var m = this.props.params.reply
    m = m ? m : this.state.reply.reply
    m = m ? m : 1
    var message = config["solveMessage"+m]
    var info =  this.compileMessage(config["info"+(m>2 ? 2:1)],this.state.opponent,this.props.params.roomName)
    message = this.compileMessage(message,this.state.opponent,this.props.params.roomName)

     return (<Jumbotron>
        <p>{message}</p>
        {this.state.showInfo ? <p style={{fontSize: 'initial'}}>{info}</p> : <Button  onClick={this.showInfo} bsStyle="default" style={{marginBottom:'30px'}}>Show more info</Button>}
        <br/>
        <p>Your contribution:</p><p style={{color:'grey',fontSize: 'small'}}> (Not visible to your partner)</p>
        <NumericInput placeholder="Your contribution" onChange={this.handleChange} style={{wrap: {fontSize: 32}}} min={0} max={100} value={this.state.estimate}  format={this.myFormat}/>
        <br/>
        <br/>
        <p>Do you think you would be better on your own?</p>
        <DropdownButton id="fuzzyAnswer" title={this.state.fuzzy}>
          {fuzzyAnswer.map((fuzzyAnswer,i)=> <MenuItem onClick={function(){self.setFuzzy(fuzzyAnswer)}} key={"fuzzyAnswer"+i} eventKey="1">{fuzzyAnswer}</MenuItem>)}
        </DropdownButton>
        <p>{this.state.estimate!==null && this.state.fuzzy ? <Button  onClick={this.answerForRoom} bsStyle="primary" style={{marginTop:'30px'}}>Answer for game: <b>{this.props.params.roomName.toUpperCase()}</b></Button> : null}</p>
      </Jumbotron>)
  }

  thePeopleForm(){
    var self = this

    let allFilled = true
    Object.keys(self.state.mainForm.peer).forEach((p)=>{
      if(self.state.mainForm.peer[p]===null){
        allFilled=false
      }
    })

    let toRender =  Object.keys(self.state.mainForm.peer).map((peer)=>
    <div key={peer+"-person"}>
      <br/><br/>
      <img style={{borderRadius:'50%', display:'block',margin:'auto'}} width={300} height={300} src={"img/people/" + peer +".jpg"} className="avatar"/>
      <br/><p style={{textAlign: 'center',fontWeight: 'bold',fontSize: 'large'}}>{peer} - Estimate average contribution</p>
      <NumericInput onChange={function(val){self.handlePeerEstimate(val, peer)}} value={self.state.mainForm.peer[peer]}  style={{wrap: {fontSize: 32,textAlign:'center', width: '100%'}}} min={0} max={100}  format={this.myFormat} />
      <br/>
    </div>)

    return (<Panel style={{ width: "550px", margin:"100px auto"}}  header={"Sliding Puzzle"} bsStyle="primary">
            <p>{config.peerMessage}</p>
            {self.state.mainForm.peer.loading ? <div>
              <b>Please wait for all participants to register..</b>
              <img style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}} src="/img/loading.gif"/></div> : toRender}
            {self.state.mainForm.peer.loading || !allFilled ? null : 
              <Button  onClick={this.StartTheGame} bsStyle="primary" style={{marginTop:'30px'}}>Start The Game</Button> }
            </Panel>)

  }


  enterGame(){
    return (<Jumbotron>
              <h1>Hello, {this.props.params.player}!</h1>
              <p>{config.enterGameMessage}</p>
              <p><Button bsStyle="primary" onClick={this.joinRoom}>JOIN ROOM: <b>{this.props.params.roomName.toUpperCase()}</b></Button></p>
            </Jumbotron>)
  }

  headerContent(){
    let replyState = (this.props.params.reply && this.state.page!="msg") || this.state.page==="done"
    let gameOver = this.state.msg.next==='gameover'
    let self = this
    return (
        <h3>
          {this.state.page==="error" ? "Error!": null}
          {this.state.page==="replyEstimate" ? "Your partners reply": null}
          {this.state.page==="join" ? "Welcome to Puzzle Experiment!": null}
          {this.state.page==="waiting" ? "Please wait for participant, game (" + this.props.params.roomName.toUpperCase()+")": null}
          {this.state.opponent!=="" && !gameOver ? (
            <div style={{height:130}}>Playing together with&nbsp; 
            <b>{this.state.opponent}</b>{this.state.yourturn ? (<b> - Your turn!</b>): (<b> - Waiting...</b>)}
            <img style={{opacity:(this.state.yourturn? 0.4: 1), borderRadius:'50%', display: 'block', float: 'left', marginTop:10,borderWidth: 3, borderColor: 'white', borderStyle: 'solid'}} width={100} height={100} src={"img/people/" + this.state.opponent +".jpg"} className="avatar"/>
              {!replyState && !gameOver ? <div style={{float:'right',marginTop:10}}>
                <ReactCountdownClock seconds={240+self.state.seconds}
                       color="#FFFFFF"
                       alpha={0.9}
                       size={100}
                       timeFormat="hms"
                       onComplete={(lol)=>{}} />
              </div> : null}
            </div>
            ) : null}
          {this.state.page=='practice' ? <div>
            <b>Practice Round! - You earn 25 cents per Board, Solve as many as you can!</b>
            <ReactCountdownClock seconds={240}
                       color="#FFFFFF"
                       alpha={0.9}
                       size={100}
                       timeFormat="hms"
                       onComplete={(lol)=>{
                        this.setState({mainFormPage: 1, page: ''});
                       }} />
          </div> : null}
        </h3>
      );
  }


  render() {
    console.log(this.props.params)
    if(this.props.params.roomName==='admini' && this.props.params.player==='stration'){
      return (<Admin>HELLO WORLD</Admin>)
    }

    var self = this
    //myturn={this.state.yourturn}
    if(this.state.page==='practice'){
      return (<Panel style={{ width: "350px", margin:"100px auto"}}  header={self.headerContent()} bsStyle="primary">
                {this.state.boardload ? <div><img style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}}src="/img/loading.gif"/></div> :
                <Board board={this.state.board} setTurn={this.setTurn}  move={self.move} style={{textAlign:"center"}} ref="pussel" /> }      
              </Panel>)
    }


    if(!this.props.params.player && !this.props.params.roomName){
      if(this.state.mainFormPage===0){
        return this.mainForm()
      }else if(this.state.mainFormPage===1){
        return  this.thePeopleForm()
      }
    }

    if((this.props.params.reply && this.state.page!="msg") || this.state.page==="done"){
      return this.getReplyForm()
    }else{

      return (
        <Panel style={{ width: "350px", margin:"100px auto"}}  header={this.headerContent()} bsStyle="primary">
          <div> 

          <Collapse style={{width:"100%"}} isOpened={this.state.page==="board"}>
            <Board  board={this.state.board} setTurn={this.setTurn} move={this.move} style={{textAlign:"center"}} ref="pussel" />       
          </Collapse>
          {this.state.page==="join" ? this.enterGame() : null}
          {this.state.page==="waiting" ? (<div><img style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}} src="/img/loading.gif"/></div>): null}
          {this.state.page==="error" ? (<div><Glyphicon glyph="exclamation-sign" /> {this.state.msg}</div>) : null}
          {this.state.page==="msg" ? (<h1>{this.state.msg}</h1>) : null}
          {this.state.page==="next" ? (<div>
                                          <h1>{this.state.msg.msg}</h1>
                                          {this.state.msg.next!=='gameover' ? 
                                          <Button bsStyle="primary" onClick={this.nextGame}>Continue to the next game</Button> : this.demographics()}      
                                      </div>) : null}
          {this.state.page==="replyEstimate" ? (<div>
                                                  <h1>{this.state.opponent} estimated {this.state.replyEstimate.estimate}% as their contribution to this game ({this.props.params.roomName})</h1>
                                                  {this.state.msg.next!=='gameover' ? 
                                                  <Button bsStyle="primary" onClick={this.nextGame}>Continue to the next game</Button> : this.demographics()} 
                                                </div>) : null}
          </div>
        </Panel>
      ) 
    }
		
  }
}
 // <Well bsSize="small">This game started <TimeAgo date={this.state.time}/></Well>
export default PapayaApp;