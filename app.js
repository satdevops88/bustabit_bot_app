const { ipcRenderer } = require('electron');
var app = require('electron').remote;
var dialog = app.dialog;
var fs = require('fs'); // Load the File System to execute our common tasks (CRUD)

var filepath = '';
var arrUsers = [];

document.getElementById("btnRunAll").addEventListener("click", function (e) {

    console.log('length', arrUsers.length);
    if(arrUsers.length == 0) {
        alert('You need to choose a File firstly');
    } else {
        arrUsers.forEach(element => {
            ipcRenderer.send('show-message', {
                username: element.bot_id,
                ods: element.odds,
                money: element.money,
                lossStreak: element.loss_streak
            });
        });

    }
    console.log('btnRunAll');
});

document.getElementById("btnOpenFile").addEventListener("click", function (e) {
    dialog.showOpenDialog((fileNames) => {
        // fileNames is an array that contains all the selected
        if (fileNames === undefined) {
            console.log("No file selected");
            return;
        }
        filepath = fileNames[0];
        var arrFilePath = [];
        arrFilePath = filepath.split(/\\/);
        filepath = arrFilePath[arrFilePath.length - 1]

        fs.readFile(filepath, 'utf-8', (err, data) => {
            if (err) {
                alert("An error ocurred reading the file :" + err.message);
                return;
            }
            var arr = data.split("\n");
            arr.forEach((element, index) => {
                user = {};
                if (index > 0) {
                    var userTemp = element.split(',');
                    if (userTemp[0] && userTemp[1] && userTemp[2] && userTemp[3] && userTemp[4] && userTemp[5] && userTemp[6]) {
                        user.bot_id = userTemp[0];
                        user.odds = userTemp[1];
                        user.money = userTemp[2];
                        user.loss_streak = userTemp[3];
                        user.min_money = userTemp[4];
                        user.max_money = userTemp[5];
                        user.money_unit = userTemp[6];
                        arrUsers.push(user);
                    }
                }
            });
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    setupClickHandler('btn1');
});

function setupClickHandler(btnName) {
    var btn = document.getElementById(btnName);
    var username = document.getElementById('username');
    var ods = document.getElementById('ods');
    var money = document.getElementById('money');
    var lossStreak = document.getElementById('lossStreak');
    btn.onclick = () => {
        ipcRenderer.send('show-message', {
            username: username.value,
            ods: ods.value,
            money: money.value,
            lossStreak: lossStreak.value
        });
    }
}


