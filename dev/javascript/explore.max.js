//****************************************************************
//Variables globales *********************************************
//****************************************************************	

let vGRID_mem_tag=null; //permet de mémoriser la recherche la denière recheche qui à eu lieu
let vGRID_mem_val=null; //permet de mémoriser la recherche la denière recheche qui à eu lieu
let vEXPLOREFILTER_FLAG_CHANGED=false; //Si la recherche change force le rafraichissement

//****************************************************************
//Variables locales *********************************************
//****************************************************************	

let expand_block=[];
let expand_max=[];


//****************************************************************
//Afficher et stock le r&sultat de la recherche ******************
//****************************************************************	

$(document).ready(function(){
	
	$('main').on('click.expandFilters', 'section.explore div.expandmenu', function(e) {
		
		let name = $(this).attr('id');

		$('main section div.'+name+expand_block[name]).removeClass('hidden');
		
		if(expand_block[name]>=expand_max[name])
		{
			$(this).addClass('hidden');
		}			
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
				
	vSECTION_active_mem=vSECTION_active;

	vNAV_search_result=true;
	DISPLAY_menu($('#select-status'),false);
	DISPLAY_set_view('grid');		
	DISPLAY_section("search");	
}

var EXPLORE_search_CallBack = function search_CallBack(datas) 
{
	let s="";
	if(datas.count>1) s="s";
	
	console.log(datas);
	
	$('nav span#filterapply').html(datas.tagname+': '+datas.keywordsname);	
	$('nav span#filterresult').html(datas.count+ ' element'+s);

	vGRID_SEARCH_DATA=datas.tags;
	
	console.log("EXPLORE_search_CallBack");
}

var EXPLORE_add_tags = function add_tags(tags)
{
	/*$.each(tags, function(index, tagvalue) {
		
		if(mem_data.tags[index][tagvalue] === undefined)
		{
			console.log("GRID_add_tags",tagvalue,"added to list");
			
			$('#'+index).append('<option value="'+tagvalue+'">');
			$('aside datalist#fastsearch').append('<option data-tag="'+index+'" value="'+tagvalue+'">');
			
			mem_data.tags[index][tagvalue]=1;
		}
		else
		{
			console.log("GRID_add_tags",tagvalue,"aready exist");
		}
	});*/
}

//****************************************************************
//Fonction Génération des datalist & advanced filters ************
//****************************************************************	

var EXPLORE_CallBack = function CallBack(datas)
{	
	let html = '';
	let htmlfull = '';
	let htmlfilter = '';
	let filtercount=1;
	let filtermem='';
	let img;
	
	let max_elements = 10;//Math.floor($('main').width()/170);

	const array_config_tag_show = {
		tag_country: ["By countries",1],
		tag_city: ["Visited cities",1],
		tag_place: ["By places",1],
		tag_activity: ["My activities",1],
		tag_comment: 0,
		tag_people: 0,
		tag_other: 0,
		years: ["By date",1],
		months: 0
	};
	
	expand_max=[];
	
	$.each(datas.tags, function(index, tagvalue) {

		html += '<datalist id="'+index+'">';

		//console.log(tagvalue);

		$.each(tagvalue, function(optionvalue, ovdata) {
								
			let date=false;
			
			if(index=='days' || index=='months' || index=='years') date=true;
		
			if(!date)
			{		
				html += '<option value="'+optionvalue+'">';
				htmlfull += '<option data-tag="'+index+'" value="'+optionvalue+'">';
			}
	
			//if(index=='years') htmlfull += '<option data-tag="'+index+'" value="'+tagvalue[optionvalue][1]+'">';
	
			//filters

			if(array_config_tag_show[index][1]==1)
			{
				if(filtermem!=index)
				{
					filtercount=1;
				}

				img="includes/401.webp";
				let visibility="";
				let name="";
				
				if(!date)
				{									
					if(ovdata[1].length>3) img='sd-'+ovdata[1];
					if(ovdata[1].length==3) img='images/flags/'+ovdata[1]+'.svg';
					
					if(filtercount>=max_elements) 
					{
						let id=Math.floor(filtercount/max_elements);
						let name=index+"_filter";
						visibility="hidden "+name+id;
									
						if(filtercount%max_elements==0) 
						{
							htmlfilter += '<div class="element cursor expandmenu" id="'+name+'"><img src="'+img+'"><span class="material-symbols-outlined">expand_circle_down</span><div>Explore more</div></div>';
							expand_block[name]=1;
							expand_max[name]=id;
						}
					}
				}
				
				if(filtermem!=index)
				{
					let add_class="";
					if(index=='tag_country') add_class="notopborder";
					
					htmlfilter += '<div class="fullrow"><h2 class="'+add_class+'">'+array_config_tag_show[index][0]+'</h2></div>';
				}
				
				if(!date)
				{
					htmlfilter += '<div class="element cursor tagelement '+visibility+'" data-tag="'+index+'" data-val="'+optionvalue+'"><img src="'+img+'"><div>'+optionvalue+'</div></div>';
				}
				else
				{
					htmlfilter += '<div class="element cursor date tagelement" data-tag="'+index+'" data-val="'+ovdata[0]+'"><div>'+ovdata[0]+'</div></div>';
				}
				
				filtermem=index;
				filtercount++;
			}

		});

		html += '</datalist>';
	});

	$('aside div#datalist').html(html);
	$('aside datalist#fastsearch').html(htmlfull);
		
	htmlfilter += '<div class="fullrow"><h2 class="">Total disk space '+formatBytes(datas.size)+'</h2></div>';

	$('main section.explore').html(htmlfilter);
}