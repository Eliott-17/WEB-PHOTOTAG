//****************************************************************
//Variables globales *********************************************
//****************************************************************	

var uniqueid=0;			//numéro unique pour les éléments de la grille
var last_select=-1;		//mémorise le dernier uniqueid sélectioné

var loaded_files=0;		//Chargement progressif: mémorise le nombre de fichier chargés
var loading_limit=0;	//Chagrement progressif: mémorise le nombre de fichier à pré-chargés

var mem_data=null;		//Stoque les données chargées pour les réutilisées et éviter un appel  à la base de données
var undated=0;

var vGRID_scrollmem;
var VGRID_scroll_lock = false;	//Chargement progressif: FLAG qui limite l'action scroll quand on est en train de charger la grille

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

var GRID_load = function load(force_reload=false, init_display=false)
{	
	if(init_display || force_reload)
	{
		loaded_files=0;
		loading_limit=0;
		undated=0;
		uniqueid=0;		
		$("main section.grid").html("");		
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
	mem_data.search=search_data;
	loaded_files=0;

	DISPLAY_menu($('#select-status'),false);
	DISPLAY_set_view('grid');
	GRID_load(false,true);
}

var GRID_load_CallBack = function load_CallBack(new_data=null)
{	
	if(new_data!=null) 
	{
		mem_data=new_data;
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
	else if(mem_data.search.length!=0)
	{
		console.log("Source search");
		source=mem_data.search;
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

	//****************************************************************
	//Loop Génération de la grille de photos *************************
	//****************************************************************	
		
	let html_mem_date=null;
	
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
					$("main section.date").append('<div class="fullrow"><h2>'+l_date_display+'</h2></div>'); //on démarre une nouvelle grille
				}

				$("main section.date").append(addElement(mem_data.dir, bdd));
				
				console.log('added');
				
				html_mem_date=l_date_test;
			}
						
			loaded_files++;
		}
		
		if(i>(50+loading_limit)) return false;

	});
	
	loading_limit=loaded_files;

	//****************************************************************
	//Loop Génération des datalist ***********************************
	//****************************************************************	

	let html = '';
	let htmlfull = '';

	$.each(mem_data.tags, function(index, tagvalue) {

		html += '<datalist id="'+index+'">';

		$.each(tagvalue, function(optionvalue, count) {
			html += '<option value="'+optionvalue+'">';
			htmlfull += '<option data-tag="'+index+'" value="'+optionvalue+'">';
		});

		html += '</datalist>';
	});

	$('aside div#datalist').html(html);
	$('aside datalist#fastsearch').html(htmlfull);
	
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