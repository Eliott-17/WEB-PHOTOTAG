var vNAV_mem_selected=null;

$(document).ready(function(){

	$('div#mainmenu div.search input').on('blur', function() {
	
		$(this).val("");
		
		/*if(vNAV_mem_selected!=null)
		{
			$(vNAV_mem_selected).addClass("selected");
			DISPLAY_menu($('#select-status'),false);
			DISPLAY_set_view('grid');
			GRID_load(false,true);
		}*/
		
	});		

	$('div#mainmenu div.search input')
	  .on('focus', function () {
		$('div#mainmenu div.search button span').addClass('lowcolor');
	  })
	  .on('blur', function () {
		$('div#mainmenu div.search button span').removeClass('lowcolor');
	  });

	$(document).on('keydown', function(e) {
		
		if(e.which === 13) 
		{			
			if ($('div#mainmenu div.search input').is(':focus')) 
			{					
				const val = $('div#mainmenu div.search input').val();
				
				const option = $('#fastsearch option').filter(function () {
					return this.value === val;
				});
				
				if(val === "")
				{
					$(vNAV_mem_selected).addClass("selected");	
					
					GRID_load(false,true);
				}
				else if (option.length === 0) 
				{
					$("main section.grid.date").html('<div class="fullrow"><h2>Nothing found.</h2></div>');
				} 
				else 
				{
					const tag = option.attr('data-tag');

					CORE_get('actions/file-search-list.php?tag='+tag+'&value='+val);
				}
			}
		}
	});

	$('div#mainmenu div button.mylib').on('click', function() {
		
		if(!$(this).hasClass('selected'))
		{
			$('main').scrollTop(0);
			$('div#mainmenu div button').removeClass("selected");
			$('div#mainmenu div button.mylib').addClass("selected");
			DISPLAY_menu($('#select-status'),false);
			DISPLAY_set_view('grid');
			GRID_load(false,true);
		}
	});	

	$('div#mainmenu div button.explore').on('click', function() {
		
		if(!$(this).hasClass('selected'))
		{
			$('main').scrollTop(0);
			$('div#mainmenu div button').removeClass("selected");
			$('div#mainmenu div button.explore').addClass("selected");
			DISPLAY_menu($('#select-status'),false);
			DISPLAY_set_view('explore');
			$('main section.grid').html('');
			//GRID_load(false,true);
		}
	});	
	
	$('div#mainmenu div button.untag').on('click', function() {
		
		if(!$(this).hasClass('selected'))
		{
			$('main').scrollTop(0);
			NAV_open_untagg();
		}
	});	
});

var NAV_search_save_active = function search_save_active()
{
	if($('div#mainmenu div button.untag').hasClass("selected")) vNAV_mem_selected='div#mainmenu div button.untag';
	if($('div#mainmenu div button.mylib').hasClass("selected")) vNAV_mem_selected='div#mainmenu div button.mylib';
	if($('div#mainmenu div button.explore').hasClass("selected")) vNAV_mem_selected='div#mainmenu div button.explore';
					
	$('div#mainmenu div button').removeClass("selected");
}

/**********************************************************************
-Affiche les fichiers de la catégorie "untag"
-Est appelée à l'appuis sur le bouton du menu principal
-Est appelée à la fin d'un upload pour aficher les nouveaux fichiers
**********************************************************************/

var NAV_open_untagg = function open_untagg(force_reload=false)
{
	$('div#mainmenu div button').removeClass("selected");
	$('div#mainmenu div button.untag').addClass("selected");
	DISPLAY_menu($('#select-status'),false);
	DISPLAY_set_view('grid');
	GRID_load(force_reload,true);
}