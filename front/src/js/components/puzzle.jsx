import React from 'react';

    var Board = React.createClass({

        
        getInitialState: function() {
            return {
                // initial state of game board
                tiles: this.props.board,
                win: false
            };
        },
        checkBoard: function() {
            var tiles = this.state.tiles;

            for (var i = 0; i < tiles.length-1; i++) {
                if (tiles[i] !== i+1) return false;
            }

            return true;
        },
        makeAMove: function(data){
            console.log(data)
            var tileEl = document.querySelector('.tile:nth-child(' + (data.move.position + 1) + ')');
            this.tileClick(tileEl, data.move.position, data.move.value, true, data)
        },
        tileClick: function(tileEl, position, status, doIt, data) {
           

            var tiles = this.state.tiles;
            var self = this;
            // Possible moves
            // [up,right,down,left]
            // 9 = out of bounds
            var moves = [
                [null,1,3,null],[null,2,4,0],[null,null,5,1],
                [0,4,6,null],   [1,5,7,3],   [2,null,8,4],
                [3,7,null,null],[4,8,null,6],[5,null,null,7]
            ];

          

            function animateTiles(i, move) {
                var directions = ['up','right','down','left'];
                var moveToEl = document.querySelector('.tile:nth-child(' + (move + 1) + ')');
                var direction = directions[i];
                tileEl.classList.add('move-' + direction);
                // this is all a little hackish.
                // css/js are used together to create the illusion of moving blocks
                setTimeout(function() {
                    moveToEl.classList.add('highlight');
                    tileEl.classList.remove('move-' + direction);
                    // time horribly linked with css transition
                    setTimeout(function() {
                        moveToEl.classList.remove('highlight');
                    }, 400);
                }, 200);
            }

            // called after tile is fully moved
            // sets new state
            function afterAnimate() {
                // tiles[position] = '';
                // tiles[move] = status;
                var theNewBoard = data.move.newBoard.map(function(i){
                    if(i===""){
                        return ""
                    }else{
                        return parseInt(i)
                    }
                })
                self.props.setTurn(data)
                this.setState({
                    tiles: theNewBoard,
                    moves: moves,
                    win: this.checkBoard()
                });

            };

            // return if they've already won
            if (this.state.win) return;

            // check possible moves
            for (var i = 0; i < moves[position].length; i++) {
                var move = moves[position][i];
                // if an adjacent tile is empty
                if (typeof move === 'number' && !tiles[move]) {
                    
                    if(doIt){
                      animateTiles(i, move);
                      setTimeout(afterAnimate.bind(this), 200);
                    }else{
                        //if (this.props.myturn){ //unessasary
                            console.log("CLICKED")
                            var newBoard=tiles.toString().split(",") //Clone array
                            newBoard[position] = '';
                            newBoard[move] = status;
                            self.props.move(position, status, newBoard);
                        //}
                        
                    }
                   
                    break;
                }
            }
        },
        restartGame: function() {
            this.setState(this.getInitialState());
        },
        render: function() {
        
            return  <div style={{textAlign: "center"}}>
                        <div id="game-board" style={this.props.style}>
                            {this.state.tiles.map(function(tile, position) {
                                return ( <Tile status={tile} key={position} keywe={position} tileClick={this.tileClick} /> );
                            }, this)}
                        </div>
                    </div>;
    
        }
    });

    var Tile = React.createClass({
        clickHandler: function(e) {
            this.props.tileClick(e.target, this.props.keywe, this.props.status);
        },
        render: function() {
            return <div className="tile" onClick={this.clickHandler}>{this.props.status}</div>;
        }
    });

   

export default Board;