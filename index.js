"use strict";

var express = require('express');
var expApp = express();
var http = require('http').Server(expApp);
var path = require('path');
var bodyParser = require('body-parser');
var sessions = require("client-sessions");

// all environments
expApp.set('port', process.env.PORT || 3000);
expApp.set('views', __dirname + '/views');
expApp.set('view engine', 'ejs');
expApp.use(bodyParser.urlencoded({ extended: true }));
expApp.use(bodyParser.json());
expApp.use(express.static(path.join(__dirname, 'public')));
expApp.use(sessions({
  cookieName: 'clipBoardSession', // cookie name dictates the key name added to the request object
  secret: 'blargadeeblargblarg', // should be a large unguessable string
  duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
}));
//----------------ROUTES--------------------------//
require("./routes/route.js")(expApp);

http.listen(expApp.get('port'), function(){
	console.log('Node-Server listening on port ' + expApp.get('port'));
});
var loginCtrl = require('./controllers/loginCtrl');

var sqs_sns_consume = require('./consume');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('temp.db');
db.run("CREATE TABLE if not exists CLIPBOARD_HISTORY (EMAIL_TIMESTAMP TEXT, TIMESTAMP DATETIME, TEXT TEXT,EMAIL TEXT,FAV_FLAG INT)");
var copypasteCtrl = require('./controllers/copyPasteCtrl');

//------------------Electron-------------------------------------------//
const {app, Menu, Tray, BrowserWindow, clipboard, globalShortcut,window} = require('electron');

var copypasteCtrl = require('./controllers/copyPasteCtrl');
var Positioner = require('electron-positioner')


app.on('ready', function(){
const win = new BrowserWindow({width: 450, height: 700, titleBarStyle: 'hidden', frame: false, titleBarStyle: 'hidden', show:false});
var positioner = new Positioner(win);
positioner.move('bottomRight');

const tray = new Tray('node-changed.png');
win.loadURL('http://localhost:3000/login/');

// This is code for Copy paste
  const copy = globalShortcut.register('CommandOrControl+Shift+C', () => {
    console.log('CommandOrControl+C is pressed');
  	var flag = loginCtrl.getLoggedInFlag();
  	if(flag){
  		var temp = clipboard.readText();
    	copypasteCtrl.copyClipboard(temp);
  	}


    // Code to sync things goes here
  });

// This is code for Copy paste
  const cut = globalShortcut.register('CommandOrControl+Shift+X', () => {
    
  });

// This is code for Copy paste
  const paste = globalShortcut.register('CommandOrControl+Shift+V', () => {

  });




tray.on('click', function() {
   win.isVisible() ? win.hide() : win.show()
})
win.on('show', () => {
  tray.setHighlightMode('always')
})
win.on('hide', () => {
  tray.setHighlightMode('never')
})

});
