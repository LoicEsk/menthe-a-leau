/*
	Scrit Node.js pout le test des envois de données vers le plugin WordPress
*/


// We need this to build our post string
var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

function PostCode() {
  // Build the post string from an object
  var post_data = querystring.stringify({
    'action': 'menthe_setData',
	'donnee' : 'humidit',
	'valeur' : 50
  });

  // An object of options to indicate where to post to
  var post_options = {
      host: 'localhost',
      port: '80',
      path: '/wp-admin/admin-ajax.php',
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


PostCode();
