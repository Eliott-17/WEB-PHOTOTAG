//****************************************************************
//Variables globales *********************************************
//****************************************************************	

let GRID = {
	configelements:20, //nombre d'éléments à charger
	section_active:"explore",
	section_mem:"",
	max_elements:0,
	changed:false,
	lock:{element_locked:false,ux_user_request:false,ux_user_answer:null}
}
	
let GRID_SECTIONS = {
    library:	{update:true,offset:0,elements:GRID.configelements,countmem:null,scrolls_mem:null},
    untagged: 	{update:true,offset:0,elements:GRID.configelements,countmem:null,scrolls_mem:null},
    search: 	{update:true,offset:0,elements:GRID.configelements,countmem:null,scrolls_mem:null,taglist:0},
    explore: 	{update:true,scrolls_mem:null} //chargé à l'init
};

let GRID_OFFSETS = {
    library:	{addedBOTTOM:0,addedTOP:0,fillbottom:true,dates_mem:[]},
    untagged: 	{addedBOTTOM:0,addedTOP:0,fillbottom:true,dates_mem:[]},
    search: 	{addedBOTTOM:0,addedTOP:0,fillbottom:true,dates_mem:[]},
    explore: 	{addedBOTTOM:0,addedTOP:0,fillbottom:true,dates_mem:[]}
};

let GRID_DATAS = {
    library:	{selection:[],loaded:[]},
    untagged: 	{selection:[],loaded:[]},
    search: 	{selection:[],loaded:[]},
    explore: 	{selection:[],loaded:[]}
};

let GRID_scroll_locked = false;

//****************************************************************
//Variables locales **********************************************
//****************************************************************	

let scroll_locked_down = false;					//Chargement progressif: FLAG qui limite l'action scroll quand on est en train de charger la grille
let scroll_locked_up = false;
let maxelementmemory=GRID.configelements*15; 	//bon hysétésys
let last_select=-1;								//mémorise le dernier uniqueid sélectioné

function GRID_system_reset(section_to_reset, from)
{	
	$("main section."+section_to_reset).html('');
	
	GRID_SECTIONS[section_to_reset].update=true;
	
	GRID_SECTIONS[section_to_reset].offset=0;
	GRID_SECTIONS[section_to_reset].elements=GRID.configelements;
	GRID_SECTIONS[section_to_reset].scrolls_mem=null;
	
	GRID_OFFSETS[section_to_reset].addedBOTTOM=0;
	GRID_OFFSETS[section_to_reset].addedTOP=0;
	GRID_OFFSETS[section_to_reset].fillbottom=true;
	GRID_OFFSETS[section_to_reset].dates_mem=[];

	GRID_DATAS[section_to_reset].selection=[];
	GRID_DATAS[section_to_reset].loaded=[];	

	if(section_to_reset==GRID.section_active) GRID_load("reset");
	
	DEBUG.log("GRID","Reset",section_to_reset,"request from",from);
}

