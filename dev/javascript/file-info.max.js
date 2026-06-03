//***********************************************
//Gère l'affichage des informations des fichiers
//***********************************************

var vFILEINFO_load_mem=null;

$(document).ready(function(){

	$('section#fullscreen div.button-info').on('click.infoViewInfo', function() {

		if(DISPLAY_is_visible_file_info())
		{
			DISPLAY_set_view("fullscreen");
		}
		else
		{
			DISPLAY_set_view("fullscreen-fileinfo");
		}
	});

	$('aside#infocontent h4.button-exif').on('click.exifInfo', function() {
		
		$('aside#infocontent h3#exif').toggleClass('hidden');
		if($('aside#infocontent h3#exif').is(':visible')) {
			$('aside#infocontent h4.button-exif div span.material-symbols-outlined').html("collapse_all");  }
		else {
			$('aside#infocontent h4.button-exif div span.material-symbols-outlined').html("expand_all");}
	});
	
	$('aside#infocontent h4.edit_ux').find('button.edit, button.cancel').on('click.infoViewEdit', function() {
				
		$(this).parent().children().toggleClass('hidden');
		
		let data=$(this).parent().attr('data-form');
		
		$('aside#infocontent h3.ux-'+data+':not(.conflict) input, h3.ux-'+data+':not(.conflict) select, h3.ux-'+data+':not(.conflict) span.unedit').toggleClass('hidden');
		
		g_conflict_solver_display(data,$(this));
		
	});	
});

var FILEINFO_load = function load()
{	
	let hash = $('section#fullscreen div.media img, section#fullscreen div.media video').attr('src').split('-').pop();
		
	if(vFILEINFO_load_mem!=hash) 
	{
		CORE_get('actions/file-load-infos.php?hash='+hash+'&lform=');
		vFILEINFO_load_mem=hash;
		vFILEINFOMULTISELECTION_mem=null; //forcer le rechargement des data en sélection multiple
		console.log('FILEINFO_load => data update request');
	}
	else
	{
		console.log('FILEINFO_load => NO data update');
	}
}

var FILEINFO_CallBack_load = function CallBack_load()
{
	FILEINFO_load();
}

