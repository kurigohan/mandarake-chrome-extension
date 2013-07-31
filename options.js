// JavaScript Document

function removeItem(index){
	

}

function getList(){
	chrome.storage.sync.get("track_list", function(data){
		var divList = $('#figures ul');
		var trackList = data.track_list;
		for(var i=0; i < trackList.length; i++)
		{
		divList.append('<li>'+trackList[i]+'<span class="remove" data-index="'+i+'">x</span></li>');
		}
	});
	
}







$(document).ready(function(){
	/*
chrome.storage.sync.get("track_list", function(data){
	
	console.log(data.figure_list);
	var divList = $('#figures ul');
	
	for(var i=0; i < data.track_list.length; i++)
	{
	divList.append('<li>'+data.track_list[i]+'<span class="remove" data-index="'+i+'">x</span></li>');
	}
	
	});*/
	getList();
	
});
