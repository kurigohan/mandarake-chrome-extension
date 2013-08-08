// JavaScript Document
var background = {
	items: {
		list: {}, 
		removed: {}, // stores urls that were removed by the user in popup. 
					 // ensures parser.searchForItems() doesn't add removed items to items.list again.
			   	     // using object for faster searching since it provides hashing.
		newest: '', // parser.searchForItems() will stop when this is encountered
		changed: false	
	},
	tracking: {
		list: [],
	}, 
	interval: { 
		time: 300000, // default interval (5 minutes)
		id: null
	},  
	badgeCount: 0,
	pageIndex: 0,
	newestFound: false,
	requesting: false, // Indicates if an xmlhttprequest is running
	source: 'http://ekizo.mandarake.co.jp/shop/en/category-bishojo-figure.html',
	start: function(){
		//load settings and begin program
		chrome.storage.local.get(['track_list', 'item_list',  'removed_list', 'newest', 'badge_count', 'interval'], 
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
		
		if(typeof data.removed_list !== 'undefined'){
			background.items.removed = data.removed_list;
			console.log('removed list loaded: ');
			console.log(background.items.removed);
		}
		else
			console.log('No removed_list found in storage.');
		
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
	
	setNewInterval: function(time, url){
		var pageUrl;
		if(url)
			pageUrl = url;
		else
			pageUrl = background.source;
		if(time)
		{
			background.interval.time = time;	
			/*chrome.storage.local.set({'interval':background.interval.time}, function(){
				console.log('interval saved.')
			});*/
		}
		if(background.interval.id){
			window.clearInterval(background.interval.id)
			console.log('interval.id cleared.');
		}
		if(!background.requesting){ // send xmlhttprequest if there isn't one currently processing
			background.checkPage(pageUrl);
		}
		else
			console.log('A request is already in progress. A new one cannot be sent.');
		background.interval.id = window.setInterval(function(){
				background.checkPage(pageUrl);
			}, background.interval.time);
		console.log('interval.id set.');
	},
	
	getPageSource: function(url, callback) {
		console.log('Fetching document: ' + url);
		var xhr = new XMLHttpRequest();
		background.requesting = true;
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				callback(xhr.responseText);
				background.requesting = false;
			}
		};
		xhr.send();
	},
	
	checkPage: function(url){
		var url = background.getPageUrl(background.pageIndex);

		if(url && background.tracking.list.length){
			background.getPageSource(url, function(data){
					background.newestFound = background.searchPageSource(data);
					if(background.newestFound == false){
						background.pageIndex++;
						console.log('Next page needed.');
					}

			}); //end getPageSource
		} // end if url && ...
		else
			console.log('Invalid url or empty tracking list. Page request not sent.');
		background.save();

	},
	
	searchPageSource: function(page){
		background.viewMode = parser.getView(page);
		return parser.searchForItems(background.viewMode.$items, background.viewMode.selector);
	},
	
	removeItem: function(url){
		delete background.items.list[url];
		background.items.removed[url] = true;
		background.badgeCount--;
		background.updateBadge();
		console.log(url + ' removed.');
		console.log(background.items.list);
		/*chrome.storage.local.set({'item_list':background.items.list, 'removed_list':background.items.removed, 
									'badge_count':background.badgeCount}, function(){
			console.log('item_list, removed_list, badge_count saved');
		});*/
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
			background.items.newest = ''; 
		}
	},
	
	save: function(){
		chrome.storage.local.set({'item_list':background.items.list, 'newest':background.items.newest, 
				'removed_list':background.items.removed, 'interval':background.interval.time,
				 'badge_count':background.badgeCount}, function(){
				console.log('Background saved.');	
		});
	},
	
	getPageUrl: function(index){
		if(index == 0)
			return background.source;
		return 'http://ekizo.mandarake.co.jp/shop/en/search.do?action=setSearchedList&searchedListIndex='+
					index +'&searchStrategy=keyword';
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
			case 'change_url':
				console.log('change_url request received.');
				background.source = request.url;
				background.setNewInterval();
				break;
			case 'reset':
				console.log('reset request received.');
				background.items.list = {};
				background.items.newest = '';
				background.items.changed = false;
				background.items.removed = {};
				background.tracking.list = [];
				background.badgeCount = 0;
				background.updateBadge();
				window.clearInterval(background.interval.id);
				console.log('All variables cleared.'); 
				break;
			default: 
				console.log('Error: Invalid request action.');
				break;
		}
	}
	
};


chrome.extension.onRequest.addListener(background.onRequest); 	// wire up the listener	
chrome.windows.onRemoved.addListener(background.save);
background.start();
