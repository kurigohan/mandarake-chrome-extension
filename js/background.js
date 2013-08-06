// JavaScript Document
var background = {
	items: {
		list: [], 
		changed: false, 
		newest: '', // parser.searchForItems() will stop when this is encountered
		removed: {} // stores urls that were removed by the user in popup. 
					 // ensures parser.searchForItems() doesn't add removed items to items.list again.
			   	     // using object for faster searching since it provides hashing.
	},
	tracking: {
		list: [],
		checkForDup: false,
	}, 
	interval: { 
		time: 300000, // default interval (5 minutes)
		id: null
	},  
	badgeCount: 0,
	
	start: function(){
		//load settings and begin program
		chrome.storage.local.get(['track_list', 'item_list',  'newest', 'badge_count', 'interval'], 
			function(data){
				background.setVariables(data);
				background.updateBadge();
				background.setNewInterval();		
		});	
	},
	
	setVariables: function(data){
		if(typeof data.track_list !== 'undefined'){
			background.tracking.list = data.track_list;
			console.log('Tracking list loaded: ');
			console.log(background.tracking.list);
		}
		else
			console.log('No track_list found in storage.');
			
		if(typeof data.item_list !== 'undefined'){
			background.items.list = data.item_list;
			console.log('Item list loaded: ');
			console.log(background.items.list);
		}
		else
			console.log('No item_list found in storage.');
			
		if(typeof data.newest !== 'undefined'){
			background.items.newest = data.newest;
			console.log('Newest item loaded: ');
			console.log(background.items.newest);
		}
		else
			console.log('No newest found in storage.');
			
		if(typeof data.badge_count !== 'undefined')
		{
			background.badgeCount = data.badge_count;
			console.log('Badge count loaded: ' + background.badgeCount);
		}
		else
			console.log('No track_list found in storage.');
			
		if(data.interval >= 300000 && data.interval <= 3600000)
		{
			background.interval.time = data.interval;
			console.log('Interval loaded: ' + background.interval.time);
		}
		else
			console.log('Invalid interval loaded. Using default ' + background.interval.time);
		
	},
	
	setNewInterval: function(time){
		if(time)
		{
			background.interval.time = time;	
			chrome.storage.local.set({'interval':background.interval.time}, function(){
				console.log('interval saved.')
			});
		}
		if(background.interval.id){
			window.clearInterval(background.interval.id)
			console.log('interval.id cleared.');
		}
		if(!parser.requesting){ // send xmlhttprequest if there isn't one currently processing
			background.checkPage();
		}
		else
			console.log('A request is already in progress. A new one cannot be sent.');
		background.interval.id = window.setInterval(background.checkPage, background.interval.time);
		console.log('interval.id set.');
	},
	
	checkPage: function(){
		if(background.tracking.list.length){
			var url = 'http://ekizo.mandarake.co.jp/shop/en/category-bishojo-figure.html';
			parser.getPageSource(url, parser.findView);
		}
		else
			console.log('background.tracking.list is empty. Page request not sent.');
	},
	
	removeItem: function(url){		
		var index = -1;
		for(var i=0, len=background.items.list.length; i<len; ++i){
			if(background.items.list[i].url == url)
			{
				index = i;
				break;
			}
		}
		if(index > -1)
		{
			background.items.list.splice(index, 1);
			console.log(background.items.list);
			background.badgeCount--;
			background.updateBadge();
			console.log('Item removed: ' + url + '\nRemoved list:');
			background.items.removed[url] = true;
			console.log(background.items.removed);
		}
		else
			console.log('Url not found in background.items.list');
			
	},
	
	updateBadge: function(){
		if(background.badgeCount > 0){
			chrome.browserAction.setBadgeText({text: background.badgeCount.toString()});
		}
		else if(background.badgeCount == 0){
			chrome.browserAction.setBadgeText({text:''});	
		}
	},
	
	changeTracking: function(newTracking){
		background.tracking.list = newTracking.list;
		if(newTracking.added) {
			// force parser.searchForItems() to search all listings since tracking list has new keys
			background.tracking.checkForDup = true;
			background.items.newest = ''; 
		}
	},
	
	onRequest: function(request, sender){
		switch(request.action)
		{
			case 'remove_item':	
				console.log('remove_item request received.');
				background.removeItem(request.url);
				break;
			case 'change_tracking':
				console.log('change_tracking request received');
				background.changeTracking(request.tracking);	
				break;
			case 'change_interval':
				console.log('change_interval request received.');
				background.setNewInterval(request.interval);
				break;
			default: 
				console.log('Error: Invalid request action.');
				break;
		}
	}
	
};


chrome.extension.onRequest.addListener(background.onRequest); 	// wire up the listener	
background.start();
