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
	
	searchForItems: function(view, bg){ //seletor, pageIndex){
		console.log('Tracking list:');
		console.log(bg.tracking.list);
		var trackingList = parser.convertToRegex(bg.tracking.list);
		if(bg.searchPage.index == 0){
			bg.items.currentNewest = view.$items.first().find('a:first').attr('href');
			console.log('Current newest: ' + bg.items.currentNewest);
		}
		console.log('Stop at this item: ' + bg.items.lastNewest);
		console.log('Parsing document...\n********************\n---START SEARCH---');
		var details;
		var url;
		var found = false;
		view.$items.each(function(){
			url = $(this).find('a:first').attr('href');
			details = $(this).find(view.selector).text().trim();
			//details = details.replace(/\s{2,}/g, ' ');
			if(url != bg.items.lastNewest){
				bg.items.lastNewestFound = false;
				console.log('Checking: ' + details);
				console.log('Link: ' + url + '\n-------------------');
				for(var i=0, len=trackingList.length; i<len; ++i)
				{	
					if(parser.compare(details, trackingList[i]))
					{
						console.log('^^^^MATCH FOUND^^^^');
						if(!(url in bg.items.list) && !(url in bg.items.removed)){
							bg.items.list[url] = details;
							bg.badgeCount++;
						}
						else
							console.log('-- Not added. Already in items.list.');
						break; //Stop checking for matchs to avoid duplicate items
					}
				}
			}
			else{ // newest found
				console.log('Stop item found. Stopping seach.');
				bg.items.lastNewestFound = true;
				console.log('Last newest set to current newest.');
				bg.items.lastNewest = bg.items.currentNewest;
				return false; //break out of .each loop 
			}
		}); //end source.find
		
		console.log("---SEARCH COMPLETE---");
		console.log(bg.items.list);
		console.log('Item count: ' + Object.keys(bg.items.list).length + '\n********************');
		bg.updateBadge();
		bg.save();
		
	},
	
	compare: function(details, key){
		var pattern = new RegExp(key);
		return pattern.test(details.toLowerCase());
	},
	convertToRegex: function(list){
		var newList = [];
		for(var i=0, len=list.length; i<len; ++i)
		{
			newList.push(list[i].match(/\w+|"[^"]+"/g)
						.join('(.|\\n)*')
						.replace(/"/g, '')
						.toLowerCase()
						);
		}
		console.log('Converted tracking list items to regex:');
		console.log(newList);
		return newList;
	}
	
}