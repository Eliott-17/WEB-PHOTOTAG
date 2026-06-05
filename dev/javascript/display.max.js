$(document).ready(function()
{ 
	DISPLAY_view=0;
	DISPLAY_view_mem=0;
});

var DISPLAY_set_view = function view_refresh(newview)
{		
	switch(newview)
	{
		case "grid":
		
			DISPLAY_full_screen(false);
			DISPLAY_file_info(false);
		
		break;
		case "grid-fileinfo":
		
			DISPLAY_full_screen(false);
			DISPLAY_file_info(true);
			
			FILEMULTISELECTION_load();
					
		break;
		case "fullscreen":	
		
			DISPLAY_full_screen(true);
			DISPLAY_file_info(false);
		
		break;
		case "fullscreen-fileinfo":

			DISPLAY_full_screen(true);
			DISPLAY_file_info(true);
			
			FILEINFO_load();
			
		break;
	
	}

	console.log("DISPLAY_set_view",newview,"loaded");
}

var DISPLAY_is_visible_file_info = function is_visible_file_info()
{
	return !$('body').hasClass('no-aside');
}

var DISPLAY_file_info = function display_aside(visibility = undefined)
{
	let lelement=$('body');
	if(visibility==undefined)  	{ lelement.toggleClass('no-aside'); return; }
	if(visibility==true) 		{ lelement.removeClass('no-aside'); return; }
	if(visibility==false) 		{ lelement.addClass('no-aside'); return; }	
	console.log("DISPLAY_file_info bad parameter");
}

var DISPLAY_is_visible_full_screen = function is_visible_full_screen()
{
	return !$('main section#fullscreen').hasClass('hidden');
}

var DISPLAY_full_screen = function display_full_screen(visibility = undefined)
{
	let lelement=$('nav');
	
	if(visibility==undefined)  	
	{ 
		$('main section').toggleClass('hidden'); 
		lelement.toggleClass('hidden');
		return; 
	}
	if(visibility==true) 		
	{ 
		$('main section.grid').addClass('hidden');
		$('main section#fullscreen').removeClass('hidden');
		lelement.addClass('hidden');
		return; 
	}
	if(visibility==false) 		
	{ 
		$('main section.grid').removeClass('hidden');
		$('main section#fullscreen').addClass('hidden');
		lelement.removeClass('hidden');		
		return; 
		
	}	
	console.log("DISPLAY_full_screen bad parameter");
}

var IS_VISIBLE_menu = function is_visible_menu(object)
{
	return !object.hasClass("ux-hidden-zindex");
}

var DISPLAY_menu = function display_menu(object=undefined, visibility=undefined)
{
	if(visibility==true && object!=undefined)
	{
		object.removeClass("ux-hidden-zindex");	
		object.removeClass("ux-hidden-opacity");
		return;
	}
	
	if(visibility==false && object!=undefined)
	{
		object.addClass("ux-hidden-opacity");
		
		setTimeout(function() { object.addClass("ux-hidden-zindex"); }, 500);
		return;
	}	

	console.log("DISPLAY_menu bad parameter");	
}

var DISPLAY_fileinfo_init = function fileinfo_init(multiselectionreset=true)
{
	//multiple edit ux display reset
	$('h3 span.solver').addClass('hidden');

	if(multiselectionreset)
	{
		$('div#informations').removeClass('hidden');
		$('aside#infocontent h3').removeClass('conflict');
	}
	else
	{
		$('div#informations').addClass('hidden');
	}
	//edit-cancel ux display reset
	$('aside#infocontent h3 input, h3 select').addClass('hidden');
	$('aside#infocontent h4.edit_ux button.save').addClass('hidden');
	$('aside#infocontent h4.edit_ux button.cancel').addClass('hidden');
	$('aside#infocontent h4.edit_ux button.edit').removeClass('hidden');
	$('aside#infocontent h3 span.unedit').removeClass('hidden');	
}


var DISPLAY_selection = function selection(vFILEOPEN_currentid,refreshfullscreen=false)
{
	//Manage grid selection

	if(refreshfullscreen==false) 
	{
		$('div#grid_'+vFILEOPEN_currentid).toggleClass('selected notselected');
		console.log("DISPLAY_selection switch selection of element",vFILEOPEN_currentid);
	}
	
	//Manage fullscreen selection
	
	if($('div#grid_'+vFILEOPEN_currentid).hasClass('selected'))
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