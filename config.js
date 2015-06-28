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

try{
	var dataRead = fs.readFileSync(file, 'utf8');
	if(dataRead.length > 0){
		// données reçues
		dataConfig = JSON.parse(dataRead);
		console.log("Config chargée avec succès");
	}
}
catch(e){
	console.log("Fichier config manquant.");
	console.log("Création du fichier par défaut");
	console.log("Modifiez %s pour modifer la config", file);
	configString = JSON.stringify(dataConfig);
	fs.writeFile(file, configString, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	});
}



function get(data){
	console.log('Lecture de config : config[' + data + '] -> ' + dataConfig[data]);
	return dataConfig[data];
}
function set(data, value){
	this.data[data] = value;

	// enregistrement
	// ...
}

module.exports.get = get;