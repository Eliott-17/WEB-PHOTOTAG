//****************************************************************
//Variables globales *********************************************
//****************************************************************	

let SCROLL = {
    library:	{loaded:false,datas:[],total_lignes:0,total_height:0,offset:0,ux:[]},
    untagged: 	{loaded:false,datas:[],total_lignes:0,total_height:0,offset:0,ux:[]},
    search: 	{loaded:false,datas:[],total_lignes:0,total_height:0,offset:0,ux:[]},
    explore: 	{loaded:false,datas:[],total_lignes:0,total_height:0,offset:0,ux:[]}
};

//****************************************************************
//Variables locales **********************************************
//****************************************************************	

let SCROLL_height_media = 220;
let SCROLL_height_date = 50;
let SCROLL_height_gap = 5;

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
		
		SCROLL[section_active].ux.date
		
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
		
		if(init) 
		{
			let blockheight = (countlines*SCROLL_height_media)+SCROLL_height_date;

			SCROLL[section_active].total_height+=blockheight;
			
			(SCROLL[section_active].ux[id] ??= {}).date = data.date;
			(SCROLL[section_active].ux[id] ??= {}).blockheight = blockheight;

			(SCROLL[section_active].datas[id] ??= {}).lines = countlines;
			
			if(id==0) 	(SCROLL[section_active].datas[id] ??= {}).offset=0;
			else  		(SCROLL[section_active].datas[id] ??= {}).offset=SCROLL[section_active].datas[id-1].offset;
			
			SCROLL[section_active].datas[id].offset+=(SCROLL_height_media+SCROLL_height_gap)*countlines;
			SCROLL[section_active].datas[id].offset+=SCROLL_height_date+SCROLL_height_gap;
			
		}

	});
	
	if(init) 	
	{
		SCROLL[section_active].total_lignes=total_lignes;
		SCROLL[section_active].total_height+=((total_lignes-1)*5); //5 pixel media gap		
		SCROLL[section_active].total_height+=(SCROLL[section_active].datas.length*5); //5 pixel media gap	

		let offset=0;
		
		$.each(SCROLL[section_active].datas, function(id,data)
		{
			let html='<li id="date_'+data.date+'" class="material-symbols-outlined">more_horiz</li>';
			
			if(id==0) 
			{	
				$('nav#magicscrollbar ul').html('<li class="material-symbols-outlined cursor">drag_handle</span></li>');
				$('nav#magicscrollbar ul').append(html);	
				$('nav#magicscrollbar ul li#date_'+data.date).css('top','-10px');
			}
			else
			{
				let a = ($('nav#magicscrollbar').height()) / (SCROLL[section_active].total_height-$('main').height());
				let height = Math.round((SCROLL[section_active].datas[id-1].offset) * a);

				$('nav#magicscrollbar ul').append(html);
				$('nav#magicscrollbar ul li#date_'+data.date).css('top',height-10+'px');
			}
		});
		
		SCROLL_set_position();
	}
	else 		
	{
		let current_line = (SCROLL[section_active].total_lignes-total_lignes);
		
		SCROLL[section_active].offset=(current_line*SCROLL_height_media);
		SCROLL[section_active].offset+=(current_line-1)*5;
	}

	DEBUG.log("SCROLLBAR",init,SCROLL[section_active]);	
}

window.SCROLL_get_grid_width = function get_grid_width()
{
	let section_active=GRID_Get_SectionActive();
	
	let columns = getComputedStyle(
		$('main section.' + section_active)[0]
	).gridTemplateColumns;

	return columns.split(' ').length;
}

window.SCROLL_set_position = function set_position()
{
	let section_active=GRID_Get_SectionActive();
	
	if(SCROLL[section_active]==undefined || SCROLL[section_active].loaded==false)  return;

	let element = $('main section.' + section_active + ' div.fullrow').first().next();	
	
	if (element.length === 0) return false;

	let a = ($('nav#magicscrollbar').height()) / (SCROLL[section_active].total_height-$('main').height()+5);
	let height = Math.round(Math.abs((element.position().top-get_ux_offset(section_active))) * a);
	
	if(element.attr('id')==section_active+"_0") $('nav#magicscrollbar ul li.cursor').css('top',height-10+'px');
	
	DEBUG.log("SCROLLBAR",element.attr('id'),height);
}

function get_ux_offset(section_active)
{
	let uxoffset=0;
	
	uxoffset+=$('div#mainmenu').height();
	
	uxoffset+=SCROLL_height_date; //First date
	
	uxoffset+=5; //margin bottom

	if(section_active=="untagged") uxoffset+=$('div#uploaddrag').height(); 
	return uxoffset;
	
}

let old_width = $(window).width();

$(window).on('resize', function() {
    let width = $(window).width();

    if (width !== old_width) {
		SCROLL_set_position();
        old_width = width;
        // largeur réellement modifiée
    }
});
