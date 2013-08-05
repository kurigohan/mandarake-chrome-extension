// JavaScript Document

var options = {
	trackList: [],
	changed: false,
	start: function(){
		chrome.storage.local.get('track_list', function(data){
			if(typeof data.track_list != 'undefined')
				options.trackList = data.track_list;
			else
				console.log('No track_list found in storage.');
			console.log(options.trackList);
			options.appendElement(0); // Display list

			// Attach events to html
			$('#additem').click(options.addItem);
			$('#savelist').click(options.saveList);
			$('#clearlist').click(options.clearList);
			$('#applyinterval').click(options.changeInterval);
			// Attach event to dynamically generated html
			$('#test').click(resetTest);
			$(document).on('click','.remove',function(){
				if(options.removeItem($(this).attr('data-index')))
				{
					$(this).closest('li').remove();
				}
				else
				{
					console.log('Remove failed.');
				}
				});
			

		});
		
	},
	
	removeItem: function(index){
		try{
			options.trackList[index] = '';
			//options.trackList.splice(key.indexOf(options.trackList), 1);
			console.log('Removed at ' + index);
			console.log(options.trackList);
			options.changed = true;
			return true;
		}
		catch(err)
		{
			console.log(err.message);
			return false;
		}
	},
	
	addItem: function(){
		options.trackList.push($('#item').val());
		$('#item').val('');
		options.appendElement(options.trackList.length-1);
		options.changed = true;
		console.log(options.trackList);
	},
	
	appendElement: function(start, clear){
		var $tracking = $('#tracking');
		if(clear)
		{
			$tracking.html('');
		}
		
		for(var i=start; i < options.trackList.length; i++)
		{
			$tracking.append('<li>'+options.trackList[i]+'<a href="#" class="remove" data-index="'+i+'">x</a></li>');
		};
	},
	
	changeInterval: function(){
		chrome.runtime.getBackgroundPage(function(page){
			var newInterval =  parseInt($('#interval').find(':selected').text(), 10) * 60000;
			console.log('Change interval to ' + newInterval);
			if(newInterval!=page.background.interval && newInterval>=300000 && newInterval<=3600000) 
			// Make sure interval different from current and is within the range 5 - 60 minutes
			{
				page.background.interval = newInterval;
				console.log(page.background.interval);
				chrome.storage.local.set({'interval':page.background.interval}, function(){
					console.log('** interval saved: ' + page.background.interval + ' **');
					page.background.newInterval();
				}); // end storage
			}
			else
				console.log('Interval same as current. No changes made.');
			
		}); //end runtime.getBackgroundPage
	},
	
	clearList: function(){
		options.trackList = [];
		$('#tracking').html('');
		options.changed = true;
	},
	
	saveList: function(){
		if(options.changed){
			if(confirm('Save changes to the tracking list?'))
			{
				options.trackList = options.trackList.filter(function(s){return s!==''});
				//options.trackList = temp;
				console.log('Cleaned options.trackList');
				console.log(options.trackList);
				options.appendElement(0, true);
				chrome.runtime.getBackgroundPage(function(page){
					page.background.tracking.list = options.trackList.slice();
					page.background.items.newest = '';
					options.changed = false;
				}); //end getBackgroundPage
					
				chrome.storage.local.set({'track_list':options.trackList}, function(){
						console.log('** options.trackList saved **');
				});
				
			}
		} 
	}
}

function resetTest(){
	var figuresToStore = ["ZERO","Saber", "Kurisu", "KOSMOS"];
	chrome.storage.local.clear(function(){console.log('Cleared');});
	chrome.storage.local.set({'track_list':figuresToStore},function(){console.log('Saved test list.');});;
	options.trackList = figuresToStore;
	options.appendElement(0, true);
}
