let vNAV_search_result=false;
let vNAV_FLAG_UPLOAD=false;
let remaining_tags=null;

$(document).ready(function(){

	$('div.mainmenu div.search input').on('blur', function() {
	
		$(this).val("");
		
	});		

	$('div.mainmenu div.search input')
	  .on('focus', function () {
		$('div.mainmenu div.search button span').addClass('lowcolor');
	  })
	  .on('blur', function () {
		$('div.mainmenu div.search button span').removeClass('lowcolor');
	  });

	$(document).on('keydown', function(e) {
		
		if(e.which === 13) 
		{	
			let use="";
	
			if(!$('div#mainmenu').hasClass('hidden') && $('div#searchmenu').hasClass('hidden'))
			{
				use = 'div#mainmenu div.search input';
			}
			if($('div#mainmenu').hasClass('hidden') && !$('div#searchmenu').hasClass('hidden'))
			{
				use = 'div#searchmenu div.search input';
			}
			
			if ($(use).is(':focus')) 
			{					
				const val = $(use).val();
				
				const option = $('#fastsearch option').filter(function () {
					return this.value === val;
				});
				
				if(option.length !== 0)
				{
					$('#filter_tag').val(option.attr('data-tag'));
					$('#filter_val').val(option.val());
					$('#filters_exclude').val("{}");
					
					EXPLORE_post_search();
				}
				else if(val==="")
				{
					DISPLAY_section(vSECTION_active_mem);
				}
				else
				{
					$('#filterapply').html("No result");
					$('main section.grid.date.search').html('');
					DISPLAY_section("search");
				}
			}
		}
	});

	$('div#mainmenu div button.library').on('click', 	function() { if(!$(this).hasClass('selected')) { nav_tab_change(); DISPLAY_section('library'); } });	
	$('div#mainmenu div button.explore').on('click', 	function() { if(!$(this).hasClass('selected')) { nav_tab_change(); DISPLAY_section('explore'); } });	
	$('div#mainmenu div button.untagged').on('click', 	function() { if(!$(this).hasClass('selected')) NAV_open_untagg(); });

	$('div#searchmenu div button.return-explore').on('click', 	function() {

			//vNAV_search_result=false;
			
			$('main').scrollTop(0);
			FILEMULTISELECTION_unselectall();
			DISPLAY_set_view('grid');
			DISPLAY_section(vSECTION_active_mem);
			DISPLAY_filters(false);
			DISPLAY_menu($('#flush-trash'), false);

	});

	$('div#searchmenu div button.advanced-filters').on('click', 	function() {

		if(DISPLAY_is_visible_filters())
		{
			DISPLAY_filters(false);
		}
		else
		{
			$('aside#advancedfilters h3').addClass('hidden');		
			$('aside#advancedfilters h2:not(.title)').addClass('hidden');
			
			$('aside#advancedfilters').off('click.inputFilters', 'input');
			$('aside#advancedfilters').off('click.allCheck', 'input');
		
			//---------------------
			//LOOAD CHECKBOX ------
			//---------------------
			
			let checkboxid=0;
			let sizeref=0;
			
			if(vEXPLORE_SEARCH_TAGS[$('#filter_tag').val()]!=undefined)
			{
				if(vEXPLORE_SEARCH_TAGS[$('#filter_tag').val()][$('#filter_val').val()]!=undefined)
				{
					if(vEXPLORE_SEARCH_TAGS[$('#filter_tag').val()][$('#filter_val').val()][0]!=undefined)
					{
						sizeref=vEXPLORE_SEARCH_TAGS[$('#filter_tag').val()][$('#filter_val').val()][0];
					}
				}
			}

			$.each(vEXPLORE_SEARCH_TAGS, function(index0, value0) 
			{
				let verify='';
				
				if($('#filter_tag').val()=='years')
				{
					if(value0[0]!==undefined) if(value0[0][0]!==undefined) verify=value0[0][0];
				}
				else
				{
					if(value0[$('#filter_val').val()]!==undefined) verify = value0[$('#filter_val').val()];					
				}

				//supression des checkbox
				if(index0==$('#filter_tag').val() && verify.length!=0) return;  //si l'élément courant est le filtre principal
				if(value0.length==0) return; 									//si l'élement n'existe pas
				
				let uxelement='aside#advancedfilters h3#'+index0.replace('tag_','');
									
				$(uxelement+" div.value").html('');
				
				let count=0;
								
				$.each(value0, function(value1) {
					
					let val=value1;
					let display=value1;
					let count=0;
					
					if(index0=='months' || index0=='years') 
					{
						val=value0[value1][0];
						display=value0[value1][1];	
						count=value0[value1][2];	
					}
					
					if(index0=='tag_country') 
					{
						val=value0[value1][1];	
						count=value0[value1][0];	
					}
					
					if(count==sizeref) return; //pas de checkbox si un filtre = filtre principal

					$(uxelement).removeClass('hidden');
					$('aside#advancedfilters h2#'+$(uxelement).attr('data-title')).removeClass('hidden');
					$(uxelement+" div.value").append(`<span><input checked="1" id="checkbox_${checkboxid}" name="${index0}" value="${val}" type="checkbox"></span>`);			
					$(uxelement+" div.value").append(`<span>${display}</span><br>`);			
					
					checkboxid++;
					count++;
						
					if(count>1) $(uxelement).addClass('line');
				});				
			});
			
			//---------------------
			// END LOOAD CHECKBOX -
			//---------------------	
			
			DISPLAY_filters(true);
		}
	});

});

function nav_tab_change()
{
	$('main').scrollTop(0);	
	$('main div.element').removeClass('selected');
	$('main div.element').addClass('notselected');
	
	DISPLAY_set_view('grid');
}

var NAV_open_untagg = function open_untagg(force_reload=false)
{
	vNAV_FLAG_UPLOAD=true;
	nav_tab_change();
	DISPLAY_section('untagged');
}