//***********************************************
//Gère l'affichage des informations des fichiers
//en lot (bouton tag)
//***********************************************

var vFILEINFOMULTISELECTION_mem=null;
var g_data_mem=null;
var g_data=null;

$(document).ready(function(){

	$('nav').on('click', 'div#select-status span#delete', function() 		{	g_ux_menu_display($('div#select-status'),false); g_ux_menu_display($('div#select-trash'),true); $('main section.grid div.selected').addClass('delete'); });
	$('nav').on('click', 'div#select-trash span#delete_cancel', function() 	{	g_ux_menu_display($('div#select-trash'),false); g_ux_menu_display($('div#select-status'),true); $('main section.grid div.selected').removeClass('delete'); });
	$('nav').on('click', 'div#select-trash span#delete_confirm', function() {	console.log("todo"); });

	$('nav').on('click', 'div#select-status div.selection', function() 		{	g_unselect_all(); });		
	$('nav').on('click', 'div#select-status span#tag', function() {

		if(DISPLAY_is_visible_file_info())
		{
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

var g_conflict_solver_display = function conflict_solver_display(data,obj)
{
	if (obj.hasClass('edit')) {
		$('h3.ux-'+data+'.conflict span.solver').removeClass('hidden');
		$('h3.ux-'+data+'.conflict span.unedit').addClass('hidden');
    }

    if (obj.hasClass('cancel')) {
		$('h3.ux-'+data+'.conflict input, h3.ux-'+data+'.conflict select').addClass('hidden');
		$('h3.ux-'+data+'.conflict span.solver').addClass('hidden');
		$('h3.ux-'+data+'.conflict span.unedit').removeClass('hidden');
		
		$('h3.ux-' + data).each(function() {

			g_data['flag'][$(this).attr('id')]=g_data_mem['flag'][$(this).attr('id')];
			$('input.conflictedit').val(JSON.stringify(g_data['flag']));
			
		});
    };
}


//
var FILEMULTISELECTION_load = function load()
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
	if(vFILEINFOMULTISELECTION_mem!=hash_array) 
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
				$('aside#infocontent h3#'+key+' input').val("");
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
	
	console.log('FILEMULTISELECTION_CallBack_load',g_data);
}

var g_success_save_multiple_selection = function succes_save_muliple_selection()
{
	$('main section.grid div.selected').addClass("transition-on");
	$('main section.grid div.selected').addClass("success");
	
	setTimeout(function() { 
		
		$('main section.grid div.selected').removeClass("success"); 
		
		setTimeout(function() { 
		
			$('main section.grid div.selected').removeClass("transition-on"); 
		
		}, 500);
		
		
	}, 500);
}