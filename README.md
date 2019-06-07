Bustabit bot installationn

install Python27
https://www.python.org/ftp/python/2.7.14/python-2.7.14.msi


if use windows install 
install visualcppbuildtools full
https://download.microsoft.com/download/5/f/7/5f7acaeb-8363-451f-9425-68a90f98b238/visualcppbuildtools_full.exe?__hstc=268264337.53d9515b9aa414bbffd43f1c76edea2d.1502872587134.1502872587134.1502872587134.1&__hssc=268264337.2.1502872587135&__hsfp=3810395603&fixForIE=.exe


// run to administrator  just this
~npm install --global --production windows-build-tools

~cd bot-app
~npm install
~npm i electron-builder

~nano node_modules\socket.io-client-cookie\index.js
search "var xhrPath = '../socket.io-client/node_modules/engine.io-client/node_modules/xmlhttprequest';"
replace "var xhrPath = '../engine.io-client/lib/xmlhttprequest';""



configration 
config.js //  game and web server url, bot user default password 
GameConfig.js // run time game config   please check here 


if you want to see console   //webview.openDevTools(); and //win.webContents.openDevTools() remove  comment 



dev 
~npm start

build 
~npm run dist

// if you want exe  please build windows 
// else if lunix pelase build lunix 
// else if macos please build macos 