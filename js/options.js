// JavaScript Document

var options = {
	tracking: {
		list: [],
		//added: false // set to true when a new item is added to the list
					 // tells options.saveList to reset background.items.lastNewest 
	},
	listCount: 0,
	interval: 300000,
	changed: false,
	start: function(){
		chrome.storage.local.get(['track_list','interval'], function(data){
			options.setVariables(data);
			options.appendElement(0); // display list
			options.updateTrackLimit();
			
			// Attach events to html
			$('#add_item').click(options.addItem);
			$('#save_list').click(options.saveList);
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
					$('#limit').text(options.listCount + '/20');
				}
				else
					alert('Could not remove item.');
			}); //end .on
		}); // end local.get
		
	},
	
	setVariables: function(data){
		if(typeof data.track_list !== 'undefined')
		{
			options.tracking.list = data.track_list;
			options.listCount = options.tracking.list.length;
			console.log('tracking_list loaded.');
			console.log(options.tracking.list);
		}
		else
			console.log('No track_list found in storage.');
		if(typeof data.interval !== 'undefined')
		{
			options.interval = data.interval;
			console.log('interval loaded: ' + options.interval);
		}
		else
			console.log('No interval found in storage.');
		
	},
	
	removeItem: function(index){
		if(typeof options.tracking.list[index] !== 'undefined' &&  options.tracking.list[index] !== null)
		{
			options.tracking.list[index] = '';
			console.log('Removed at ' + index);
			console.log(options.tracking.list);
			options.changed = true;
			options.listCount--;
			options.updateTrackLimit();
			return true;
		}
		console.log('Remove failed.');
		return false;

	},
	
	addItem: function(){
		if(options.listCount < 20){
			options.tracking.list.push($('#item').val());
			$('#item').val('');
			options.appendElement(options.tracking.list.length-1);
			options.changed = true;
			//options.tracking.added = true;
			console.log('Added.');
			console.log(options.tracking.list);
			options.listCount++;
			options.updateTrackLimit();
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
		var newInterval =  parseInt($('#interval').find(':selected').text(), 10) * 60000;
		console.log('Change interval to ' + newInterval);
		// make sure interval different from current and is within the range 5 - 60 minutes
		if(newInterval!=options.interval && newInterval>=300000 && newInterval<=3600000) 
		{
			options.interval = newInterval;
			chrome.extension.sendRequest({action: 'change_interval', interval: newInterval});
			alert('Interval changed to ' + newInterval/60000 + ' minutes.');
		}
		else
			console.log('Interval is invalid or same as current. No changes made.');
	},
	
	changeSearchLimit: function(){
		var searchLimit = parseInt($('#search_limit').val(), 10);
		if(searchLimit > 0 && searchLimit <= 10){
			console.log('Change search page limit: ' + searchLimit);
			chrome.extension.sendRequest({action: 'change_limit', limit: searchLimit});
		}
		else{
			console.log('Invalid search page limit.');
			alert('Error: Invalid search page limit.');
		}
	},
	
	changeUrl: function(){
		var pattern = new RegExp( '^ekizo.mandarake.co.jp/shop/en/')
		var newUrl = $('#url').val();
		console.log(newUrl);
		if(pattern.test(newUrl)){
			newUrl = 'http://' + newUrl;
			console.log('Change url: ' + newUrl)
			chrome.extension.sendRequest({action: 'change_url', url: newUrl});
		}
		else
			alert('Invalid url.');

	},
	
	clearList: function(){
		options.tracking.list = [];
		options.listCount = 0;
		$('#tracking').html('');
		options.changed = true;
		options.updateTrackLimit();
	},
	
	saveList: function(){
		if(options.changed){
			if(confirm('Save changes to the tracking list?'))
			{
				options.tracking.list = options.tracking.list.filter(function(s){return s!==''});
				//options.tracking.list = temp;
				console.log('Cleaned options.tracking.list');
				console.log(options.tracking.list);
				options.appendElement(0, true);
				
				chrome.extension.sendRequest({action: 'change_tracking', tracking: options.tracking});
				//options.tracking.added = false;
				options.changed = false;

				chrome.storage.local.set({'track_list':options.tracking.list}, function(){
						console.log('** options.tracking.list saved **');
				});
				
			}
		} 
	},
	
	updateTrackLimit: function(){
		$('#track_limit').text(options.listCount + '/20');
	},
	
	resetAll: function(){
		if(confirm('Reset storage and settings?\n(The extension must be reloaded after.)'))
		{
			console.log('RESET');

			chrome.storage.local.clear(function(){
				console.log('Storage cleared.');
				chrome.extension.sendRequest({action:'reset'});
			});
		}
	
	}
}

$(document).ready(function(){
	options.start();
});