$(document).ready(function(){

	$('main').on('scroll', function() { scroll_refresh(); });

	$(document).on('keydown.fullscreen', function(e) {
	 
		const tag = e.target.tagName;
		
		if (
			tag === "INPUT" ||
			tag === "TEXTAREA" ||
			e.target.isContentEditable
		) {
			return;
		}
			
		if(DISPLAY_is_visible_full_screen()) return;
				
		if (e.ctrlKey && e.key.toLowerCase() === 'a')
		{
			e.preventDefault();
			$('main section.'+GRID.section_active+' div.element').addClass('selected');
			$('main section.'+GRID.section_active+' div.element').removeClass('notselected');
			DISPLAY_selection();
		}

		if (e.key === "Escape") //undelect all
		{
			$('main div.element').removeClass('selected');
			$('main div.element').addClass('notselected');
			DISPLAY_selection();
		}	
	});

	//****************************************************************
	//Ajout du bouton de restoration (en mode corbeille) *************
	//****************************************************************	

	$('main').on('click.gridRestaure', 'div.button-restaure', function(e) {
		
		let current_id = $(this).parent().attr('id');
		let hash = $('div#'+current_id+' div.media-container').attr('data-src');
		
		CORE_get('/actions/file-restaure.php?hash='+hash+'&id='+current_id);	
	});
	
	//****************************************************************
	//Ajout du bouton de sélection d'une photo sur la grille *********
	//****************************************************************	

	$('main').on('click.gridSelect', 'div.button-select', function(e) {
		
		let current_id = parseInt($(this).parent().attr('id').replace(GRID.section_active+'_',''));
				
		//****************************************************************
		//Logique de sélection en lot avec la touche SHIFT ***************
		//****************************************************************	

		if(e.shiftKey)
		{	
			if(last_select>=0)
			{	
				if(current_id>last_select)
				{					
					for(i=last_select;i<=current_id;i++) 
					{
						let media_id = parseInt($('div#'+GRID.section_active+'_'+i+' div.media-container').attr('data-id'));
						if(!GRID_DATAS[GRID.section_active].selection.includes(media_id)) GRID_DATAS[GRID.section_active].selection.push(media_id);
						$('div#'+GRID.section_active+'_'+i).addClass('selected');
						$('div#'+GRID.section_active+'_'+i).removeClass('notselected');
					}
				}
				else
				{				
					for(i=current_id;i<=last_select;i++) 
					{
						let media_id = parseInt($('div#'+GRID.section_active+'_'+i+' div.media-container').attr('data-id'));
						if(!GRID_DATAS[GRID.section_active].selection.includes(media_id)) GRID_DATAS[GRID.section_active].selection.push(media_id);
						$('div#'+GRID.section_active+'_'+i).addClass('selected');
						$('div#'+GRID.section_active+'_'+i).removeClass('notselected');
					}
				}	
			}
		}
		else
		{			
			let media_id = parseInt($('div#'+GRID.section_active+'_'+current_id+' div.media-container').attr('data-id'));

			if(GRID_DATAS[GRID.section_active].selection.includes(media_id)) 		
			{
				GRID_DATAS[GRID.section_active].selection = GRID_DATAS[GRID.section_active].selection.filter(h => h !== media_id);
				DEBUG.log("GRID", "element deleted from selection");
			}
			else 									
			{
				GRID_DATAS[GRID.section_active].selection.push(media_id);
				DEBUG.log("GRID", "element added to selection");
			}
		}
		
		$('input.filesid').val(JSON.stringify(GRID_DATAS[GRID.section_active].selection));

		//****************************************************************
		//Action à effectué après la sélection effective *****************
		//****************************************************************

		DISPLAY_selection(current_id);
		
		if(IS_VISIBLE_menu($('div#select-trash'))) OBJ_Select_both.find('div.selected').addClass('delete');
		
		if(DISPLAY_is_visible_file_info()) //Si on à affiché les information des fichiers lors d'une sélection multiple
		{
			FILEMULTISELECTION_CallBack_load(); //On rafraichi les informations affichés au changement de sélection
		}
		
		last_select=current_id;
				
	});

	//*******************************************************************
	//Ajout du bouton plein écran d'une photo sur la grille *************
	//*******************************************************************	
	
	$('main').on('click.gridOpen', 'div.button-fullscreen', function() {
		
		let media_id = parseInt($(this).parent().attr('id').replace(GRID.section_active+'_',''));
		
		let max = GRID.max_elements;

		FILEOPENFULLSCREEN.id_current=media_id;
		FILEOPENFULLSCREEN.id_max=max;
		ArrowDisplay(media_id, max); 
		FILEOPENFULLSCREEN_Loadmedia(media_id);
		DISPLAY_set_view("fullscreen");	//order before DISPLAY_selection is important
		DISPLAY_selection(FILEOPENFULLSCREEN.id_current,true);
	});	
	
	//*******************************************************************
	//Ajout du bouton choix d'affichage sur la grille *******************
	//*******************************************************************	

	$('nav').on('click.privacy', 'div#privacy', function() {
		
		$('nav div.mainmenu div#privacy button').toggleClass("nothover hover");
		
		if(GRID.lock.ux_user_answer==false || GRID.lock.ux_user_answer==null)
		{
			GRID.lock.ux_user_answer=true;
			
			$('main section div.element div.media-container').each(function () {
				
				$(this).find('img').attr('src', 'sd-'+$(this).attr('data-src'));			
			});						
		}
		else
		{
			GRID.lock.ux_user_answer=false;
			
			$('main section div.element div.media-container').each(function () {
				
				$(this).find('img.private').attr('src', 'bl-'+$(this).attr('data-src'));			
			});						
		}		
	});
	
});

