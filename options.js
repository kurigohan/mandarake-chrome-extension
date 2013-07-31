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
	
	checkInput: function(){
		
	},
	
	appendElement: function(start){
		var divList = $('#tracking');
		for(var i=start; i < options.trackList.length; i++)
		{
			divList.append('<li>'+options.trackList[i]+'<span href="" class="remove" data-index="'+i+'">x</span></li>');
		};
	},
	
	getList: function(){
		chrome.storage.sync.get("track_list", function(data){
			options.trackList = data.track_list;
			options.appendElement(0);

			// Attach events to html
			$('#add').click(options.addItem);
			
			$('#save').click(function(){
				if(options.editted == 1){
					if(confirm('Save changes to the tracking list?'))
					{
						storage.save(options.trackList);
						options.editted = 0;
					}
				}
			});
		});
	}
}

function resetTest(){
	var figuresToStore = ["Saber", "Kurisu", "KOSMOS"];
	chrome.storage.sync.clear(function(){console.log('Cleared');});
	storage.save(figuresToStore);
}

$(document).ready(function(){
	options.getList();
	
	// Attach event to dynamically generated html
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
	
	$('#test').click(resetTest);
	
	
	
});
