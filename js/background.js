// JavaScript Document
var background = {
	items: {
		list: [], 
		changed: false, 
		newest: '' // parser.searchForItems() will stop when this is encountered
	},
	tracking: {
		list: []
	}, 
	interval: 600000, //default interval (10 minutes)
	intervalID: null,
	start: function(){
		//load settings and begin program
		//var keys = ['interval', 'track_list'];
		chrome.storage.local.get(['interval','track_list'], function(data){
				if(typeof data.track_list != 'undefined')
					background.tracking.list = data.track_list;
				else
					console.log('No track_list found in storage.');
				console.log(background.tracking.list);
				if(data.interval >= 300000 && data.interval <= 3600000)
				{
					background.interval = data.interval;
					console.log('Interval loaded: ' + background.interval);
				}
				else
					console.log('Invalid interval. Using default ' + background.interval);
				if(background.tracking.list.length){
					background.checkPage();
				}
				else
					console.log('background.tracking.list is empty. Program stopped.');
	
				background.intervalID = window.setInterval(background.checkPage, background.interval);
				console.log('intervalID set.');	
		});	
	},
	
	newInterval: function(){
		window.clearInterval(background.intervalID)
		console.log('Interval cleared.');
		//background.checkPage();
		if(parser.requesting == 0){ // send xmlhttprequest if there isn't one currently processing
			background.checkPage();
		}
		else
			console.log('A request is already in progress. A new one cannot be sent.');
		background.intervalID = window.setInterval(background.checkPage, background.interval);
		console.log('New interval set: ' + background.interval);
	},
	
	checkPage: function(){
		var url = 'http://ekizo.mandarake.co.jp/shop/en/category-bishojo-figure.html';
		parser.getPageSource(url, parser.findView);
	}
};

background.start();
