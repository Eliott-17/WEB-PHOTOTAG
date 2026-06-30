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
		GRID_load();
		$('main').scrollTop(vGRID_scrollmem);		
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
		FILEOPENFULLSCREEN_Loadmedia(vFILEOPEN_currentid);
		ArrowDisplay(vFILEOPEN_currentid, max_id);
		DISPLAY_selection(vFILEOPEN_currentid,true);

		if(DISPLAY_is_visible_file_info()) FILEINFO_load();			
	}
}

function Select()
{
	if(!DISPLAY_is_visible_full_screen()) return;

	DISPLAY_selection(vFILEOPEN_currentid);		

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

var FILEOPENFULLSCREEN_Loadmedia = function LoadMedia(id)
{	
	let file_type = $('div#'+vSECTION_active+'_'+id+' div.media-container').attr("data-type");
	let file_hash = $('div#'+vSECTION_active+'_'+id+' div.media-container').attr("data-src");
	let media_id =  $('div#'+vSECTION_active+'_'+id+' div.media-container').attr("data-id");
	
	$('section#fullscreen div.media').attr('data-id',media_id);
		
	if(file_type == 0) $('section#fullscreen div.media').html('<img src="hd-'+file_hash+'" loading="lazy">');
	if(file_type == 1) $('section#fullscreen div.media').html('<video src="hd-'+file_hash+'" poster="sd-'+file_hash+'" controls autoplay muted preload="auto" playsinline></video>');	

	console.log(media_id, file_hash);
}