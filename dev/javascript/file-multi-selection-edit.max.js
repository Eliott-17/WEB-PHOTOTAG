//***********************************************
//Gère l'affichage des informations des fichiers
//en lot (bouton tag)
//***********************************************

var vFILEINFOMULTISELECTION_FLAG_SAVED=false;
var vFILEINFOMULTISELECTION_mem=null;
var g_data_mem=null;
var g_data=null;

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

		$('main section.grid div.element').each(function () 
		{ 
			if($(this).hasClass('delete')) 
			{ 
				let id=parseInt($(this).find("div.media-container").attr('data-id'));

				hash_array.push(id);
			}
		});
		
		hash_array = hash_array.map(Number);
		
		//si la tableu est vide, on recherche une sélection en plain écran
		
		if(hash_array.length==0)
		{
			hash_array.push(parseInt($('section#fullscreen div.media').attr('data-id')));
		}
		
		//si la tableau est toujours vide, la sélection n'existe plus

		if(hash_array.length==0)
		{
			console.error("Error trash selection"); //ce message n'est jamais censé arrivé
			return;
		}
				
		$('input.filesid').val(JSON.stringify(hash_array));
		
		CORE_post($('#filetrash'));
		
	});

	$('nav').on('click', 'div#select-status div.selection', function() {

		$('main div.element').each(function () { if ($(this).hasClass('selected')) $(this).toggleClass('selected notselected');	});
		DISPLAY_menu($('#select-status'),false);
		
		if(vFILEINFOMULTISELECTION_FLAG_SAVED==true)
		{
			GRID_load(true);
			vFILEINFOMULTISELECTION_FLAG_SAVED=false;
		}
		
		$('span#tag').html('new_label');
		$('span#tag').removeClass('green');
			
		DISPLAY_set_view("grid");
		
	});	
	
	$('nav').on('click', 'div#select-status span#tag', function() {

		if(DISPLAY_is_visible_file_info())
		{
			if(vFILEINFOMULTISELECTION_FLAG_SAVED==true)
			{
				GRID_load(true);
				vFILEINFOMULTISELECTION_FLAG_SAVED=false;
			}

			$('span#tag').html('new_label');
			$('span#tag').removeClass('green');
			
			DISPLAY_set_view("grid");
		}
		else
		{
			DISPLAY_set_view("grid-fileinfo");
		}
		
	});
	
	$('aside#infocontent h3 span.solver').on('click.solver', function() {
		
		let data=$(this).parent().attr('id');

		g_data['flag'][data]=0; //update
		$('input.conflictedit').val(JSON.stringify(g_data['flag']));

		$('aside#infocontent h3#'+data+'.conflict input, h3#'+data+'.conflict select, h3#'+data+'.conflict span.solver').toggleClass('hidden');
	
		console.log(g_data['flag']);
	});
		
});

var FILEMULTISELECTION_load = function load(force_reload=false)
{
	var hash_array=[];

	$('main section.grid div.element').each(function () 
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
		console.log('FILEMULTISELECTION_load => NO data update, require two files selected');
	}
	else if(JSON.stringify(vFILEINFOMULTISELECTION_mem)!==JSON.stringify(hash_array) || force_reload) 
	{		
		$('input.filesid').val(JSON.stringify(hash_array));
		
		CORE_post($('#fileinfopost'));
		
		vFILEINFOMULTISELECTION_mem=hash_array;
		vFILEINFO_load_mem=null; //forcer le rechargement des data en sélection simple
		
		console.log('FILEMULTISELECTION_load => data update request');
	}
	else
	{
		console.log('FILEMULTISELECTION_load => NO data update, unchanged selection');
	}
}

var FILEMULTISELECTION_CallBack_load = function CallBack_load(ldata)
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
			
			$('aside#infocontent h3#'+key).addClass('conflict');
			$('aside#infocontent h3#'+key+' span.unedit').html("{ Different values }");
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
	$('input.conflictedit').val(JSON.stringify(g_data['flag']));
	
	console.log('FILEMULTISELECTION_CallBack_load');
}

var FILEMULTISELECTION_CallBack_success = function CallBack_success()
{
	$('main section.grid div.selected').addClass("transition-on");
	$('main section.grid div.selected').addClass("success");
	
	setTimeout(function() { 
		
		$('main section.grid div.selected').removeClass("success"); 
		
		setTimeout(function() { 
		
			$('main section.grid div.selected').removeClass("transition-on"); 
		
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
	GRID_load(true,true);
}