//*******************************************************************
//Fonction du scroll et chagement/déchargement progressif ***********
//*******************************************************************	

function scroll_refresh()
{
	if($('main section.'+GRID.section_active).hasClass('hidden') || GRID_scroll_locked) return;

	//scroll_bottom();
	//scroll_top();
	
	scroll_execute(true);
	scroll_execute(false);
}

function scroll_execute(sens) //bottom = true, top = false;
{
	let senschar="UNK";
	let senslimit=0;
	let elements=[];
	
	if(sens) 	senschar="bottom";
	else 		senschar="top";
	
	if(sens && scroll_locked_down || !sens && scroll_locked_up) 
	{
		DEBUG.log("SCROLL","scroll_execute",senschar,"sroll locked");
		return;
	}
	
	GRID_SECTIONS[GRID.section_active].scrolls_mem = $('main').scrollTop();

	let WINDOWS_VIEW = $('main').height();
	let WINDOWS_TOP = GRID_SECTIONS[GRID.section_active].scrolls_mem;
	let WINDOWS_LOADED = $('section.date.'+GRID.section_active).height();
	let WINDOWS_BOTTOM = WINDOWS_LOADED-(WINDOWS_VIEW+WINDOWS_TOP);
	
	if(sens) 	senslimit=WINDOWS_BOTTOM;
	else 		senslimit=WINDOWS_TOP;

	if(senslimit < (225*12))
	{
		//AJOUT DE 20 PHOTOS SUPPLEMENTAIRES

		if(	(((GRID_OFFSETS[GRID.section_active].addedBOTTOM+GRID.configelements)<GRID_SECTIONS[GRID.section_active].countmem) && sens) ||
			((GRID_OFFSETS[GRID.section_active].addedTOP<0) && !sens))
		{
			GRID_OFFSETS[GRID.section_active].fillbottom=sens;	

			if(sens) 	GRID_SECTIONS[GRID.section_active].offset =(GRID_OFFSETS[GRID.section_active].addedBOTTOM+GRID.configelements); //request
			else		GRID_SECTIONS[GRID.section_active].offset=Math.abs(GRID_OFFSETS[GRID.section_active].addedTOP+GRID.configelements); //request
			
			GRID_SECTIONS[GRID.section_active].elements=GRID.configelements;	
			GRID_SECTIONS[GRID.section_active].update=true;
			GRID_load("scroll");
			
			DEBUG.log("GRID",GRID.configelements, "added to",senschar);
			
			//SUPRESSION DE 20 PHOTOS
			
			if(GRID_OFFSETS[GRID.section_active].addedBOTTOM>maxelementmemory)
			{
				let i=GRID.configelements;
				
				if(sens) 	GRID_OFFSETS[GRID.section_active].addedTOP-=i;
				else 		GRID_OFFSETS[GRID.section_active].addedBOTTOM-=i;

				if(sens) 	elements = $('main section.' + GRID.section_active + ' > div')
				else 		elements = $('main section.' + GRID.section_active + ' > div').get().reverse();

				$(elements).each(function() {
					
					$(this).addClass("toremove");
					
					if($(this).hasClass("element")) i--;
					
					if(i<=0) return false;

				});
				
				$('main section.' + GRID.section_active + ' > div').each(function() 
				{
					if($(this).hasClass("toremove"))
					{
						let date = $(this).find('h2').html();
						
						if(sens || ($(this).hasClass("fullrow") && !sens))
						{
							GRID_OFFSETS[GRID.section_active].dates_mem = GRID_OFFSETS[GRID.section_active].dates_mem.filter(item => item !== date);
						}
						
						$(this).remove();
					}
				});
				
				DEBUG.log("GRID",GRID_OFFSETS[GRID.section_active].addedBOTTOM,GRID_OFFSETS[GRID.section_active].addedTOP,"deleted from",senschar);
			}
		}
		else DEBUG.log("SCROLL","nothing added to",senschar);
	}
	//else DEBUG.log("SCROLL","scroll_execute",senschar,"nothing to add");
}
/*
function scroll_bottom()
{
	if(scroll_locked_down) 
	{
		DEBUG.log("SCROLL","check bottom sroll locked");
		return;
	}
	
	GRID_SECTIONS[GRID.section_active].scrolls_mem = $('main').scrollTop();

	let WINDOWS_VIEW = $('main').height();
	let WINDOWS_TOP = GRID_SECTIONS[GRID.section_active].scrolls_mem;
	let WINDOWS_LOADED = $('section.date.'+GRID.section_active).height();
	let WINDOWS_BOTTOM = WINDOWS_LOADED-(WINDOWS_VIEW+WINDOWS_TOP);

	if(WINDOWS_BOTTOM < (225*12))
	{
		//AJOUT DE 20 PHOTOS SUPPLEMENTAIRES au bottom

		if((GRID_OFFSETS[GRID.section_active].addedBOTTOM+GRID.configelements)<GRID_SECTIONS[GRID.section_active].countmem)
		{
			GRID_OFFSETS[GRID.section_active].fillbottom=true;	
			
			GRID_SECTIONS[GRID.section_active].offset=(GRID_OFFSETS[GRID.section_active].addedBOTTOM+GRID.configelements); //request
			GRID_SECTIONS[GRID.section_active].elements=GRID.configelements;	
			GRID_SECTIONS[GRID.section_active].update=true;
			GRID_load("scroll");
			
			DEBUG.log("GRID",GRID.configelements, "added to bottom");
			
			//SUPRESSION DE 20 PHOTOS DU top
			
			if(GRID_OFFSETS[GRID.section_active].addedBOTTOM>maxelementmemory)
			{
				let i=GRID.configelements;
				
				GRID_OFFSETS[GRID.section_active].addedTOP-=i;

				$($('main section.' + GRID.section_active + ' > div')).each(function() {
					
					$(this).addClass("toremove");
					
					if($(this).hasClass("element")) i--;
					
					if(i<=0) return false;

				});
				
				$('main section.' + GRID.section_active + ' > div').each(function() 
				{
					if($(this).hasClass("toremove"))
					{
						let date = $(this).find('h2').html();	
						GRID_OFFSETS[GRID.section_active].dates_mem = GRID_OFFSETS[GRID.section_active].dates_mem.filter(item => item !== date);
						
						$(this).remove();
					}
				});
				
				DEBUG.log("GRID",GRID_OFFSETS[GRID.section_active].addedTOP,"deleted from TOP");
			}
		}
		else DEBUG.log("SCROLL","nothing added to bottom","(",GRID_OFFSETS[GRID.section_active].addedBOTTOM,"+",GRID.configelements,")<",GRID_SECTIONS[GRID.section_active].countmem);
	}
	else DEBUG.log("SCROLL","scroll_bottom()",WINDOWS_BOTTOM,"<",(225*12));
}

function scroll_top()
{
	if(scroll_locked_up) 
	{
		DEBUG.log("SCROLL","check top sroll locked");
		return;
	}

	GRID_SECTIONS[GRID.section_active].scrolls_mem = $('main').scrollTop();

	let WINDOWS_TOP = GRID_SECTIONS[GRID.section_active].scrolls_mem;

	if(WINDOWS_TOP < (225*12)) 
	{
		//AJOUT DE 20 PHOTOS SUPPLEMENTAIRES au top
		
		if(GRID_OFFSETS[GRID.section_active].addedTOP<0)
		{	
			GRID_OFFSETS[GRID.section_active].fillbottom=false;		

			GRID_SECTIONS[GRID.section_active].offset=Math.abs(GRID_OFFSETS[GRID.section_active].addedTOP+GRID.configelements);
			GRID_SECTIONS[GRID.section_active].elements=GRID.configelements;	
			GRID_SECTIONS[GRID.section_active].update=true;
		
			GRID_load("scroll");
			
			DEBUG.log("GRID",GRID.configelements, "added to top");
			
			//SUPRESSION DE 20 PHOTOS DU bottom

			if(GRID_OFFSETS[GRID.section_active].addedBOTTOM>maxelementmemory)
			{

				let i=GRID.configelements;
				
				GRID_OFFSETS[GRID.section_active].addedBOTTOM-=i;

				$($('main section.' + GRID.section_active + ' > div').get().reverse()).each(function() {

					$(this).addClass("toremove");
					
					if($(this).hasClass("element")) i--;
					
					if(i<=0) return false;

				});
				
				$('main section.' + GRID.section_active + ' > div').each(function() 
				{
					if($(this).hasClass("toremove"))
					{
						if($(this).hasClass("fullrow"))
						{
							let date = $(this).find('h2').html();	
							GRID_OFFSETS[GRID.section_active].dates_mem = GRID_OFFSETS[GRID.section_active].dates_mem.filter(item => item !== date);
						}
						$(this).remove();
					}
				});
				
				DEBUG.log("SCROLL",GRID_OFFSETS[GRID.section_active].addedBOTTOM,"deleted from bottom");
			}		
		}
		else DEBUG.log("SCROLL","nothing added to top",GRID_OFFSETS[GRID.section_active].addedTOP,">0");		
	}
	else DEBUG.log("SCROLL","scroll_top()",WINDOWS_TOP,"<",(225*12));
}
*/
//*******************************************************************
//chagement et reset de la grille ***********************************
//*******************************************************************	

