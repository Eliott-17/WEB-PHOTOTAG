//***********************************************
//Gère l'affichage des informations des fichiers
//individuels (bouton ouvrir en grand)
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

	$('aside#fullscreen_picture div.button-return').on('click.gridSelect', function() {
		g_fullscreen(-1);
		$('nav div#mainmenu').show();
	});

	$('aside#fullscreen_picture').on('click.gridLeftAR', 'div.button-leftarrow', function() { Arrow(0); });			
	$('aside#fullscreen_picture').on('click.gridRightAR', 'div.button-rightarrow', function() { Arrow(1); });
	$('aside#fullscreen_picture').on('click.gridUnselect', 'div.button-selection', function() { Select(); });
});

g_fullscreen = function fullscreen(id, max)
{
	$('aside#fullscreen_picture').toggleClass('fullscreen');
	$('body').toggleClass('fullscreen');
	
	current_id=id;
	max_id=max;
	arrow_hide(id, max); 
	fullscreen_is_selected(id);
	
	/*if($('aside#fullscreen_picture').hasClass('fullscreen'))
	{
		arrow_hide(current_id, max);
	}*/
}

function Arrow(sens)
{
	if(sens==0) current_id--;
	if(sens==1) current_id++;
	
	if(sens==0 || sens==1)
	{	
		g_load_media(current_id);
		arrow_hide(current_id, max_id);
		fullscreen_is_selected(current_id);	
	}
}

function Select()
{
	$('div#grid_'+current_id).toggleClass('selected notselected');
	fullscreen_is_selected(current_id);
	g_display_global_selection();	
}

function arrow_hide(current_id, max_id)
{
	if(current_id==0)
	{
		$('div.button-leftarrow').hide();
		lockleft=1;
	}	
	else
	{
		$('div.button-leftarrow').show();
		lockleft=0;
	}

	if(current_id==max_id)
	{
		$('div.button-rightarrow').hide();
		lockright=1;
	}
	else
	{
		$('div.button-rightarrow').show();
		lockright=0;
	}
}

function fullscreen_is_selected(current_id)
{
	if($('aside#fullscreen_picture').hasClass('fullscreen'))
	{	
		if($('div#grid_'+current_id).hasClass('selected'))
		{
			$('aside#fullscreen_picture').addClass('selected');
			$('aside#fullscreen_picture div.button-selection').addClass('selected');
			$('aside#fullscreen_picture div.button-selection').removeClass('notselected');
		}
		else
		{
			$('aside#fullscreen_picture').removeClass('selected');
			$('aside#fullscreen_picture div.button-selection').addClass('notselected');
			$('aside#fullscreen_picture div.button-selection').removeClass('selected');
		}
	}
}