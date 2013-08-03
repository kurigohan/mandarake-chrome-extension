// JavaScript Document

var parser = {
	itemList: [],
	requesting: 0, // Indicates if an xmlhttprequest is running
	getPageSource: function(url, callback) {
		var xhr = new XMLHttpRequest();
		parser.requesting = 1;
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				callback(xhr.responseText);
				parser.requesting = 0;
			}
		};
		xhr.send();
	},
	
	display_page: function(data){
		var $source = $(data).find("#itemlist");
		var itemLink = "http://ekizo.mandarake.co.jp/shop/en/"+$source.find("a.info:first").attr("href");
		var name = $source.find("h5:first").text();
		$("#status").text("");
		$("#figures").html("<li><a href="+itemLink+" target='_blank' class='item'>"+name+"</a></li>");
		//chrome.browserAction.setBadgeText ( { text: i.toString() } );
	},
	
	constructItemList: function(data){
		var $source = $(data).find("#itemlist");
		var itemLink = "http://ekizo.mandarake.co.jp/shop/en/"+$source.find("a.info:first").attr("href");
		var name = $source.find("h5:first").text();
		var figure = "<li><a href="+itemLink+" target='_blank' class='item'>"+name+"</a></li>";
		parser.itemList.push(figure);
		chrome.browserAction.setBadgeText({text: parser.itemList.length.toString()});
		chrome.storage.sync.set({'item_list':parser.itemList});	
	},
	
	
	findViewMode: function(page){
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
		chrome.storage.sync.get('track_list', function(data){
			console.log('---START SEARCH---');
			console.log(data.track_list);
			$items.each(function(){
				var details = $(this).find(selector).text().toLowerCase();
				var url = "";
				var figure = { 'details': details,
							   'url': url
							 }
				console.log('Checking: ' + details);
				for(var i=0; i<data.track_list.length;i++)
				{	
					if(details.indexOf(data.track_list[i].toLowerCase()) > -1)
					{
						console.log('****MATCH FOUND****');	
						url = $(this).find('a:first').attr('href');
						console.log('Link: ' + url);
						figure.url = url;
						parser.itemList.push(figure);
						break; //Stop checking for matchs to avoid duplicate items
					}
				}
				
				}); //end source.find
			console.log("---SEARCH COMPLETE---");
			console.log(parser.itemList);
			
			if(typeof parser.itemList !== 'undefined' && parser.itemList.length > 0)
				chrome.browserAction.setBadgeText({text: parser.itemList.length.toString()});
			chrome.storage.sync.set({'item_list':parser.itemList}, function(){
				console.log('** item_list saved **');	
				}); //end sync.set
			
		});	//end .each
	}
	
}
function checkInput(){
		
}