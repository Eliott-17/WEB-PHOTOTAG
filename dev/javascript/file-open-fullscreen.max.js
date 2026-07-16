//****************************************************************
//Variables globales *********************************************
//****************************************************************	

let FILEOPENFULLSCREEN = {
	id_current:0,
	id_max:0
}

//****************************************************************
//Variables locales **********************************************
//****************************************************************	

let lockleft=0;
let lockright=0;

//***********************************************
//Gère l'affichage en plein écran
//***********************************************

$(document).on('keydown.fullscreen', function(e) {
 
	const tag = e.target.tagName;
	
    if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        e.target.isContentEditable
    ) {
        return;
    }
	
	if(!DISPLAY_is_visible_full_screen()) return;
	
	if (e.which === 37)	{ if(!lockleft) Arrow(0); 		/*37 = flèche gauche*/  }
	if (e.which === 39) { if(!lockright) Arrow(1); 		/*39 = flèche droite*/  }
	if (e.which === 32) { Select(); 					/*37 = espace*/ 		}
	if (e.which === 27)	 { DISPLAY_set_view('grid');	/*27 = echap*/ 			}

});

$(document).ready(function(){

	$('section#fullscreen div.button-return').on('click.gridSelect', function() {
		
		let fsid=$('section#fullscreen div.media').attr('data-id');
		$('div#media_'+fsid).parent().addClass('memselected');
		
		DISPLAY_set_view("grid");
		DISPLAY_menu($('#flush-trash'), false);
		GRID_load("click.gridSelect");
		$('main').scrollTop(GRID.scroll_mem);	

		$('main section#fullscreen div.button-info').removeClass("error");		
	});

	$('section#fullscreen').on('click.gridLeftAR', 'div.button-leftarrow', function() { Arrow(0); });			
	$('section#fullscreen').on('click.gridRightAR', 'div.button-rightarrow', function() { Arrow(1); });
	$('section#fullscreen').on('click.gridUnselect', 'div.button-selection', function() { Select(); });
});

function Arrow(sens)
{
	if(!DISPLAY_is_visible_full_screen()) return;
	
	if(sens==0) FILEOPENFULLSCREEN.id_current--;
	if(sens==1) FILEOPENFULLSCREEN.id_current++;
	
	if(sens==0 || sens==1)
	{	
		FILEOPENFULLSCREEN_Loadmedia(FILEOPENFULLSCREEN.id_current);
		ArrowDisplay(FILEOPENFULLSCREEN.id_current, FILEOPENFULLSCREEN.id_max);
		DISPLAY_selection(FILEOPENFULLSCREEN.id_current,true);

		if(DISPLAY_is_visible_file_info()) FILEINFO_CallBack_load();			
	}
}

function Select()
{
	if(!DISPLAY_is_visible_full_screen()) return;

	DISPLAY_selection(FILEOPENFULLSCREEN.id_current);		

	if(!DISPLAY_is_visible_file_info() || DISPLAY_is_visible_full_screen()) return;
					
	FILEMULTISELECTION_CallBack_load(); //mettre à jour la sélection si on affiche le multifile sans full screen
}

function ArrowDisplay(current_id, max_id)
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

var FILEOPENFULLSCREEN_Loadmedia = function LoadMedia(id)
{	
	let file_type = $('div#'+GRID.section_active+'_'+id+' div.media-container').attr("data-type");
	let file_hash = $('div#'+GRID.section_active+'_'+id+' div.media-container').attr("data-src");
	let media_id =  $('div#'+GRID.section_active+'_'+id+' div.media-container').attr("data-id");
	
	$('section#fullscreen div.media').attr('data-id',media_id);
	
	$('section#fullscreen div.media img').off("error.imgfullscreen");
	$('section#fullscreen div.media img').on("error.imgfullscreen", function (e) {
		console.log(e);
	});
		
	if(file_type == 0) $('section#fullscreen div.media').html('<img src="hd-'+file_hash+'" loading="lazy">');
	if(file_type == 1) $('section#fullscreen div.media').html('<video src="hd-'+file_hash+'" poster="sd-'+file_hash+'" controls autoplay muted preload="auto" playsinline></video>');	

}

var FILEOPENFULLSCREEN_Loadmedia = function LoadMedia(id)
{
    let file_type = $('div#'+GRID.section_active+'_'+id+' div.media-container').attr("data-type");
    let file_hash = $('div#'+GRID.section_active+'_'+id+' div.media-container').attr("data-src");
    let media_id = $('div#'+GRID.section_active+'_'+id+' div.media-container').attr("data-id");

    let container = $('section#fullscreen div.media');

    container.attr('data-id', media_id);

    container.empty();

    if (file_type == 0) {

        let img = $('<img>', {
            loading: 'lazy'
        });

        img.on("error.imgfullscreen", function(e) {
            console.log("Erreur image", this.src);
			
			img.attr('src', img.attr('src').replace('hd','sd'));
			
			$('main section#fullscreen div.button-info').addClass("error");
        });

        img.attr('src', 'hd-' + file_hash);

        container.append(img);

    }

	if (file_type == 1) {

		let video = $('<video>', {
			controls: true,
			autoplay: true,
			muted: true,
			preload: 'auto',
			playsinline: true,
			poster: 'sd-' + file_hash
		});

		video.on("loadedmetadata", function () {

			if (this.videoWidth === 0 || this.videoHeight === 0) $('main section#fullscreen div.button-info').addClass("error");
			
		});
		
		video.on("error.videofullscreen", function(e) {

			$('main section#fullscreen div.button-info').addClass("error");

		});

		video.attr('src', 'hd-' + file_hash);

		container.append(video);
	}
}