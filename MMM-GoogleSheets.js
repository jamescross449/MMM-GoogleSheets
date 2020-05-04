/* Magic Mirror
 * Module: MMM-GoogleSheets
 *
 * By ProgParty, https://github.com/Prog-Party/MMM-GoogleSheets
 * MIT Licensed.
 */

Module.register('MMM-GoogleSheets', {
	defaults: {
		spreadsheetId: "",
		sheetId: "",
		updateInterval: 60 * 1000,
		range: "'Sheet1'",
		firstRowHeader: true,
		firstColHeader: true,
		
		urlBase: "https://sheets.googleapis.com/v4/spreadsheets/",
  	}
	
	start: function () {
		this.getJson();
		this.scheduleUpdate();
	},

	scheduleUpdate: function () {
		var self = this;
		setInterval(function () {
			self.getJson();
		}, this.config.updateInterval);
	},
		
	getStyles: function () {
		return ["MMM-GoogleSheets.css"];
	},
	
	getDom: function() {
		var wrapper = document.createElement("div");
		
		if (this.config.spreadsheetId === "") {
			wrapper.innerHTML = "Please set the correct Google Sheets <i>spreadsheet ID</i> in the config for module: " + this.name + ".";
			return wrapper;
		}
		
		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING...");
			return wrapper;
		}
		
	}

	updateSheet: function() {
		if (this.config.spreadsheetId === "") {
			Log.error("Google Sheets: Spreadsheet ID not set!");
			return;
		}

		var url = this.config.urlBase + this.config.spreadsheetId + "/values" + this.config.range;
		var self = this;
		var retry = true;

		var sheetRequest = new XMLHttpRequest();
		sheetRequest.open("GET", url, true);
		sheetRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processSheet(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);

					if (self.config.forecastEndpoint === "forecast/daily") {
						self.config.forecastEndpoint = "forecast";
						Log.warn(self.name + ": Your AppID does not support long term forecasts. Switching to fallback endpoint.");
					}

					retry = true;
				} else {
					Log.error(self.name + ": Could not load weather.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		weatherRequest.send();
	},
		
	processSheet: function(data) {
		this.fetchedLocationName = data.city.name + ", " + data.city.country;

		this.forecast = [];
		var lastDay = null;
		var forecastData = {};

		for (var i = 0, count = data.list.length; i < count; i++) {

			var forecast = data.list[i];
			this.parserDataWeather(forecast); // hack issue #1017

			var day;
			var hour;
			if(!!forecast.dt_txt) {
				day = moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss").format("ddd");
				hour = moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss").format("H");
			} else {
				day = moment(forecast.dt, "X").format("ddd");
				hour = moment(forecast.dt, "X").format("H");
			}

			if (day !== lastDay) {
				var forecastData = {
					day: day,
					icon: this.config.iconTable[forecast.weather[0].icon],
					maxTemp: this.roundValue(forecast.temp.max),
					minTemp: this.roundValue(forecast.temp.min),
					rain: this.processRain(forecast, data.list)
				};

				this.forecast.push(forecastData);
				lastDay = day;

				// Stop processing when maxNumberOfDays is reached
				if (this.forecast.length === this.config.maxNumberOfDays) {
					break;
				}
			} else {
				//Log.log("Compare max: ", forecast.temp.max, parseFloat(forecastData.maxTemp));
				forecastData.maxTemp = forecast.temp.max > parseFloat(forecastData.maxTemp) ? this.roundValue(forecast.temp.max) : forecastData.maxTemp;
				//Log.log("Compare min: ", forecast.temp.min, parseFloat(forecastData.minTemp));
				forecastData.minTemp = forecast.temp.min < parseFloat(forecastData.minTemp) ? this.roundValue(forecast.temp.min) : forecastData.minTemp;

				// Since we don't want an icon from the start of the day (in the middle of the night)
				// we update the icon as long as it's somewhere during the day.
				if (hour >= 8 && hour <= 17) {
					forecastData.icon = this.config.iconTable[forecast.weather[0].icon];
				}
			}
		}

		//Log.log(this.forecast);
		this.show(this.config.animationSpeed, {lockString:this.identifier});
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},
}
