//****************************************************************
//Variables globales *********************************************
//****************************************************************	

var uniqueid=0;			//numéro unique pour les éléments de la grille
var last_select=-1;		//mémorise le dernier uniqueid sélectioné

var loaded_files=0;		//Chargement progressif: mémorise le nombre de fichier chargés
var loading_limit=0;	//Chagrement progressif: mémorise le nombre de fichier à pré-chargés

var mem_data=null;		 //Stoque les données chargées pour les réutilisées et éviter un appel  à la base de données
var mem_data_search=null;//Stoque les données chargées pour les réutilisées et éviter un appel  à la base de données

var html_mem_date;		//Pour afficher les dates correctemenr avec réinitialisation
var undated=0;
var scrolltop_after;

var vGRID_scrollmem;
var VGRID_scroll_lock = false;	//Chargement progressif: FLAG qui limite l'action scroll quand on est en train de charger la grille

var vGRID_mem_tag=null; //permet de mémoriser la recherche la denière recheche qui à eu lieu
var vGRID_mem_val=null; //permet de mémoriser la recherche la denière recheche qui à eu lieu

var expand_block=[];
var expand_max=[];

$(document).ready(function(){

	$('main').on('scroll', function() {

		if (VGRID_scroll_lock || mem_data==null) return;

		let scrollTop = $('main').scrollTop();
		let windowHeight = $('main').height();
		let docHeight = $('section.date').height()+$('section.nodate').height();
		
		let remaining = docHeight - (scrollTop + windowHeight);

		// déclenche quand il reste 25%
		if (remaining < docHeight * 0.25) {
			if(remaining>=0)
			{
				VGRID_scroll_lock=true;
				console.log("reload from scroll",remaining);
				GRID_load();
			}
		}
	});

});

var GRID_load = function load(force_reload=false, init_display=false, init_html="")
{	
	scrolltop_after=false;

	if(init_display || force_reload || init_html!="")
	{
		loaded_files=0;
		loading_limit=0;
		undated=0;
		uniqueid=0;	
		html_mem_date=null;
		$("main section.grid").html('');
		$("main section.grid.date").html(init_html);
		scrolltop_after=true;
	}
	
	if(mem_data==null || force_reload)
	{
		CORE_get('actions/file-load-list.php');
	}
	else 
	{
		GRID_load_CallBack();
	}
	
	console.log("GRID_loaded");

}

var GRID_search_CallBack = function search_CallBack(search_data) 
{
	//UX
	
	if($('div#mainmenu div button.untag').hasClass("selected")) vNAV_mem_selected='div#mainmenu div button.untag';
	if($('div#mainmenu div button.mylib').hasClass("selected")) vNAV_mem_selected='div#mainmenu div button.mylib';
	if($('div#mainmenu div button.explore').hasClass("selected")) vNAV_mem_selected='div#mainmenu div button.explore';
					
	$('div#mainmenu div button').removeClass("selected");
	
	vNAV_search_result=true;
		
	//result

	mem_data_search=search_data.datas;
	DISPLAY_menu($('#select-status'),false);
	DISPLAY_set_view('grid');

	let s="";
	if(search_data.datas.length>1) s="s";
	
	$('nav span#filterapply').html(search_data.tagname+': '+search_data.keywords);	
	$('nav span#filterresult').html(search_data.datas.length+ ' element'+s);
	
	GRID_load(false,true);
}