var FILEINFO_CallBack_data = function CallBack(data)
{
	console.log('FILEINFO_CallBack');
	
	DISPLAY_fileinfo_init();
	
	let lform = data.lform;
	let datas = data.info[0];
	
	flag_selection_has_changed=1; //pour recharger les informations si on load une photo individuellement
	$('input.filesid').val("["+data.info[0].id+"]");
	$('input.conflictedit').val('{"date":0,"time":0,"zone":0,"continent":0,"country":0,"city":0,"place":0,"activity":0,"comment":0,"people":0,"other":0}');

	if(lform !=="")
	{
		$('aside#infocontent h3.ux-'+lform).find('input, select').addClass('hidden');
		$('aside#infocontent h4.'+lform).find('button.save, button.cancel').addClass('hidden');
		$('aside#infocontent h3.ux-'+lform+' span').removeClass('hidden');				
		$('aside#infocontent h4.'+lform+' button.edit').removeClass('hidden');
	}

	if(datas.file_type==1) 	$('h2#file_type span.material-symbols-outlined').html('video_file');
	else  					$('h2#file_type span.material-symbols-outlined').html('photo');
	
	$('h2#file_type span.title').html('File');
	
	$('h3#file_original_name span').html(datas.file_original_name);
	$('h3#file_original_name').removeClass('hidden');
	
	$('h3#file_size span').html(formatBytes(datas.file_size));	
	
	let time_taken_at = datas.time_taken_at_date+datas.time_taken_at_zone+datas.time_taken_at_time;
	
	if(time_taken_at=="00000000+0000000000")
	{
		$('h3#date span.unedit').html('Unknown');
		$('h3#time span.unedit').html('Unknown');
		$('h3#zone span.unedit').html('Unknown');
	}
	else
	{		
		$('h3#date input').val(formatDateTime(time_taken_at,'input-date'));
		$('h3#time input').val(formatDateTime(time_taken_at,'input-time'));
		$('h3#zone select').val(formatDateTime(time_taken_at,'input-zone').replace('UTC',''));
		
		$('h3#date span.unedit').html(formatDateTime(time_taken_at,'output-date'));
		$('h3#time span.unedit').html(formatDateTime(time_taken_at,'output-time'));
		$('h3#zone span.unedit').html(formatDateTime(time_taken_at,'output-zone'));
	}

	$('h3#exif').html(processExif(datas.exif));
		
	// Continent
	if (datas.tag_continent == null) 	
	{
		$('h3#continent select').val("UN");
		$('h3#continent span.unedit').html("");
	}
	else 
	{	
		$('h3#continent select').val(datas.tag_continent);
		$('h3#continent span.unedit').html($('h3#continent option:selected').text());			
	}

	// Pays
	if (datas.tag_country == null) 	
	{
		$('h3#country select').val("UNK");
		$('h3#country span.unedit').html("");
	}
	else 
	{
		$('h3#country select').val(datas.tag_country);
		$('h3#country span.unedit').html($('h3#country option:selected').text());
	}

	// Ville
	if (datas.tag_city == null) 		$('h3#city span.unedit').html("");
	else 
	{
		$('h3#city span.unedit').html(datas.tag_city);
		$('h3#city input').val(datas.tag_city);
	}

	// Lieu
	if (datas.tag_place == null) 		$('h3#place span.unedit').html("");
	else 
	{
		$('h3#place span.unedit').html(datas.tag_place);
		$('h3#place input').val(datas.tag_place);
	}

	// Activité
	if (datas.tag_activity == null)		$('h3#activity span.unedit').html("");
	else 							
	{
		$('h3#activity span.unedit').html(datas.tag_activity);
		$('h3#activity input').val(datas.tag_activity);
	}
	// Commentaire
	if (datas.tag_comment == null) 		$('h3#comment span.unedit').html("");
	else 							
	{
		$('h3#comment span.unedit').html(datas.tag_comment);
		$('h3#comment input').val(datas.tag_comment);
	}
	// Personnes
	if (datas.tag_people == null) 		$('h3#people span.unedit').html("");
	else  							
	{
		$('h3#people span.unedit').html(datas.tag_people);
		$('h3#people input').val(datas.tag_people);
	}
	// Autres
	if (datas.tag_other == null) 		$('h3#other span.unedit').html("");
	else 							
	{
		$('h3#other span.unedit').html(datas.tag_other);
		$('h3#other input').val(datas.tag_other);
		
	}
	
	$('h3#time_added_at').html(formatUTCToLocalWithTimezone(datas.time_added_at));
	
	if (datas.time_modified_at == null) 	$('h3#time_modified_at').html("never");
	else 									$('h3#time_modified_at').html(formatUTCToLocalWithTimezone(datas.time_modified_at));					
}

var FILEINFO_CallBack_success = function success()
{
	$('main section#fullscreen').addClass("transition-on");
	$('main section#fullscreen').addClass("success");
	
	setTimeout(function() { 
		
		$('main section#fullscreen').removeClass("success"); 
		
		setTimeout(function() { 
		
			$('main section#fullscreen').removeClass("transition-on"); 
		
		}, 500);
		
		
	}, 500);
}

function processExif(data, indent = 0) {
        let html = '';
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'object' && value !== null) {
                // Si la valeur est un objet, on récurse
                html += `<div style="margin-left: ${indent}px;"><strong>${key}:</strong></div>`;
                html += processExif(value, indent + 20);
            } else {
                // Afficher la clé et la valeur
                html += `<div style="margin-left: ${indent}px;"><strong>${key}:</strong> ${value}</div>`;
            }
        }
        return html;
}

function formatBytes(bytes) {
    if (bytes < 1000) return bytes + " o";

    const units = ["Ko", "Mo", "Go", "To"];
    let i = -1;

    do {
        bytes = bytes / 1000;
        i++;
    } while (bytes >= 1000 && i < units.length - 1);

    return (Math.round(bytes * 10) / 10) + " " + units[i];
}