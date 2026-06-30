
$(document).ready(function()
{
	$('aside#advancedfilters').on('click.enterClearAll', 'button', function(e) {

		let check=-1;
		let html = $(this).find("span.material-symbols-outlined").html();
		
		if(html=='check_box')
		{
			console.log("Check all");
			check=true;
		}
			
		if(html=='check_box_outline_blank')
		{
			console.log("Uncheck all");
			check=false;
		}
		
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
			console.log("Check all",target_elements);
			check=true;
		}
			
		if($(this).html()=='check_box_outline_blank')
		{
			//console.log("Uncheck all",target_elements);
			check=false;
		}
		
		if(check!=-1)
		{	
			$('aside#advancedfilters h3.'+target_elements+' div.value input[type="checkbox"]').each(function (index, element) {
				
			//console.log("set",check);
			if($(element).prop('disabled')==false)	$(element).prop('checked',check);  
			
			});

			FILTERS_checkbox_post();			
		}										
	});
		
	$('aside#advancedfilters').on('click.inputFilters', 'div.value input[type="checkbox"]', function () {

		FILTERS_checkbox_post();
					
	});
});


var FILTERS_search_CallBack = function search_CallBack(datas) 
{
	let s="";
	if(datas.count>1) s="s";
	
	$('nav span#filterresult').html(datas.count+ ' element'+s);
	
	//console.log(datas.tags);
	
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
		
		//console.log(key,value,found);
			
	});
	
	console.log("FILTERS_search_CallBack");
}

var FILTERS_checkbox_post = function checkbox_post()
{
	var data = {};

	$('aside#advancedfilters h3 div.value input[type="checkbox"]').each(function (index, element) {
		
		$('input#filters_activated').val($(element).id);
		
		if($(element).prop('checked')==false)
		{
			 var name = $(this).attr('name');
				var value = $(this).val();

				if (!data[name]) {
					data[name] = [];
				}

				data[name].push(value);
		}
	});
	
	$('input#filters_exclude').val(JSON.stringify(data));
	
	FILEMULTISELECTION_unselectall();
	
	$('main').scrollTop(0);
	
	SECTIONS[vSECTION_active].offset=0;
	SECTIONS[vSECTION_active].taglist=2;
	SECTIONS[vSECTION_active].update=true;

	GRID_load();
}