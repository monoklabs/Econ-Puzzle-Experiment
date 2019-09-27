/*
Adam Sam 2017

For non-https runs of this in linux:
google-chrome --user-data-dir=/tmp --unsafely-treat-insecure-origin-as-secure="http://63.142.255.120" http://63.142.255.120

chromium-browser --user-data-dir=/tmp --unsafely-treat-insecure-origin-as-secure="http://63.142.255.120" http://63.142.255.120

in Windows:
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir=C:\ChromeTempFiles --unsafely-treat-insecure-origin-as-secure=http://63.142.255.120  https://harvarddecisionlab.org/comprehension-for-credit-instructions

*/


import React from 'react';

import {Label, ListGroup, ListGroupItem, ButtonToolbar,ProgressBar, Nav,NavItem, Row, Col, Code, Carousel,FormControl, MenuItem, DropdownButton, Glyphicon, Well, Panel, Jumbotron, Button } from 'react-bootstrap';
import Collapse from 'react-collapse';
import Board from './puzzle.jsx'
import io from 'socket.io-client'
import TimeAgo from 'react-timeago'
import NumericInput from 'react-numeric-input';
import ReactCountdownClock from 'react-countdown-clock';
import Gauge from 'react-svg-gauge';

var config = require('../../settings/config.json');
var moment = require('moment');
const apiURL = config.server[(location.host ==='localhost' ? 'dev' : config.server.host)].apiUrl

let p = console.log

class Admin extends React.Component {

	constructor(props){
    super(props);
    this.handleVal = this.handleVal.bind(this);
    this.setGames = this.setGames.bind(this);
    this.getCSV = this.getCSV.bind(this);
    this.getCSVMoves = this.getCSVMoves.bind(this);
    this.getDataZip = this.getDataZip.bind(this);
    this.final = this.final.bind(this);
    this.switchSession = this.switchSession.bind(this);
 		this.state = {sessionInput:"", gamesInput:1,currentsession:null};

  }

  componentDidMount(){
    if(!this.state.currentsession){
      this.loadPath('currentsession')  
      this.loadPath('players')  
      this.loadPath('indicies')  
      this.loadPath('rooms')  
    }
    
  }

  loadPath(path){
    let self = this
    self.api('/'+path,{},(data)=>{
      console.log(data)
      let newState = {}
      newState[path]=data
      self.setState(newState)
    })
  }

  handleVal(e) {
   this.setState({sessionInput: e.target.value.toLowerCase().replace(new RegExp(' ', 'g'),'')});
  }  
  
 

  api(path, options, callback){
    fetch(apiURL+path)
      .then(res => res.json())
      .then(callback);
  }

  switchSession(session){
    console.log(session)
     this.api('/switchto/'+(session ? session : this.state.sessionInput),{},(data)=>{
      location.reload();
    })
  }

  setGames() {
    this.api('/games/'+this.state.gamesInput,{},(data)=>{
      location.reload();
    })
  }

  final() {
    this.setState({final:'loading'})
    this.loadPath('final')  
    // this.api('/final',{},(data)=>{
    //   location.reload();
    // })
  }

  getCSV(){
    let self=this
      self.setState({csv:'loading'})
     fetch(apiURL+'/csv')
      .then((err, res)=>{
        this.setState({csv:true})
        window.open(apiURL.split(':3030')[0]+"/img/all-"+self.state.currentsession.session+".csv","_blank")
      });
  }

  getCSVMoves(){
    let self=this
    this.setState({movescsv:'loading'})
     fetch(apiURL+'/movescsv')
      .then((err, res)=>{
        this.setState({movescsv:true})
        window.open(apiURL.split(':3030')[0]+"/img/moves-"+self.state.currentsession.session+".csv","_blank")
      });
  }
  
  getDataZip(){
    let self=this
    this.setState({compressalldata:'loading'})
     fetch(apiURL+'/compressalldata')
      .then((err, res)=>{
        this.setState({compressalldata:true})
        window.open(apiURL.split(':3030')[0]+"/"+self.state.currentsession.session+".zip","_blank")
      });
  }
  

