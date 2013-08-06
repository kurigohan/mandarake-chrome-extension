// JavaScript Document

var popup = {
	start: function(){
		
		chrome.runtime.getBackgroundPage(function(page){
			console.log(page.background.items.list);
			/*
			var figure;
			for(var i=0, len=page.background.items.list.length; i<len; ++i)
			{
				//console.log(page.background.items.list[i]);
				$("#figure_list").append(popup.constructTag(page.background.items.list[i]));
			}*/
			popup.displayItems(page.background.items.list);
			$('.remove').click(function(){
				console.log($(this).next().attr('href').slice(37)); 
				var itemPage = $(this).next().attr('href').slice(37); //get item url and remove host
				$(this).closest('li').remove();
				popup.removeItem(itemPage);
			});	
		});
	},
	
	displayItems: function(list){
		for(var key in list){
			$("#figure_list").append(popup.constructTag(key, list[key]));		
		}
		
	},
	
	constructTag: function(url, details){
		var tag = '<li></a><a href="" class="remove">x</a><a href=http://ekizo.mandarake.co.jp/shop/en/' +
					url + ' target="_blank" class="item">' +
					details + '</li>';
		return tag;
		
	},

	constructTag2: function(figure){
		var tag = '<li></a><a href="" class="remove">x</a><a href=http://ekizo.mandarake.co.jp/shop/en/' +
					figure.url + ' target="_blank" class="item">' +
					figure.details + '</li>';
		return tag;
	
	},
	
	removeItem: function(itemPage){
		
		chrome.extension.sendRequest({action: 'remove_item', url: itemPage});
	}
	
}


$(document).ready(function(){
	popup.start();
});

