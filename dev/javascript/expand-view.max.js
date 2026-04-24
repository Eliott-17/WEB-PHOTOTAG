
var current_id;
var max_id;
var lockleft=0;
var lockright=0;

$(document).on('keydown', function(e) {
    if (e.which === 37) { if(!lockleft) LeftArrow(); /*37 = flèche gauche*/ }
    if (e.which === 39) { if(!lockright) RightArrow(); /*39 = flèche droite*/ }
    if (e.which === 32) { Select(); /*37 = espace*/ }
});

$(document).ready(function(){

	$('aside#fullscreen_picture div.button-return').on('click.gridSelect', function() {
		g_fullscreen(-1);
		$('nav div#mainmenu').show();
	});

	$('aside#fullscreen_picture').on('click.gridLeftAR', 'div.button-leftarrow', function() { LeftArrow(); });			
	$('aside#fullscreen_picture').on('click.gridRightAR', 'div.button-rightarrow', function() { RightArrow(); });
	$('aside#fullscreen_picture').on('click.gridUnselect', 'div.button-selection', function() { Select(); });
});

g_fullscreen = function fullscreen(id, max)
{
	$('aside#fullscreen_picture').toggleClass('fullscreen');
	$('body').toggleClass('fullscreen');
	
	//console.log("open "+id+" to "+max);

	max_id=parseInt(max);
	current_id=parseInt(id);
	
	console.log(current_id);
	
	arrow_hide(current_id, max_id);
	fullscreen_is_selected(current_id);
	
	if($('aside#fullscreen_picture').hasClass('fullscreen'))
	{
		arrow_hide(current_id, max_id);
	}
		
}

function LeftArrow()
{
	current_id--;

	if ($('div#'+current_id).length)
	{
		$('aside#fullscreen_picture img').attr("src",$('div#'+current_id+" img").attr('src').replace('sd','hd'));
		g_loadinfoview();
	}

	arrow_hide(current_id, max_id);
	fullscreen_is_selected(current_id);	
}

function RightArrow()
{
	current_id++;
	
	if ($('div#'+current_id).length)
	{
		$('aside#fullscreen_picture img').attr("src",$('div#'+current_id+" img").attr('src').replace('sd','hd'));
		g_loadinfoview();
	}

	arrow_hide(current_id, max_id);
	fullscreen_is_selected(current_id);	
}

function Select()
{
	$('div#'+current_id).toggleClass('selected notselected');
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
		if($('div#'+current_id).hasClass('selected'))
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