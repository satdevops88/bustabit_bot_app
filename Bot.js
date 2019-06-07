const { ipcRenderer } = require('electron');



/* INITIALIZATION
----------------*/

var login = require('./login');
var charge = require('./charge');


function formatSatoshis(n, decimals) {
	return formatDecimals(n / 100, decimals);
}

function formatBetMoney(e, t) {
	return formatDecimals(parseInt(e), t)
}

function formatDecimals(n, decimals) {
	if (typeof decimals === 'undefined') {
		if (n % 100 === 0)
			decimals = 0;
		else
			decimals = 2;
	}
	return n.toFixed(decimals).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}


/* BOT
-----------------*/
function MeroBot(username, ods, money, lossStreak) {
	var self = this;
	self.Config = require('./Config');
	self.Config.USER = username;
	var gameConfig = require('./GameConfig');
	gameConfig.TARGET = parseFloat(ods);
	gameConfig.BET = parseFloat(money);
	gameConfig.LOSSSTREAK = parseInt(lossStreak);

	//variables
	var SatoshiMultiplier = 100;
	var cooledDown = false;
	var baseSatoshi = gameConfig.BET;
	var maxBetSatoshi = gameConfig.MAX;
	var currLoss = 0;
	var currentGameID = -1;
	var playedGames = 0;
	var profit = 0;
	var initialBalance = 0;
	var currentBet = 0;
	var startTime = new Date().getTime();
	var timeRunning = 0;
	var currentTime;
	var highestBalance = 0;
	var currentBalance = 0;
	var betMultiplier = 100;
	var played = false;
	var lostLast = false;

	currentBet = baseSatoshi;


	ipcRenderer.send('bot-log', self.Config.USER);

	login(username, self.Config.PASSWORD, function (err, sessionid) {
		if (err) {
			ipcRenderer.send('bot-log', "Login error: " + err);
			return false;
		}
		self.Config.SESSION = sessionid;

		//console.log(JSON.stringify(self.Config)); // uncomment to see your configs
		var GameClient = require('./GameClient'),
			WebClient = require('./WebClient');

		// Set bot's session cookie for connections
		require('socket.io-client-cookie').setCookies('id=' + self.Config.SESSION);

		// Connect to the game server.
		self.gameClient = new GameClient(self.Config);

		// Connect to the web server.
		self.webClient = new WebClient(self.Config);

		//get initial Balance
		self.gameClient.on('join', function (data) {
			initialBalance = data.balance_satoshis;
			highestBalance = initialBalance;
			currentBalance = initialBalance;
			ipcRenderer.send('bot-log', "Initial Balance: " + formatBetMoney(initialBalance, 0));
			console.log("Initial Balance: " + formatBetMoney(initialBalance, 0));
		});



		//register functions on Events game_starting
		self.gameClient.on('game_starting', function (data) {

			//stop betting when reached target profti
			if (profit > gameConfig.PROFIT) {
				ipcRenderer.send('bot-log', "Taget Profit reached: " + profit);
				console.log("Taget Profit reached: " + profit);
				//process.exit(0);
				return false;
			};

			//we enough funds to do anything ( KRW > 1?)
			if (currentBalance < SatoshiMultiplier) {
				console.log(" Insufficent funds to do anything...");
				ipcRenderer.send('bot-log', "Insufficent funds to do anything...");
				//process.exit(0);
				//transfer

				return false;
			};

			////increase Loss Streak if enabled
			if (gameConfig.LOSSSTREAKPROTECTION) {
				//ipcRenderer.send('bot-log', "[LOSSSTREAKPROTECTION] burda");
				if (lostLast && played) {
					currLoss++;
				};
				//is Bot currently cooled down due to a loss streak?
				// ipcRenderer.send('bot-log', "[currLoss >= gameConfig.LOSSSTREAK] "  + 'currLoss: '+ currLoss  +  ' gameConfig.LOSSSTREAK: ' + gameConfig.LOSSSTREAK);

				if (currLoss >= gameConfig.LOSSSTREAK) {
					cooledDown = true;

					if (lostLast && played) {
						// currLoss = Math.floor(Math.random() * 13) + 1;
						currLoss = 0;
					}

					//currLoss is random set

					ipcRenderer.send('bot-log', "[Bot] We are on a Loss Streak... Cooling down.. rnd" + currLoss);
					console.log('[Bot] We are on a Loss Streak... Cooling down..');
				}
				if (cooledDown) {
					if (currLoss == 0) {
						cooledDown = false;
					} else {
						currLoss--;
						ipcRenderer.send('bot-log', '[Bot] Secured your stake for another ' + currLoss + ' games');
						console.log('[Bot] Secured your stake for another ' + currLoss + ' games');
						//not sure if correct place for played variable...
						played = false;
						return;
					};
				};
			};

			//calculate the new bet
			/*
			if (!(lostLast) && playedGames > 0 && played) {
				currLoss = 0;
				//either multiply or add the basebet
				if (gameConfig.MULTIPLY) {
					currentBet *= gameConfig.MULITIPLIER;
				} else {
					currentBet += baseSatoshi;
				};
				if (highestBalance <= currentBalance) {
					//use base bet according to OScars Grind systemLanguage
					currentBet = baseSatoshi;
					highestBalance = currentBalance;
				};
			};
			*/
			//calculate random new bet



			
			//check if maxumum betting amount is reached
			if (currentBet > gameConfig.MAX) {
				console.log('[Bot] Max amount bet KRW reached...');
				ipcRenderer.send('bot-log', '[Bot] Max amount bet KRW reached...');
				if (gameConfig.STOP) {
					ipcRenderer.send('bot-log', '[Bot] stopping Bot');
					console.log('[Bot] stopping Bot');
					//process.exit(0);
					return false;
				};

				if (gameConfig.RESET) {
					currentBet = baseSatoshi;
				} else {
					currentBet = maxBetSatoshi;
				};
			};

			//check if currentBet is affordable
			if (currentBet > currentBalance) {
				ipcRenderer.send('bot-log', '[Bot] Cannot afford ' + formatBetMoney(currentBet, 0) + ' KRW...');
				console.log('[Bot] Cannot afford ' + formatBetMoney(currentBet, 0) + ' KRW...');
				if (gameConfig.LOW) {
					ipcRenderer.send('bot-log', '[Bot] Stop betting due to low balance');
					console.log('[Bot] Stop betting due to low balance');
					//process.exit(0);
					return false;
				}

				if (baseSatoshi > currentBalance) {
					ipcRenderer.send('bot-log', '[Bot] Insufficent funds for intial bet... stopping');
					console.error('[Bot] Insufficent funds for intial bet... stopping');
					//process.exit(0);

					return false;
				};

				currentBet = baseSatoshi;
			};

			if (currentBet == 500000) {
				currentBet = parseInt(currentBet / (Math.floor(Math.random() * 6) + 2));
			}

			//Place our bet
			var CurrMulti = Math.round(gameConfig.TARGET * betMultiplier);



			this.socket.emit('place_bet', currentBet, CurrMulti, function (err) {
				if (err) {
					ipcRenderer.send('bot-log', 'Place bet error:' + err);
					console.error('Place bet error:', err)
					if (err == 'NOT_ENOUGH_MONEY') {
						//process.exit(0);
						ipcRenderer.send('bot-log', 'For transfer reset money');
						currentBalance = 0;
						profit = 0;
						//return false;
					}
				} else {
					ipcRenderer.send('bot-log', "Placed " + currentBet + " KRW on Multiplier: " + gameConfig.TARGET);
					console.log("Placed " + currentBet + " KRW on Multiplier: " + gameConfig.TARGET);
					currentBalance = currentBalance - currentBet;
					playedGames++;
					//set some variables for later processing
					played = true;
					lostLast = false;
				};
			});
		});

		//register function on Event game_crashed
		self.gameClient.on('game_crash', function (data) {
			//console.log("Current balance before: " + currentBalance)
			//console.log(JSON.stringify(data));
			//console.log(data.game_crash);
			if (playedGames > 0 && played) {
				var bonus = data.bonuses[self.Config.USER];
				if (bonus == undefined) {
					bonus = 0;
				}

				if (data.game_crash < Math.round(gameConfig.TARGET * betMultiplier)) {
					currentBalance = currentBalance + bonus;
					ipcRenderer.send('bot-log', "Game crashed at " + (data.game_crash / SatoshiMultiplier).toFixed(2) + " LOST");
					console.log("Game crashed at " + (data.game_crash / SatoshiMultiplier).toFixed(2) + " LOST");
					lostLast = true;
				} else {
					currentBalance = currentBalance + Math.round(currentBet * gameConfig.TARGET) + bonus;// TODO: BONUS    + Bonus;
					ipcRenderer.send('bot-log', "Game crashed at " + (data.game_crash / SatoshiMultiplier).toFixed(2) + " WIN");
					console.log("Game crashed at " + (data.game_crash / SatoshiMultiplier).toFixed(2) + " WIN");
				};

				profit = (formatBetMoney((currentBalance - initialBalance), 0));
				ipcRenderer.send('bot-log', "Session Profit in KRW: " + profit);
				console.log("Session Profit in KRW: " + profit);
			}


			if (gameConfig.ENABLEBANK) {
				if (currentBalance < 1000) {

					var data = {
						AMOUNT: gameConfig.BANK,
						ACCOUNT: self.Config.BANK,
						PASSWORD: self.Config.PASSWORD,
						SESSION: self.Config.SESSION
					};

					ipcRenderer.send('bot-log', "transfering " + gameConfig.BANK + " to " + self.Config.BANK);
					console.log("transfering " + gameConfig.BANK + " to " + self.Config.BANK);

					charge(self.Config.SESSION, function (err, data) {
						if (err) {
							ipcRenderer.send('bot-log', "transfering err:" + err);
							return false;
						}
						ipcRenderer.send('bot-log', "transfering complete");
						//reset
						initialBalance = gameConfig.BANK;
						currentBalance = initialBalance;
						highestBalance = 0;
						ipcRenderer.send('bot-log', "profit " + profit);
						ipcRenderer.send('bot-log', "initialBalance " + initialBalance);
						ipcRenderer.send('bot-log', "currentBalance " + currentBalance);
						ipcRenderer.send('bot-log', "highest-balance " + highestBalance);
						console.log("profit " + profit);
						console.log("initialBalance " + initialBalance);
						console.log("currentBalcne " + currentBalance);
						console.log("highest-balance " + highestBalance);
					});
				}
			};
		});

	});

}

module.exports = MeroBot;
