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

var g_loadinfoview = function loadinfoview(lform = "")
{	
	if($('div#infocontent').hasClass("displayinfo"))
	{	
		let hash = $('div#maincontent img, div#maincontent video').attr('src').split('-').pop();
		
		get('actions/filelist.php?hash='+hash+'&lform='+lform);
	}
}

var g_loadinfoview_data = function loadinfoview_data(data)
{
	let lform = data.lform;
	let hash = data.hash;
	let datas = data.info[0];

	$('input.filehash').val(hash);
	
	if(lform !=="")
	{
		$('div#infocontent h3.ux-'+lform).find('input, select').hide();
		$('div#infocontent h4.'+lform).find('button.save, button.cancel').hide();
		$('div#infocontent h3.ux-'+lform+' span').show();				
		$('div#infocontent h4.'+lform+' button.edit').show();
	}

	if(datas.file_type==1) $('h2 span#file_type').html('video_file');
	else  $('h2 span#file_type').html('photo');
	
	$('h3#file_original_name span').html(datas.file_original_name);
	$('h3#file_size span').html(formatBytes(datas.file_size));	
	
	if(datas.time_taken_at=="00000000+0000000000")
	{
		$('h3#time_taken_at span').html("Unknown");
		$('h3.ux-time select').val('+0000');
	}
	else
	{
		$('h3#time_taken_at span').html(formatDateTime(datas.time_taken_at,'display'));
		$('h3.ux-time input').val(formatDateTime(datas.time_taken_at,'input'));
		$('h3.ux-time select').val(formatDateTime(datas.time_taken_at,'timezone'));
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
}

$(document).ready(function(){

	$('aside#fullscreen_picture div.button-info').on('click.infoViewInfo', function() {
		
		$('aside#fullscreen_picture div#infocontent').toggleClass('displayinfo');
		$('aside#fullscreen_picture div.button-rightarrow').toggleClass('displayinfo');
		
		g_loadinfoview();
	});

	$('aside#fullscreen_picture div#infocontent h4.button-exif').on('click.exifInfo', function() {
		
		$('aside#fullscreen_picture div#infocontent h3#exif').toggle();
		if($('aside#fullscreen_picture div#infocontent h3#exif').is(':visible')) {
			$('aside#fullscreen_picture div#infocontent h4.button-exif div span.material-symbols-outlined').html("collapse_all");  }
		else {
			$('aside#fullscreen_picture div#infocontent h4.button-exif div span.material-symbols-outlined').html("expand_all");}
	});
	
	$('aside#fullscreen_picture div#infocontent h4.edit_ux').find('button.edit, button.cancel').on('click.infoViewEdit', function() {
				
		$(this).parent().children().toggle();
		
		let data=$(this).parent().attr('data-form');
		
		$('aside#fullscreen_picture h3.ux-'+data+' input, h3.ux-'+data+' select, h3.ux-'+data+' span').toggle();
	});	
});