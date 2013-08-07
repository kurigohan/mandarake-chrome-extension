// JavaScript Document

var popup = {
	start: function(){
		
		chrome.runtime.getBackgroundPage(function(page){
			console.log(page.background.items.list);
			Object.keys(page.background.items.list).length
			popup.displayItems(page.background.items.list);
			$('.remove').click(function(){
				console.log($(this).next().attr('href').slice(37)); 
				var itemPage = $(this).next().attr('href').slice(37); //get item url and remove host
				$(this).closest('li').remove();
				popup.removeItem(itemPage);
			});	
		});
	},
	
	displayItems: function(list, start, end){
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

	removeItem: function(itemPage){
		
		chrome.extension.sendRequest({action: 'remove_item', url: itemPage});
	},
	
	createPage: function(list){
		var len = Object.keys(list).length;
		if(len > 10){
			
		}
		else
		{
			popup.displayItems(list);			
		}
	}	
}


$(document).ready(function(){
	popup.start();
});

