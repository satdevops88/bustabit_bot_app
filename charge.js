
var url = require('url');
var http = require('http');
var request = require('request');

var config = require('./Config');

function isJSON(str) {

    if(typeof(str) === "boolean"){ return false; } // or if(typeof(str) !== "string")

    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function charge(session, callback) {
    var j = request.jar();
    var headers = {'Cookie': "id="+session};
    console.log('headers' + headers.Cookie);
    request.post({url:config.WEBSERVER + '/secure/charge', jar:j, form:null, headers: headers }, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
         console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
         console.log('body:',body ); // Print the HTML for the Google homepage.
        if(error) return callback(error,null);


        if (!isJSON(body)) {
            //Not JSon
            return callback('Charge failed', null);
        }
        var body = JSON.parse(body);
        callback(null, body.result=='SUCCESS'?true:false);
    });
};

module.exports = charge;