var GRID_load_CallBack = function load_CallBack(new_data=null)
{	
	let updated_data=false;

	if(new_data!=null) 
	{
		mem_data=new_data;
		updated_data=true;
		console.log("reload from new data");
	}
	else
	{
		console.log("reload from memory");
	}
	
	if(mem_data==null)
	{
		console.log("No data loaded");
		return;
	}
		
	let source=null;

	if($('div#mainmenu button.mylib').hasClass('selected')) 
	{
		console.log("Source library");
		source=mem_data.library;
	}
	else if($('div#mainmenu button.untag').hasClass('selected')) 
	{
		console.log("Source untagged");
		source=mem_data.untagged;
	}
	else if(mem_data_search.length!=0)
	{
		console.log("Source search");
		source=mem_data_search;
	}
	else {};
	
	if(source==null)
	{
		console.error("No source selected");
		return;		
	}
	
	let total_file_library=mem_data.library.length;
	let total_file_untagged=mem_data.untagged.length;	
	
	$('#untaggedcount').html("&nbsp;("+total_file_untagged+")");
	$('#taggedcount').html("&nbsp;("+total_file_library+")");
	//****************************************************************
	//Loop Génération de la grille de photos *************************
	//****************************************************************	
			
	$.each(source, function(i, bdd)
	{
		if(i>=loaded_files)
		{
			if(bdd.time_taken_at_date=="00000000" &&  bdd.time_taken_at_zone=="00000" && bdd.time_taken_at_time=="000000")
			{
				//si on à pas de date
				if(undated==0) $("main section.nodate").append('<div class="fullrow"><h2>Undated</h2></div>');
				$("main section.nodate").append(addElement(mem_data.dir, bdd));
				undated++;
			}
			else
			{										
				let l_date_test = bdd.time_taken_at_date;

				let l_date_display = l_date_test.substring(6,8) + "/" + l_date_test.substring(4,6) + "/" + l_date_test.substring(0,4);	
				
				if(html_mem_date==null || html_mem_date!=l_date_test)
				{
					$("main section.date").append('<div class="fullrow"><h2>'+formatDateLocale(l_date_display)+'</h2></div>'); //on démarre une nouvelle grille
				}

				$("main section.date").append(addElement(mem_data.dir, bdd));
								
				html_mem_date=l_date_test;
			}
						
			loaded_files++;
		}
		
		if(i>(50+loading_limit)) return false;

	});
	
	loading_limit=loaded_files;

	//****************************************************************
	//Loop Génération des datalist & advanced filters ****************
	//****************************************************************		
	if(updated_data) 
	{
		let html = '';
		let htmlfull = '';
		let htmlfilter = '';
		let filtercount=1;
		let filtermem='';
		//let filtermem_time='';
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
			time_taken_at_date: ["By date",1]
		};
		
		expand_max=[];

		$.each(mem_data.tags, function(index, tagvalue) {

			html += '<datalist id="'+index+'">';

			$.each(tagvalue, function(optionvalue, ovdata) {
				
				html += '<option value="'+optionvalue+'">';
				htmlfull += '<option data-tag="'+index+'" value="'+optionvalue+'">';
				
				//filters
			
				if(optionvalue=='days' || optionvalue=='months' || optionvalue=='years')
				{
					console.log('time',optionvalue);
					
					if(optionvalue=='years')
					{					
						//if(optionvalue!=filtermem_time)
						//{
							htmlfilter += '<div class="fullrow"><h2>'+optionvalue.toUpperCase()+'</h2></div>';
						//}
						
						$.each(ovdata, function(key, value) {
							htmlfilter += '<div class="element cursor date yearelement" data-tag="'+optionvalue+'" data-val="'+key+'"><div>'+key+'</div></div>';

						});
						
						//filtermem_time=optionvalue;
					}
				}
				else if(array_config_tag_show[index][1]==1)
				{
					if(filtermem!=index)
					{
						filtercount=1;
					}
					
					img="includes/401.webp";
					let visibility="";
					let name="";
				
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
					
					if(filtermem!=index)
					{
						let add_class="";
						if(index=='tag_country') add_class="notopborder";
						
						htmlfilter += '<div class="fullrow"><h2 class="'+add_class+'">'+array_config_tag_show[index][0]+'</h2></div>';
					}
					
					htmlfilter += '<div class="element cursor tagelement '+visibility+'" data-tag="'+index+'" data-val="'+optionvalue+'"><img src="'+img+'"><div>'+optionvalue+'</div></div>';

					filtermem=index;
					filtercount++;
				}
				else {}
	
			});

			html += '</datalist>';
		});

		$('aside div#datalist').html(html);
		$('aside datalist#fastsearch').html(htmlfull);

		$('main section#explore').html(htmlfilter);
		
		//****************************************************************
		//Bouton expanse *************************************************
		//****************************************************************	
		
		$('main').off('click.expandFilters');
		$('main').off('click.enterFilter');
		$('main').off('click.enterFilterYear');
		$('main').off('click.enterFilterMonth');
		
		$('main').on('click.expandFilters', 'section#explore div.expandmenu', function(e) {
			
			let name = $(this).attr('id');
			
			console.log('main section div.'+name+expand_block[name]);
			
			$('main section div.'+name+expand_block[name]).removeClass('hidden');
			
			if(expand_block[name]>=expand_max[name])
			{
				$(this).addClass('hidden');
			}			
		});


		$('main').on('click.enterFilter', 'section#explore div.tagelement', function(e) {
			
			if(!$(this).hasClass('expandmenu'))
			{			
				vGRID_mem_tag=$(this).attr('data-tag');
				vGRID_mem_val=$(this).attr('data-val');

				CORE_get('actions/file-search-list.php?tag='+vGRID_mem_tag+'&value='+vGRID_mem_val);	
			}
		});	

		$('main').on('click.enterFilterYear', 'section#explore div.yearelement', function(e) {
			
			//if(!$(this).hasClass('expandmenu'))
			//{			
			//	CORE_get('actions/file-search-list.php?tag='+$(this).attr('data-tag')+'&value='+$(this).attr('data-val'));	
			//}
		});	
	
		if(scrolltop_after) $('main').scrollTop(0);

	}
	
	//****************************************************************
	//Déchagrement des précents boutons ******************************
	//****************************************************************	

	$('main').off('click.gridSelect');
	$('main').off('click.gridOpen');

	//****************************************************************
	//Ajout du bouton de sélection d'une photo sur la grille *********
	//****************************************************************	

	$('main').on('click.gridSelect', 'div.button-select', function(e) {
		
		let current_id = parseInt($(this).parent().attr('id').replace('grid_',''));
				
		//****************************************************************
		//Logique de sélection en lot avec la touche SHIFT ***************
		//****************************************************************		

		if(e.shiftKey)
		{	
			if(last_select>=0)
			{
				if(current_id>last_select)
				{
					for(i=(last_select+1);i<current_id;i++) 
					{
						$('#grid_'+i).toggleClass('selected notselected');
					}
				}
				else
				{				
					for(i=(current_id+1);i<last_select;i++) 
					{
						$('#grid_'+i).toggleClass('selected notselected');
					}
				}	
			}
		}

		//****************************************************************
		//Action à effectué après la sélection effective *****************
		//****************************************************************

		DISPLAY_selection(current_id);
		
		if(IS_VISIBLE_menu($('div#select-trash'))) $('main section.grid div.selected').addClass('delete');

		if(DISPLAY_is_visible_file_info()) //Si on à affiché les information des fichiers lors d'une sélection multiple
		{
			FILEMULTISELECTION_load(); //On rafraichi les informations affichés au changement de sélection
		}
		
		last_select=current_id;
		
	});

	//*******************************************************************
	//Ajout du bouton plein écran d'une photo sur la grille *************
	//*******************************************************************	
	
	$('main').on('click.gridOpen', 'div.button-fullscreen', function() {
		
		let media_id = parseInt($(this).parent().attr('id').replace("grid_",""));
		let max = (loaded_files-1);
		
		vGRID_scrollmem = $('main').scrollTop();
		vFILEOPEN_currentid=media_id;
		max_id=max;
		ArrowDisplay(media_id, max); 
		FILEOPENFULLSCREEN_Loadmedia(media_id);
		DISPLAY_set_view("fullscreen");	//order before DISPLAY_selection is important
		DISPLAY_selection(vFILEOPEN_currentid,true);
	});	
				
	VGRID_scroll_lock=false;	
	
	DISPLAY_selection();
	
	console.log("GRID_load_CallBack");
}

