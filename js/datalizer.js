// script pour lire et afficher les données


console.log('Datalizer présent !!');

jQuery(document).ready(function($) {
    

    if(document.getElementById('ajaxOut')){

      var dateNow = new Date();
      var time1an = 1000 * 60 * 60 * 24 * 365;
      var fromTime = dateNow.getTime() - time1an;
      var fromDate = new Date(fromTime);

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
          var dataHTML = '<div>' + dataObj[i].time + ' > ' + dataObj[i].nom + ' = ' + dataObj[i].valeur + '</div>';
          $('#ajaxOut').prepend(dataHTML); 
        }
  		});
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

function padStr(i) {
    return (i < 10) ? "0" + i : "" + i;
}
