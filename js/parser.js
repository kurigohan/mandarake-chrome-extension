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
		var details;
		$items.each(function(){
			details = $(this).find(selector).text().trim();
			details = details.replace(/\s{2,}/g, ' ');
			if(details != background.items.newest){
				console.log('Checking: ' + details);
				for(var i=0, len=background.tracking.list.length; i<len; ++i)
				{	
					if(parser.compare(details, background.tracking.list[i]))
					{
						console.log('^^^^MATCH FOUND^^^^');	
						url = $(this).find('a:first').attr('href');
						console.log('Link: ' + url + '\n-------------------');
						if(!(url in background.items.removed) && !(url in background.items.list)){
							background.items.list[url] = details;
							background.badgeCount++;
						}
						else
							console.log('-- Not added. Exists in items.removed or already in items.list.');
						break; //Stop checking for matchs to avoid duplicate items
					}
				}
			}
			else{
				console.log('Stop item found. Stopping seach.');
				return false; //break out of .each loop
			}
		}); //end source.find
		
		console.log("---SEARCH COMPLETE---");
		console.log(background.items.list);
		console.log('Items found: ' + Object.keys(background.items.list).length);
		background.items.newest = firstItem;
		background.updateBadge();

		chrome.storage.local.set({'item_list':background.items.list, 'newest':background.items.newest, 
				    'badge_count':background.badgeCount}, function(){
					console.log('** item_list and badge_count saved **');	
		}); //end .each
		
	}, //-------------------------------------------------
	
	compare: function(str1, str2){
													//replace all spaces with .*
	   return str1.toLowerCase().match(str2.toLowerCase().replace(/ /g, '.*'));
	}	
}