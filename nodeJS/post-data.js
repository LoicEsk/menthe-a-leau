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
      io.emit('serial', data);// envois des données brut

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
          
          // envois HTTP POST
          postData(decomposition[0], decomposition[1]);

        };

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

function postData(donne, valeur){
  // Build the post string from an object
  var post_data = querystring.stringify({
    'action': 'menthe_setData',
  'donnee' : donnee,
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