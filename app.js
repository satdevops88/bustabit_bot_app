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
            console.log(element);
            ipcRenderer.send('show-message', {
                username: element.bot_id,
                ods: element.odds,
                min_money: element.min_money,
                max_money: element.max_money,
                random_unit: element.money_unit,
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
                    if (userTemp[0] && userTemp[1] && userTemp[2] && userTemp[3] && userTemp[4] && userTemp[5]) {
                        user.bot_id = userTemp[0];
                        user.odds = userTemp[1];
                        user.loss_streak = userTemp[2];
                        user.min_money = userTemp[3];
                        user.max_money = userTemp[4];
                        user.money_unit = userTemp[5];
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
    // var money = document.getElementById('money');
    var minmoney = document.getElementById('min_money');
    var maxmoney = document.getElementById('max_money');
    var random_unit = document.getElementById('random_unit');
    var lossStreak = document.getElementById('lossStreak');
    btn.onclick = () => {
        ipcRenderer.send('show-message', {
            username: username.value,
            ods: ods.value,
            min_money: minmoney.value,
            max_money: maxmoney.value,
            random_unit: random_unit.value,
            lossStreak: lossStreak.value
        });
    }
}