function GRID_reset(from,source,searchoption=null)
{
	let found=false;
	
	if(source=="FILES" || source=="RESTAURETRASH")
	{
		GRID_system_reset("library", from);
		found=true;
	}
	
	if(source=="FILES")
	{
		GRID_system_reset("explore", from);	
		found=true;		
	}
	
	if(source=="UPLOAD" || source=="FILES" || source=="RESTAURETRASH")
	{
		GRID_system_reset("untagged", from);	
		found=true;	
	}

	if(source=="SEARCH" || source=="FILES")
	{
		GRID_system_reset("search", from);
		
		if(searchoption!=null)
		{
			GRID_SECTIONS["search"].taglist=searchoption;
		}
		
		found=true;	

	}
	
	if(!found) DEBUG.log("GRID","Reset",source,"NOT FOUND",from);
}

function GRID_load(from)
{
	DEBUG.log("GRID","GRID LOAD FROM",from);
	
	if(GRID_SECTIONS[GRID.section_active].update==true)
	{
		scroll_locked_down=true;
		scroll_locked_up=true;	
		
		DEBUG.log("GRID",GRID.section_active,"update request");
		
		GRID_SECTIONS[GRID.section_active].update=false;

		switch(GRID.section_active)
		{
			case "library":
			
				CORE_get('/actions/file-load-list.php?source=0&elements='+GRID_SECTIONS[GRID.section_active].elements+'&offset='+GRID_SECTIONS[GRID.section_active].offset);
				
			break;
			case "untagged":
			
				CORE_get('/actions/file-load-list.php?source=1&elements='+GRID_SECTIONS[GRID.section_active].elements+'&offset='+GRID_SECTIONS[GRID.section_active].offset);
				
			break;
			case "search":
			
				$("#filters").attr('action','/actions/file-search-list.php?offset='+GRID_SECTIONS[GRID.section_active].offset+'&tagslist='+GRID_SECTIONS[GRID.section_active].taglist);

				GRID_SECTIONS[GRID.section_active].taglist=0; //par défaut à 0;
				
				//TAGLIST=0 > "GRID_CallBack_load" + array("datas"=>$return);
				//TAGLIST=1 > "EXPLORE_CallBack_search" + $tag); + datas
				//TAGLIST=2 > "FILTERS_CallBack_search" + $tag); + datas

				CORE_post($("#filters"));
			
			break;
			case "explore":
			
				CORE_get('/actions/file-load-explore.php');
				
			break;
			default: break;
		}			
	}
	else
	{
		$('main section div.element.is_tagged').removeClass('is_tagged');
		$('main section div.element.is_not_tagged').removeClass('is_not_tagged');
		
		DEBUG.log("GRID","GRID",GRID.section_active,"no action");		
	}
}

