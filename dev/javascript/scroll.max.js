//****************************************************************
//Variables globales *********************************************
//****************************************************************	

//****************************************************************
//Variables locales **********************************************
//****************************************************************	

grid_data=[];

$(document).ready(function(){

	//****************************************************************
	// *************
	//****************************************************************	
});

window.SCROLL_CallBack_load = function(data_array)
{
	grid_data = [...data_array];
}

window.SCROLL_Load_Scroll_Bar= function Load_Scroll_Bar()
{
	
	let grid_width = SCROLL_get_grid_width();
	let total_lignes = 0;
	let total_dates = 0;
	
	$.each(grid_data, function(id,data)
	{
		let increment;
		let nbphoto = 0;
		let nbligne = 1;
		
		$.each(data.orientations.split(',').reverse(), function(id_, data_)
		{
			if(data_==1) 	increment=1;
			else			increment=3;
			
			nbphoto+=increment;
			
			if(nbphoto>grid_width)
			{
				nbligne++;
				total_lignes++;
				nbphoto=increment;
			}
			
		});
		
		total_dates++;

	});
		
	let total_height_px =(48*total_dates)*(total_lignes*225);

	DEBUG.log("SCROLLBAR",total_lignes,total_dates,total_height_px);	
	
}

window.SCROLL_get_grid_width = function get_grid_width()
{
	elements = $('main section.' + GRID.section_active + ' div.element');
	let height=null;
	let total = 0;
	
	$(elements).each(function() {

		let position = this.offsetTop;

		//DEBUG.log("SCROLLBAR",$(this).attr('id'),position);

		if(height==null || height==position)
		{
			height=position;
			total+=parseInt($(this).css('grid-column').replace('span ',''));
		}
		else
		{
			return false;
		}
	});	
	
	return total;
}