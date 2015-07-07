// objet de config


// valeurs par défaut
var dataConfig = {
    serialID: 'com3',/* "/dev/ttyACM0" */
    baudrate: 9600,
    dataFolder: __dirname,
	urlPost: '/wp-admin/admin-ajax.php'
};

// lecture du fichier config
console.log('Chargement de la config');

var fs = require('fs');
var file = __dirname + '/config.json';

try{
	var dataRead = fs.readFileSync(file, 'utf8');
	if(dataRead.length > 0){
		// données reçues
		var configRead = JSON.parse(dataRead);
		// vérification de la config
		var erreur = false;
		for(var elem in dataConfig){
			//console.log('Verif de config : config[' + elem + '] -> ' + configRead[elem]);
			if(configRead[elem] == undefined) erreur = true;
		}
		if(!erreur){
			dataConfig = JSON.parse(dataRead);
			console.log("Config chargée avec succès");
		}else{
			console.log('ERREUR : Incohérence de la config lue. Certainement un problème de version. Help @LoicEsk');
		}
	}
}
catch(e){
	console.log("ERREUR : Fichier config manquant");
	console.log("Création du fichier par défaut");
	console.log("Modifiez %s pour modifer la config", file);
	configString = JSON.stringify(dataConfig);
	fs.writeFile(file, configString, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	});
}

// affichage config
for(var elem in dataConfig){
	console.log('Lecture de config : config[' + elem + '] -> ' + dataConfig[elem]);
}



function get(data){
	return dataConfig[data];
}
function set(data, value){
	this.data[data] = value;

	// enregistrement
	// ...
}

module.exports.get = get;