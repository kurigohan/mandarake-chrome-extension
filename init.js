// JavaScript Document
$(document).ready(function(){
	var figuresToStore = ["Saber", "Kurisu"];
	chrome.storage.sync.clear(function(){console.log('Cleared');});
	chrome.storage.sync.set({'track_list': figuresToStore}, function(){console.log('Saved');});
	var url = 'http://ekizo.mandarake.co.jp/shop/en/category-bishojo-figure.html';
	getPageSource(url, display_page);
});