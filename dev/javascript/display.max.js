$(document).ready(function()
{ 
	DISPLAY_view=0;
	DISPLAY_view_mem=0;
});

//****************************************************************
//Gère la vue générale *******************************************
//****************************************************************	

var DISPLAY_set_view = function view_refresh(newview)
{	
	DISPLAY_trash(false); //close trash menu on an display change
	
	switch(newview)
	{
		case "searchresult":
		
			DISPLAY_filters(false);	
		
		break;
		case "searchresult-filters":
		
			DISPLAY_file_info(false);
			FILEMULTISELECTION_unselectall();
			DISPLAY_selection();
			DISPLAY_filters(true);	
			
		break;
		/*case "explore":
		
			DISPLAY_full_screen(false);
			DISPLAY_file_info(false);
			DISPLAY_explore(true);		
		
		break;*/
		case "grid":
		
			DISPLAY_full_screen(false);
			DISPLAY_file_info(false);
			DISPLAY_selection();
			DISPLAY_menu(null,false);//fermer tous les menus affichés
		
		break;
		case "grid-fileinfo":
		
			DISPLAY_filters(false);	
			DISPLAY_full_screen(false);
			DISPLAY_file_info(true);
			
			FILEMULTISELECTION_CallBack_load();
					
		break;
		case "fullscreen":	
		
			DISPLAY_filters(false);	
			DISPLAY_full_screen(true);
			DISPLAY_file_info(false);
			
		break;
		case "fullscreen-fileinfo":

			DISPLAY_full_screen(true);
			DISPLAY_file_info(true);
			
			FILEINFO_CallBack_load();
			
		break;
		default:
			DEBUG.log("DISPLAY","set_view !!! VIEW NOT FOUND !!!");
		break;
	
	}
	
	DEBUG.log("DISPLAY","set_view",newview,"loaded");
}

//

var DISPLAY_section = function section(section)
{
	GRID.section_active=section;
	
	$('div#mainmenu div button').removeClass("selected");
	$('div#mainmenu div button.'+GRID.section_active).addClass("selected");
	
	$('section').addClass("hidden");
	$('section.'+GRID.section_active).removeClass("hidden");

	$('div#uploaddrag').addClass("hidden");
	$('div.'+GRID.section_active).removeClass("hidden");
	
	if(GRID.section_active=="search")	
	{
		$('div#mainmenu').addClass('hidden');
		$('div#searchmenu').removeClass('hidden');
	}
	else 							
	{
		$('div#mainmenu').removeClass('hidden');
		$('div#searchmenu').addClass('hidden');
	}
	
	GRID_load("DISPLAY_section");//en affichant une section on s'assure de charger les données.
		
	DEBUG.log("DISPLAY","section",'section.'+GRID.section_active);
}

//****************************************************************
//Gère la visibilité de l'édition des paramètres des fichier *****
//****************************************************************	

var DISPLAY_is_visible_file_info = function is_visible_file_info()
{
	return !$('body').hasClass('no-aside-files');
}

var DISPLAY_file_info = function display_aside(visibility = undefined)
{
	let lelement=$('body');
	if(visibility==true) 		{ lelement.removeClass('no-aside-files'); return; }
	if(visibility==false) 		{ lelement.addClass('no-aside-files'); return; }	
	DEBUG.log("DISPLAY","file_info bad parameter");
}

//****************************************************************
//Gère la visibilité des filtres avancés *************************
//****************************************************************	

var DISPLAY_is_visible_filters = function is_visible_filters()
{
	return !$('body').hasClass('no-aside-filters');
}

var DISPLAY_filters = function display_filters(visibility = undefined)
{
	let lelement=$('body');
	if(visibility==true) 		{ lelement.removeClass('no-aside-filters'); return; }
	if(visibility==false) 		{ lelement.addClass('no-aside-filters'); return; }	
	DEBUG.log("DISPLAY","fiters bad parameter");
}

//****************************************************************
//Gère l'affichage en plein écran ********************************
//****************************************************************	

var DISPLAY_is_visible_full_screen = function is_visible_full_screen()
{
	return !$('main section#fullscreen').hasClass('hidden');
}

var DISPLAY_full_screen = function display_full_screen(visibility = undefined)
{
	//let lelement1=$('div#mainmenu');
	//let lelement2=$('div#searchmenu');
	
	if(visibility==true) 		
	{ 
		$('main section.'+GRID.section_active).addClass('hidden');
		$('main section#fullscreen').removeClass('hidden');
		DEBUG.log("DISPLAY","full_screen: openned (show)");
		$('nav#main').addClass('hidden');
		//lelement1.addClass('hidden');
		//lelement2.addClass('hidden');
		return; 
	}
	
	if(visibility==false) 		
	{ 
		$('main section.'+GRID.section_active).removeClass('hidden');
		$('main section#fullscreen').addClass('hidden');
		$('nav#main').removeClass('hidden');
			
		DEBUG.log("DISPLAY","full_screen: closed (hide)");		
		return; 
		
	}	
	DEBUG.log("DISPLAY","full_screen bad parameter");
}

