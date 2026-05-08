$(document).ready(function(){

	$('div#mainmenu div.search input').on('blur', function() {
		
		$(this).val("");
	});		

	$('div#mainmenu div button.mylib').on('click', function() {
		
		if(!$(this).hasClass('selected'))
		{
			$('div#mainmenu div button.untag').removeClass("selected");
			$('div#mainmenu div button.mylib').addClass("selected");
			g_load_files();
			g_unselect_all();
		}
	});	
	
	$('div#mainmenu div button.untag').on('click', function() {
		
		if(!$(this).hasClass('selected'))
		{
			g_load_untag();
		}
	});	
});

var g_load_untag = function load_untag(force_reload=false)
{
	$('div#mainmenu div button.mylib').removeClass("selected");
	$('div#mainmenu div button.untag').addClass("selected");
	g_load_files(force_reload);
	g_unselect_all();
}