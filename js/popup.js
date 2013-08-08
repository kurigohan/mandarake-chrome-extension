// JavaScript Document

var popup = {
	pages: [],
	pageIndex: 0,
	start: function(){
		
		chrome.runtime.getBackgroundPage(function(page){
			console.log(page.background.items.list);
			popup.createDisplayPage(page.background.items.list);
			//popup.displayItems(page.background.items.list);

			$('.remove').click(function(){
				console.log($(this).next().attr('href').slice(37)); 
				var itemPage = $(this).next().attr('href').slice(37); //get item url and remove host
				$(this).closest('li').remove();
				popup.removeItem(itemPage);
			});	
		});
	},
	
	displayItems: function(list){
		var display = '';
		if(list instanceof Array){
			for(var i=0, len=list.length;i<len;++i){
				display += popup.constructTag(list[i].url, list[i].details);
				//$("#figure_list").append(popup.constructTag(list[i].url, list[i].details));	
			}
		}
		else if(typeof list === 'object'){
			for(var key in list){
				display += popup.constructTag(key, list[key]);
				//$("#figure_list").append(popup.constructTag(key, list[key]));		
			}
		}
		$("#figure_list").html(display);
		
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
	
	createDisplayPage: function(list){
		var len = Object.keys(list).length;
		console.log('Item count: ' + len);
		var arr = [];
		if(len > 10){
			var count  = 0;
			for(key in list)
			{
				arr.push({url:key, details:list[key]});
				count++;
				if(count % 10.0 == 0){
					popup.pages.push(arr)
					arr = [];
				}
			}
			if(arr.length)
				popup.pages.push(arr);
			//console.log(popup.pages);
			$('#page').text('1/' + popup.pages.length)
			
			$('#next').click(function(){
				popup.changePage('next');
			});
			$('#back').click(function(){
				popup.changePage('back');
			});
			
			popup.displayItems(popup.pages[0]);

		}
		else
		{
			$('#page').text('1/1')
			popup.displayItems(list);			
		}
	},
	changePage: function(direction){
		if(direction == 'next' && popup.pageIndex < popup.pages.length-1)
			popup.pageIndex++;
		else if(direction == 'back' && popup.pageIndex > 0)
			popup.pageIndex--;
		$('#page').text(popup.pageIndex+1 + '/' + popup.pages.length);
		popup.displayItems(popup.pages[popup.pageIndex]);
		
	}
}


$(document).ready(function(){
	popup.start();
});

