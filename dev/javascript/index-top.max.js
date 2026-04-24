$(document).ready(function(){

	$('div#mainmenu div.search input').on('blur', function() {
		
		$(this).val("");
	});		

	$('div#mainmenu div button.mylib').on('click', function() {
		
		if(!$(this).hasClass('selected'))
		{
			$('div#mainmenu div button.untag').removeClass("selected");
			$(this).addClass("selected");
			g_load_files();
			g_unselect_all();
		}
	});	
	
	$('div#mainmenu div button.untag').on('click', function() {
		
		if(!$(this).hasClass('selected'))
		{
			$('div#mainmenu div button.mylib').removeClass("selected");
			$(this).addClass("selected");
			g_load_files();
			g_unselect_all();
		}
	});	
});
