//****************************************************************
//Variables globales *********************************************
//****************************************************************	

let SCROLL = {
    library:	{loaded:false,datas:[],total_lignes:0,total_height:0,offset:0},
    untagged: 	{loaded:false,datas:[],total_lignes:0,total_height:0,offset:0},
    search: 	{loaded:false,datas:[],total_lignes:0,total_height:0,offset:0}
};

//****************************************************************
//Variables locales **********************************************
//****************************************************************	


$(document).ready(function(){

	//****************************************************************
	// *************
	//****************************************************************	
});

window.SCROLL_CallBack_load = function(datas)
{
	let = section_active=GRID_Get_SectionActive();
	SCROLL[section_active].datas = [...datas];
	SCROLL_Load_Scroll_Bar(null);
}

window.SCROLL_Load_Scroll_Bar= function Load_Scroll_Bar(offset=null)
{
	let = section_active=GRID_Get_SectionActive();
	
	let init = false;
	
	if(offset==null) 
	{
		if(SCROLL[section_active].loaded==false) 
		{
			init=true;
		}
		else
		{
			return false;
		}
	}
	
	let grid_width = SCROLL_get_grid_width();
	
	//only offset
	let ignore;
	let total_lignes=0;
	
	if(init) //mode init
	{
		SCROLL[section_active].loaded=true;
		SCROLL[section_active].total_lignes=0;
		SCROLL[section_active].total_height=0;
		
		ignore=0; 
	}
	else
	{
		SCROLL[section_active].offset=0;
		
		ignore=Math.abs(offset);		
	}
	
	$.each(SCROLL[section_active].datas, function(id,data)
	{
		let counter = 0;
		let countlines = 1;
		let increment;
		let elements=0;
		
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
		
		total_lignes+=countlines;
		
		if(init) SCROLL[section_active].total_height+=(countlines*225)+48

	});
	
	if(init) 	SCROLL[section_active].total_lignes=total_lignes;
	else 		SCROLL[section_active].offset=(SCROLL[section_active].total_ligne-total_lignes)*225;

	DEBUG.log("SCROLLBAR",init,SCROLL[section_active]);	
}

window.SCROLL_get_grid_width = function get_grid_width()
{
	let section_active=GRID_Get_SectionActive();;
	
	let columns = getComputedStyle(
		$('main section.' + section_active)[0]
	).gridTemplateColumns;

	return columns.split(' ').length;
}

window.SCROLL_set_position = function set_position()
{
	let section_active=GRID_Get_SectionActive();
	
	if(SCROLL[section_active]==undefined) return;
	
	let uxoffset=0;
	
	uxoffset+=84; // TOP NAVBAR
	uxoffset+=48; //First line date	
	
	if(section_active=="untagged") uxoffset+=62; //DROP FILES ZONE
	
	element = $('main section.' + section_active + ' div.fullrow').first().next();

	let total = SCROLL[section_active].total_height-1125-uxoffset;
	
	let position = Math.abs(element.position().top-uxoffset)+SCROLL[section_active].offset;
	
	let precent = Math.round(position*1000/total)/10;
	
	if(element.attr('id')==section_active+"_0") $('nav#magicscrollbar div.pointer').css('height',precent+'%');
	
	DEBUG.log("SCROLLBAR",element.attr('id'),total,SCROLL[section_active].offset,position,precent);
}
