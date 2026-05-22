//***********************************************
//Gère l'affichage des informations des fichiers
//***********************************************

$(document).ready(function(){

	$('section#maincontent div.button-info').on('click.infoViewInfo', function() {
		
		$('body').toggleClass('no-aside');

		g_file_load_infos();
	});

	$('aside#infocontent h4.button-exif').on('click.exifInfo', function() {
		
		$('aside#infocontent h3#exif').toggle();
		if($('aside#infocontent h3#exif').is(':visible')) {
			$('aside#infocontent h4.button-exif div span.material-symbols-outlined').html("collapse_all");  }
		else {
			$('aside#infocontent h4.button-exif div span.material-symbols-outlined').html("expand_all");}
	});
	
	$('aside#infocontent h4.edit_ux').find('button.edit, button.cancel').on('click.infoViewEdit', function() {
				
		$(this).parent().children().toggle();
		
		let data=$(this).parent().attr('data-form');
		
		$('aside#infocontent h3.ux-'+data+':not(.conflict) input, h3.ux-'+data+':not(.conflict) select, h3.ux-'+data+':not(.conflict) span.unedit').toggle();
		
		g_conflict_solver_display(data,$(this));
		
	});	
});

var g_file_load_infos = function loadinfoview(lform = "")
{	
	if(!$('body').hasClass("no-aside"))
	{	
		$("#infocontent :where(input,select)").hide();

		let hash = $('section#maincontent div.media img, section#maincontent div.media video').attr('src').split('-').pop();
		
		get('actions/file-load-infos.php?hash='+hash+'&lform='+lform);
	}
}

var g_file_load_info_CallBack = function file_load_info_CallBack(data)
{
	let lform = data.lform;
	let hash = data.hash;
	let datas = data.info[0];

	$('input.filehash').val(hash);
	
	if(lform !=="")
	{
		$('aside#infocontent h3.ux-'+lform).find('input, select').hide();
		$('aside#infocontent h4.'+lform).find('button.save, button.cancel').hide();
		$('aside#infocontent h3.ux-'+lform+' span').show();				
		$('aside#infocontent h4.'+lform+' button.edit').show();
	}

	if(datas.file_type==1) 	$('h2#file_type span.material-symbols-outlined').html('video_file');
	else  					$('h2#file_type span.material-symbols-outlined').html('photo');
	
	$('h2#file_type span.title').html('File');
	
	$('h3#file_original_name span').html(datas.file_original_name);
	$('h3#file_original_name').show();
	
	$('h3#file_size span').html(formatBytes(datas.file_size));	
	
	if(datas.time_taken_at=="00000000+0000000000")
	{
		$('h3#date span.unedit').html('Unknown');
		$('h3#time span.unedit').html('Unknown');
		$('h3#zone span.unedit').html('Unknown');
	}
	else
	{
		$('h3#date input').val(formatDateTime(datas.time_taken_at,'input-date'));
		$('h3#time input').val(formatDateTime(datas.time_taken_at,'input-time'));
		$('h3#zone select').val(formatDateTime(datas.time_taken_at,'input-zone').replace('UTC',''));
		
		console.log(formatDateTime(datas.time_taken_at,'output-date'));
		
		$('h3#date span.unedit').html(formatDateTime(datas.time_taken_at,'output-date'));
		$('h3#time span.unedit').html(formatDateTime(datas.time_taken_at,'output-time'));
		$('h3#zone span.unedit').html(formatDateTime(datas.time_taken_at,'output-zone'));
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
	
	$('span#time_added_at').html(formatUTCToLocalWithTimezone(datas.time_added_at));
	
	if (datas.time_status == null) 		$('h3#other span.unedit').html("");
	else 							
	{
		$('span#time_status').html(formatUTCToLocalWithTimezone(datas.time_status));					
	}
	
	//reset from multiple

	$('div#informations').show();
	$('h3 span.solver').hide();
	$('aside#infocontent h3').removeClass('conflict');
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