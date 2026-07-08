//***********************************************
//Gère l'affichage des informations des fichiers
//en lot (bouton tag)
//***********************************************

let vFILEINFOMULTISELECTION_FLAG_SAVED=false;
let vFILEINFOMULTISELECTION_mem=null;
let g_data_mem=null;
let g_data=null;

let FILEMULTISELECTION_debug = false;

$(document).ready(function(){

	$('nav').on('click', 'div#select-status span#delete', function() 		{	
	
		DISPLAY_menu($('div#select-status'),false); 
		DISPLAY_trash(true);
	});
	
	$('nav').on('click', 'div#select-trash span#delete_cancel', function() 	{
	
		DISPLAY_trash(false);
		DISPLAY_selection();
	});
	
	$('nav').on('click', 'div#select-trash span#delete_confirm', function() {
		
		var hash_array=[];

		$('main section.'+vSECTION_active+' div.element').each(function () 
		{ 
			if($(this).hasClass('delete')) 
			{ 
				$(this).remove();
		
				let id=parseInt($(this).find("div.media-container").attr('data-id'));

				hash_array.push(id);
			}
		});
		
		hash_array = hash_array.map(Number);
		
		//si la tableu est vide, on recherche une sélection en plain écran
		
		if(hash_array.length==0)
		{
			let id=$('section#fullscreen div.media').attr('data-id');
			
			$('#media_'+id).parent().remove();
			
			hash_array.push(id);
		}
		
		//si la tableau est toujours vide, la sélection n'existe plus

		if(hash_array.length==0)
		{
			console.error("Error trash selection"); //ce message n'est jamais censé arrivé
			return;
		}
				
		$('input.filesid').val(JSON.stringify(hash_array));
		
		DISPLAY_trash(false);
		
		CORE_post($('#filetrash'));
		
	});

	$('nav').on('click', 'div#select-status div.deselectall', function() {

		//$('main div.element').each(function () { if ($(this).hasClass('selected')) $(this).toggleClass('selected notselected');	});
		FILEMULTISELECTION_unselectall();	

		DISPLAY_menu($('#select-status'),false);			
		DISPLAY_set_view("grid");
		
	});	
	
	$('nav').on('click', 'div#select-status span#tag', function() {

		if(DISPLAY_is_visible_file_info())
		{
			DISPLAY_set_view("grid");
		}
		else
		{
			DISPLAY_set_view("grid-fileinfo");
		}
		
		GRID_load(); //recharger la grille si on à changer des photos
		
	});
	
	$('aside#infocontent h3 span.solver').on('click.solver', function() {
		
		let data=$(this).parent().attr('id');

		g_data['flag'][data]=0; //update
		$('input.conflictedit').val(JSON.stringify(g_data['flag']));

		$('aside#infocontent h3#'+data+'.conflict input, h3#'+data+'.conflict select, h3#'+data+'.conflict span.solver').toggleClass('hidden');
	
	});
		
});

var FILEMULTISELECTION_unselectall = function unselect_all()
{
	$('main div.element').removeClass('selected');
	$('main div.element').addClass('notselected');
	
	//gestion du cas particulier ou on à un offset > 0 par défilement mais qu'on doit forcer le rafraishissement compplet à la désélection
	if(vSECTION_active=="untagged") 
	{
		vNAV_FLAG_UPLOAD=true; 
	}
	
	GRID_load(); //recharger la grille si on à changer des photos	
}

var FILEMULTISELECTION_load = function load(force_reload=false)
{
	var hash_array=[];

	$('main section.'+vSECTION_active+' div.element').each(function () 
	{ 
		if($(this).hasClass('selected')) 
		{ 
			let id=$(this).find("div.media-container").attr('data-id');

			hash_array.push(id);
		}
	});
	
	hash_array = hash_array.map(Number);
		
	if(hash_array.length<=1)
	{
		if(FILEMULTISELECTION_debug) console.log('FILEMULTISELECTION_load => NO data update, require two files selected');
	}
	else if(JSON.stringify(vFILEINFOMULTISELECTION_mem)!==JSON.stringify(hash_array) || force_reload) 
	{		
		$('input.filesid').val(JSON.stringify(hash_array));
		
		CORE_post($('#fileinfopost'));
		
		vFILEINFOMULTISELECTION_mem=hash_array;
		vFILEINFO_load_mem=null; //forcer le rechargement des data en sélection simple
		
		if(FILEMULTISELECTION_debug) console.log('FILEMULTISELECTION_load => data update request');
	}
	else
	{
		if(FILEMULTISELECTION_debug) console.log('FILEMULTISELECTION_load => NO data update, unchanged selection');
	}
}