var GRID_add_tags = function add_tags(tags)
{
	$.each(tags, function(index, tagvalue) {
		
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
	});
}

function addElement(dir, bdd)
{
	let file_orientationtxt="landscape";
	
	if(bdd.file_orientation==1) file_orientationtxt="portrait";
		
	let html ="";
	let ux = "photo";
	html+= '<div id="grid_'+uniqueid+'" class="element notselected wrapper '+file_orientationtxt+'">';
	
	html+= '	<div class="media-container" data-type="'+bdd.file_type+'" data-src="'+bdd.file_hash+'" data-id="'+bdd.id+'" id="media_'+bdd.id+'">';
	
	if(bdd.file_type == 0) 
	{
		html+= '		<img src="sd-'+bdd.file_hash+'" VGRID_scroll_lock="lazy">';
	}
	if(bdd.file_type == 1)
	{
		html+= '		<video src="hd-'+bdd.file_hash+'" poster="sd-'+bdd.file_hash+'" controlslist="nodownload nofullscreen noremoteplayback"></video>';
		ux = "video";
	}
	
	html+= '	</div>';
	
	html+= '	<div class="button-select cursor">';
	html+= '		<span class="material-symbols-outlined nothover">radio_button_unchecked</span>';
	html+= '		<span class="material-symbols-outlined hover">check_circle</span>';
	html+= '		<span class="material-symbols-outlined caseselected">check</span>';
	html+= '	</div>';
	html+= '	<div class="button-fullscreen cursor '+ux+'">';			
	html+= '		<span class="material-symbols-outlined">open_in_full</span>';
	html+= '	</div>';
	html+= '</div>';
	
	uniqueid++;
	
	return html;	
}

function formatDateLocale(dateStr) {
  const [day, month, year] = dateStr.split("/").map(Number);

  const date = new Date(year, month - 1, day);

  const locale = navigator.language || "en-US";

  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}