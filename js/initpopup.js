// JavaScript Document

var popup = {
	start: function(){
		chrome.runtime.getBackgroundPage(function(page){
			console.log(page.background.items.list);
			var figure;
			for(var i=0;i<page.background.items.list.length;i++)
			{
				console.log(page.background.items.list[i]);
				
				figure = '<li></a><a href="#" class="remove">x</a><a href=http://ekizo.mandarake.co.jp/shop/en/' +
						page.background.items.list[i].url + ' target="_blank" class="item">' +
						page.background.items.list[i].details + '</li>';
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
	popup.start();
});