var FILEMULTISELECTION_load_CallBack = function load(ldata)
{
	g_data = structuredClone(ldata);	
	g_data_mem = structuredClone(ldata);	
	
	$.each(g_data['flag'], function(key, value)
	{
		if(value!=0) //conflict
		{
			if(key=="continent" || key=="country") 
			{
				$('aside#infocontent h3#'+key+' select').val(null);
			}
			else 
			{
				if(key=="time") $('aside#infocontent h3#'+key+' input').val("00:00:00");
				else if(key=="date") $('aside#infocontent h3#'+key+' input').val("1900-01-01");
				else if(key=="zone") $('aside#infocontent h3#'+key+' input').val("+0000");
				else $('aside#infocontent h3#'+key+' input').val("");
			}
			
			if(key=="file_is_private")
			{		
				$('aside#infocontent h3.lockconflict').removeClass('hidden');
				$('div.privacy_mode_locked').removeClass("hidden");
				$('div.privacy_mode_unlocked').removeClass("hidden");	
			}
			else
			{
				$('aside#infocontent h3#'+key).addClass('conflict');
				$('aside#infocontent h3#'+key+' span.unedit').html("{ Different values }");
			}
		}	
		else
		{
			$('aside#infocontent h3#'+key).removeClass('conflict');
			
			if(key=="continent" || key=="country") 
			{
				$('aside#infocontent h3#'+key+' select').val(g_data['mem'][key]);
				$('aside#infocontent h3#'+key+' span.unedit').html($('h3#'+key+' option:selected').text());
			}
			else if(key=="date")
			{	
				$('aside#infocontent h3#'+key+' input').val(formatDateTime(g_data['mem'][key]+'+0000000000','input-date'));
				$('aside#infocontent h3#'+key+' span.unedit').html(formatDateTime(g_data['mem'][key]+'+0000000000','output-date'));
			}
			else if(key=="time")
			{
				$('aside#infocontent h3#'+key+' input').val(formatDateTime('00000000+0000'+g_data['mem'][key],'input-time'));
				$('aside#infocontent h3#'+key+' span.unedit').html(formatDateTime('00000000+0000'+g_data['mem'][key],'output-time'));
			}			
			else if(key=="zone")
			{
				$('aside#infocontent h3#'+key+' input').val(formatDateTime('00000000'+g_data['mem'][key]+'000000','input-date'));
				$('aside#infocontent h3#'+key+' span.unedit').html(formatDateTime('00000000'+g_data['mem'][key]+'000000','output-zone'));
			}
			else if(key=="file_is_private")
			{
				$('aside#infocontent h3.lockconflict').addClass('hidden');				
				FILEINFO_lock_CallBack(g_data['mem'][key]);
			}
			else
			{
				$('aside#infocontent h3#'+key+' input').val(g_data['mem'][key]);
				$('aside#infocontent h3#'+key+' span.unedit').html(g_data['mem'][key]);
			}
		}
		
	});
	
	DISPLAY_fileinfo_init(false);

	$('h2#file_type span.material-symbols-outlined').html('files');
	$('h2#file_type span.title').html('Multiple files selection');
	$('h3#file_size span').html(formatBytes(g_data['total_size']));
	$('h3#file_original_name').addClass('hidden');
	$('h3.ux-tag-location.gps').addClass('hidden');
	$('h3.privacy_mode').removeClass('hidden');
	$('input.conflictedit').val(JSON.stringify(g_data['flag']));
	
	if(CALLBACK_debug) console.log('FILEMULTISELECTION_load_CallBack');
}

var FILEMULTISELECTION_CallBack_success = function CallBack_success()
{
	$('main section.'+vSECTION_active+' div.selected').addClass("transition-on");
	$('main section.'+vSECTION_active+' div.selected').addClass("success");
	
	setTimeout(function() { 
		
		$('main section.'+vSECTION_active+' div.selected').removeClass("success"); 
		
		setTimeout(function() { 
		
			$('main section.'+vSECTION_active+' div.selected').removeClass("transition-on"); 
		
		}, 500);
		
		
	}, 500);
	
	$('span#tag').html('refresh');
	$('span#tag').addClass('green');	
	vFILEINFOMULTISELECTION_FLAG_SAVED=true;
}

var FILEMULTISELECTION_reset_ux = function reset_ux(obj, data)
{
	if (obj.hasClass('edit')) 
	{
		$('h3.ux-'+data+'.conflict span.solver').removeClass('hidden');
		$('h3.ux-'+data+'.conflict span.unedit').addClass('hidden');
	}

	if (obj.hasClass('cancel')) 
	{
		$('h3.ux-'+data+'.conflict input, h3.ux-'+data+'.conflict select').addClass('hidden');
		$('h3.ux-'+data+'.conflict span.solver').addClass('hidden');
		$('h3.ux-'+data+'.conflict span.unedit').removeClass('hidden');
		
		$('h3.ux-' + data).each(function() {

			g_data['flag'][$(this).attr('id')]=g_data_mem['flag'][$(this).attr('id')];
			$('input.conflictedit').val(JSON.stringify(g_data['flag']));
			
		});
	};
}

var FILEMULTISELECTION_CallBack_trash = function CallBack_trash()
{
	DISPLAY_set_view('grid');
	GRID_load_id();
}