//***********************************************
//Gère l'affichage des informations des fichiers
//en lot (bouton tag)
//***********************************************

var g_data_mem=null;
var g_data=null;

$(document).ready(function(){

	$('nav').on('click', 'div#select-status div.selection', function() { g_unselect_all(); });		
	$('nav').on('click', 'div#select-status span#tag', function() {	g_multiple_selection_manage_display() });
	
	$('aside#infocontent h3 span.solver').on('click.solver', function() {
		
		let data=$(this).parent().attr('id');
		
		//console.log(data);
		
		$('aside#infocontent h3#'+data+'.conflict input, h3#'+data+'.conflict select, h3#'+data+'.conflict span.solver').toggle();
	});
	
});

var g_conflict_solver_display = function conflict_solver_display(data,obj)
{
	if (obj.hasClass('edit')) {
		$('h3.ux-'+data+'.conflict span.solver').show();
		$('h3.ux-'+data+'.conflict span.unedit').hide();
    }

    if (obj.hasClass('cancel')) {
		$('h3.ux-'+data+'.conflict input, h3.ux-'+data+'.conflict select').hide();
		$('h3.ux-'+data+'.conflict span.solver').hide();
		$('h3.ux-'+data+'.conflict span.unedit').show();
    }	
}

var g_multiple_selection_manage_display = function g_multiple_selection_manage_display()
{
	if(is_multi_selection_displayed())
	{
		//si on est déjà en multi-sélection, on ferme le aside

		$('body').addClass("no-aside");
	}
	else
	{			
		if($('body').hasClass("no-aside"))
		{
			$('body').removeClass("no-aside");
		}

		if(!$('main section#maincontent').hasClass("hidden"))
		{
			//si on était en fullscreen
			
			$('main section').toggleClass("hidden");
		}

		g_multiple_selection_load_data();			
	}
}

var g_multiple_selection_load_data = function multiple_selection_load_data()
{
	if(is_multi_selection_displayed() && flag_selection_has_changed==1) //uniquement si le menu multi-selection est ouvert et qu'on à changé la sélection
	{	
		flag_selection_has_changed=0; //raz du flag
	
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
		
		$('.fileshash').val(JSON.stringify(hash_array));
		
		$("#infocontent :where(input,select)").hide();
		g_get_new_token($('#fileinfopost'));
	}
}

var g_multiple_selection_load_data_CallBack = function multiple_selection_load_data_CallBack(data)
{	
	console.log("Data",data);
	
	g_data = structuredClone(data);
	g_data_mem = structuredClone(data['flag']);
	
	g_multiple_selection_display_data();
}

var g_multiple_selection_display_data = function multiple_selection_display_data()
{
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
			
			console.log("Set "+key+" to Different values");
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
				$('aside#infocontent h3#'+key+' input').val(formatDateTime(g_data['mem'][key],'input-date'));
				$('aside#infocontent h3#'+key+' span.unedit').html(formatDateTime(g_data['mem'][key],'output-date'));
			}
			else if(key=="time")
			{
				$('aside#infocontent h3#'+key+' input').val(formatDateTime(g_data['mem'][key],'input-time'));
				$('aside#infocontent h3#'+key+' span.unedit').html(formatDateTime(g_data['mem'][key],'output-time'));
			}			
			else if(key=="zone")
			{
				$('aside#infocontent h3#'+key+' input').val(formatDateTime(g_data['mem'][key],'input-date'));
				$('aside#infocontent h3#'+key+' span.unedit').html(formatDateTime(g_data['mem'][key],'output-zone'));
			}
			else
			{
				$('aside#infocontent h3#'+key+' input').val(g_data['mem'][key]);
				$('aside#infocontent h3#'+key+' span.unedit').html(g_data['mem'][key]);
			}
			
			console.log("Set'aside#infocontent h3#"+key+" span.unedit' to "+g_data['mem'][key]);
		}
		
	});

	$('h2#file_type span.material-symbols-outlined').html('files');
	$('h2#file_type span.title').html('Multiple files selection');
	$('div#informations').hide();
	
	$('#conflictedit').val(JSON.stringify(g_data['flag']));
	$('h3#file_size span').html(formatBytes(g_data['total_size']));
	$('h3#file_original_name').hide();
	
	$('h3 span.solver').hide();
	
	//show_file_list();
}

//cet fonction permet de savoir si on est en l'édition multi-selection

function is_multi_selection_displayed()
{
	return !$('body').hasClass("no-aside") && $('main section#maincontent').hasClass("hidden");
}
