//***********************************************
//Gère l'affichage en plein écran
//***********************************************

var vFILEOPEN_currentid;
var max_id;
var lockleft=0;
var lockright=0;

$(document).on('keydown', function(e) {
    if (e.which === 37) { if(!lockleft) Arrow(0); /*37 = flèche gauche*/ }
    if (e.which === 39) { if(!lockright) Arrow(1); /*39 = flèche droite*/ }
    if (e.which === 32) { Select(); /*37 = espace*/ }
});

$(document).ready(function(){

	$('section#fullscreen div.button-return').on('click.gridSelect', function() {
		DISPLAY_set_view("grid");
	});

	$('section#fullscreen').on('click.gridLeftAR', 'div.button-leftarrow', function() { Arrow(0); });			
	$('section#fullscreen').on('click.gridRightAR', 'div.button-rightarrow', function() { Arrow(1); });
	$('section#fullscreen').on('click.gridUnselect', 'div.button-selection', function() { Select(); });
});

function Arrow(sens)
{
	if(!DISPLAY_is_visible_full_screen()) return;
	
	if(sens==0) vFILEOPEN_currentid--;
	if(sens==1) vFILEOPEN_currentid++;
	
	if(sens==0 || sens==1)
	{	
		LoadMedia(vFILEOPEN_currentid);
		ArrowDisplay(vFILEOPEN_currentid, max_id);
		DISPLAY_selection(vFILEOPEN_currentid,true);

		if(DISPLAY_is_visible_file_info()) FILEINFO_load();			
	}
}

function Select()
{
	if(!DISPLAY_is_visible_full_screen()) return;

	DISPLAY_selection(vFILEOPEN_currentid);		
	g_display_menu_global_selection();			//Affiche le menu flotant - TODO

	if(!DISPLAY_is_visible_file_info() || DISPLAY_is_visible_full_screen()) return;
					
	FILEMULTISELECTION_load(); //mettre à jour la sélection si on affiche le multifile sans full screen
}

function ArrowDisplay(vFILEOPEN_currentid, max_id)
{
	if(vFILEOPEN_currentid==0)
	{
		$('div.button-leftarrow').addClass('hidden');
		lockleft=1;
	}	
	else
	{
		$('div.button-leftarrow').removeClass('hidden');
		lockleft=0;
	}

	if(vFILEOPEN_currentid==max_id)
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

function LoadMedia(id)
{	
	let file_type = $('div#grid_'+id+' div.media-container').attr("data-type");
	let file_hash = $('div#grid_'+id+' div.media-container').attr("data-src");
		
	if(file_type == 0) $('section#fullscreen div.media').html('<img src="hd-'+file_hash+'" loading="lazy">');
	if(file_type == 1) $('section#fullscreen div.media').html('<video src="hd-'+file_hash+'" poster="sd-'+file_hash+'" controls autoplay muted preload="auto" playsinline></video>></video>');	
}

//******************
//Fonction globales
//******************

var FILEOPENFULLSCREEN_set_button_fullscreen = function set_button_fullscreen()
{
	$('main').on('click.gridOpen', 'div.button-fullscreen', function() {
		
		let media_id = parseInt($(this).parent().attr('id').replace("grid_",""));
		let max = (loaded_files-1);

		vFILEOPEN_currentid=media_id;
		max_id=max;
		ArrowDisplay(media_id, max); 
		LoadMedia(media_id);
		DISPLAY_selection(vFILEOPEN_currentid,true);
		DISPLAY_set_view("fullscreen");	
	});	
}