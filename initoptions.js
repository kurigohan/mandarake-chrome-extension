// JavaScript Document
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