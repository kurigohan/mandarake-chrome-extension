// JavaScript Document

var options = {
	tracking: {
		list: [], // array of keywords
		count: 0 // keyword count
		//added: false // set to true when a new item is added to the list
					 // tells options.saveTrackList to reset background.items.lastNewest 
	},
	changed: { // indicates which option was changed
		checkinterval: false,
		searchLimit: false, 
		searchCategory: false,
		trackList: false, 
	},
	hideGuide: false, // hide extension guide

	start: function(){
		chrome.storage.local.get(['hide', 'track_list', 'interval', 'search_limit', 'category'], function(data){
			options.setVariables(data);
			if(options.hideGuide){
  				$('#guide_content').hide();
				$('#guide_header').toggleClass('close');
			}

			options.appendElement(0); // display list
			options.updateTrackLimit();
			
			$('#guide_header').click(function(){
				$(this).toggleClass('close');
				$('#guide_content').slideToggle(350);
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
			
			/*
			$('#keyword').keyup(function(event){
				if(event.keyCode == 13){
					options.addItem();
				}
			});*/
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
				else{
					alert('Could not remove item.');
				}
			}); //end .on
		}); // end local.get
		
	},
	
	setVariables: function(data){
		if(data.hide !== undefined)
		{
			options.hideGuide = data.hide;	
			console.log('hide loaded:' + options.hideGuide);
		}
		else{
			console.log('No hide found in storage');
		}
		if(data.track_list !== undefined)
		{
			options.tracking.list = data.track_list;
			options.tracking.count = options.tracking.list.length;
			console.log('tracking_list loaded.');
			//console.log(options.tracking.list);
		}
		else{
			console.log('No track_list found in storage.');
		}
		if(data.interval !== undefined)
		{
			$('#interval').val(data.interval/60000);
			console.log('interval loaded: ' + data.interval);
		}
		else{
			console.log('No interval found in storage.');
		}
			
		if(data.search_limit !== undefined)
		{
			$('#search_limit').val(data.search_limit);
			console.log('search_limit loaded: ' + data.search_limit);
		}
		else{
			console.log('No search_limit found in storage.');
		}
			
		if(data.category !== undefined)
		{
			$('#category').val(data.category);
			console.log('category loaded: ' + data.category);
		}
		else{
			console.log('No category found in storage.');
		}
		
	},
	
	// remove keyword from tracking list
	removeItem: function(index){
		// if tracking.list not invalid
		if(typeof options.tracking.list[index] !== 'undefined' &&  options.tracking.list[index] !== null)
		{
			// set keyword to empty string
			options.tracking.list[index] = '';
			console.log('Removed at ' + index);
			//console.log(options.tracking.list);
			options.changed.trackList = true;
			options.tracking.count--;
			options.updateTrackLimit();
			return true;
		}
		console.log('Remove failed.');
		return false;

	},
	
	// add keyword to tracking list
	addItem: function(){
		// ensure word does not exceed 30 chars
		if(options.tracking.count <= 30){
			var newKey = $('#keyword').val().trim();
				// don't allow words less than 3 chars long or more than 60 chars long
				if(newKey.replace(/ /g,'').length >= 3 && newKey.length <= 60)
				{
					$('#keyword').val('');
					if(options.tracking.list.indexOf(newKey) == -1){
						options.tracking.list.push(newKey);
						options.appendElement(options.tracking.list.length-1);
						options.changed.trackList = true;
						console.log('Added: ' + newKey);
						//console.log(options.tracking.list);
						options.tracking.count++;
						options.updateTrackLimit();
					}
					else
					{
						console.log('Keyword not added. Already exists.');
						alert('Keyword already exists.');
					}
				}
				else{
					alert('Keywords must be at least 3 characters long not including spaces and less than 61 characters.');
				}
		}
		else
		{
			console.log('tracking.list is full');
			alert('The tracking list is full.');	
		}
	},


	// display keywords by creating tags from keywords and inserting into appropriate element
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
	
	// change the max number of pages to search
	changeSearchLimit: function(){
		var searchLimit = parseInt($('#search_limit').val(), 10);
		if(searchLimit > 0 && searchLimit <= 10){
			console.log('Change search page limit: ' + searchLimit);
			chrome.runtime.sendMessage({action: 'change_limit', limit: searchLimit});
			//alert('Page limit changed to ' + searchLimit);
			return '';
		}
		else{
			console.log('Invalid search page limit. ');
			return 'Search page limit must be between 1-10.';
		}
	},
	
	// change the interval id
	changeIntervalId: function(){
		var msg = {action:'change_interval'};
		var interval;
		var source;
		var error = ''
		if(options.changed.checkinterval){
			interval = parseInt($('#interval').val(), 10);
			if(interval>=1 && interval<=60)
				msg['interval'] = interval*60000;
			else
				error += 'Interval must be between 1 - 60 minutes. ';
		}
		if(options.changed.searchCategory){
			source = options.getCategoryUrl();
			if(source)
				msg['source'] = source;
			else
				error += 'Invalid Source.';
		}
		console.log('Change interval/source:')
		console.log(msg);
		if(msg.interval !== undefined || msg.source !== undefined)
			chrome.runtime.sendMessage(msg);
		else{
			console.log('Invalid interval/source.');
		}
		return error;
	},
	
	// change the search category url
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
		else if(category == 'ame')
			url = 'http://ekizo.mandarake.co.jp/shop/en/category-ame-toy.html';
		else{
			console.log('Invalid category. ');
		}

		return url;
	},
	
	// clear the keyword list
	clearList: function(){
		options.tracking.list = [];
		options.tracking.count = 0;
		$('#tracking').html('');
		options.changed.trackList = true;
		options.updateTrackLimit();
	},
	
	// apply the option settings
	applySettings: function(){
		var errors = '';
		if(options.changed.searchLimit){
			errors += options.changeSearchLimit();
			options.changed.searchLimit = false;
		}
		if(options.changed.checkinterval || options.changed.searchCategory){
			errors += options.changeIntervalId();
			options.changed.checkinterval = false;
			options.changed.searchCategory = false;
		}
		if(errors)
			alert('Error: ' + errors);
		else
			alert('Settings applied.');
	},
	
	// save the keyword list
	saveTrackList: function(){
		if(options.changed.trackList){
			if(confirm('Save changes to the tracking list?'))
			{
				options.tracking.list = options.tracking.list.filter(function(s){return s!==''});
				//options.tracking.list = temp;
				console.log('Cleaned options.tracking.list');
				//console.log(options.tracking.list);
				options.appendElement(0, true);
				
				chrome.runtime.sendMessage({action: 'change_tracking', tracking: options.tracking});
				//options.tracking.added = false;
				options.changed.trackList = false;

				chrome.storage.local.set({'track_list':options.tracking.list}, function(){
						console.log('** options.tracking.list saved **');
				});
				
			}
		} 
	},
	
	// update the keyword list limit
	updateTrackLimit: function(){
		$('#track_limit').text(options.tracking.count + '/30');
	},
	
	// reset all variables and clear storage 
	resetAll: function(){
		if(confirm('Reset all saved data and settings?\n(The extension must disabled and renabled after.)'))
		{

			chrome.storage.local.clear(function(){
				console.log('Storage cleared.');
				options.clearList();
				$('#interval').val(15 + ' minutes');
				$('#category').val('bishoujo');
				$('#search_limit').val('5');
				chrome.runtime.sendMessage({action:'clear'});
			});

		}
	
	}
}

$(document).ready(function(){
	options.start();

});