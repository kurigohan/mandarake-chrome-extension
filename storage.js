// JavaScript Document

var storage = {
	changed: 0,
	save:function(value){
		chrome.storage.sync.set({'track_list':value}, function(){
			console.log('Saved');
			this.changed = 1;
		});
	}

};