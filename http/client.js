// variables globales
var dataGlobal = [];

$(document).ready(function() {
	// connection IO
	var socket = io.connect();
	socket.emit('ping');
	
	socket.on('message', function(data){
		printMsg(data);
	});
	socket.on('donnees', function(data){
		var dataObj = data.paseJSON;
		var dataID = dataObj.cle;
		dataGlobal[dataID].push(dataObj.valeur);
	
		var msgHTML = $("<div/>").html(dataObj.cle + ' = ' + dataObj.value);
		$("#content").append(msgHTML);
	})
	
	socket.on('serial', function(data){
		var $dataZone = $('#data-serial');
		/*var res = String.fromCharCode(10);
		//var nData = data.replace('#'+res+'#g', '<br />');
		var nData = "";
		
		for(var i=0; i<data.length; i++){
			if(data.charCodeAt(i) == 13){
				nData += '<br />';
			}else
				nData += data.charAt(i);
		}*/
		//console.log('data converit : %s', nData);
		
		var nData = data + '<br />';
		$dataZone.html($dataZone.html() + nData);
		window.scrollTo(0, document.body.scrollHeight);
	});
	
	$('#submitSerial').submit(function(event){
		var strSubmited = $('#strSubmit').val();
		$('#strSubmit').val('');
		socket.emit('serial', strSubmited);
		printMsg(strSubmited, 'submit');
		return false;
	});
	
	
	// fonction globales
	function printMsg(message, typeMsg = null){
		var $msgHTML = $("<p/>").html(message);
		if(typeMsg != null){
			$msgHTML.addClass(typeMsg);
		}
		$("#data-serial").append($msgHTML);
	}
	
});//$(document).ready(function() {}