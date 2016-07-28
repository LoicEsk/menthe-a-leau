/*
	MENTHE A L'EAU

  @author : Loïc Laurent

	docs : https://www.npmjs.org/package/serialport
  
  version : 1.3

*/


console.log('Serial logger');

var fs = require('fs');
var config = require("./config.js");

var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor 
var serial = new SerialPort(config.get('serialID'), {
  baudrate: config.get('baudrate'),
  parser: serialport.parsers.readline("\n") // parser de fin de lignes
}, false);


var querystring = require('querystring');
var http = require('http');

var bufferSerial = "";

// serveur HTTP
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/http'))
/*.get('/', function(req, res) {
   fs.readFile('index.html', 'utf-8', function(error, content) {
        console.log("erreur : "+error);
    res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
})*/
.use(function(req, res, next){
  // 404
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
});
app.on('error', function(){
  console.log('Erreur Expess');
});
var serveur = app.listen(8080);
serveur.on('error', function(){ console.log('== ERREUR SERVEUR =='); });
console.log("_____________________");
console.log("http sur port 8080");
console.log("ctrl+C pour arreter");

// Chargement de socket.io
var io = require('socket.io').listen(serveur/*, { log: false }*/);//
// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    console.log('%s > Un client est connecté à socket.io', getDateStr());
    
    socket.emit('message', 'Connecté à socket.io');

    // connexion coupee
    /*socket.on('disconnect', function(){
        console.log('Un client s\'est déconnecté.');
    })*/
    
    socket.on('serial', function(data){
      if(serial.isOpen()){
        serial.write(data);
        console.log("serie << %s", data);
      }else{
        console.log("serie <X %s", data);
      }
    })

    // reception
    socket.on('ping', function(){
        socket.emit('message', 'Ping recu');
    });
    
    socket.on('error', function(e){
      console.log('Erreur socket.io');
    });
    

});

function openSerial(){
  serial.open(function (error) {
    if ( error ) {
      console.log("%s : Erreur à l'ouverture de la liaison série : ", getDateStr());
      console.log("  -> " + error);
      //serial.close();
      console.log('%s : Nouvelle tentative dans 5 min', getDateStr());
      setTimeout(openSerial, 300000);
  
    } else {
      //serial.flush();
      console.log('Liaison série OK');
      console.log('Affiche du flux de données :');
      
      // ping toutes les 10s pour tracker les erreurs
      /*setInterval(function(){
        serial.write('ping');
        //console.log('ping');
        io.sockets.emit('message', 'ping liaison serie');
      }, 10000);*/
    }
  });
}

serial.on('data', function(data) {
  
  io.sockets.emit('serial', data.toString());// envois des données brut
  //console.log('serial : %s', data);
  
  bufferSerial += data.toString();
  
  var endLine = bufferSerial.indexOf('\n');
  if(endLine > -1 ){
    var lignes = bufferSerial.split('\n');
    for(var i=0; i<lignes.length-2; i++){
      //console.log('Ligne : %s', lignes[i]);
      // quand ca fonctionnera, envoyer les ligne aux clients web
    }
  }
  
  dateFormat = getDateStr();
  
  /*console.log("__");
  console.log('Donnees recues : %s', data);
  console.log("buffer : %s", bufferSerial);*/
  var sep = bufferSerial.indexOf(';');
  while(sep > -1){
    var dataBrut = bufferSerial.substr(0, sep);
    bufferSerial = bufferSerial.substring(sep + 1, bufferSerial.lenght);
    //console.log('sep = %d', sep);
    //console.log("dataBrut = %s",dataBrut);
    //console.log("buffer = %s", bufferSerial);
  
    var sepPos = dataBrut.indexOf('=');
    if(sepPos > 0){
      var decomposition = dataBrut.split('=');
      console.log('%s : POST -> %s = %s', dateFormat, decomposition[0], decomposition[1]);
      
      // enregistrement csv
      /*var donneeFormat = dateFormat + ';' + decomposition[0] + ';' + decomposition[1] + "\r\n";
      fs.appendFile('data.csv', donneeFormat, function (err) {
        if (err) console.log("Erreur d'écriture dans le fichier data.csv");
      });*/
  
      // envois http
      PostData(decomposition[0], decomposition[1], dateFormat);
  
    }
  
    sep = bufferSerial.indexOf(';');
  }

});
// END serial.on('data')
    
serial.on('close', function(erreur){
  console.log('%s : Connexion série perdue !', getDateStr());
  io.sockets.emit('message', 'Connexion série perdue');
  if(serial.isOpen()){
    console.log('Fermeture de la liaison');
    serial.close();
  }
  else console.log('La connexion est fermée');
  console.log('%s : Reconnexion dans 5 min', getDateStr());
  setTimeout(openSerial, 300000);
});

serial.on('error', function(erreur){
  console.log('Erreur sur la Liaison série : %s', erreur);
});





openSerial();


function PostData(donnee, valeur, dateStr) {
  //console.log('envoi de données');
  var querystring = require('querystring');
	var http = require('http');
  
  // Build the post string from an object
  var post_data = querystring.stringify({
    'action': 'datalizer_setData',
    'donnee' : donnee,
    'valeur' : valeur,
    'date' :   dateStr
  });

  // An object of options to indicate where to post to
  var post_options = {
      host: 'localhost',
      port: '80',
      path: config.get('urlPost'),
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          //console.log('Response: ' + chunk);
      });
  });
  post_req.on('error', function(e) {
    console.log("%s : Erreur de la requette POST: %s", getDateStr(), e.message);
    //console.log(e);
    // ça ne passe pas, on réessaye un peu plus tard
    if(e.code == 'ECONNRESET'){
      var delayPost = function(){
        console.log("%s : Nouvelle tentative d'envoi de %s: %d", getDateStr(), donnee, valeur);
        PostData(donnee, valeur, dateStr);
      }
      setTimeout(delayPost, 5000);
    }
  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}

function getDateStr(){
  var now = new Date();
  var annee   = now.getFullYear();
  var mois    = now.getMonth() + 1;
  var jour    = now.getDate();
  var dateFormat = annee + '-' + mois + '-' + jour;
  dateFormat += ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
  return dateFormat;
}

