// JavaScript Document

var popup = {
	pages: [],
	pageIndex: 0,
	itemCount: 0,
	start: function(){
		// retrieve background for processing 
		chrome.runtime.getBackgroundPage(function(page){
			console.log(page.background.items.list);
			popup.itemCount = page.background.items.listCount;
			// check if item list full
			if(popup.itemCount >= 50){
				$('#notify').text('Item list is full. Please remove some items.');
			}
			popup.updateItemCount();
			// create popup pages and display popup
			popup.createDisplayPage(page.background.items.list);

			
			// Attach event to dynamically generated html
			$(document).on('click','.remove',function(){
				console.log($(this).next().attr('href').slice(37)); 
				var itemUrl = $(this).next().attr('href').slice(37); //get item url and remove host
				$(this).closest('li').remove();
				popup.removeItem(itemUrl);

			}); //end .on
		});
	},
	
	// display list of found items in the popup
	displayItems: function(list){
		var display = '';
		if(list instanceof Array){
			for(var i=0, len=list.length;i<len;++i){
				display += popup.constructTag(list[i].url, list[i].details);
			}
		}
		else if(typeof list === 'object'){
			for(var key in list){
				display += popup.constructTag(key, list[key]);
			}
		}
		$("#figure_list").html(display);
		
	},
	
	// create list tag for an item
	constructTag: function(url, details){
		var tag = '<li><a href="#" class="remove">x</a><a href=http://ekizo.mandarake.co.jp/shop/en/' +
					url + ' target="_blank" class="item">' +
					details + '</a></li>';
		return tag;
		
	},

	// remove an item given its url
	removeItem: function(itemUrl){
		var itemIndex = popup.findUrlIndex(itemUrl);
		console.log(itemIndex);

		if(itemIndex > -1){
			popup.pages[popup.pageIndex].splice(itemIndex, 1);
			console.log('Removed from page.');
		//	console.log(popup.pages[popup.pageIndex]);
			popup.itemCount--;
			chrome.runtime.sendMessage({action: 'remove_item', url: itemUrl});
			popup.getNextPageItem();
			popup.updateItemCount();
		}
		if(popup.pageIndex != 0 && popup.pages[popup.pageIndex].length == 0)
		{
			popup.displayItems(popup.pages[--popup.pageIndex]);
			popup.pages.splice(popup.pages.length-1,1);
			popup.updatePageCount();
		}

		
	},
	
	// get index of item in popup
	findUrlIndex: function(itemUrl){
		//console.log(popup.pages);
		for(var i=0; i<popup.pages[popup.pageIndex].length;++i){
			if(popup.pages[popup.pageIndex][i].url == itemUrl)
				return i;	
		}
		console.log('Item url not found');	
		return -1;
	},
	
	// shift items up one on the popup pages  (after remove)
	getNextPageItem: function(){
		var pagesLeft = popup.pages.length-(popup.pageIndex+1);
		if( pagesLeft >= 1){
			console.log('pages left: '+pagesLeft);
			var nextItem;
			for(var i=popup.pages.length-1; i>popup.pageIndex;--i){
				nextItem = popup.pages[i].shift();
				popup.pages[i-1].push(nextItem);
				if(popup.pages[i].length == 0)
				{
					popup.pages.splice(i, 1);	
					popup.updatePageCount();
				}
			}
			//console.log(nextItem);
			$('#figure_list').append(popup.constructTag(nextItem.url, nextItem.details));
		}
	},
	

	// create popup pages
	createDisplayPage: function(list){
		var len = Object.keys(list).length;
		console.log('Item count: ' + len);
		var arr = [];
		var count  = 0;
		for(var key in list)
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
		if(popup.pages.length){
			$('#next').click(function(){
				popup.changePage('next');
			});
			$('#back').click(function(){
				popup.changePage('back');
			});
		}
		else{
			$('#content').prepend('Go to <a href="options.html" target="_blank"><b>options</b></a> to edit your tracking list.')	
		}
		popup.updatePageCount();
		popup.displayItems(popup.pages[0]);
	},

	// switch pages
	changePage: function(direction){
		if(direction == 'next' && popup.pageIndex < popup.pages.length-1){
			popup.pageIndex++;
		}
		else if(direction == 'back' && popup.pageIndex > 0){
			popup.pageIndex--;
		}
		popup.updatePageCount();
		popup.displayItems(popup.pages[popup.pageIndex]);
		
	},

	updatePageCount: function(){
		var maxPages = popup.pages.length;
		if(maxPages == 0)
			maxPages = 1;
		$('#page').text(popup.pageIndex+1 + '/' + maxPages);
		
	},

	updateItemCount: function(){
		$('#count').text(popup.itemCount +'/50');
	}
}


$(document).ready(function(){
	popup.start();
});

