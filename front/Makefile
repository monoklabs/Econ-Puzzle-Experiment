# semsomi AB 2016-2017, (Monok 2019)
# All rights reserved

NODE_VERSION = 6.2.0
PRODUCTION_BRANCH = master
UPDATE_SCREEN = frontupdate
SERVE_SCREEN = webserver

all: change-node-version
	npm run build

dev: change-node-version sync-with-public
	npm run start

build: change-node-version
	npm run build

install: install-nvm

public: sync-with-public build

update: change-branch download-latest public

download-latest:
	git pull origin $(PRODUCTION_BRANCH)
	npm install --production
	
change-branch:
 ifeq ($(shell git branch | grep "* $(PRODUCTION_BRANCH)"),)
	git checkout $(PRODUCTION_BRANCH)
 endif

screen-autoupdate:
 ifeq ($(shell screen -ls | grep $(UPDATE_SCREEN)),)
	screen -Sdm $(UPDATE_SCREEN)
 endif
	screen -S $(UPDATE_SCREEN) -p 0 -X stuff "make autoupdate\\r"

restart-screen-serve: close-screen-serve screen-serve

close-screen-serve:
 ifneq ($(shell screen -ls | grep $(SERVE_SCREEN)),)
	screen -S $(SERVE_SCREEN) -X quit
 endif

screen-serve:
 ifeq ($(shell screen -ls | grep $(SERVE_SCREEN)),)
	screen -Sdm $(SERVE_SCREEN)
 endif
	screen -S $(SERVE_SCREEN) -p 0 -X stuff "make serve\\r"

serve:
	npm run serve

autoupdate:
	node autoupdate.js

install-node:
 ifneq ($(shell whoami),root)
	$(error MUST BE RUN AS ROOT)
 endif
 ifeq ($(shell which node),)
	sudo apt-get -y install nodejs-legacy
 endif

install-npm:
 ifneq ($(shell whoami),root)
	$(error MUST BE RUN AS ROOT)
 endif
 ifeq ($(shell which npm),)
	sudo apt-get -y install npm
 endif	

#node version manager
install-nvm: install-node install-npm
 ifneq ($(shell whoami),root)
	$(error MUST BE RUN AS ROOT)
 endif
 #check if installed, if not download
 ifeq ($(shell ls -a ~/ | grep .nvm),)
	sudo wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash
 endif
 #check if right node version is used, if not install and use
 ifneq ($(shell node --version),v$(NODE_VERSION))
	. ~/.nvm/nvm.sh;nvm install $(NODE_VERSION)
	. ~/.nvm/nvm.sh;nvm use $(NODE_VERSION)
 endif

create-public-folder:
	mkdir -p ../public

sync-with-public: create-public-folder
	rsync -av --ignore-existing --exclude 'js' --exclude 'css' ./src/ ../public/

change-node-version:
 ifneq ($(shell node --version),v$(NODE_VERSION))
	. ~/.nvm/nvm.sh;nvm install $(NODE_VERSION)
	. ~/.nvm/nvm.sh;nvm use $(NODE_VERSION)
 endif