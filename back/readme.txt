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