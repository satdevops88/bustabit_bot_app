const bot = require('./Bot');

const { ipcRenderer } = require('electron');





function findGetParameter(parameterName) {
    let result = null,
        tmp = [];
    location.search
        .substr(1)
        .split('&')
        .forEach(item => {
            tmp = item.split('=');
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

document.addEventListener('DOMContentLoaded', () => {
    let username = findGetParameter('username');
    let ods = findGetParameter('ods');
    // let money = findGetParameter('money');
    let min_money = findGetParameter('min_money');
    let max_money = findGetParameter('max_money');
    let random_unit = findGetParameter('random_unit');
    let lossStreak = findGetParameter('lossStreak');

    console.log(username);
    var theDiv = document.getElementById('message');
    theDiv.innerHTML = 'Login user: <b>' + username + '</b>';


var logs = document.getElementById('logs');

    ipcRenderer.on('bot-log-reply', function(event, arg) {
        console.log(arg); // prints "pong"

        var newNode = document.createElement('div');
        newNode.innerHTML = arg;
        logs.appendChild( newNode )

    });

    // bot(username, ods, money, lossStreak);
    bot(username, ods, min_money, max_money, random_unit, lossStreak);
});






// bot burda calisicak

