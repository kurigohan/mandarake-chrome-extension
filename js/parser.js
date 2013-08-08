// JavaScript Document
//Requires background.js

var parser = {
		
	getView: function(page){
		console.log('Determining document view setting...');
		// Parse the page for use with JQuery (avoids get error with relative image paths)
		var doc = document.implementation.createHTMLDocument('');
		doc.documentElement.innerHTML = page;
		$itemlist = $(doc).find('#itemlist');
		if($itemlist.find('h5:first').length){
			console.log('View Mode: Thumbnail');
			return {view:'thumbnail', $items:$itemlist.find('td[style]'), selector:'h5'};
			//parser.searchForItems($itemlist.find('td[style]'), 'h5');
		}
		else if($itemlist.find('h1:first').length){
			console.log('View Mode: with image');
			return {view:'image', $items:$itemlist.find('table[style]'), selector:'h1'};
			//parser.searchForItems($itemlist.find('table[style]'), 'h1');
		}
		else if($itemlist.find('.list_text:first').length){
			console.log('View Mode: without image');
			return {view:'no_image', $items:$itemlist.find('tr'), selector:'.list_text'};
			//parser.searchForItems($itemlist.find('tr'), '.list_text');
		}
		else
		{
			console.log('View mode could not be determined.');
			return false;
		}
	},
	
	searchForItems: function($items, selector){
		console.log('Parsing document...\n---START SEARCH---');
		console.log(background.tracking.list);
		console.log('Stop at this item:\n'+background.items.newest);
		var firstItem = $items.first().find(selector).text().trim();
		firstItem = firstItem.replace(/\s{2,}/g, ' '); //replace multiple spaces and tabs
		var details;
		var found = false;
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
			else{ // newest found
				console.log('Stop item found. Stopping seach.');
				found = true;

				return false; //break out of .each loop 
			}
		}); //end source.find
		
		console.log("---SEARCH COMPLETE---");
		console.log(background.items.list);
		console.log('Item count: ' + Object.keys(background.items.list).length);
		background.updateBadge();
		background.items.newest = firstItem;
		return found; //newest not found

		/*chrome.storage.local.set({'item_list':background.items.list, 'newest':background.items.newest, 
				    'badge_count':background.badgeCount}, function(){
					console.log('** item_list and badge_count saved **');	
		}); //end .each */
		
	}, //-------------------------------------------------
	
	compare: function(str1, str2){
		var pattern = new RegExp( str2.toLowerCase().replace(/ /g, '.*'));
		return pattern.test(str1.toLowerCase());
	}
}