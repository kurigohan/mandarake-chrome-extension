// JavaScript Document
function getPageSource(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			callback(xhr.responseText);
		}
	};
	xhr.send();
	$("#status").text("Retreiving...");
}

function display_page(data){
	var source = $(data).find("#itemlist");
	var itemLink = "http://ekizo.mandarake.co.jp/shop/en/"+source.find("a.info:first").attr("href");
	var name = source.find("h5:first").text();
	$("#status").text("");
	$("#figures").html("<li><a href="+itemLink+" target='_blank' class='item'>"+name+"</a></li>");
	//chrome.browserAction.setBadgeText ( { text: i.toString() } );
}