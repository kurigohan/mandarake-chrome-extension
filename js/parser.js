// JavaScript Document
//Requires background.js

var parser = {
	requesting: false, // Indicates if an xmlhttprequest is running
	getPageSource: function(url, callback) {
		console.log('Fetching document...');
		var xhr = new XMLHttpRequest();
		parser.requesting = true;
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				callback(xhr.responseText);
				parser.requesting = false;
			}
		};
		xhr.send();
	},
	
	constructItemList: function(data){
		var $source = $(data).find("#itemlist");
		var itemLink = "http://ekizo.mandarake.co.jp/shop/en/"+$source.find("a.info:first").attr("href");
		var name = $source.find("h5:first").text();
		var figure = "<li><a href="+itemLink+" target='_blank' class='item'>"+name+"</a></li>";
		background.items.list.push(figure);
		chrome.browserAction.setBadgeText({text: background.items.list.length.toString()});
		chrome.storage.local.set({'item_list':background.items.list});	
	},
	
	
	findView: function(page){
		console.log('Determining document view setting...');
		// Parse the page for use with JQuery (avoids get error with relative image paths)
		var doc = document.implementation.createHTMLDocument('');
		doc.documentElement.innerHTML = page;
		$items = $(doc).find('#itemlist');
		if($items.find('h5:first').length){
			console.log('View Mode: Thumbnail');
			parser.searchForItems($items.find('td[style]'), 'h5');
		}
		else if($items.find('.list_text:first').length){
			console.log('View Mode: without image');
			parser.searchForItems($items.find('tr'), '.list_text');
		}
		else if($items.find('h1:first').length){
			console.log('View Mode: with image');
			parser.searchForItems($items.find('table[style]'), 'h1');
		}
		else
			console.log('View mode could not be determined.');
	},
	
	searchForItems: function($items, selector){
		console.log('Parsing document...\n---START SEARCH---');
		console.log(background.tracking.list);
		console.log('Stop at this item:\n'+background.items.newest);
		var firstItem = $items.first().find(selector).text().trim();
		firstItem = firstItem.replace(/\s{2,}/g, ' '); //replace multiple spaces and tabs
		$items.each(function(){
			var details = $(this).find(selector).text().trim();
			details = details.replace(/\s{2,}/g, ' ');
			if(details != background.items.newest){
				var figure = { details: details,
							   url: ''
							 }
				var isDup = false;
				console.log('Checking: ' + details);
				for(var i=0, len=background.tracking.list.length; i<len; ++i)
				{	
					if(parser.checkArray(details, background.tracking.list[i]))
					{
						console.log('^^^^MATCH FOUND^^^^');	
						url = $(this).find('a:first').attr('href');
						console.log('Link: ' + url + '\n-------------------');
						if(!(url in background.items.removed)){
							if(background.tracking.checkForDup)
							{
								for(var j=0, len2=background.items.list.length; j<len; ++j){
									if(url == background.items.list[j].url){
										isDup = true;
										break;
									}
								}
							}
							if(!isDup){
								figure.url = url;
								background.items.list.push(figure);
								background.badgeCount++;
							}
						}
						else
							console.log('-- Found in items.removed. Not added to items.list.');
						break; //Stop checking for matchs to avoid duplicate items
					}
				}
			}
			else{
				console.log('Stop item found. Stopping seach.');
				return false; //break out of .each loop
			}
		}); //end source.find
		/*if(background.items.list.length > 1 && background.items.newest == ''){ 
			  items.newest was reset when tracking.changed was set to force searchForItems() 
			  to parse the entire page instead of stopping when items.newest was encountered.
			  There may be duplicate items in the array as a result.
			//Remove duplicates from the items.list
			background.items.list = parser.removeDuplicates(background.items.list, parser.comparer);
			console.log('Duplicates removed');
		}*/
		
		console.log("---SEARCH COMPLETE---");
		console.log(background.items.list);
		background.tracking.checkForDup = false;
		background.items.newest = firstItem;
		background.updateBadge();
		
		
		chrome.storage.local.set({'item_list':background.items.list, 'newest':background.items.newest, 
								'badge_count':background.badgeCount}, function(){
									console.log('** item_list and badge_count saved **');	
		}); //end .each
		
	}, //-------------------------------------------------
	
	removeDuplicates: function(arr, equals){
		var originalArr = arr.slice();
		var i, len, j, val;
		arr.length = 0;
	
		for (i=0, len=originalArr.length; i<len; ++i) {
			val = originalArr[i];
			if (!parser.arrayContains(arr, val, equals)) {
				arr.push(val);
			}
    	}
		background.badgeCount -= originalArr.length - arr.length;
		return arr;
	},
	
	arrayContains: function(arr, val, equals){
		 var i = arr.length;
   		while (i--) {
        	if ( equals(arr[i], val) ) {
            	return true;
        	}
    	}
    	return false;	
	},
	
	comparer: function(elm1, elm2){
		return elm1.url === elm2.url;
	},
	
	checkArray: function(str1, str2){
	   return str1.toLowerCase().match(('.*'+str2).toLowerCase().replace(" ", ".*"));

	},
		
	
	
}