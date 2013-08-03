// JavaScript Document

var options = {
	trackList: [],
	editted: 0,
	start: function(){
		chrome.storage.sync.get('track_list', function(data){
			options.trackList = data.track_list;
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
			options.editted = 1;
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
		options.editted = 1;
		console.log(options.trackList);
	},
	
	appendElement: function(start, clear){
		var $tracking = $('#tracking');
		if(clear == 1)
		{
			$tracking.html('');
		}
		
		for(var i=start; i < options.trackList.length; i++)
		{
			$tracking.append('<li>'+options.trackList[i]+'<span href="" class="remove" data-index="'+i+'">x</span></li>');
		};
	},
	
	changeInterval: function(){
		chrome.runtime.getBackgroundPage(function(bg){
			var newInterval =  parseInt($('#interval').find(':selected').text(), 10) * 60000;
			console.log('Change interval to ' + newInterval);
			if(newInterval!=bg.background.interval && newInterval>=300000 && newInterval<=3600000) 
			// Make sure interval different from current and is within the range 5 - 60 minutes
			{
				bg.background.interval = newInterval;
				console.log(bg.background.interval);
				chrome.storage.sync.set({'interval':bg.background.interval}, function(){
				console.log('** interval saved: ' + bg.background.interval + ' **');
				bg.background.newInterval();
				}); // end sync.set 
			}
			
			}); //end runtime.getBackgroundPage
	},
	
	clearList: function(){
		options.trackList = [];
		$('#tracking').html('');
		options.editted = 1;
	},
	
	saveList: function(){
		if(options.editted == 1){
			if(confirm('Save changes to the tracking list?'))
			{
				options.trackList = options.trackList.filter(function(s){return s!==''});
				//options.trackList = temp;
				console.log('Cleaned options.trackList');
				console.log(options.trackList);
				options.appendElement(0, 1);
				chrome.runtime.getBackgroundPage(function(bg){
					bg.background.trackList = options.trackList.slice();
					options.editted = 0;
					}); //end getBackgroundPage
					
				chrome.storage.sync.set({'track_list':options.trackList}, function(){
						console.log('** options.trackList saved **');
						});
				
			}
		} 
	},
	
	getList: function(){
		chrome.storage.sync.get("track_list", function(data){
			options.trackList = data.track_list;
			options.appendElement(0);

			// Attach events to html
			$('#additem').click(options.addItem);
			$('#savelist').click(options.saveList);
			$('#clearlist').click(options.clearList);
			$('#applyinterval').click(options.changeInterval);
			});
	}
}

function resetTest(){
	var figuresToStore = ["ZERO","Saber", "Kurisu", "KOSMOS"];
	chrome.storage.sync.clear(function(){console.log('Cleared');});
	chrome.storage.sync.set({'track_list':figuresToStore},function(){console.log('Saved test list.');});;
	options.trackList = figuresToStore;
	options.appendElement(0, 1);
}
