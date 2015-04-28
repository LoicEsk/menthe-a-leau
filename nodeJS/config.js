// objet de config


// valeurs par défaut
dataConfig = {
    serialID: 'com3',/* "/dev/ttyACM0" */
    baudrate: 9600,
    dataFolder: __dirname
};

// lecture du fichier config
console.log('Chargement de la config');

var fs = require('fs');
var file = __dirname + '/config.json';

fs.readFile(file, 'utf8', function (err, dataTxt) {
	 if (err) {
		console.log('Erreur de lecture de configuration');
		console.log('Err : ' + err);
		console.log('chargement de la config par défaut');
		return;
	 }
  	// données reçues
  	dataConfig = extend(dataConfig, JSON.parse(dataTxt));
});

function get(data){
	return dataConfig[data];
}
function set(data, value){
	this.data[data] = value;

	// enregistrement
	// ...
}

module.exports.get = get;