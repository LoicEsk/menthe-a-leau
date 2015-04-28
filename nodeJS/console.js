/*
	MENTHE A L'EAU

  @author : Loïc Laurent

	docs : https://www.npmjs.org/package/serialport
*/


console.log('Serial logger');

var fs = require('fs');
var config = require("./config.js");
var SerialPort = require("serialport").SerialPort;
var serial = new SerialPort(config.get('serialID'), {
  baudrate: config.get('baudrate')
}, false); // this is the openImmediately flag [default is true]

var querystring = require('querystring');
var http = require('http');

serial.open(function (error) {
  var bufferSerial = "";
  if ( error ) {
    console.log("Erreur à l'ouerture de la liaison série : "+error);
    //serial.close();

  } else {
    //serial.flush();
    console.log('Liaison série OK');
    console.log('Affiche du flux de données :');

    serial.on('data', function(data) {
      io.emit('serial', data);// envois des données brut
      console.log(data);

      bufferSerial += data;

      var now = new Date();
      var annee   = now.getFullYear();
      var mois    = now.getMonth() + 1;
      var jour    = now.getDate();
      var dateFormat = annee + '-' + mois + '-' + jour;
      dateFormat += ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

      //console.log("__");
      //console.log('Donnees recues : %s', data);
      //console.log("buffer : %s", bufferSerial);
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
          console.log('%s : %s = %s', dateFormat, decomposition[0], decomposition[1]);
          
          // enregistrement csv
          /*var donneeFormat = dateFormat + ';' + decomposition[0] + ';' + decomposition[1] + "\r\n";
          fs.appendFile('data.csv', donneeFormat, function (err) {
            if (err) console.log("Erreur d'écriture dans le fichier data.csv");
          });*/

          // envois http
          PostData(decomposition[0], decomposition[1]);

        }

        sep = bufferSerial.indexOf(';');
      }

    });
    serial.on('close', function(erreur){
      console.log('Connexion série perdue !');
      console.log(erreur);
    })
    serial.on('error', function(erreur){
      console.log('Erreur sur la Liaison série : %s', erreur);
    })

    /*serial.write("ls\n", function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results);
    });*/
  }
});

/* headers pour fournir un CSV ;
res.header('content-type','text/csv');
res.header('content-disposition', 'attachment; filename=report.csv');
*/

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
    res.send(404, 'Page introuvable !');
});
var serveur = app.listen(8080);
console.log("_____________________");
console.log("http sur port 8080");
console.log("ctrl+C pour arreter");

// Chargement de socket.io
var io = require('socket.io').listen(serveur, { log: false });//
// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    //console.log('Un client est connecté à socket.io');
    socket.emit('message', 'Connecté à socket.io');

    // connexion coupee
    /*socket.on('disconnect', function(){
        console.log('Un client s\'est déconnecté.');
    })*/

    // reception
    socket.on('echo', function(){
        socket.emit('message', '999 grosses dondons');
    });
    

});



function PostData(donnee, valeur) {
  // Build the post string from an object
  var post_data = querystring.stringify({
    'action': 'menthe_setData',
    'donnee' : 'donnee',
    'valeur' : valeur
  });

  // An object of options to indicate where to post to
  var post_options = {
      host: 'localhost',
      port: '80',
      path: '/home/wp-admin/admin-ajax.php',
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
          console.log('Response: ' + chunk);
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}