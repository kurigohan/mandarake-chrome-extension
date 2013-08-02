// JavaScript Document

var parser = {
	itemList: [],
	getPageSource: function(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				callback(xhr.responseText);
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
	
	searchForItems: function(page){
		chrome.storage.sync.get('track_list', function(data){
			console.log(data.track_list);
			var $source = $(page).find('#itemlist td');
			$source.each(function(){
				var details = $(this).find('h5').text().toLowerCase();
				var figure = { 'details': details,
							   'url': ""
							 }
				console.log('Checking: ' + details);
				for(var i=0; i<data.track_list.length;i++)
				{	
					if(details.indexOf(data.track_list[i].toLowerCase()) > -1)
					{
						console.log('**Match found**');	
						console.log('Link: ' + $(this).find('a.info:first').attr('href'));
						figure.url = $(this).find('a.info:first').attr('href');
						parser.itemList.push(figure);
						break; //Stop checking for matchs to avoid duplicate items
					}
				}
				
			}); //end source.find
			console.log(parser.itemList);
			if(typeof parser.itemList !== 'undefined' && parser.itemList.length > 0)
				chrome.browserAction.setBadgeText({text: parser.itemList.length.toString()});
			chrome.storage.sync.set({'item_list':parser.itemList});
		});
		
	},
	
	searchForItems2: function(page){
		chrome.storage.sync.get('track_list',function(data){
			console.log(data.track_list);
			var $source = $(page).find('#itemlist');
			$source.find('h5').each(function(){
				var figure = $(this).text().toLowerCase();
				console.log('Checking: ' + figure);
				for(var i=0; i<data.track_list.length;i++)
				{	
					if(figure.indexOf(data.track_list[i].toLowerCase()) > -1)
					{
						console.log('**Match found**');	
						console.log('Closest' + $(this).closest('a.info').attr('href'));
						parser.itemList.push(figure);
						break; //Stop checking for matchs to avoid duplicate items
					}
				}
				
			}); //end source.find
			
			console.log(parser.itemList);
			if(typeof parser.itemList !== 'undefined' && parser.itemList.length > 0)
				chrome.browserAction.setBadgeText({text: parser.itemList.length.toString()});
			chrome.storage.sync.set({'item_list':parser.itemList});
		}); //end sync.get
	}
}
function checkInput(){
		
}