const { ipcRenderer } = require('electron');

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
            username:username.value,
            ods:ods.value,
            money:money.value,
            lossStreak:lossStreak.value
        });
    }
}

