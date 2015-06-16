// objet de config


// valeurs par défaut
var dataConfig = {
    serialID: 'com3',/* "/dev/ttyACM0" */
    baudrate: 9600,
    dataFolder: __dirname
};

// lecture du fichier config
console.log('Chargement de la config');

var fs = require('fs');
var file = __dirname + '/config.json';

var dataRead = fs.readFileSync(file, 'utf8');
if(dataRead.length > 0){
	// données reçues
	//dataConfig = JSON.parse(dataRead);
	dataConfig = dataRead;
	console.log('config :');
	console.log(dataConfig);
}


function get(data){
	console.log('config[' + data + '] -> ' + dataConfig[data]);
	return dataConfig[data];
}
function set(data, value){
	this.data[data] = value;

	// enregistrement
	// ...
}

module.exports.get = get;