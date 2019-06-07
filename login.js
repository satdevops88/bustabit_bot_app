
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

function login(username, password, callback) {
    var j = request.jar();
    var formData = {username:username,password:password};
    request.post({url:config.WEBSERVER + '/secure/login', jar:j, form:formData }, function (error, response, body) {
        /* console.log('error:', error); // Print the error if one occurred
         console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
         console.log('body:', ); // Print the HTML for the Google homepage.*/
        if(error) return callback(error,null);


        if (!isJSON(body)) {
            //Not JSon
            return callback('Login failed', null);
        }

        var body = JSON.parse(body);
        callback(null, body.session);
    });
};

module.exports = login;

