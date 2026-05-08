
var g_data_mem=null;
var g_data=null;
var clicked=0;
var mode=0;
var mode_mem=0;
var last_open=0;

$(document).ready(function(){

	$('nav').on('click', 'div#select-status span#tag', function()
	{
		g_fullscreen_edit();
		last_open=1;		
	});

	$('nav').on('click', 'div#select-status span#delete', function() 
	{
		last_open=2;
		
		$(this).addClass("delete");
		$('nav div#select-status').fadeOut(300);

		if(!$('aside#fullscreen_edit').hasClass('fullscreen'))
		{	
			mode=1;
			mode_mem=1;
			
			g_fullscreen_edit();	
		}
		else
		{
			mode=0;
			mode_mem=0;
			g_trash_display();
		}
	
		console.log('clicked:',mode);
		
	});

	$('aside#fullscreen_edit').on('mouseenter', 'div#filelist div.fake-link', function() 
	{
		$("div#conflict-quicklook").html($("div#"+$(this).attr('data-id')).html());
		$('aside#fullscreen_edit div#editcontent form').hide();
		$('div#conflict-quicklook').show();
	})
	.on('mouseleave', 'div#filelist div.fake-link', function() {
		
		if(last_open==1) $('aside#fullscreen_edit div#editcontent form#editform').show();
		if(last_open==2) $('aside#fullscreen_edit div#editcontent form#trashform').show();
		
		$('div#conflict-quicklook').hide();
	});
	
	$('aside#fullscreen_edit h3 button').on('click.ConflictSolver', function() {

		last_open=1;
		
		if(clicked==1) g_cancel_conflict();
		
		clicked=1;
		
		let id = $(this).parent().attr('id');
		
		//display fields

		$('aside#fullscreen_edit h3#'+id+' button').hide();
		$('aside#fullscreen_edit h3#'+id+' select').show();
		$('aside#fullscreen_edit h3#'+id+' input').show();
		$('aside#fullscreen_edit h4 button.cancel').show();
		
		g_data['flag'][id.replace('_edit','')]=0;		
		$('#conflictedit').val(JSON.stringify(g_data['flag']));

		//open conflict
		
		let icon = $('aside#fullscreen_edit h3#'+id).children().html();
		let selector = "input";
		if(id=="continent_edit" || id=="country_edit") selector = "select";			
		let title = $('aside#fullscreen_edit h3#'+id+' '+selector).attr('placeholder');

		$('aside#fullscreen_edit #conflict-icon').html(icon);
		$('aside#fullscreen_edit #conflict-title').html(title+' conflict solver');	
		$('aside#fullscreen_edit #filelist').html("");
		$('aside#fullscreen_edit #conflict-info').show();
		$('aside#fullscreen_edit #conflict-info span:not(.material-symbols-outlined)').html('Saving will overwrite '+title+' for all selected.');

		show_file_list(id);
		
	});

	$('aside#fullscreen_edit h4 button.cancel').on('click.CancelSolver', function() {
		
		g_cancel_conflict();
		$('nav div#select-status span#delete').removeClass('delete');	
		$('nav div#select-status').fadeIn(300);

		if($(this).hasClass('cancel') && mode_mem==1) g_fullscreen_edit();
	});	
});

var g_fullscreen_edit = function fullscreen_edit()
{
	$('aside#fullscreen_edit').toggleClass('fullscreen');
	$('body').toggleClass('fullscreen');
	$('#tag').toggleClass('fullscreen');
	
	if($('aside#fullscreen_edit').hasClass('fullscreen'))
	{	
		$('nav div#mainmenu').hide();

		if($('aside#fullscreen_picture').hasClass('fullscreen'))
		{
			g_fullscreen(-1);
			/*$('nav div#mainmenu').show();*/
		}

		var hash_array=[];

		$('main div.element').each(function () 
		{ 
			if($(this).hasClass('selected')) 
			{ 

				//let hash=$(this).find("media-container").attr('data-src');
				let id=$(this).find("div.media-container").attr('data-id');

				hash_array.push(id);
			}
		});
		
		hash_array = hash_array.map(Number);
		
		$('.fileshash').val(JSON.stringify(hash_array));
		
		g_load_data_edit();
	}
	else
	{
		$('nav div#mainmenu').show();
	}
}

var g_load_data_edit = function load_data_edit()
{
	g_get_new_token($('#fileinfopost'));
}
	
var g_edit_treat_data = function edit_treat_data(data)
{	
	//console.log("Data",data);
	
	g_data = structuredClone(data);
	g_data_mem = structuredClone(data['flag']);
	
	g_refresh_conflict();
	//g_load_untag();//enlever les élements de la grille
}

var g_hide_conflict = function hide_conflict()
{
	$('aside#fullscreen_edit #conflict-icon').html("");
	$('aside#fullscreen_edit #conflict-title').html("");	
	$('aside#fullscreen_edit #filelist').html("");	
}

var g_cancel_conflict = function cancel_conflict()
{
	g_data['flag']=structuredClone(g_data_mem);
	g_refresh_conflict();
	$(this).hide();
	g_hide_conflict();
	clicked=0;
}

var g_trash_display = function trash_display()
{
	$('aside#fullscreen_edit form#editform').hide();
	$('aside#fullscreen_edit form#trashform').show();
	$('aside#fullscreen_edit #conflict-info').show();
	$('aside#fullscreen_edit h4 button.cancel').show();
	show_file_list();
}

var g_refresh_conflict = function refresh_conflict()
{
	$('aside#fullscreen_edit h3').removeClass('conflict');
	
	$('aside#fullscreen_edit h3 input:not(#totalsize)').hide();
	$('aside#fullscreen_edit h3 select').hide();
	$('aside#fullscreen_edit h3 button').hide();
	$('aside#fullscreen_edit h3 span.cursor').hide();
	$('aside#fullscreen_edit #conflict-info').hide();
	$('aside#fullscreen_edit form#trashform').hide();
	$('aside#fullscreen_edit form#editform').hide();

	if(mode==1) 
	{
		g_trash_display();
		mode=0;
	}
	else
	{
		$('aside#fullscreen_edit h4 button.cancel').hide();
		$('aside#fullscreen_edit form#editform').show();
	}
	
	$.each(g_data['flag'], function(key, value)
	{
		if(value!=0) //conflict
		{
			$('aside#fullscreen_edit h3#'+key+'_edit').addClass('conflict');
			$('aside#fullscreen_edit h3#'+key+'_edit button').show();
			$('aside#fullscreen_edit h3#'+key+'_edit span.cursor').show();
		}	
		else
		{
			if(key=="continent" || key=="country") 
			{
				$('aside#fullscreen_edit h3#'+key+'_edit select').val(g_data['mem'][key]);
				$('aside#fullscreen_edit h3#'+key+'_edit select').show();
			}
			else 
			{
				$('aside#fullscreen_edit h3#'+key+'_edit input').val(g_data['mem'][key]);
				$('aside#fullscreen_edit h3#'+key+'_edit input').show();
			}
		}
	});

	$('#conflictedit').val(JSON.stringify(g_data['flag']));
	$('#totalsize').val(formatBytes(g_data['total_size']));
}

function show_file_list(id=null)
{
	$('aside#fullscreen_edit #filelist').html('');
	
	$.each(g_data['filedata'], function(index, value) {
						
		$('aside#fullscreen_edit #filelist').append('<div class="fake-link" data-id="media_'+value['id']+'">'+index+'</div>');
		//if(id!=null) $('aside#fullscreen_edit #filelist').append('<div>'+value[id.replace('_edit','')]+'</div>');
	
	});
}