window.GRID_CallBack_load = function(data_array)
{
	let regenerate=true;
	
	DEBUG.log("GRID_DATAS",data_array);

	if(data_array.count!==undefined)
	{	
		if(data_array.count.total!==undefined)
		{
			let count = data_array.count.total;

			$('span#'+GRID.section_active+'_count').html(count);
			
			localStorage.setItem(APP.userhash+'_'+GRID.section_active+'_count', count);
			
			if(GRID_SECTIONS[GRID.section_active].countmem!==null && GRID.changed)
			{
				DEBUG.log("GRID","count mem",GRID_SECTIONS[GRID.section_active].countmem);

				if(count<GRID_SECTIONS[GRID.section_active].countmem)
				{
					regenerate=false;
					
					DEBUG.log("GRID",'Remove elements in '+GRID.section_active+' '+count+' < '+GRID_SECTIONS[GRID.section_active].countmem);
					
					if(GRID.section_active=="untagged") 
					{
						removedcount = $('main section.'+GRID.section_active+' div.element.is_tagged').length;
						
						$('main section.'+GRID.section_active+' div.element.is_tagged').remove();
						
						GRID_SECTIONS['library'].countmem+=removedcount;
						$('span#library_count').html(GRID_SECTIONS['library'].countmem);
						
						localStorage.setItem(APP.userhash+'_library_count', GRID_SECTIONS['library'].countmem);
					}
					
					if(GRID.section_active=="library") 
					{
						removedcount = $('main section.'+GRID.section_active+' div.element.is_not_tagged').length;
						
						$('main section.'+GRID.section_active+' div.element.is_not_tagged').remove();

						GRID_SECTIONS['untagged'].countmem+=removedcount;
						$('span#untagged_count').html(' ('+GRID_SECTIONS['untagged'].countmem+')');
						
						localStorage.setItem(APP.userhash+'_untagged_count', GRID_SECTIONS['untagged'].countmem);

					}
					
					DISPLAY_selection();
					GRID_load_id();
				}

				if(count==GRID_SECTIONS[GRID.section_active].countmem)
				{
					regenerate=false;
				}
				
				GRID_SECTIONS[GRID.section_active].update=false;
				
				GRID.changed=false;
			}
			
			GRID_SECTIONS[GRID.section_active].countmem=count;
		}
	}
	
	if(regenerate)
	{
		DEBUG.log("GRID",'Regenerated');
		
		GRID.lock.element_locked=false;
		
		let OBJ_Dest_date = "";

		source=data_array.datas;
			
		let j=0; //because i is not reliable (in case of skip)
		let max_display=source.length; //because source.length is not reliable (in case of skip)

		$.each(source, function(i, bdd)
		{		
			if(bdd.advfilter_hidden!=undefined)
			{
				if(bdd.advfilter_hidden==1)
				{
					max_display--;
					return; //skip to the next element
				}
			}
											
			let l_date_test = bdd.time_taken_at_date;

			let l_date_display = l_date_test.substring(6,8) + "/" + l_date_test.substring(4,6) + "/" + l_date_test.substring(0,4);	
			
			if(l_date_display=="00/00/0000")  	htmldate="Undated";
			else 								htmldate=formatDateLocale(l_date_display);

			OBJ_Dest_date+=(addElement(data_array.dir, bdd, htmldate));
			
			if(!GRID_DATAS[GRID.section_active].loaded.includes(bdd.id)) GRID_DATAS[GRID.section_active].loaded.push(bdd.id); //store all loaded elements

			j++;
		});

		if(GRID_OFFSETS[GRID.section_active].fillbottom) 
		{
			GRID_OFFSETS[GRID.section_active].addedBOTTOM+=j;
			$("main section.date."+GRID.section_active).append(OBJ_Dest_date);
		}
		else 										
		{
			GRID_OFFSETS[GRID.section_active].addedTOP+=j;
			$("main section.date."+GRID.section_active).prepend(OBJ_Dest_date);
		}

		GRID_load_id();

		DISPLAY_selection();	

		if(GRID.lock.element_locked==true && GRID.lock.ux_user_request==false) 
		{
			GRID.lock.ux_user_request=true;
			$('div#privacy').removeClass('hidden');
		}

		$('main section div.element.is_tagged').removeClass('is_tagged');
		$('main section div.element.is_not_tagged').removeClass('is_not_tagged');
		
		//fill the grid with empty space

		scroll_locked_up=false;
		scroll_locked_down=false;	

		DEBUG.log("CALLBACK","CallBack_load","Will add element on",GRID.section_active);
		
		if(GRID_OFFSETS[GRID.section_active].fillbottom) scroll_execute(true);
		else scroll_execute(false);

	}

	DEBUG.log("CALLBACK","CallBack_load",GRID_OFFSETS[GRID.section_active]);
}

