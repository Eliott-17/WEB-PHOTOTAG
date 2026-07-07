//****************************************************************
//Variables globales *********************************************
//****************************************************************	

let vEXPLORE_SEARCH_TAGS=[];	//Stoque les données chargées pour les réutilisées et éviter un appel  à la base de données
let vEXPLORE_ALL_TAGS=[];		//Stoque tous les tags

let vEXPLOREFILTER_FLAG_CHANGED=false; //Si la recherche change force le rafraichissement

//****************************************************************
//Variables locales *********************************************
//****************************************************************	

//****************************************************************
//Afficher et stock le r&sultat de la recherche ******************
//****************************************************************	

$(document).ready(function(){
	
	$('main').on('click.expandFilters', 'section.explore div.expandmenu', function(e) {
		
		let name = $(this).attr('id');

		$('main section div.'+name).removeClass('hidden');

		$(this).remove();
	});
	
	$('main').on('click.enterFilter', 'section.explore div.tagelement', function(e) {
				
		if(!$(this).hasClass('expandmenu'))
		{		
			if($('#filter_tag').val()!=$(this).attr('data-tag') || $('#filter_val').val()!=$(this).attr('data-val') || $('input#filters_exclude').val()!="");
			{
				vEXPLOREFILTER_FLAG_CHANGED=true;
			}
	
			$('#filter_tag').val($(this).attr('data-tag'));
			$('#filter_val').val($(this).attr('data-val'));
			$('#filters_exclude').val("{}");

			EXPLORE_post_search();
		}
	});	
	
});

var EXPLORE_post_search = function post_search()
{
	SECTIONS["search"].taglist=1; //count+tag
	SECTIONS["search"].update=true; //count+tag
	
	if(vSECTION_active!="search") vSECTION_active_mem=vSECTION_active;

	//vNAV_search_result=true;
	DISPLAY_menu($('#select-status'),false);
	DISPLAY_set_view('grid');		
	DISPLAY_section("search");	
	//GRID_load();
}

var EXPLORE_search_CallBack = function search_CallBack(datas) 
{
	let s="";
	if(datas.count>1) s="s";

	$('nav#main span#filterapply').html(datas.tagname+': '+datas.keywordsname);	
	$('nav#main span#filterresult').html(datas.count+ ' element'+s);

	vEXPLORE_SEARCH_TAGS=datas.tags; //stock le résultat de la recherche
	
	console.log("EXPLORE_search_CallBack");
}

var EXPLORE_add_tags = function add_tags(tags)
{	
	$.each(tags, function(index, tagvalue) {

		let addtag=false;
		
		if(vEXPLORE_ALL_TAGS[index] === undefined)
		{
			vEXPLORE_ALL_TAGS[index] = {};
			
			addtag=true;
		}
		else
		{
			if(vEXPLORE_ALL_TAGS[index][tagvalue] === undefined)
			{
				addtag=true;
			}
		}

		if(addtag==true)
		{
			$('#'+index).append('<option value="'+tagvalue+'">');
			$('aside datalist#fastsearch').append('<option data-tag="'+index+'" value="'+tagvalue+'">');

			vEXPLORE_ALL_TAGS[index][tagvalue]=1;
		}
		else
		{
			vEXPLORE_ALL_TAGS[index][tagvalue]++;
		}
	});
}

//****************************************************************
//Fonction Génération des datalist & advanced filters ************
//****************************************************************	

var EXPLORE_CallBack = function CallBack(datas)
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
	
	vEXPLORE_ALL_TAGS=datas.tags;
	
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
	
	$('span#totaldisk').html(formatBytes(size_files+size_webp));

}