  allplayers(){
    let players = this.state.players ? this.state.players.profiles : null
    let payment = this.state.final
   
    if(players){
      return <ListGroup>{
                players.map((player,i)=>{
                  let pay = payment && payment!=='loading' ? payment.find((p)=>p.player==player.name) : null
                  console.log(pay)
                  console.log(payment)
                  return (<ListGroupItem key={'p'+i}>
                              <img width={64} height={64} src={"/img/people/"+player.name+".jpg"} alt="thumbnail" style={{borderRadius:'50%'}} className="avatar"/>
                              <b style={{marginLeft: 10, textTransform: 'capitalize'}}>{player.name}</b>
                              <b style={{marginLeft: 10, textTransform: 'capitalize', float:'right'}}>{pay && pay.pay ? "$"+pay.pay : '-'}</b>
                              <Label style={{position: 'absolute',left: 7, boxShadow: '3px 2px 7px #636363a6'}} bsStyle={player.seat ? (player.seat.indexOf('B') >-1 ? "info" : "warning") : "danger"}>{player.seat}</Label> {player.gender} , {player.education} 
                              {player.practice ? <div style={{marginTop: 14,float:'right',overflow:'hidden',height: 40}}><div style={{marginTop:-20}}><Gauge  topLabelStyle={{marginTop:10,fontSize:13}} color="#5cb85c" backgroundColor="#f5f5f5" value={player.practice} max={15} width={64} height={64} label="Practice" /></div></div>:null}
                          </ListGroupItem>)
                })
            }</ListGroup>
    }else{
      <div>Loading All Players...</div>
    }
  }
  databases(){
    let self = this
    let databases = self.state.indicies
   p(databases)
    if(databases){
      return <ListGroup>{
                databases.filter((d)=>{
                  // console.log("d")
                  // console.log(d)
                  return !self.state.sessionInput || self.state.sessionInput === ''? true : d.name.includes(self.state.sessionInput)
                  }).map((db,i)=>
                <ListGroupItem key={'db'+i} onClick={(e)=>{this.switchSession(db.name)}} style={{width:'100%'}}>
            
                  <b style={{marginLeft: 10, textTransform: 'capitalize'}}>{db.name}</b>
                  <Label  bsStyle={"primary"}>{db.size}</Label>
                </ListGroupItem>
              )
            }</ListGroup>
    }else{
      <div>Loading All Databases...</div>
    }
  }

  getRooms(){
    let self = this
    let rooms = self.state.rooms

    if(rooms){
      return <ListGroup>{
                rooms.map((rm,i)=>
                <ListGroupItem key={'rm'+i}  style={{width:'100%'}}>
            
                  <b style={{marginRight:10, textTransform: 'capitalize'}}>{rm.name}</b>
                   <Label  bsStyle={"primary"}><TimeAgo date={rm.started}/></Label>
                   <Label  bsStyle={rm.completed ? "success" : (!rm.completed && rm.finished ? "danger" :  "warning") }><TimeAgo date={rm.started}/></Label>
                    <div style={{float:'right'}}>
                    {rm.players.map((p,i)=><div key={'tt'+i} style={{float:'right', paddingRight:20}}>
                      <img width={64} height={64} src={"/img/people/"+p+".jpg"} alt="thumbnail" style={{borderRadius:'50%',width:25, height:25, marginRight:10}} className="avatar"/>
                      {p}
                    </div>)}
                    </div>
                </ListGroupItem>
              )
            }</ListGroup>
    }else{
      <div>Loading All Rooms...</div>
    }
  }