window.GRID_CallBack_restaure = function(current_id)
{
	$('div#'+current_id).remove();
	
	let count=parseInt($('nav#main span#filterresult').html());
	count--;
	$('nav#main span#filterresult').html(count);
	
	GRID_reset("GRID_CallBack_restaure","RESTAURETRASH");
}

function GRID_load_id(date)
{
	let id=0;

	$('main section.' + GRID.section_active+' div.element').each(function () {

		$(this).attr('id', GRID.section_active+'_'+id);
		
		let date=$(this).attr('data-date');

		if(!GRID_OFFSETS[GRID.section_active].dates_mem.includes(date)) 
		{
			$(this).before('<div class="fullrow"><h2>'+date+'</h2></div>'); //on démarre une nouvelle grille
			GRID_OFFSETS[GRID.section_active].dates_mem.push(date);
		}		
	
		id++;

	});
	
	GRID.max_elements = (id-1);
	
	return (id-1);
	
	DEBUG.log("GRID","load_id");
}

function addElement(dir, bdd, date)
{
	let file_orientationtxt="landscape";
	let trash = false;
	let before = '';
	
	if(bdd.file_status!=undefined) if(bdd.file_status==2) 
	{
		trash=true;
	
		const filename = bdd.file_original_name;

		const pos = filename.indexOf('_');

		if (pos !== -1) {
			before = filename.substring(0, pos);
			after  = filename.substring(pos + 1);
		} else {
			before = filename;
			after = null;
		}
		
		if(after==null) console.err('Inconsistent file name');
		
		before+='_';
	}
	
	if(bdd.file_orientation==1) file_orientationtxt="portrait";
		
	let html ="";
	let ux = "photo";
	html+= '<div id="" data-date="'+date+'" class="element notselected wrapper '+file_orientationtxt+'">';
	
	html+= '	<div class="media-container" data-type="'+bdd.file_type+'" data-src="'+before+bdd.file_hash+'" data-id="'+bdd.id+'" id="media_'+bdd.id+'">';

	let header='sd';
	let openfull='open_in_full';
	let classp='';

	if(bdd.file_is_private==1 && GRID.lock.ux_user_answer!=true)
	{
		header='bl';
		openfull='lock_open_right';
		classp='private';
		GRID.lock.element_locked=true;
	}

	if(bdd.file_type == 0) 
	{
		html+= '		<img class="'+classp+'" src="'+header+'-'+before+bdd.file_hash+'" loading="lazy">';
	}
	if(bdd.file_type == 1)
	{
		html+= '		<video class="'+classp+'" src="hd-'+before+bdd.file_hash+'" poster="'+header+'-'+bdd.file_hash+'" controlslist="nodownload nofullscreen noremoteplayback"></video>';
		ux = "video";
	}
	
	html+= '	</div>';
	
	if(!trash) 
	{
		html+= '	<div class="button-select cursor">';
		html+= '		<span class="material-symbols-outlined nothover">radio_button_unchecked</span>';
		html+= '		<span class="material-symbols-outlined hover">check_circle</span>';
		html+= '		<span class="material-symbols-outlined caseselected">check</span>';
		html+= '	</div>';
		html+= '	<div class="button-fullscreen cursor '+ux+'">';			
		html+= '		<span class="material-symbols-outlined button_grid_'+bdd.id+'">'+openfull+'</span>';
		html+= '	</div>';
	}
	else
	{
		html+= '	<div class="button-restaure cursor">';			
		html+= '		<span class="material-symbols-outlined">restore_from_trash</span>';
		html+= '	</div>';		
	}
	
	html+= '</div>';
		
	return html;	
}

function formatDateLocale(dateStr) {
  const [day, month, year] = dateStr.split("/").map(Number);

  const date = new Date(year, month - 1, day);

  const locale = navigator.language || "en-US";

  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}