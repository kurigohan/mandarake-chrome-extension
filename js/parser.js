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
	
	searchForItems: function($items, selector, pageIndex){
		console.log(background.tracking.list);
		console.log('Stop at this item:\n'+background.items.lastNewest);
		console.log('Parsing document...\n********************\n---START SEARCH---');
		//var firstItem = $items.first().find(selector).text().trim();
		//firstItem = firstItem.replace(/\s{2,}/g, ' '); //replace multiple spaces and tabs
		if(pageIndex == 0){
			background.items.currentNewest = $items.first().find('a:first').attr('href');
			console.log('Current newest: ' + background.items.currentNewest);
		}
		var details;
		var url;
		var found = false;
		$items.each(function(){
			url = $(this).find('a:first').attr('href');
			details = $(this).find(selector).text().trim();
			//details = details.replace(/\s{2,}/g, ' ');
			if(url != background.items.lastNewest){
				console.log('Checking: ' + details);
				console.log('Link: ' + url + '\n-------------------');
				for(var i=0, len=background.tracking.list.length; i<len; ++i)
				{	
					if(parser.compare(details, background.tracking.list[i]))
					{
						console.log('^^^^MATCH FOUND^^^^');
						if(!(url in background.items.list)){
							background.items.list[url] = details;
							background.badgeCount++;
						}
						else
							console.log('-- Not added. Already in items.list.');
						break; //Stop checking for matchs to avoid duplicate items
					}
				}
			}
			else{ // newest found
				console.log('Stop item found. Stopping seach.');
				background.items.lastNewestFound = true;
				console.log('Last newest set to current newest.');
				background.items.lastNewest = background.items.currentNewest;
				return false; //break out of .each loop 
			}
		}); //end source.find
		
		console.log("---SEARCH COMPLETE---");
		console.log(background.items.list);
		console.log('Item count: ' + Object.keys(background.items.list).length + '\n********************');
		background.updateBadge();
		background.save();
		/*chrome.storage.local.set({'item_list':background.items.list, 'removed_list':background.items.removed,
				 'last_newest':background.items.lastNewest, 'badge_count':background.badgeCount}, function(){
					console.log('item_list, removed_list, last_newest, and badge_count saved.');	
		}); //end storage */
		
	}, //-------------------------------------------------
	
	compare: function(str1, str2){
											//match any character and newline
		var pattern = new RegExp( str2.toLowerCase().replace(/ /g, '(.|\n)*'));
		return pattern.test(str1.toLowerCase());
	}
}