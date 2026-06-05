$(document).ready(function(){

	$('div#mainmenu div.search input').on('blur', function() {
		
		$(this).val("");
	});		

	$('div#mainmenu div button.mylib').on('click', function() {
		
		if(!$(this).hasClass('selected'))
		{
			$('div#mainmenu div button.untag').removeClass("selected");
			$('div#mainmenu div button.mylib').addClass("selected");
			DISPLAY_menu($('#select-status'),false);
			GRID_load(false,true);
		}
	});	
	
	$('div#mainmenu div button.untag').on('click', function() {
		
		if(!$(this).hasClass('selected'))
		{
			TOP_open_untagg();
		}
	});	
});

/**********************************************************************
-Affiche les fichiers de la catégorie "untag"
-Est appelée à l'appuis sur le bouton du menu principal
-Est appelée à la fin d'un upload pour aficher les nouveaux fichiers
**********************************************************************/

var TOP_open_untagg = function open_untagg(force_reload=false)
{
	$('div#mainmenu div button.untag').addClass("selected");
	$('div#mainmenu div button.mylib').removeClass("selected");
	DISPLAY_menu($('#select-status'),false);
	GRID_load(force_reload,true);
}