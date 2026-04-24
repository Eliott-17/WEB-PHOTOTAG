
$(document).ready(function(){

	$('nav').on('click', 'div#select-status span#tag', function() { g_fullscreen_edit(); });
	
});

var g_fullscreen_edit = function fullscreen_edit()
{
	$('aside#fullscreen_edit').toggleClass('fullscreen');
	$('body').toggleClass('fullscreen');
	$('#tag').toggleClass('fullscreen');
	
	if($('aside#fullscreen_edit').hasClass('fullscreen'))
	{	
		$('#filelist').html("");
		
		var hash_array=[];

		$('main div.grid div.element').each(function () 
		{ 
			if($(this).hasClass('selected')) 
			{ 

				let hash=$(this).find("img").attr('src').split('-').pop().replace('.webp','');
				let id=$(this).find("img").attr('data-id')

				$('#filelist').append('<option value="'+id+'">'+id+':'+hash+'</option>');
				
				hash_array.push(id);
			}
		});
		
		$('#fileshash').val(JSON.stringify(hash_array));
		
		g_get_new_token($('#fileinfopost'));
	}
}
	
var g_edit_treat_data = function edit_treat_data(data)
{
	console.log(data);
}