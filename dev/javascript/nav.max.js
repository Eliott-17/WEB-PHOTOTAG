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
				if($('div#mainmenu div button.untag').hasClass("selected")) vNAV_mem_selected='div#mainmenu div button.untag';
				if($('div#mainmenu div button.mylib').hasClass("selected")) vNAV_mem_selected='div#mainmenu div button.mylib';
				
				$('div#mainmenu div button.untag').removeClass("selected");
				$('div#mainmenu div button.mylib').removeClass("selected");
				$("main section.grid").html("");
				
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
					
					console.log("Load filter",tag,val);
					
					CORE_get('actions/file-search-list.php?tag='+tag+'&value='+val);
				}
			}
		}
	});

	$('div#mainmenu div button.mylib').on('click', function() {
		
		if(!$(this).hasClass('selected'))
		{
			$('div#mainmenu div button.untag').removeClass("selected");
			$('div#mainmenu div button.mylib').addClass("selected");
			DISPLAY_menu($('#select-status'),false);
			DISPLAY_set_view('grid');
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
	DISPLAY_set_view('grid');
	GRID_load(force_reload,true);
}