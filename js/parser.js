// JavaScript Document
//Requires background.js

var parser = {
	trackList: [],
	getView: function(page){
		console.log('Determining document view setting...');
		// Parse the page for use with JQuery (avoids get error with relative image paths)
		var doc = document.implementation.createHTMLDocument('');
		doc.documentElement.innerHTML = page;
		$itemlist = $(doc).find('#itemlist');
		if($itemlist.find('h1:first').length){
			console.log('View Mode: List All with image');
			return {view:'image', $items:$itemlist.find('table[style]'), detailSelector:'h1', stockSelector:'a[style]:eq(2)'};
			//parser.searchForItems($itemlist.find('table[style]'), 'h1');
		}
		else if($itemlist.find('#layout1').length){
			console.log('View Mode: Thumbnail View 1');
			return {view: 'thumb1', $items:$itemlist.find('div.container'), detailSelector: 'div.itemTitle > p', stockSelector:'div.itemLink > p.addcart'};
		
		}
		else if($itemlist.find('#layout2').length){
			console.log('View Mode: Thumbnail View 2');
	return {view: 'thumb2', $items:$itemlist.find('div.container'), detailSelector: 'div.itemTitle > p', stockSelector:'div.itemLink > p.addcart'};
		}
		
		else if($itemlist.find('h5:first').length){
			console.log('View Mode: Thumbnail');
			return {view:'thumbnail', $items:$itemlist.find('td[style]'), detailSelector:'h5', stockSelector:'a.buy'};
			//parser.searchForItems($itemlist.find('td[style]'), 'h5');
		}

		else if($itemlist.find('.list_text:first').length){
			console.log('View Mode: List All without image');
			return {view:'no_image', $items:$itemlist.find('tr'), detailSelector:'.list_text', stockSelector:'a b'};
			//parser.searchForItems($itemlist.find('tr'), '.list_text');
		}
		else
		{
			console.error('View mode could not be determined.');
			return false;
		}
	},
	
	// compare items on webpage to keyword list
	searchForItems: function(view, bg){ 
		console.log('Tracking list:');
		console.log(bg.tracking.list);
		if(bg.searchPage.index == 0){
			bg.items.currentNewest = view.$items.first().find('a:first').attr('href');
			console.log('Current newest: ' + bg.items.currentNewest);
		}
		if(bg.items.currentNewest){
			if(bg.items.lastNewest){
				if(bg.tracking.changed){ //Split keywords if needed
					console.log('Tracking list changed since last search. Split required.');
					parser.trackList = parser.splitKeywords(bg.tracking.list);
					bg.tracking.changed = false;
				}
				else{
					console.log('Tracking list unchanged.');
					console.log(parser.trackList);	
				}
				console.log('Stop at this item: ' + bg.items.lastNewest);
				console.log('Parsing document...\n********************\n---START SEARCH---');
				var details;
				var url;
				var stock;
				var found = false; // found last newest 
				view.$items.each(function(){
					if(bg.items.listCount < 50){
						url = $(this).find('a:first').attr('href');
						details = $(this).find(view.detailSelector).text().trim();
						// replace tabs, multiple spaces, newlines with single space
						details = details.replace(/\s{2,}|[\n\t]/g, ' '); 
						stock = $(this).find(view.stockSelector).text().trim().toLowerCase();
						if(!stock){ // set stock to sold if stock is empty
							stock = 'sold';
						}
						console.log('Details: ' + details);
						console.log('Stock: ' + stock);
						console.log('Link: ' + url);
						if(url != bg.items.lastNewest){ // check if last newest item found
							if(stock == 'sold'){ // skip sold out items
								console.log('** Sold out. Skipped.');
							}
							else{
								for(var i=0, len=parser.trackList.length; i<len; ++i)
								{	
									// compare item details to the words in the split trackiing list
									if(parser.compare(details, parser.trackList[i])) 
									{
										console.log('^^^^MATCH FOUND^^^^');
										// make sure the item does not already exist in the item found list or removed items list
										if(!(bg.items.list[url]!==undefined) && !(bg.items.removed[url]!==undefined)){
											bg.items.list[url] = details;
											bg.items.listCount++;
											bg.badgeCount++;
										}
										else{
											console.log('** Not added. Already in items.list or items.removed.');
										}
										break; // stop checking for matchs
									}// end if compare
								}// end for loop
							}
							console.log('-------------------');
						}// end if url!=lastNewest
						else{ // newest found
							console.log('^^^^STOP FOUND^^^^');
							bg.items.lastNewestFound = true;
							console.log('Last newest set to current newest.');
							bg.items.lastNewest = bg.items.currentNewest;
							return false; //break out of .each loop 
						}
					}//end if count <
					else{
						console.error('items.list full. Search stopped.');
						bg.items.lastNewestFound = true;
						return false;
					}
				}); //end source.find
				
				console.log("---SEARCH COMPLETE---");
		//		console.log(bg.items.list);
				console.log('Item count: ' + Object.keys(bg.items.list).length + '\n********************');
				bg.updateBadge();	
				}// end if items.lastNewest
			else{ //first run
				bg.items.lastNewest = bg.items.currentNewest;
				console.log('Getting last newest item only.');	
				bg.items.lastNewestFound = true;
			}
			
		}// end if items.currentNewest
		else{
			console.error('Invalid current newest. Search cancelled');
			bg.items.lastNewestFound = true;
		}

	},
	
	// Split keyword phrases into arrays of individual words. 
	// Word encloses in double quotes or vertical bars are not split.
	splitKeywords: function(list){
		var newKey;
		var newList = [];
		for(var i=0, len=list.length; i<len; ++i)
		{
			newKey = list[i].toLowerCase().match(/[^"'\s\|]+|"[^"]+"|'[^']+'|\|[^\|]+\|/g);
			for(var j=0; j<newKey.length;++j)
				newKey[j] = newKey[j].replace(/["']/g, '').replace(/\s{2,}|[\n\t]/g, ' '); 
			newList.push(newKey);
		}
		console.log('Tracking list split: ');
		console.log(newList);
		return newList;
	},
	
	// Compare each word in the keyword list to item details
	compare: function(details, key){
		for(var i=0; i<key.length;++i){
			// if vertical bar found, make sure word enclosed is not in item details
 			if(key[i].charAt(0) == '|'){ 
                if(details.toLowerCase().indexOf(key[i].substring(1, key[i].length-1)) > -1)
                    return false;
            }
            else if(details.toLowerCase().indexOf(key[i]) == -1){
                    return false;
            }
		}
		return true;
	},

}