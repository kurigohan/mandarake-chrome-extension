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
		changed: false	
	},
	tracking: {
		list: [],
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
		chrome.storage.local.get(['track_list', 'item_list',  'removed_list', 'last_newest', 
									'search_source', 'search_limit','badge_count', 'interval'], 
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
			console.log('Removed list loaded: ');
			console.log(background.items.removed);
		}
		else
			console.log('No removed_list found in storage.');
		
		if(typeof data.last_newest !== 'undefined'){
			background.items.lastNewest = data.last_newest;
			console.log('Last newest item loaded: ');
			console.log(background.items.lastNewest);
		}
		else
			console.log('No last_newest found in storage.');
			
			
		if(typeof data.search_source !== 'undefined')
		{
			background.searchPage.source = data.search_source;
			console.log('Search page source loaded: ' + background.searchPage.source);
		}
		else
			console.log('No search_source found in storage.');
			
		if(typeof data.search_limit !== 'undefined')
		{
			background.searchPage.limit = data.search_limit;
			console.log('Search page limit loaded: ' + background.searchPage.limit);
		}
		else
			console.log('No search_limit found in storage.');
			
		if(typeof data.badge_count !== 'undefined')
		{
			background.badgeCount = data.badge_count;
			console.log('Badge count loaded: ' + background.badgeCount);
		}
		else
			console.log('No badge_count found in storage.');
			
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
			pageUrl = background.searchPage.source;
		if(!isNaN(time) && time!=background.interval.time){
			background.interval.time = time;	
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
			
		background.interval.id = window.setInterval(function(){background.checkPage(pageUrl)}
																, background.interval.time);
		console.log('interval.id set.');
		return true;
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
				
				if(background.items.lastNewestFound == false){
					var nextUrl = background.getPageUrl(background.searchPage.index);
					console.log(nextUrl);
					if(nextUrl != ''){
						background.getPageSource(nextUrl, callback);
					}
					else{
						console.log('Page limit reached. Stopping search');
						background.searchPage.index = 0;
						//if(background.items.lastNewest == ''){
						background.items.lastNewest = background.items.currentNewest;
						console.log('lastNewest set to currentNewest.'); 
						//}
						console.log(background.items.lastNewest);
					}
				}
			}
		};
		xhr.send();
	},
	
	checkPage: function(url){
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
		else
			console.log('Invalid url or empty tracking list. Page request not sent.');
	},
	
	searchPageSource: function(page){
		background.viewMode = parser.getView(page);
		parser.searchForItems(background.viewMode, this);
	},
	
	removeItem: function(url){
		delete background.items.list[url];
		background.items.removed[url] = true;
		background.badgeCount--;
		background.updateBadge();
		console.log(url + ' removed.');
		console.log(background.items.list);
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
		/*if(newTracking.added) {
			// force parser.searchForItems() to search all listings since tracking list has new keys
			background.items.lastNewest = ''; 
		}*/
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
			case 'change_limit':
				console.log('change_limit request received.');
				background.searchPage.limit = request.limit;
				console.log('searchPage.limit = ' + background.searchPage.limit);
				break;
			case 'change_source':
				console.log('change_source request received.');
				background.searchPage.source = request.source;
				background.setNewInterval();
				break;
			case 'reset':
				console.log('reset request received.');
				background.items.list = {};
				background.items.lastNewest = '';
				background.items.changed = false;
				//background.items.removed = {};
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
