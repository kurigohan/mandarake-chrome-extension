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
	alarmInfo:{
		delayInMinutes: 5,
		periodInMinutes: 5
	},
	searchPage: {
		source: 'http://ekizo.mandarake.co.jp/shop/en/category-bishojo-figure.html',
		index: 0, // current display page index; used to get the next page url
		limit: 5 // max number of pages to search
	},
	badgeCount: 0,
	requesting: false, // Indicates if an xmlhttprequest is running
	startup: function(){
		//load settings and begin program
		chrome.storage.local.getBytesInUse(null,function(bytesInUse) {console.log('Current Storage size: '+bytesInUse)});
		chrome.storage.local.get(['track_list', 'item_list',  'removed_list', 'last_newest', 
									'search_source', 'search_limit','badge_count', 'alarm'], 
			function(data){
				background.setVariables(data);
				background.updateBadge();
				if(background.items.lastNewest){
					background.setAlarm();
				}
				else{
					console.log('First Run.');
					background.getLastNewestOnly();
				}
		});	
	},
	
	run: function(){
		//load settings and check source
		chrome.storage.local.getBytesInUse(null,function(bytesInUse) {console.log('Current Storage size: '+bytesInUse)});
		chrome.storage.local.get(['track_list', 'item_list',  'removed_list', 'last_newest', 
									'search_source', 'search_limit','badge_count', 'alarm'], 
			function(data){
				background.setVariables(data);
				background.updateBadge();
				background.startSearch();
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
			
		if(data.alarm !== undefined)
		{
			background.alarmInfo = data.alarm;
			console.log('Alarm delay loaded: ');
			console.log(background.alarmInfo);
		}
		else{
			console.log('Invalid alarm info loaded. Using default.');
			console.log(background.alarmInfo);
		}
	},
	
	getLastNewestOnly: function(){
		background.getPageSource(background.searchPage.source, function(data){
				background.searchPageSource(data);
			}); //end getPageSource
		chrome.alarms.create("startSearchAlarm", background.alarmInfo);
		console.log('Alarm set.');
		
	},
	
	setAlarm: function(time, url){
		var pageUrl;
		if(url)
			pageUrl = url;
		else
			pageUrl = background.searchPage.source;
			
		if(!isNaN(time) && time!=background.alarmInfo.periodInMinutes){
			background.alarmInfo.periodInMinutes = background.alarmInfo.delayInMinutes = time;
			console.log('Interval changed: ' + background.alarmInfo.periodInMinutes);	
		}
		if(background.requesting == false){
			background.startSearch();
		}
		else{
			console.error('A request is already in progress. Check page cancelled.');
		}
		
		chrome.alarms.create("startSearchAlarm", background.alarmInfo);
		chrome.alarms.getAll(function(alarms){console.log(alarms)});
		console.log('Alarm set.');
	},
	
	getPageSource: function(url, callback) {
		background.requesting = true;
		console.log('Fetching document: ' + url);
		var xhr = new XMLHttpRequest();
		
		var abortTimerId = window.setTimeout(function(){
			xhr.abort();
			console.error('Request timed out.');
			background.requesting = false;
			}, 20000);
			
		console.log('REQUEST STARTED');
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				window.clearTimeout(abortTimerId);
				callback(xhr.responseText);
				background.requesting = false;
				console.log('REQUEST ENDED.');

				if(background.items.lastNewestFound == false){
					var nextUrl = background.getPageUrl(background.searchPage.index);
					console.log(nextUrl);
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

			}// end if xhr.readyState
		}; //end onreadystatechange
		xhr.onerror = function(error) {
					console.error('Error. Could not retrieve page.');
					background.requesting = false;
					xhr.abort();
					};
		xhr.open("GET", url, true);
		xhr.send();
		
	},
	
	startSearch: function(){
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
			  console.error('Invalid url or empty tracking list. Page request not sent.');
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
		console.log(background.items.list);
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
		 'alarm':background.alarmInfo, 'search_source':background.searchPage.source,
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
	
	onMessage: function(request, sender){
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
			case 'change_alarm':
				console.log('change_alarm request received.');
				if(request.source !== undefined){
					background.searchPage.source = request.source;
					console.log('New search page source set: '+background.searchPage.source);
				}
				background.setAlarm(request.interval);
				break;
			case 'change_limit':
				console.log('change_limit request received.');
				background.searchPage.limit = request.limit;
				console.log('searchPage.limit = ' + background.searchPage.limit);
				break;
			case 'clear':
				console.log('reset request received.');
				background.clear();
				break;
			default: 
				console.error('Error: Invalid request action.');
				break;
		}
	},
	
	onAlarm: function(alarm){
		if(alarm.name == 'startSearchAlarm'){
			background.run();
		}
		else{
			console.error('Could not handle alarm event. Invalid alarm name.');
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
		background.alarmInfo = { delayInMinutes: 5, periodInMinutes: 5};
		background.searchPage.limit = 5;
		backgrounb.searchPage.index = 0;
		background.searchPage.source = 'http://ekizo.mandarake.co.jp/shop/en/category-bishojo-figure.html';
		chrome.alarms.clearAll();
		console.log('All variables cleared.'); 	
		chrome.storage.local.getBytesInUse(null, function(bytesInUse){console.log('Current storage size: '+bytesInUse)});
	}
	
};


// add event listeners	

chrome.runtime.onSuspend.addListener(function(){background.save; console.log('UNLOADED');});
chrome.runtime.onStartup.addListener(background.startup);
chrome.runtime.onInstalled.addListener(background.startup);
chrome.alarms.onAlarm.addListener(background.onAlarm);
chrome.runtime.onMessage.addListener(background.onMessage); 	
chrome.windows.onRemoved.addListener(background.save);

