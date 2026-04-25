
var g_data_mem;
var g_data;
var g_clicked=0;

$(document).ready(function(){

	$('nav').on('click', 'div#select-status span#tag', function() { g_fullscreen_edit(); });

	$('aside#fullscreen_edit h3 button').on('click.ConflictSolver', function() {
		
		let id = $(this).parent().attr('id');

		$('aside#fullscreen_edit h3#'+id+' button').hide();
		$('aside#fullscreen_edit h3#'+id+' select').show();
		$('aside#fullscreen_edit h3#'+id+' input').show();
		$('aside#fullscreen_edit h4 button.cancel').show();
		
		g_data['flag'][id.replace('_edit','')]=0;		
		$('#conflictedit').val(JSON.stringify(g_data['flag']));
	});
	
	$('aside#fullscreen_edit h3 span.cursor').on('click.ConflictSolver', function() {
	
		let id = $(this).parent().attr('id');
		
		let icon = $('aside#fullscreen_edit h3#'+id).children().html();
		let selector = "input";
		if(id=="continent_edit" || id=="country_edit") selector = "select";			
		let title = $('aside#fullscreen_edit h3#'+id+' '+selector).attr('placeholder');

		$('aside#fullscreen_edit #conflict-icon').html(icon);
		$('aside#fullscreen_edit #conflict-title').html(title+' conflict solver');	
		$(this).html("visibility_lock");
		$(this).removeClass("cursor");
		
		console.log('aside#fullscreen_edit h3#'+id+' span.cursor');
	
		$('aside#fullscreen_edit #filelist').html("");

		$.each(g_data['filedata'], function(index, value) {
			
			$('aside#fullscreen_edit #filelist').append("<div>"+index+"</div><div>"+value[id.replace('_edit','')]+"</div>");			
		});
	});

	$('aside#fullscreen_edit h4 button.cancel').on('click.CancelSolver', function() {
		
		g_data['flag']=structuredClone(g_data_mem);
		g_refresh_conflict();
		$(this).hide();
		g_hide_conflict();
		
	});
	
	$('aside#fullscreen_edit h3 span.cursor').hover(
    function() {
		
		$(this).html("visibility");
    },
    function() {
       $(this).html("visibility_off");
    }
);
		
});

var g_fullscreen_edit = function fullscreen_edit()
{
	$('aside#fullscreen_edit').toggleClass('fullscreen');
	$('body').toggleClass('fullscreen');
	$('#tag').toggleClass('fullscreen');
	
	if($('aside#fullscreen_edit').hasClass('fullscreen'))
	{	
		//$('#filelist').html("");
		
		var hash_array=[];

		$('main div.grid div.element').each(function () 
		{ 
			if($(this).hasClass('selected')) 
			{ 

				let hash=$(this).find("img").attr('src').split('-').pop().replace('.webp','');
				let id=$(this).find("img").attr('data-id')

				//$('#filelist').append('<option value="'+id+'">'+id+':'+hash+'</option>');
				
				hash_array.push(id);
			}
		});
		
		$('.fileshash').val(JSON.stringify(hash_array));
		
		g_load_data_edit();
	}
}

var g_load_data_edit = function load_data_edit()
{
	g_get_new_token($('#fileinfopost'));
}
	
var g_edit_treat_data = function edit_treat_data(data)
{	
	g_data = structuredClone(data);
	g_data_mem = structuredClone(data['flag']);
	
	g_refresh_conflict();
}

var g_hide_conflict = function hide_conflict()
{
	$('aside#fullscreen_edit #conflict-icon').html("");
	$('aside#fullscreen_edit #conflict-title').html("");	
	$('aside#fullscreen_edit #filelist').html("");	
	g_clicked=0;	
}

var g_refresh_conflict = function refresh_conflict()
{
	$('aside#fullscreen_edit h3').removeClass('conflict');
	
	$('aside#fullscreen_edit h3 span.cursor').hide();
	
	console.log(g_data);
	
	$.each(g_data['flag'], function(key, value)
	{
		if(value!=0) //conflict
		{
			$('aside#fullscreen_edit h3#'+key+'_edit').addClass('conflict');
			$('aside#fullscreen_edit h3#'+key+'_edit button').show();
			$('aside#fullscreen_edit h3#'+key+'_edit span.cursor').show();
			if(key=="continent" || key=="country") $('aside#fullscreen_edit h3#'+key+'_edit select').hide();
			else $('aside#fullscreen_edit h3#'+key+'_edit input').hide();
		}	
		else
		{
			if(key=="continent" || key=="country") $('aside#fullscreen_edit h3#'+key+'_edit select').val(g_data['mem'][key]);
			else $('aside#fullscreen_edit h3#'+key+'_edit input').val(g_data['mem'][key]);
		}
	});

	$('#conflictedit').val(JSON.stringify(g_data['flag']));
	$('#totalsize').val(formatBytes(g_data['total_size']));
	
	$('aside#fullscreen_edit h4 button.cancel').hide();
}