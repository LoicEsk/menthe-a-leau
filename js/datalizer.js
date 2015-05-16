// script pour lire et afficher les données


// console.log('Datalizer présent !!');

var dataStorage = {
  fromDate : new Date(),
  toDate : new Date(),
  data : []
}

jQuery(document).ready(function($) {
    

    if(document.getElementById('datalizer')){
      
      // dimensionement du canvas
      /*$('#graph').width($('#ajaxOut').width());
      $('#graph').height($('#graph').width() * 1/2);*/
      
      var dateNow = new Date();
      var time1an = 1000 * 60 * 60 * 24 * 365;
      //var time1mois = 1000 * 60 * 60 * 24 * 30; // pour les tests avec moins de valeurs
      var fromTime = dateNow.getTime() - time1an;
      var fromDate = new Date(fromTime);
      
      dataStorage.fromDate = fromDate;
      dataStorage.toDate = dateNow;
      
      getData();
    }
    
    function getData(){

    	var data = {
  			'action': 'menthe_getData',
  			'fromDate' : dateToString(fromDate),
  			'toDate' : dateToString(dateNow)
  		};

      console.log('Envoi des données : ', data);

  		// since 2.8 ajaxurl is always defined in the admin header and points to admin-ajax.php
  		$.post(ajaxurl, data, function(response) {
  			console.log('Got this from the server: ' + response);
        var dataObj = $.parseJSON(response);
        
        
        
        // affiche les données brutes
        for(var i in dataObj){
          /*var dataHTML = '<div>' + dataObj[i].time + ' > ' + dataObj[i].nom + ' = ' + dataObj[i].valeur + '</div>';
          $('#ajaxOut').prepend(dataHTML);*/ 
          
          // archivage de la donnée
          //dataStorage.data.push(dataObj);
          var nom = dataObj[i].nom;
          var date = dateFromString(dataObj[i].time);
          var valeur = dataObj[i].valeur;
          var dataTps = {'time': date.getTime(), 'valeur': valeur};
          
          if(dataStorage.data[nom] == undefined){
            //console.log('Création de la série %s', nom);
            dataStorage.data[nom] = [];
          }
//          console.log(dataTps);
          dataStorage.data[nom].push(dataTps);
        }
        analyseData();
        drawGraph();
  		});
    }

    function analyseData(){
      // nettoyage des doublons
      // tri des données par ordre chronologique
      
      // affichage du tableau de bord
      var zoneDom = $("#ajaxOut");
      zoneDom.html();
      for(var nom in dataStorage.data){
        var derValeur = dataStorage.data[nom][dataStorage.data[nom].length -1].valeur;
        var elem = $('<div/>').html('<span class="etiquette">' + nom + ' :</span> ' + derValeur);
        zoneDom.append(elem);
      }
      
    }
    
    $(window).on('resize', function() {
        var canvas = document.getElementById("graph");
        var largeur = $('#datalizer').width();
        var hauteur = largeur * 1 / 2;
        canvas.height = hauteur;
        canvas.width = largeur;
        drawGraph();
    });
    $(window).trigger('resize');
    
    function drawGraph(){
      // tracé du graph de valeurs
      
      var startTime = new Date().getTime();
      
      // récupération du contexte 2D
      var canvas = document.getElementById("graph");
      var ctx = canvas.getContext("2d");
      
      // calcul des échelles
      var largeur = canvas.width;
      var hauteur = canvas.height;
      var nbMin = (dataStorage.toDate.getTime() - dataStorage.fromDate.getTime()) / 60000;
      var echelleX = largeur / nbMin;
      var echelleY = hauteur / 100; // de 0 à 100 en vertical
      
      //console.log('Echelles :');
      //console.log('%d min sur %d px -> coeff = %d', nbMin, largeur, echelleX);
    
      ctx.fillStyle = "black";
      ctx.font = "12px serif";
    
      for(nom in dataStorage.data){
        ctx.lineWidth = 2;
        //ctx.strokeStyle = 'blue';
        ctx.beginPath();
        //console.log('série %s', nom);
        for(i in dataStorage.data[nom]){
          var minutesX = (dataStorage.data[nom][i].time - dataStorage.fromDate.getTime()) / 60000;
          //console.log(dataStorage.data[nom][i].time);
          var x = minutesX * largeur / nbMin;
          var y = dataStorage.data[nom][i]['valeur'] * echelleY;
          //console.log('%s %d > %d, %d',nom, i, x, y);
          if(i == 0){
            ctx.fillText(nom, x, y);
            ctx.moveTo(x, y);
          }
          else ctx.lineTo(x, y);
        }
        // fin de tracé
        ctx.stroke();
      }
      
    }
});

function dateToString(dateObj){
	var dateStr = padStr(dateObj.getFullYear()) + '-' +
                  padStr(1 + dateObj.getMonth()) + '-' +
                  padStr(dateObj.getDate()) + ' ' +
                  padStr(dateObj.getHours()) + ':' +
                  padStr(dateObj.getMinutes()) + ':' +
                  padStr(dateObj.getSeconds());
    console.log (dateStr );
    return dateStr;
}
function dateFromString(dateStr){
  // fonction de création d'objet Date à partir d'une chaine au format SQL
  var regex = new RegExp('[-: ]', 'g');
  var dateTab = dateStr.split(regex);
  var dateObj = new Date(dateTab[0], dateTab[1] - 1, dateTab[2], dateTab[3], dateTab[4], dateTab[5]);
  return dateObj;
}

function padStr(i) {
    return (i < 10) ? "0" + i : "" + i;
}