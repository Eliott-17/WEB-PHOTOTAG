//***********************************************
//Gère l'affichage en plein écran
//***********************************************

var current_id;
var max_id;
var lockleft=0;
var lockright=0;

$(document).on('keydown', function(e) {
    if (e.which === 37) { if(!lockleft) Arrow(0); /*37 = flèche gauche*/ }
    if (e.which === 39) { if(!lockright) Arrow(1); /*39 = flèche droite*/ }
    if (e.which === 32) { Select(); /*37 = espace*/ }
});

$(document).ready(function(){

	$('section#maincontent div.button-return').on('click.gridSelect', function() {
		g_fullscreen(-1);
	});

	$('section#maincontent').on('click.gridLeftAR', 'div.button-leftarrow', function() { Arrow(0); });			
	$('section#maincontent').on('click.gridRightAR', 'div.button-rightarrow', function() { Arrow(1); });
	$('section#maincontent').on('click.gridUnselect', 'div.button-selection', function() { Select(); });
});

g_fullscreen = function fullscreen(id, max)
{
	$('main section').toggleClass('hidden');

	if(!$('body').hasClass("no-aside"))
	{	
		$('body').toggleClass("no-aside");
	}
	
	if(id==-1) $('nav div#mainmenu').removeClass('hidden');
	
	current_id=id;
	max_id=max;
	arrow_hide(id, max); 
	g_ux_init(id);
}

function Arrow(sens)
{
	if(sens==0) current_id--;
	if(sens==1) current_id++;
	
	if((sens==0 || sens==1) && !is_multi_selection_displayed())
	{	
		g_load_media(current_id);
		arrow_hide(current_id, max_id);
		fullscreen_is_selected(current_id);	
		//g_ux_init_edit();
	}
}

function Select()
{
	if(!is_multi_selection_displayed())
	{
		$('div#grid_'+current_id).toggleClass('selected notselected');
		fullscreen_is_selected(current_id);
		g_display_menu_global_selection();	
		flag_selection_has_changed=1; //on set le flag
		g_multiple_selection_load_data(); //mettre à jour les informations si on est en multiple file selection
	}
}

function arrow_hide(current_id, max_id)
{
	if(current_id==0)
	{
		$('div.button-leftarrow').addClass('hidden');
		lockleft=1;
	}	
	else
	{
		$('div.button-leftarrow').removeClass('hidden');
		lockleft=0;
	}

	if(current_id==max_id)
	{
		$('div.button-rightarrow').addClass('hidden');
		lockright=1;
	}
	else
	{
		$('div.button-rightarrow').removeClass('hidden');
		lockright=0;
	}
}

function fullscreen_is_selected(current_id)
{
	if($('div#grid_'+current_id).hasClass('selected'))
	{
		$('section#maincontent').addClass('selected');
		$('section#maincontent div.button-selection').addClass('selected');
		$('section#maincontent div.button-selection').removeClass('notselected');
	}
	else
	{
		$('section#maincontent').removeClass('selected');
		$('section#maincontent div.button-selection').addClass('notselected');
		$('section#maincontent div.button-selection').removeClass('selected');
	}
}