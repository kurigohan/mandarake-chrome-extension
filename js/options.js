// JavaScript Document

var options = {
	tracking: {
		list: [],
		count: 0
		//added: false // set to true when a new item is added to the list
					 // tells options.saveTrackList to reset background.items.lastNewest 
	},
	changed: {
		checkinterval: false,
		searchLimit: false, 
		searchCategory: false,
		trackList: false,
	},
	hideGuide: false,
	start: function(){
		chrome.storage.local.get(['hide', 'track_list', 'interval', 'search_limit', 'category'], function(data){
			options.setVariables(data);
			if(options.hideGuide){
  				$('#note_content').hide();
				$('h3').toggleClass('close');
			}

			options.appendElement(0); // display list
			options.updateTrackLimit();
			
			$('h3').click(function(){
				$(this).toggleClass('close');
				$('#note_content').slideToggle(350);
				options.hideGuide = !options.hideGuide;
				chrome.storage.local.set({hide:options.hideGuide}, function(){console.log('hide saved')});
			});
			$('#interval').change(function(){
				console.log('Interval changed');
				options.changed.checkinterval = true;
			});
			$('#search_limit').change(function(){
				console.log('Search limit changed');
				options.changed.searchLimit = true;
			});
			$('#category').change(function(){
				console.log('Search source changed');
				options.changed.searchCategory = true;
			});
			
			$('#keyword').keyup(function(event){
				if(event.keyCode == 13){
					options.addItem();
				}
			});
			$('#apply_settings').click(options.applySettings);
			$('#add_keyword').click(options.addItem);
			$('#save_list').click(options.saveTrackList);
			$('#clear_list').click(options.clearList);
			$('#apply_interval').click(options.changeInterval);
			$('#apply_limit').click(options.changeSearchLimit);
			$('#apply_url').click(options.changeUrl);
			$('#reset').click(options.resetAll);
		
			
			// Attach event to dynamically generated html
			$(document).on('click','.remove',function(){
				if(options.removeItem($(this).attr('data-index')))
				{
					$(this).closest('li').remove();
					$('#limit').text(options.tracking.count + '/30');
				}
				else
					alert('Could not remove item.');
			}); //end .on
		}); // end local.get
		
	},
	
	setVariables: function(data){
		if(data.hide !== undefined)
		{
			options.hideGuide = data.hide;	
			console.log('hide loaded:' + options.hideGuide);
		}
		else
			console.log('No hide found in storage');
		if(data.track_list !== undefined)
		{
			options.tracking.list = data.track_list;
			options.tracking.count = options.tracking.list.length;
			console.log('tracking_list loaded.');
			console.log(options.tracking.list);
		}
		else
			console.log('No track_list found in storage.');
		if(data.interval !== undefined)
		{
			$('#interval').val(data.interval/60000 + ' minutes');
			console.log('interval loaded: ' + data.interval);
		}
		else
			console.log('No interval found in storage.');
			
		if(data.search_limit !== undefined)
		{
			$('#search_limit').val(data.search_limit);
			console.log('search_limit loaded: ' + data.search_limit);
		}
		else
			console.log('No search_limit found in storage.');
			
		if(data.category !== undefined)
		{
			$('#category').val(data.category);
			console.log('category loaded: ' + data.category);
		}
		else
			console.log('No category found in storage.');
		
	},
	
	removeItem: function(index){
		if(typeof options.tracking.list[index] !== 'undefined' &&  options.tracking.list[index] !== null)
		{
			options.tracking.list[index] = '';
			console.log('Removed at ' + index);
			console.log(options.tracking.list);
			options.changed.trackList = true;
			options.tracking.count--;
			options.updateTrackLimit();
			return true;
		}
		console.log('Remove failed.');
		return false;

	},
	
	addItem: function(){
		if(options.tracking.count < 30){
			var newKey = $('#keyword').val().trim();
				
				if(newKey.replace(/ /g,'').length >= 3 && newKey.length <= 60)
				{
					$('#keyword').val('');
					if(options.tracking.list.indexOf(newKey) == -1){
						options.tracking.list.push(newKey);
						options.appendElement(options.tracking.list.length-1);
						options.changed.trackList = true;
						console.log('Added: ' + newKey);
						console.log(options.tracking.list);
						options.tracking.count++;
						options.updateTrackLimit();
					}
					else
					{
						console.log('Keyword not added. Already exists.');
						alert('Keyword already exists.');
					}
				}
				else
					alert('Keywords must be at least 3 characters long not including spaces.');

		}
		else
		{
			console.log('tracking.list is full');
			alert('The tracking list is full.');	
		}
	},
	
	appendElement: function(start, clear){
		var $tracking = $('#tracking');
		if(clear)
		{
			$tracking.html('');
		}
		
		for(var i=start, len=options.tracking.list.length; i<len; ++i)
		{
			$tracking.append('<li>'+options.tracking.list[i]+'<a href="#" class="remove" data-index="'+i+'">x</a></li>');
		};
	},
	
	changeInterval: function(){
		var newInterval =  parseInt($('#interval').find(':selected').text(), 10);
		console.log('Change interval to ' + newInterval);
		// make sure interval different from current and is within the range 5 - 60 minutes
		if(newInterval>=5 && newInterval<=60) 
		{
			chrome.extension.sendRequest({action: 'change_interval', interval: newInterval*60000});
			//alert('Interval changed to ' + newInterval + ' minutes.');
		}
		else
			console.log('Interval is invalid or same as current. No changes made.');
	},
	
	changeSearchLimit: function(){
		var searchLimit = parseInt($('#search_limit').val(), 10);
		if(searchLimit > 0 && searchLimit <= 10){
			console.log('Change search page limit: ' + searchLimit);
			chrome.extension.sendRequest({action: 'change_limit', limit: searchLimit});
			//alert('Page limit changed to ' + searchLimit);
		}
		else{
			console.log('Invalid search page limit.');
			//alert('Error: Invalid search page limit.');
		}
	},
	
	changeIntervalId: function(){
		var request = {action:'change_interval'};
		var interval;
		var source;
		if(options.changed.checkinterval){
			interval = parseInt($('#interval').find(':selected').text(), 10);
			if(interval>=5 && interval<=60)
				request['interval'] = interval*60000;
		}
		if(options.changed.searchCategory){
			source = options.getCategoryUrl();
			if(source)
				request['source'] = source;
		}
		console.log('Change interval/source:')
		console.log(request);
		if(request.interval !== undefined || request.source !== undefined)
			chrome.extension.sendRequest(request);
		else
			console.log('Invalid interval/source.');
	},
	
	getCategoryUrl: function(){
		var category = $('#category').find(':selected').val();
		console.log(category);
		chrome.storage.local.set({'category':category}, function(){console.log('Category saved.')});
		var url = false;
		if(category == 'all')
			url = 'http://ekizo.mandarake.co.jp/shop/en/search.do?action=whatsNew&doujin=all&displayDate=0';
		else if(category == 'doll')
			url = 'http://ekizo.mandarake.co.jp/shop/en/category-doll.html';
		else if(category == 'bishoujo')
			url = 'http://ekizo.mandarake.co.jp/shop/en/category-bishojo-figure.html';
		else if(category == 'model')
			url = 'http://ekizo.mandarake.co.jp/shop/en/category-model-kit.html';
		else if(category == 'action')
			url = 'http://ekizo.mandarake.co.jp/shop/en/category-action-figure.html';
		else if(category == 'gokin')
			url = 'http://ekizo.mandarake.co.jp/shop/en/category-gokin.html';
		else
			console.log('Invalid category.');

		return url;
	},
	

	
	clearList: function(){
		options.tracking.list = [];
		options.tracking.count = 0;
		$('#tracking').html('');
		options.changed.trackList = true;
		options.updateTrackLimit();
	},
	
	applySettings: function(){
		if(options.changed.searchLimit){
			options.changeSearchLimit();	
			options.changed.searchLimit = false;
		}
		if(options.changed.checkinterval || options.changed.searchCategory){
			options.changeIntervalId();
			options.changed.checkinterval = false;
			options.changed.searchCategory = false;
		}

		alert('Settings applied.');
	},
	
	saveTrackList: function(){
		if(options.changed.trackList){
			if(confirm('Save changes to the tracking list?'))
			{
				options.tracking.list = options.tracking.list.filter(function(s){return s!==''});
				//options.tracking.list = temp;
				console.log('Cleaned options.tracking.list');
				console.log(options.tracking.list);
				options.appendElement(0, true);
				
				chrome.extension.sendRequest({action: 'change_tracking', tracking: options.tracking});
				//options.tracking.added = false;
				options.changed.trackList = false;

				chrome.storage.local.set({'track_list':options.tracking.list}, function(){
						console.log('** options.tracking.list saved **');
				});
				
			}
		} 
	},
	
	updateTrackLimit: function(){
		$('#track_limit').text(options.tracking.count + '/30');
	},
	
	resetAll: function(){
		if(confirm('Clear all saved data and settings?\n(The extension should be reloaded after.)'))
		{

			chrome.storage.local.clear(function(){
				console.log('Storage cleared.');
				options.clearList();
				$('#interval').val(15 + ' minutes');
				$('#category').val('bishoujo');
				$('#search_limit').val('5');

				chrome.extension.sendRequest({action:'clear'});
			});

		}
	
	}
}

$(document).ready(function(){
	options.start();

});