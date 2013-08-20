// JavaScript Document
var background = {
	items: {
		list: {}, 
		//removed: {}, // stores urls that were removed by the user in popup. 
					 // ensures parser.searchForItems() doesn't add removed items to items.list again.
		removed: {},
		lastNewest: '', // parser.searchForItems() will stop when this is encountered
		currentNewest: '', // holds the current newest item while last newest item is being searched for
		lastNewestFound: false,
		listCount: 0,
		removeCount: 0,
		changed: false
	},
	tracking: {
		list: [],
		changed: true // ensures parser splits tracking.list on start
	}, 
	interval: { 
		time: 300000, // default interval (5 minutes)
		id: null
	},  
	searchPage: {
		source: 'http://ekizo.mandarake.co.jp/shop/en/category-bishojo-figure.html',
		index: 0, // current display page index; used to get the next page url
		limit: 5 // max number of pages to search
	},
	badgeCount: 0,
	requesting: false, // Indicates if an xmlhttprequest is running
	start: function(){
		//load settings and begin program
		chrome.storage.local.getBytesInUse(null,function(bytesInUse) {console.log('Current Storage size: '+bytesInUse)});
		chrome.storage.local.get(['track_list', 'item_list',  'removed_list', 'last_newest', 
									'search_source', 'search_limit','badge_count', 'interval'], 
			function(data){
				background.setVariables(data);
				background.updateBadge();
				if(background.items.lastNewest){
					background.setNewInterval();
				}
				else{
					console.log('First Run.');
					background.getLastNewestOnly();
				}
		});	
	},
	
	setVariables: function(data){

		if(data.track_list !== undefined){
			background.tracking.list = data.track_list;
			console.log('Tracking list loaded: ');
			console.log(background.tracking.list);
		}
		else{
			console.log('No track_list found in storage.');
		}
			
		if(data.item_list !== undefined){
			background.items.list = data.item_list;
			background.items.listCount = Object.keys(background.items.list).length;
			console.log('Item list loaded: ');
			console.log(background.items.list);
			console.log('Length: ' + background.items.listCount);
		}
		else{
			console.log('No item_list found in storage.');
		}
		
		if(data.removed_list !== undefined){
			background.items.removed = data.removed_list;
			background.items.removeCount = Object.keys(background.items.removed).length;
			console.log('Removed list loaded: ');
			console.log(background.items.removed);
			console.log('Length: ' + background.items.removeCount);
		}
		else{
			console.log('No removed_list found in storage.');
		}
		
		if(data.last_newest !== undefined){
			background.items.lastNewest = data.last_newest;
			console.log('Last newest item loaded: '+background.items.lastNewest);
		}
		else{
			console.log('No last_newest found in storage.');
		}	
			
		if(data.search_source !== undefined)
		{
			background.searchPage.source = data.search_source;
			console.log('Search page source loaded: ' + background.searchPage.source);
		}
		else {
			console.log('No search_source found in storage.');
		}
			
		if(data.search_limit !== undefined)
		{
			background.searchPage.limit = data.search_limit;
			console.log('Search page limit loaded: ' + background.searchPage.limit);
		}
		else{
			console.log('No search_limit found in storage.');
		}
			
		if(data.badge_count !== undefined)
		{
			background.badgeCount = data.badge_count;
			console.log('Badge count loaded: ' + background.badgeCount);
		}
		else{
			console.log('No badge_count found in storage.');
		}
			
		if(data.interval >= 60000 && data.interval <= 3600000)
		{
			background.interval.time = data.interval;
			console.log('Interval loaded: ' + background.interval.time);
		}
		else{
			console.log('Invalid interval loaded. Using default ' + background.interval.time);
		}
	},
	
	getLastNewestOnly: function(){
		background.getPageSource(background.searchPage.source, function(data){
				background.searchPageSource(data);
			}); //end getPageSource
					
		background.interval.id = window.setInterval(function(){
				background.checkPage(background.searchPage.source);
			}, background.interval.time);	
		console.log('interval.id set.');
		
	},
	
	setNewInterval: function(time, url){
		var pageUrl;
		if(url)
			pageUrl = url;
		else
			pageUrl = background.searchPage.source;
		if(!isNaN(time) && time!=background.interval.time){
			background.interval.time = time;
			console.log('Interval changed: ' + background.interval.time);	
		}

		if(background.interval.id){
			window.clearInterval(background.interval.id)
			console.log('interval.id cleared.');
		}

			
		background.interval.id = window.setInterval(function(){
					background.checkPage(pageUrl);
				}, background.interval.time);
		console.log('interval.id set.');
		
		if(!background.requesting){ // send xmlhttprequest if there isn't one currently processing
			background.checkPage(pageUrl);
		}
		else{
			console.error('A request is already in progress. A new one cannot be sent.');
		}
	},
	
	getPageSource: function(url, callback) {
		background.requesting = true;
		console.log('Fetching document: ' + url);
		var xhr = new XMLHttpRequest();
		var abortTimerId = window.setTimeout(function(){
			xhr.abort();
			console.log('Request timed out.');
			background.requesting = false;
			}, 20000);
		console.log('REQUEST STARTED');
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				window.clearTimeout(abortTimerId);
				callback(xhr.responseText);
				background.requesting = false;
				background.save();
				console.log('REQUEST ENDED.');
				if(background.items.lastNewestFound == false){
					var nextUrl = background.getPageUrl(background.searchPage.index);
					console.log('Next page url: ' + nextUrl);
					if(nextUrl != ''){
						background.getPageSource(nextUrl, callback);
					}
					else{
						console.log('Page limit reached. Stopping search');
						background.searchPage.index = 0;
						background.items.lastNewest = background.items.currentNewest;
						console.log('lastNewest set to currentNewest.'); 
						console.log(background.items.lastNewest);
					}
				}

			}
		}; //end onreadystatechange
		xhr.onerror = function(error) {
					console.error('Error. Could not retrieve page.');
					background.requesting = false;
					};
		xhr.open("GET", url, true);
		xhr.send();
		
	},
	
	checkPage: function(url){
		console.log('lastNewestFound equals '+background.items.lastNewestFound);
		background.items.lastNewestFound = false;
		console.log('background.items.lastNewestFound set to false');
		var url = background.getPageUrl(background.searchPage.index);

		if(url && background.tracking.list.length){
			background.getPageSource(url, function(data){
					background.searchPageSource(data);
					if(background.items.lastNewestFound == false){
						background.searchPage.index++;
						console.log('Next page needed.');
					}

			}); //end getPageSource
		} // end if url && ...
		else{
			console.log('Invalid url or empty tracking list. Page request not sent.');
		}

	},
	
	searchPageSource: function(page){
		background.viewMode = parser.getView(page);
		if(background.viewMode)
			parser.searchForItems(background.viewMode, background);
		else{
			console.error('Invalid view mode. Search cancelled.');
		}
	},
	
	removeItem: function(url){
		delete background.items.list[url];
		background.items.removed[url] = '';
		background.items.removeCount++;
		background.items.listCount--;
		background.badgeCount--;
		background.updateBadge();
		console.log(url + ' removed.');
		//console.log(background.items.list);
		if(background.items.removeCount >= 200){
			background.items.removed = {};
			background.items.removeCount = 0;
			console.log('Removed list limit reach. Cleared.');
		}
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
		background.tracking.changed = true;
	},
	
	save: function(){
		chrome.storage.local.set({'item_list':background.items.list, 'last_newest':background.items.lastNewest, 
		 'track_list':background.tracking.list, 'removed_list':background.items.removed,
		 'interval':background.interval.time, 'search_source':background.searchPage.source,
		 'search_limit':background.searchPage.limit, 'badge_count':background.badgeCount}, function(){
				console.log('Background saved.');	
		});
	},
	
	getPageUrl: function(index){
		console.log('Fetch Page index: ' + index);
		if(index == 0)
			return background.searchPage.source;
		else if(index < background.searchPage.limit)
			return 'http://ekizo.mandarake.co.jp/shop/en/search.do?action=setSearchedList&searchedListIndex='+
					index +'&searchStrategy=keyword';
		else return '';
	},
	
	onMessage: function(msg, sender){
		switch(msg.action)
		{
			case 'remove_item':	
				console.log('remove_item msg received.');
				background.removeItem(msg.url);
				break;
			case 'change_tracking':
				console.log('change_tracking msg received');
				background.changeTracking(msg.tracking);	
				break;
			case 'change_interval':
				console.log('change_interval msg received.');
				if(msg.source !== undefined){
					background.searchPage.source = msg.source;
					console.log('New search page source set: '+background.searchPage.source);
				}
				background.setNewInterval(msg.interval);
				break;
			case 'change_limit':
				console.log('change_limit msg received.');
				background.searchPage.limit = msg.limit;
				console.log('searchPage.limit = ' + background.searchPage.limit);
				break;
			case 'clear':
				console.log('reset msg received.');
				background.clear();
				break;
			default: 
				console.error('Error: Invalid msg action.');
				break;
		}
	},
	
	clear: function(){
		background.items.list = {};
		background.items.removed = {};
		background.items.lastNewest = '';
		background.items.changed = false;
		background.tracking.list = [];
		background.tracking.changed = true;
		background.badgeCount = 0;
		background.updateBadge();
		background.interval.time = 300000;
		background.searchPage.limit = 5;
		background.searchPage.index = 0;
		background.searchPage.source = 'http://ekizo.mandarake.co.jp/shop/en/category-bishojo-figure.html';
		window.clearInterval(background.interval.id);
		console.log('All variables cleared.'); 	
		chrome.storage.local.getBytesInUse(null, function(bytesInUse){console.log('Current storage size: '+bytesInUse)});
	}
	
};

// wire up the listener	
chrome.runtime.onMessage.addListener(background.onMessage); 
chrome.windows.onRemoved.addListener(background.save);
background.start();
