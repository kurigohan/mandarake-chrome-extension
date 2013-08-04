// JavaScript Document

var popup = {
	start: function(){
		chrome.runtime.getBackgroundPage(function(page){
			console.log(page.background.items.list);
			var figure;
			for(var i=0;i<page.background.items.list.length;i++)
			{
				console.log(page.background.items.list[i]);
				
				figure = "<li><a href=http://ekizo.mandarake.co.jp/shop/en/"+page.background.items.list[i].url+" target='_blank' class='item'>"+
							page.background.items.list[i].details+"</a></li>";
				$("#figure_list").append(figure);
			}
			
			});
		
	},
	
}

function constructTags(){
	chrome.runtime.getBackgroundPage(function(page){
		console.log(page.background.items.list);
		var figure;
		for(var i=0;i<page.background.items.list.length;i++)
		{
			console.log(page.background.items.list[i]);
			
			figure = "<li><a href=http://ekizo.mandarake.co.jp/shop/en/"+page.background.items.list[i].url+" target='_blank' class='item'>"+
						page.background.items.list[i].details+"</a></li>";
			$("#figures").append(figure);
		}
		
	});
}


$(document).ready(function(){
	/*chrome.storage.local.get('item_list', function(data){
		chrome.browserAction.setBadgeText({text:""}); //Clear the badge text
		constructTags(); //create tags to insert into the document
		
	});*/
	
	popup.start();
});
