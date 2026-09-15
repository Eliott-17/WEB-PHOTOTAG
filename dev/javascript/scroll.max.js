//****************************************************************
//Variables globales *********************************************
//****************************************************************	

let SCROLL_flag_loaded=false;

//****************************************************************
//Variables locales **********************************************
//****************************************************************	

let grid_data=[];
let grid_clean;
let total_height;
let total_lignes;
let offset=0;

$(document).ready(function(){

	//****************************************************************
	// *************
	//****************************************************************	
});

window.SCROLL_CallBack_load = function(data_array)
{
	SCROLL_flag_loaded=false;
	grid_data = [...data_array];
}

window.SCROLL_Load_Scroll_Bar= function Load_Scroll_Bar()
{
	SCROLL_flag_loaded=true;
	
	let grid_width = SCROLL_get_grid_width();
	let total_dates = 0;
	
	total_lignes = 0;	
	total_height = 0;

	grid_clean=[];
	
	$.each(grid_data, function(id,data)
	{
		let counter = 0;
		let countlines = 1;
		let increment;
		let elements=0;

		let datas = data.orientations.split(',').reverse();

		$.each(datas, function(id_, data_) {

				elements++;
				
				let increment = (data_ == 1) ? 1 : 3;

				if (counter > 0 && counter + increment > grid_width) {
					countlines++;
					counter = 0;
				}

				counter += increment;

				if (counter == grid_width) {
					countlines++;
					counter = 0;
				}
			//}
		});

		if (counter == 0) {
			countlines--;
		}
				
		total_lignes+=countlines;
		
		(grid_clean[id] ??= {}).date = data.date;
		(grid_clean[id] ??= {}).lines = countlines;
		(grid_clean[id] ??= {}).elements = elements;
		(grid_clean[id] ??= {}).height = (countlines*225);
		if(countlines!=0) (grid_clean[id] ??= {}).height+=48;

		total_height+=(grid_clean[id] ??= {}).height;
		total_dates++;

	});
	
	//total_lignes+=total_dates;

	DEBUG.log("SCROLLBAR","INIT",total_lignes,total_dates,total_height,grid_clean);	
}

window.SCROLL_Load_Offsets = function Load_Offsets()
{

	let grid_width = SCROLL_get_grid_width();
	let ignore=Math.abs(GRID_OFFSETS[GRID.section_active].addedTOP);
	let total_lignes_offset=0;

	$.each(grid_data, function(id,data)
	{
		let counter = 0;
		let countlines = 1;
		let increment;
		let elements=0;
		
		grid_clean[id].offset=0;

		let datas = data.orientations.split(',').reverse();

		$.each(datas, function(id_, data_) {

			if(ignore>0) ignore--;
			else
			{
				elements++;
				
				let increment = (data_ == 1) ? 1 : 3;

				if (counter > 0 && counter + increment > grid_width) {
					countlines++;
					counter = 0;
				}

				counter += increment;

				if (counter == grid_width) {
					countlines++;
					counter = 0;
				}
			}
		});

		if (counter == 0) {
			countlines--;
		}
		
		total_lignes_offset+=countlines;
	});
	
	offset = ((total_lignes-total_lignes_offset)*225)
	
	DEBUG.log("SCROLLBAR","LOAD OFFSETS",total_lignes,total_lignes_offset,offset);	
}

window.SCROLL_get_grid_width = function get_grid_width()
{
	let columns = getComputedStyle(
		$('main section.' + GRID.section_active)[0]
	).gridTemplateColumns;

	return columns.split(' ').length;
}

window.SCROLL_block_position = function block_position()
{
	element = $('main section.' + GRID.section_active + ' div.fullrow').first().next();

	let total = total_height-1125-194;
	let position = Math.abs(element.position().top-194)+offset; //constant MENU 84 + DROP 62 + 48 DATE
	
	let precent = Math.round(position*1000/total)/10;
	
	if(element.attr('id')=="untagged_0") $('nav#magicscrollbar div.pointer').css('height',precent+'%');
	
	console.log(element.attr('id'),total,offset,position,precent);
}
