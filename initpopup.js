// JavaScript Document

function constructTags(){
	chrome.runtime.getBackgroundPage(function(bg){
		console.log(bg.parser.itemList);
		var figure;
		for(var i=0;i<bg.parser.itemList.length;i++)
		{
			console.log(bg.parser.itemList[i]);
			
			figure = "<li><a href=http://ekizo.mandarake.co.jp/shop/en/"+bg.parser.itemList[i].url+" target='_blank' class='item'>"+
						bg.parser.itemList[i].details+"</a></li>";
			$("#figures").append(figure);
		}
		
	});
}

$(document).ready(function(){
	console.log('testing');
	chrome.storage.sync.get('item_list', function(data){
		chrome.browserAction.setBadgeText({text:""}); //Clear the badge text
		constructTags(); //create tags to insert into the document
		
	});
});
