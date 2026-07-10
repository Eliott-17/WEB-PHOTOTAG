//****************************************************************
//Variables globales *********************************************
//****************************************************************	

let gEXPLORE_search_tags=[];//Stoque les données chargées pour les réutilisées et éviter un appel  à la base de données

//****************************************************************
//Variables locales *********************************************
//****************************************************************	

let all_tags=[];//Stoque tous les tags

//****************************************************************
//Afficher et stock le résultat de la recherche explore **********
//****************************************************************	

$(document).ready(function(){
	
	$('main').on('click.expandFilters', 'section.explore div.expandmenu', function(e) {

		DEBUG.log("ON",'click.expandFilter');
		
		let name = $(this).attr('id');

		$('main section div.'+name).removeClass('hidden');

		$(this).remove();
	});
	
	$('main').on('click.enterFilter', 'section.explore div.tagelement', function(e) {

		DEBUG.log("ON",'click.enterFilter');
			
		if(!$(this).hasClass('expandmenu'))
		{		
			EXPLORE_post_search($(this).attr('data-tag'),$(this).attr('data-val'),"{}");			
		}
	});	
	
});

function EXPLORE_post_search(tag,val,exclude)
{
	if($('#filter_tag').val()!=tag || $('#filter_val').val()!=val || $('input#filters_exclude').val()!=exclude)
	{
		GRID_reset("EXPLORE_post_search","SEARCH",1);
	}

	$('#filter_tag').val(tag);
	$('#filter_val').val(val);
	$('#filters_exclude').val(exclude);

	if(gSECTION_active!="search") gSECTION_active_mem=gSECTION_active;

	DISPLAY_menu($('#select-status'),false);
	DISPLAY_set_view('grid');		
	DISPLAY_section("search");	
}

window.EXPLORE_CallBack_search = function(datas) 
{
	let s="";
	if(datas.count>1) s="s";

	$('nav#main span#filterapply').html(datas.tagname+': '+datas.keywordsname);	
	$('nav#main span#filterresult').html(datas.count+ ' element'+s);

	gEXPLORE_search_tags=datas.tags; //stock le résultat de la recherche
	
	DEBUG.log("CALLBACK","EXPLORE_CallBack_search");
}

window.EXPLORE_CallBack_addtags = function(tags)
{	
	$.each(tags, function(index, tagvalue) {

		let addtag=false;
		
		if(all_tags[index] === undefined)
		{
			all_tags[index] = {};
			
			addtag=true;
		}
		else
		{
			if(all_tags[index][tagvalue] === undefined)
			{
				addtag=true;
			}
		}

		if(addtag==true)
		{
			$('#'+index).append('<option value="'+tagvalue+'">');
			$('aside datalist#fastsearch').append('<option data-tag="'+index+'" value="'+tagvalue+'">');

			all_tags[index][tagvalue]=1;
		}
		else
		{
			all_tags[index][tagvalue]++;
		}
	});
	
	DEBUG.log("CALLBACK","EXPLORE_CallBack_addtags");
}

//****************************************************************
//Fonction Génération des datalist & advanced filters ************
//****************************************************************	

window.EXPLORE_CallBack_load = function(datas) 
{	
	let html = '';
	let htmlfull = '';
	let htmlfilter = '';
	let filtercount=0;
	let filtergroup=0;
	let filterfreeze=false;
	let filtermem='';
	let img;

	const cols = Math.floor(($('main').width() + 20) / 170);
	let max_elements;

	switch(cols)
	{
		case 3: max_elements=8; break;
		case 4: max_elements=7; break;
		case 5: max_elements=9; break;
		case 6: max_elements=6; break;
		case 7: max_elements=7; break; 
		case 8: max_elements=8; break;
		default: max_elements=9; break;
	}
	
	let top_elements = max_elements;

	const array_config_tag_show = {
		tag_country: ["Visited countries",1],
		tag_city: ["Visited cities",1],
		tag_place: ["Places",1],
		tag_activity: ["Activities",1],
		tag_comment: ["Comments",1],
		tag_people:  ["People",1],
		tag_other: 0,
		years: ["By date",1],
		months: 0
	};
	
	all_tags=datas.tags;
	
	$.each(datas.tags, function(index, tagvalue) {

		html += '<datalist id="'+index+'">';
		
		let visibility="";
		let count = Object.keys(tagvalue).length;
		
		if(count==1) count="";
		
		$.each(tagvalue, function(optionvalue, ovdata) {
								
			let date=false;
			let id="";
			
			if(index=='days' || index=='months' || index=='years') date=true;		
		
			if(!date)
			{		
				html += '<option value="'+optionvalue+'">';
				htmlfull += '<option data-tag="'+index+'" value="'+optionvalue+'">';
			}
	
			//filters

			if(array_config_tag_show[index][1]==1)
			{
				if(filtermem!=index)
				{
					visibility="";
					filtercount=0;
					top_elements=max_elements;
				}

				img="includes/401.webp";
				let name="";
				
				if(!date)
				{									
					if(ovdata[1].length>3) img='sd-'+ovdata[1];
					if(ovdata[1].length==3) img='images/flags/'+ovdata[1]+'.svg';
					
					if(filtercount>=top_elements) 
					{						
						top_elements+=(max_elements+1);
						
						filtergroup++;
						let name=filtergroup+'_filter';						
						
						htmlfilter += '<div class="element cursor expandmenu '+visibility+'" id="'+name+'"><img src="'+img+'"><span class="material-symbols-outlined">expand_circle_down</span><div>Explore more</div></div>';
						
						visibility="hidden "+name;
					}
				}
				
				if(filtermem!=index)
				{
					let add_class="";
					if(index=='tag_country') add_class="notopborder";
					
					htmlfilter += '<div class="fullrow"><h2 class="'+add_class+'">'+count+'&nbsp;'+array_config_tag_show[index][0]+'</h2></div>';
				}
				
				if(!date)
				{
					htmlfilter += '<div class="element cursor tagelement '+visibility+'" data-tag="'+index+'" data-val="'+optionvalue+'"><img src="'+img+'"><div>'+optionvalue+'</div></div>';
				}
				else
				{
					let id="years_"+ovdata[0];
					
					htmlfilter += '<div id="'+id+'" class="element cursor date tagelement" data-tag="'+index+'" data-val="'+ovdata[0]+'">-</div>';
				}
				
				filtermem=index;
				filtercount++;
			}

		});

		html += '</datalist>';
	});

	$('aside div#datalist').html(html);
	$('aside datalist#fastsearch').html('<option data-tag="trash" value="TRASH"/>'+htmlfull);
	htmlfilter += '<div class="fullrow"><h2 class="">Total disk space <span id="totaldisk">-</span></h2></div>';

	$('main section.explore').html(htmlfilter);
	
	let size_files=0;
	let size_webp=0;
	
	$.each(datas.size, function(index, value) {
		
		size_files+=value.size_files;
		size_webp+=value.size_webp;
		
		$('div#years_'+value.years).html('<div>'+value.years+'</div><div class="legendstats">'+value.count_files+' elments</div><div class="legendstats">'+formatBytes(value.size_files)+'</div>');	
	});
	
	$('span#totaldisk').html(formatBytes(size_files+size_webp)+' (including '+formatBytes(size_webp)+' of thumbnail)');

}