let element_last_checked;
let search_flag_limit=false;

$(document).ready(function()
{
	$('aside#advancedfilters').on('click.enterClearAll', 'button', function(e) {

		let check=-1;
		let html = $(this).find("span.material-symbols-outlined").html();
		
		if(html=='check_box') check=true;			
		if(html=='check_box_outline_blank') check=false;
		
		if(check!=-1)
		{	
			$('aside#advancedfilters h3 div.value input[type="checkbox"]').each(function (index, element) {
			
				$(element).prop('checked',check);
				$(element).prop('disabled',false);	
			});
			
			FILTERS_checkbox_post();
		}
	});
	
	$('aside#advancedfilters').on('click.allCheck', 'h2 span.cursor', function () {
					
		let target_elements = $(this).parent().attr('id');
		let check=-1;
		
		if($(this).html()=='check_box')
		{
			check=true;
		}
			
		if($(this).html()=='check_box_outline_blank')
		{
			check=false;
		}
		
		if(check!=-1)
		{	
			$('aside#advancedfilters h3.'+target_elements+' div.value input[type="checkbox"]').each(function (index, element) {

			if($(element).prop('disabled')==false)	$(element).prop('checked',check);  
			
			});

			FILTERS_checkbox_post();			
		}										
	});
		
	$('aside#advancedfilters').on('click.inputFilters', 'div.value input[type="checkbox"]', function () {

		element_last_checked = {};
		FILTERS_checkbox_post($(this).prop('checked'));
					
	});
});


window.FILTERS_CallBack_search = function(datas) 
{
	let s="";
	if(datas.count>1) s="s";
	
	$('nav span#filterresult').html(datas.count+ ' element'+s);

	let element_check_callback=false;		

	$('aside#advancedfilters h3 div.value input[type="checkbox"]').each(function (index, element) {
		
		let key = $(element).attr('name').replace('[]','');
		let value = $(element).attr('value');
		let found=false;

		if(key=='years' || key=='months')
		{
			$.each(datas.tags[key], function(i,search) {

				if(search[0]==value) 
				{
					found=true;
					return;
				}
			});
		}
		else if(key=='tag_country')
		{			
			$.each(datas.tags[key], function(i,search) {

				if(search[1]==value) 
				{
					found=true;
					return;
				}
			});
		}
		else
		{
			if (datas.tags[key] && datas.tags[key][value] !== undefined) found=true;
		}
		
		if(found)
		{		
			$(element).prop('disabled', false);
		}
		else
		{
			if($(element).prop('checked')==true) $(element).prop('disabled', true);
		}
			
		if(datas.recheck!==undefined)
		{
			if(datas.recheck[key]!==undefined)
			{
				if(datas.recheck[key]==value)
				{
					$(element).prop('checked',true);
					
					element_check_callback=true;
				}
			}
		}
		
	});
	
	if(!search_flag_limit && element_check_callback)
	{
		search_flag_limit=true;
		FILTERS_checkbox_post();
	}
	else
	{
		search_flag_limit=false;
	}			
	
	DEBUG.log("CALLBACK","FILTERS_CallBack_search");
}

var FILTERS_checkbox_post = function checkbox_post(is_checked=null)
{
	let data = {};

	$('aside#advancedfilters h3 div.value input[type="checkbox"]').each(function (index, element) {
		
		$('input#filters_activated').val($(element).id);
				
		if($(element).prop('checked')==false)
		{
			let name = $(this).attr('name');
			let value = $(this).val();

			if(!data[name]) { data[name] = []; }

			data[name].push(value);
		}
	});
	
	if(is_checked==true)
	{
		$('input#last_checked').val(JSON.stringify(element_last_checked));
	}
	else
	{
		$('input#last_checked').val(JSON.stringify({}));
	}
	
	$('input#filters_exclude').val(JSON.stringify(data));
	
	FILEMULTISELECTION_unselectall();
	
	$
	GRID_reset("FILTERS_checkbox_post","SEARCH",2);
	GRID_load("FILTERS_checkbox_post");
}

window.FILTERS_CallBack_trash = function(count)
{
	
	$('nav#main span#filterapply').html('TRASH');	
	$('nav#main span#filterresult').html(count);
	
	DISPLAY_menu($('#flush-trash'), true);
}

window.FILTERS_CallBack_flush = function()
{	
	$('nav#main span#filterresult').html(0);
	$('section.search').html('');
	
	DISPLAY_menu($('#flush-trash'), false);
	
}