  render() {
    let self = this
    let cs = self.state.currentsession
    let players = this.state.players ? this.state.players.profiles : null
    let rooms = self.state.rooms
    let A = []
    let B = []
    if(players){
      B = players.filter(function(p){return (p && p.seat ? p.seat.indexOf('B') > -1 : false)})
      A = players.filter(function(p){return (p && p.seat ? p.seat.indexOf('B') === -1 : false)})
    }
      return (
        <div> 
         <Nav bsStyle="pills" activeKey={1} >
          <NavItem eventKey={1} href="/home">
            Puzzle Admin
          </NavItem>
          <NavItem href="http://63.142.255.120" target="_blank" eventKey={2} title="Item">
         
            Play a Game
          </NavItem>
          <NavItem href="https://harvarddecisionlab.org/comprehension-for-credit-instructions" target="_blank" eventKey={3}>
            Comprehension
          </NavItem>
        </Nav>


        <Jumbotron>
        <Row className="show-grid" style={{position: 'relative'}}>
        <Col xs={10} md={8}>
               <h1>{cs ? cs.session : 'Loading...'}</h1>
                {cs ? 
                  <div>
                    <p>
                      The Session has currently <b>{cs.number_of_attendees} participants</b><br/>
                      The number of games in this Session is <b>{cs.games} games for {cs.games*2} participants</b>
                    </p>
                    <p>
                    <ProgressBar bsStyle="success" label={`${cs.number_of_attendees}/${cs.games*2}`} now={(cs.number_of_attendees/(cs.games*2))*100} /> 
                    </p>
                   
                      {rooms ? <p>There are currently <b>{rooms.length} rooms</b> of ({Math.pow(cs.games, 2)})</p> : <p>No rooms found</p>}
                    
                    <p>
                    <ProgressBar bsStyle="success" label={rooms ? `${rooms.length}/${Math.pow(cs.games, 2)}` : "No rooms found"} now={rooms ? 100*(rooms.length/Math.pow(cs.games, 2)) : 0} /> 
                    </p>
                      <ButtonToolbar style={{float:'right'}}>
                       {this.state.compressalldata==='loading' ? <img style={{display: 'block', width:30,height:30}} src="/img/loading.gif"/> :
                        <Button bsStyle="default"  style={{marginLeft:30}} onClick={this.getDataZip}>Download All Data (.zip)</Button>}
                        {this.state.movescsv==='loading' ? <img style={{display: 'block', width:30,height:30}} src="/img/loading.gif"/> :
                        <Button bsStyle="default"  style={{marginLeft:30}} onClick={this.getCSVMoves}>Download Moves CSV</Button>}
                         {this.state.csv==='loading' ? <img style={{display: 'block', width:30,height:30}} src="/img/loading.gif"/> :
                        <Button bsStyle="default"  style={{marginLeft:30}} onClick={this.getCSV}>Download Games CSV</Button>}
                        {this.state.final==='loading' ? <img style={{display: 'block', width:30,height:30}} src="/img/loading.gif"/> : 
                        <Button bsStyle="default"  style={{marginLeft:30}} onClick={this.final}>Calculate Final Payment</Button>}
                      </ButtonToolbar>
                    <p>
                 
                        <br/>Games<br/>
                        <DropdownButton bsSize="large" id="seat" title={self.state.gamesInput}>
                          {Array.from('x'.repeat(12)).map((nrOfGames,i)=> <MenuItem  onClick={function(){self.setState({gamesInput:i+1})}} key={"games"+i} eventKey="1">{i+1}</MenuItem>)}
                        </DropdownButton>
                         <Button bsStyle="success" onClick={self.setGames} style={{marginLeft:10}}>Set Games</Button>
                    </p>
                  </div>
                : null}
        </Col>
        <Col xsHidden md={4} style={{right:0, position:'absolute',height:'100%'}} >
         Session Name<br/>
                        <FormControl
                          type="text"
                          value={self.state.sessionInput}
                          placeholder="Type in a Session Name"
                          onChange={self.handleVal}
                          autoComplete="false"
                          style={{float:'left',width:300}}
                        />
                        <Button bsStyle="success"  onClick={(e)=>{this.switchSession()}}style={{marginLeft:10}}>Switch To</Button>
                        <div style={{right:0,height:'100%',overflow:'scroll'}}>
          {this.databases()}
          </div>
        </Col>
      </Row>
       
        </Jumbotron>


         <Row className="show-grid" style={{paddingTop:40}}>
        <Col xs={6} md={6}>
        {players ?
          <ProgressBar>
           <ProgressBar bsStyle="info" label={`${B.length}/${cs.games}`} now={(A.length/(cs.games))*50} key={"pb1"}/>
           <ProgressBar bsStyle="warning" label={`${A.length}/${cs.games}`} now={(A.length/(cs.games))*50} key={"pb2"}/>
        </ProgressBar>
          : null}
        {self.allplayers()}
        </Col>
        <Col xs={6} md={6}>
        {self.getRooms()}
        </Col>
     
      </Row>

    <div className="container">
     
      
     

    

      <hr/>

      <footer>
        <p>&copy; Monok AB 2019</p>
      </footer>
    </div>
          </div>
     
      ) 
    }
		
  
}
export default Admin;

 // <Well bsSize="small">This game started <TimeAgo date={this.state.time}/></Well>

   // <ButtonToolbar>
   //      {/* Standard button */}
   //      <Button>Default</Button>

   //      {/* Provides extra visual weight and identifies the primary action in a set of buttons */}
   //      <Button bsStyle="primary">Primary</Button>

   //      {/* Indicates a successful or positive action */}
    

   //      {/* Contextual button for informational alert messages */}
   //      <Button bsStyle="info">Info</Button>

   //      {/* Indicates caution should be taken with this action */}
   //      <Button bsStyle="warning">Warning</Button>

   //      {/* Indicates a dangerous or potentially negative action */}
   //      <Button bsStyle="danger">Danger</Button>

   //      {/* Deemphasize a button by making it look like a link while maintaining button behavior */}
   //      <Button bsStyle="link">Link</Button>
   //    </ButtonToolbar>;