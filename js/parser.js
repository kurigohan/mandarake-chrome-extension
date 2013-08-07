// JavaScript Document
//Requires background.js

var parser = {
	
	
	constructItemList: function(data){
		var $source = $(data).find("#itemlist");
		var itemLink = "http://ekizo.mandarake.co.jp/shop/en/"+$source.find("a.info:first").attr("href");
		var name = $source.find("h5:first").text();
		var figure = "<li><a href="+itemLink+" target='_blank' class='item'>"+name+"</a></li>";
		background.items.list.push(figure);
		chrome.browserAction.setBadgeText({text: background.items.list.length.toString()});
		chrome.storage.local.set({'item_list':background.items.list});	
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
		console.log('Item count: ' + Object.keys(background.items.list).length);
		background.items.newest = firstItem;
		background.updateBadge();

		chrome.storage.local.set({'item_list':background.items.list, 'newest':background.items.newest, 
				    'badge_count':background.badgeCount}, function(){
					console.log('** item_list and badge_count saved **');	
		}); //end .each
		
	}, //-------------------------------------------------
	
	compare: function(str1, str2){
		var pattern = new RegExp( str2.toLowerCase().replace(/ /g, '.*'));
		return pattern.test(str1.toLowerCase());
	}
}