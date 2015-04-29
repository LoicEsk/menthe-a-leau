/*
	MENTHE A L'EAU

  Enregistreur de données simple

	docs : https://www.npmjs.org/package/serialport
*/


console.log('Serial logger');

var fs = require('fs');
var SerialPort = require("serialport").SerialPort;
var serial = new SerialPort("/dev/ttyACM0", {
  baudrate: 9600
}, false); // this is the openImmediately flag [default is true]

serial.open(function (error) {
  var bufferSerial = "";
  if ( error ) {
    console.log('ERREUR : '+error);
  } else {
    //serial.flush();
    console.log('Liaison série OK');
    console.log('Affiche du flux de données :');

    serial.on('data', function(data) {

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
          var donneeFormat = dateFormat + ';' + decomposition[0] + ';' + decomposition[1] + "\r\n";
          fs.appendFile('data.csv', donneeFormat, function (err) {
            if (err) console.log("Erreur d'écriture dans le fichier data.csv");
          });

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
