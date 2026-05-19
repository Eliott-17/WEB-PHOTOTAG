//***********************************************
//Gère l'affichage des informations des fichiers
//en lot (bouton tag)
//***********************************************

var g_data_mem=null;
var g_data=null;

$(document).ready(function(){

	$('nav').on('click', 'div#select-status div.selection', function() { g_unselect_all(); });		

	$('nav').on('click', 'div#select-status span#tag', function()
	{	
		if(!$('body').hasClass("no-aside") && $('main section#maincontent').hasClass("hidden"))
		{
			$('body').toggleClass("no-aside");
		}
		else
		{
			if($('body').hasClass("no-aside"))
			{
				$('body').toggleClass("no-aside");
			}

			if(!$('main section#maincontent').hasClass("hidden"))
			{
				$('main section').toggleClass("hidden");
			}				
		}
		
		g_multiple_files_set_display();
	});
});

var g_multiple_files_set_display = function multiple_files_set_display()
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
	
	$('.fileshash').val(JSON.stringify(hash_array));
	
	g_multiple_files_load_data();
}


var g_multiple_files_load_data = function multiple_files_load_data()
{
	g_get_new_token($('#fileinfopost'));
}

var g_multiple_files_load_data_CallBack = function multiple_files_load_data_CallBack(data)
{	
	console.log("Data",data);
	
	g_data = structuredClone(data);
	g_data_mem = structuredClone(data['flag']);
	
	g_multiple_files_display_data();
	//g_load_untag();//enlever les élements de la grille
}

var g_multiple_files_display_data = function multiple_files_display_data()
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
			
			$('aside#infocontent h3#'+key+' span.material-symbols-outlined').addClass('conflict');
			$('aside#infocontent h3#'+key+' span.unedit').html("{ Different values }");
		}	
		else
		{
			$('aside#infocontent h3#'+key+' span.material-symbols-outlined').removeClass('conflict');
			if(key=="continent" || key=="country") 
			{
				$('aside#infocontent h3#'+key+' select').val(g_data['mem'][key]);
				$('aside#infocontent h3#'+key+' span.unedit').html($('h3#'+key+' option:selected').text());
			}
			else 
			{
				$('aside#infocontent h3#'+key+' input').val(g_data['mem'][key]);
				$('aside#infocontent h3#'+key+' span.undedit').val(g_data['mem'][key]);
			}
		}
	});

	$('#conflictedit').val(JSON.stringify(g_data['flag']));
	$('#totalsize').val(formatBytes(g_data['total_size']));
	
	//show_file_list();
}
