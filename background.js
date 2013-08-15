// JavaScript Document
var background = {
	trackList: [],
	interval: 600000, //default interval of 10minutes
	intervalID: null,
	start: function(){
		//load settings and begin program
		//var keys = ['interval', 'track_list'];
		chrome.storage.sync.get(['interval','track_list'], function(data){
				background.trackList = data.track_list.splice(0);
				console.log(background.trackList);
				if(data.interval >= 300000 && data.interval <= 3600000)
				{
					background.interval = data.interval;
					console.log('Interval loaded: ' + background.interval);
				}
				else
					console.log('Invalid interval. Using default ' + background.interval);
				if(background.trackList.length > 0){
					background.checkPage();
					background.intervalID = window.setInterval(background.checkPage, background.interval);
				}
				else
					console.log('background.tracklist is empty');
			});	
	},
	
	newInterval: function(){
		window.clearInterval(background.intervalID)
		console.log('Interval cleared.');
		//background.checkPage();
		if(parser.requesting == 0){ // send xmlhttprequest if there isn't one currently processing
			background.checkPage();
		}
		background.intervalID = window.setInterval(background.checkPage, background.interval);
		console.log('New interval set: ' + background.interval);
	},
	
	checkPage: function(){
		var url = 'http://ekizo.mandarake.co.jp/shop/en/category-bishojo-figure.html';
		//parser.getPageSource(url,parser.searchForItems);
		parser.itemList = [];
		parser.getPageSource(url, parser.findViewMode);
	}
};

background.start();
/*
background.checkPage();
var intervalID = window.setInterval(background.checkPage, 300000); //run every 5 minutes
*/
