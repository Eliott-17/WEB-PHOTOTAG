//****************************************************************
//Variables globales *********************************************
//****************************************************************	

//****************************************************************
//Variables locales **********************************************
//****************************************************************	

let grid_data=[];
let grid_clean;
let scroll_position_mem=0;
let scroll_position_tot=0;
let scroll_total_height_px;

$(document).ready(function(){

	//****************************************************************
	// *************
	//****************************************************************	
});

window.SCROLL_CallBack_load = function(data_array)
{
	scroll_position_mem=0;
	scroll_position_tot=0;
	grid_data = [...data_array];
}

window.SCROLL_Load_Scroll_Bar= function Load_Scroll_Bar()
{
	
	let grid_width = SCROLL_get_grid_width();
	let total_lignes = 0;
	let total_dates = 0;
	let first=null;
	
	grid_clean=[];
	
	(grid_clean[0] ??= {}).lines = 0;
	
	$.each(grid_data, function(id,data)
	{
		let increment;
		let nbphoto = 0;
		let nbligne = 1;
		let htmldate;

		//replace the date format
		
		let l_date_display = data.date.substring(6,8) + "/" + data.date.substring(4,6) + "/" + data.date.substring(0,4);	
			
		if(l_date_display=="00/00/0000")  	htmldate="Undated";
		else 								htmldate=formatDateLocale(l_date_display);

		//calculate the number of line
		
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
		
		if(first==null) first=htmldate;
		
		(grid_clean[id] ??= {}).date = htmldate;

		if((id+1)<grid_data.length) (grid_clean[id+1] ??= {}).lines = (nbligne*225)+48+grid_clean[id].lines;
		else
		{
			(grid_clean[id+1] ??= {}).date = "bottom";
			(grid_clean[id+1] ??= {}).lines = (nbligne*225)+48+grid_clean[id].lines;
		}

		total_dates++;	

	});

	total_lignes+=total_dates;
		
	scroll_total_height_px =(48*total_dates)+(total_lignes*225);

	DEBUG.log("SCROLLBAR",total_lignes,total_dates,scroll_total_height_px,grid_clean);	
	
}

window.SCROLL_set_cursor = function set_cursor()
{
	let position = $('main').scrollTop();

	scroll_position_tot+=(position-scroll_position_mem);
	
	scroll_position_mem=position;
	
	console.log(scroll_position_tot);
	
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