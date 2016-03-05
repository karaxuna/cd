/* global __dirname */
var express = require('express'),
    app = express();
    
// Serve static files
app.use(express.static(__dirname + '/build'));
app.use(express.static(__dirname + '/docs'));
    
// Create http server
var port = 8080;
app.listen(port, function () {
    console.log('Server listening on port', port);
});