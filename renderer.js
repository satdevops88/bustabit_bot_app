// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const TabGroup = require('electron-tabs');
const dragula = require('dragula');

let tabGroup = new TabGroup({
        closeButtonText: '&#x2715;',
        ready: tabGroup => {
        dragula([tabGroup.tabContainer], {
            direction: 'horizontal'
        });
}
});

let tab = tabGroup.addTab({
        title: 'Home',
        src: './app.html',
        webviewAttributes: {
            'nodeintegration': true
        },
        icon: 'fa fa-home',
        visible: true,
        closable: false,
        active: true,
        ready: tab => {
        // Open dev tools for webview
        let webview = tab.webview;
            if (!!webview) {
                webview.addEventListener('dom-ready', () => {
                   // webview.openDevTools();
                })
            }
        }
});

const { ipcRenderer } = require('electron');

ipcRenderer.on('show-message', (event, msg) => {

    let tab = tabGroup.addTab({
            title: `User: ${msg.username}`,
            src: `./content.html?username=${msg.username}&ods=${msg.ods}&money=${msg.money}&lossStreak=${msg.lossStreak}`,
            webviewAttributes: {
                'nodeintegration': true
            },
            icon: 'fa fa-comment',
            visible: true,
            active: true,
            ready: tab => {
            // Open dev tools for webview
            let webview = tab.webview;
                if (!!webview) {
                    webview.addEventListener('dom-ready', () => {
                       //webview.openDevTools();
                 })
                }
            }
    });
});
