# Install MongoDB
sudo apt install mongodb-server
# Kill MongoDB
sudo killall -15 mongod
# Start MongoDB
sudo mongod --dbpath data

#Locale problems
export LC_ALL=C
mongod


n=$(which node);n=${n%/bin/node}; chmod -R 755 $n/bin/*; sudo cp -r $n/{bin,lib,share} /usr/local

A Room is a game between two people, a unique match, i.e LA1 (L is the board, A is the physical room number and 1 is the seat number) 

If you're hosting the backend on http://DOMAINNAME.com
the full path will be http://DOMAINNAME.com:3030 except for when downloading the compiled csv file

| Path | Description |
| --- | --- |
| /switchto/<sessiondatenumber> | Sets/Switches the current session (experiment), if it doesn't exist it will set it up with a new random order of boards (with sessiondatenumber as seed). |
| /currentsession | Returns the current experiment session, with the number of games, and the order of boards. |
| /games/<x> | This sets the number of games in a session, where x is the number of puzzles that subjects are going to solve that day. Number of games must be set before any demogrpahics information is entered otherwise everyone that was signed in is kicked out and you have to start all over again! If only 4 participants show up, you must set the games (x) to 2. For the 2 games, these 4 people will play.|
| /players | Lists all the players and their respective profiles in the current session |
| /allmoves | Lists all the moves made by all the players in all the rooms in the current session|
| /allscoredmoves | All moves data including scores|
| /moves/<room>/<player> | Returns all the moves made by a specific player in a specific room|
| /payment | returns the payment amount for all participants |
| /seat/<seat> | Get the player profile based on the seat they are sitting in (i.e A2)|
| /csv | Downloads all the data in CSV format|
| http://<DOMAIN NAME>/img/all-<sessionsnamn>.csv | Downloads the csv file |
| /data/<player> | Returns all data for the participant |
| /profile/<name> | Returns the profile data (demographics etc), peer-estimate etc of the chosen player (name) |
| /deleteProfile/<name> | Deletes a player profile (if they were added with incorrect information, say their name is misspelled) |
| /estimate/<room>/<player> | Return the estimates for a player in a room |
| /peerestimate | This is a socket io used by the frontend |
| /createroom/<name> | Creates a new, empty room with the global-board as its board |
| /rooms/<playername> | Returns a list of all the rooms (state, turn etc) where the player is a member. |
| /room/<name> | This returns the current board-state, turn and members for a particular room (i.e k-A2) |
| /rooms | This lists all the current rooms and their state, turn and members |
| /allresults | Returns a list of all the moves for all the players in all the rooms, the moves are presented as positive or negative integers for positive or negative move. A sum is given under “result”, showing how well a player did. |
| /payment | Returns the amount of money to be paid out for each player if the calculation has been made |
| /final | Calculates and returns a list of all the players and the amount of money they have respectively earned. |