var IS_VISIBLE_menu = function is_visible_menu(object)
{
	return !object.hasClass("ux-hidden-zindex");
}

//****************************************************************
//Gère l'affichage du menu fixe interactif en bas à gauche *******
//****************************************************************	

var DISPLAY_menu = function display_menu(object=undefined, visibility=undefined)
{
	if(Object==null)
	{
		object=$('nav#status div');
	}
	
	if(visibility==true && object!=undefined)
	{
		object.removeClass("ux-hidden-zindex");	
		object.removeClass("ux-hidden-opacity");
		return;
	}
	
	if(visibility==false && object!=undefined)
	{
		object.addClass("ux-hidden-opacity");
		
		if(object!=null)
		{
			setTimeout(function() 
			{ 
				object.addClass("ux-hidden-zindex");

				//restaure tag
				$('span#tag').html('new_label');
				$('span#tag').removeClass('green');
				
			}, 500);
			return;
		}
	}	

	DEBUG.log("DISPLAY","menu bad parameter");	
}

//****************************************************************
//Initialise les champ d'édition mono ou multifichier ************
//****************************************************************	

var DISPLAY_fileinfo_init = function fileinfo_init(multiselectionreset=true)
{
	//multiple edit ux display reset
	$('h3 span.solver').addClass('hidden');

	if(multiselectionreset)
	{
		$('div.informations').removeClass('hidden');
		$('div#actions').removeClass('hidden');
		$('aside#infocontent h3').removeClass('conflict');
	}
	else
	{
		$('div.informations').addClass('hidden');
		$('div#actions').addClass('hidden');
	}
	//edit-cancel ux display reset
	$('aside#infocontent h3 input, h3 select').addClass('hidden');
	$('aside#infocontent h4.edit_ux button.save').addClass('hidden');
	$('aside#infocontent h4.edit_ux button.cancel').addClass('hidden');
	$('aside#infocontent h4.edit_ux button.edit').removeClass('hidden');
	$('aside#infocontent h3 span.unedit').removeClass('hidden');	
}

//****************************************************************
//Gère l'affichage lors de la sélection des photos ***************
//****************************************************************	

var DISPLAY_selection = function selection(id_current=null,refreshfullscreen=false)
{
	DEBUG.log("DISPLAY","selection switch selection of element",id_current);
	
	if(id_current!=null) {
	
		//Manage grid selection

		if(refreshfullscreen==false) 
		{
			$('div#'+GRID.section_active+'_'+id_current).toggleClass('selected notselected');
		}
		
		//Manage fullscreen selection
		
		if($('div#'+GRID.section_active+'_'+id_current).hasClass('selected'))
		{
			$('section#fullscreen').addClass('selected');
			$('section#fullscreen div.button-selection').addClass('selected');
			$('section#fullscreen div.button-selection').removeClass('notselected');
		}
		else
		{
			$('section#fullscreen').removeClass('selected');
			$('section#fullscreen div.button-selection').addClass('notselected');
			$('section#fullscreen div.button-selection').removeClass('selected');
		}
	}
	
	//****************************************************************
	//Affiche le menu si on sélectionne deux photos ou plus **********
	//****************************************************************
	
	let selected_ids = $('.element.selected').map(function() {
		return this.id;
	}).get();
	
	let loaded_files=selected_ids.length;

	if(loaded_files<=1 || DISPLAY_is_visible_full_screen()) 
	{	
		$('.elementscnt').html("1 element");
		DISPLAY_menu($('#select-status'), false);	
		
		if(!DISPLAY_is_visible_full_screen()) DISPLAY_file_info(false);
	}
	else
	{ 
		$('.elementscnt').html(loaded_files+" elements");
		DISPLAY_menu($('#select-status'), true);
	}
}

//****************************************************************
//Gère l'affichage de confirmation/annulation corbeille **********
//****************************************************************

var DISPLAY_trash = function trash(display)
{
	if(display==true)
	{
		DISPLAY_menu($('div#select-trash'),true); 
		$('main section.'+GRID.section_active+' div.selected').addClass('delete'); 
	}
	else
	{		
		DISPLAY_menu($('div#select-trash'),false); 
		$('main section.'+GRID.section_active+' div.selected').removeClass('delete');
	}
}