// JavaScript Document
function increment(){
	counter++;
	console.log(counter);
}

function logFigure(){
	var url = 'http://ekizo.mandarake.co.jp/shop/en/category-bishojo-figure.html';
	parser.getPageSource(url, parser.constructItemList);
	console.log(parser.itemList);
	
}



logFigure();
//var intervalID = window.setInterval(getPageSource(url, logFigure), 1000);

