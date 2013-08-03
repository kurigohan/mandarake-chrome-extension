// JavaScript Document

var options = {
	trackList: [],
	editted: 0,
	removeItem: function(index){
		try{
			
			options.trackList.splice(parseInt(index, 10),1);
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
		options.appendElement(options.trackList.length-1);
		options.editted = 1;
		console.log(options.trackList);
		console.log(options.trackList.length);
	},
	
	appendElement: function(start){
		var divList = $('#tracking');
		for(var i=start; i < options.trackList.length; i++)
		{
			divList.append('<li>'+options.trackList[i]+'<span href="" class="remove" data-index="'+i+'">x</span></li>');
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
				chrome.storage.sync.set({'track_list':options.trackList}, function(){
					console.log('** trackList saved **');
					});
				options.editted = 0;
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
	chrome.storage.sync.set({'track_list':figuresToStore});
}

