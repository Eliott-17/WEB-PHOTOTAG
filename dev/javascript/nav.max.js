var vNAV_mem_selected=null;
var vNAV_search_result=false;

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

	$('div#mainmenu div button.mylib').on('click', 		function() { if(!$(this).hasClass('selected')) NAV_open_lib(); });	
	$('div#mainmenu div button.explore').on('click', 	function() { if(!$(this).hasClass('selected')) NAV_open_explore(); });	
	$('div#mainmenu div button.untag').on('click', 		function() { if(!$(this).hasClass('selected')) NAV_open_untagg() });

	$('div#searchmenu div button.return-explore').on('click', 	function() {

			vGRID_mem_tag=null;
			vGRID_mem_val=null;
			vNAV_search_result=false;
			
			let fr = (vFILEINFO_FLAG_SAVED || vFILEINFOMULTISELECTION_FLAG_SAVED);

			if(vNAV_mem_selected=='div#mainmenu div button.untag') NAV_open_untagg(fr);
			else if(vNAV_mem_selected=='div#mainmenu div button.mylib') NAV_open_lib(fr);
			else if(vNAV_mem_selected=='div#mainmenu div button.explore') NAV_open_explore(fr);
			else {}
			
			vFILEINFO_FLAG_SAVED = false;
			vFILEINFOMULTISELECTION_FLAG_SAVED = false;
			
			DISPLAY_filters(false);
			$('section.grid div').removeClass('hidden');
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
			
			update_checkbox();
			
			$('aside#advancedfilters').on('click.allCheck', 'h2 span.cursor', function () {
							
				let target_elements = $(this).parent().attr('id');
				let val=1;
				
				if($(this).html()=='check_box') 
				{
					val = 0;
				}
				
				$.each(vGRID_SEARCH_DATA.datas, function (index, v_) {
									
					vGRID_SEARCH_DATA.datas[index]['advfilter_hidden']=val;
				});

				update_grid();	
			});
					
			$('aside#advancedfilters').on('click.inputFilters', 'input', function () {

				console.log('clicked');

				let error = false;
				let input = null;

				try {
					input = JSON.parse($(this).val());

					if (!input || !input.tag || !input.value) {
						error = true;
					}

				} catch (e) {
					error = true;
				}

				if (error) {
					console.error('JSON invalid checkbox value:', $(this).val());
					return;
				}
				
				//{"tag":"tag_people","value":"..."}
				
				FILEMULTISELECTION_unselectall();
				
				let store_hash=null;
				let check_status=$(this).is(':checked');
				
				let total_data=vGRID_SEARCH_DATA.datas.length;
				
				$.each(vGRID_SEARCH_DATA.datas, function (index, value) {
									
					if(value[input.tag] == input.value)
					{
						if(!check_status) 
						{
							vGRID_SEARCH_DATA.datas[index]['advfilter_hidden']=1; //hide
						}
						else
						{
							vGRID_SEARCH_DATA.datas[index]['advfilter_hidden']=0; //show
						}
					}
				
				});

				update_grid();
			});

			DISPLAY_filters(true);
		}
	});

});

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

var NAV_open_explore = function open_explore(force_reload=false)
{
	$('div#mainmenu div button').removeClass("selected");
	$('div#mainmenu div button.explore').addClass("selected");
	DISPLAY_menu($('#select-status'),false);
	DISPLAY_set_view('explore');
	if(force_reload)  GRID_load(force_reload,true);
}

var NAV_open_lib = function open_lib(force_reload=false)
{
	$('div#mainmenu div button').removeClass("selected");
	$('div#mainmenu div button.mylib').addClass("selected");
	DISPLAY_menu($('#select-status'),false);
	DISPLAY_set_view('grid');
	GRID_load(force_reload,true);
}

function update_grid()
{
	let i=0;
	let remaining_tags={};

	$.each(vGRID_SEARCH_DATA.datas, function (index0, value0) {
		
		if(vGRID_SEARCH_DATA.datas[index0]['advfilter_hidden']==0)
		{
			i++;
			j=0;
			
			$.each(vGRID_SEARCH_DATA.tags, function (index1, value1) {
				
				let ext_tag = vGRID_SEARCH_DATA.datas[index0][index1];							
											
				if (!remaining_tags[index1]) {
					remaining_tags[index1] = [];
				}

				if (remaining_tags[index1].indexOf(ext_tag) === -1) {
					remaining_tags[index1].push(ext_tag);
				}

			});
		}
	});
					
	update_checkbox(remaining_tags);
	
	let s="";
	
	if(i>1) s="s";
		
	$('#filterresult').html(i+' element'+s);
	
	GRID_load(false,true);
}

function update_checkbox(remaining_tags=null)
{	
	$.each(vGRID_SEARCH_DATA.tags, function(index0, value0) 
	{		
		if(value0.length==0 || (vGRID_SEARCH_DATA.tag==index0))
		{
			//console.log("Terminated A",value0,vGRID_SEARCH_DATA.tag,index0);
		}
		else
		{				
			let loopdata=[];
					
			if(index0=='time_taken_at_date')
			{
				loopdata[0]=value0.months;
				loopdata[1]=value0.years;
			}
			else
			{
				loopdata[0]=value0;
			}
			
			let uxelement='aside#advancedfilters h3#'+index0.replace('tag_','');
							
			$(uxelement+" div.value").html('');
			
			$.each(loopdata, function(loopindex, loopvalue) {
						
				let count=0;
						
				$.each(loopvalue, function(index1, value1) {
					
					count++;

					//index1 = tag value
					//value1[0] = count
					//value1[1] = flie hash
								
					if(value1[0]==vGRID_SEARCH_DATA.datas.length)
					{
						//console.log("Terminated B",vGRID_SEARCH_DATA.datas.length,value1[0]);
					}
					else
					{
						let val = index1;

						if(index0=='tag_country' || index0=='months') val = value1[1];

						const obj = { tag: index0, value: val };
						
						//console.log(val);
						
						let elementsel='aside#advancedfilters h3#'+index0.replace('tag_','');
						
						let value='checked="1"';

						if(remaining_tags!=null)
						{
							if(remaining_tags[index0]!==undefined)
							{
								if(remaining_tags[index0].indexOf(val)===-1)  value='';
							}
							else value='';
						}
						
						//console.log(elementsel,`<span class="${total_checked}"><input ${value} type="checkbox" value='${JSON.stringify(obj)}'></span><span>${index1}</span><br>`);
						
						$(elementsel).removeClass('hidden');
						$('aside#advancedfilters h2#'+$(elementsel).attr('data-title')).removeClass('hidden');
						$(elementsel+" div.value").append(`<span><input ${value} type="checkbox" value='${JSON.stringify(obj)}'></span><span>${index1}</span><br>`);
												
						if(count>1)
						{
							$(uxelement).addClass('line');
						}
					}					
				});
			});
		}	
	});
}