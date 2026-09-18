//****************************************************************
//Variables globales *********************************************
//****************************************************************	

let GRID = {
	configelements:40, //nombre d'éléments à charger
	section_active:"explore",
	section_mem:"",
	max_elements:0,
	changed:false,
	lock:{element_locked:false,ux_user_request:false,ux_user_answer:null}
}
	
let GRID_SECTIONS = {
    library:	{update:true,offset:0,elements:GRID.configelements,countmem:0,scrolls_mem:null},
    untagged: 	{update:true,offset:0,elements:GRID.configelements,countmem:0,scrolls_mem:null},
    search: 	{update:true,offset:0,elements:GRID.configelements,countmem:0,scrolls_mem:null,taglist:0},
    explore: 	{update:true,scrolls_mem:null} //chargé à l'init
};

let GRID_OFFSETS = {
    library:	{addedBOTTOM:0,addedTOP:0,fillbottom:true},
    untagged: 	{addedBOTTOM:0,addedTOP:0,fillbottom:true},
    search: 	{addedBOTTOM:0,addedTOP:0,fillbottom:true},
    explore: 	{addedBOTTOM:0,addedTOP:0,fillbottom:true}
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
	GRID_SECTIONS[section_to_reset].countmem=0;
	GRID_SECTIONS[section_to_reset].scrolls_mem=null;
	
	GRID_OFFSETS[section_to_reset].addedBOTTOM=0;
	GRID_OFFSETS[section_to_reset].addedTOP=0;
	GRID_OFFSETS[section_to_reset].fillbottom=true;

	GRID_DATAS[section_to_reset].selection=[];
	GRID_DATAS[section_to_reset].loaded=[];	
	
	SCROLL[section_to_reset].loaded=false;
	SCROLL[section_to_reset].datas=[];
	SCROLL[section_to_reset].total_lignes=0;
	SCROLL[section_to_reset].total_height=0;
	SCROLL[section_to_reset].offset=0;

	if(section_to_reset==GRID.section_active) GRID_load("reset");
	
	DEBUG.log("GRID","Reset",section_to_reset,"request from",from);
}

$(document).ready(function(){

	$('main').on('scroll', function() { scroll_refresh(); });

	$(document).on('keydown.fullscreen', function(e) {
		
		let = section_active=GRID_Get_SectionActive();
	 
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
			$('main section.'+section_active+' div.element').addClass('selected');
			$('main section.'+section_active+' div.element').removeClass('notselected');
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
		
		let = section_active=GRID_Get_SectionActive();
		
		let media_id = parseInt($(this).parent().children().first().attr('data-id'));
				
		//****************************************************************
		//Logique de sélection en lot avec la touche SHIFT ***************
		//****************************************************************	
		
		if(e.shiftKey)
		{
			let index_last_select = GRID_DATAS[section_active].loaded.indexOf(last_select);
			let index_current_id = 	GRID_DATAS[section_active].loaded.indexOf(media_id);
	
			if(index_last_select>=0 && index_current_id>=0 && index_last_select!=index_current_id)
			{
				if(index_current_id>index_last_select)
				{
					index_current_id++;
					index_last_select++;
				}
				else
				{
					index_last_select++;
					index_last_select--;
				}
				
				let index_min=Math.min(index_current_id, index_last_select);
				let index_max=Math.max(index_current_id, index_last_select);
				
				let result = GRID_DATAS[section_active].loaded.slice(index_min,index_max);
				
				DEBUG.log("GRID","loaded index from",index_min,index_max);
				
				$.each(result, function(key,value)
				{
					change_selection(value);
				});
			}
		}
		else
		{			
			change_selection(media_id);
		}
		
		$('input.filesid').val(JSON.stringify(GRID_DATAS[section_active].selection));

		//****************************************************************
		//Action à effectué après la sélection effective *****************
		//****************************************************************

		DISPLAY_selection();
		
		if(IS_VISIBLE_menu($('div#select-trash'))) OBJ_Select_both.find('div.selected').addClass('delete');
		
		if(DISPLAY_is_visible_file_info()) //Si on à affiché les information des fichiers lors d'une sélection multiple
		{
			FILEMULTISELECTION_CallBack_load(); //On rafraichi les informations affichés au changement de sélection
		}
		
		last_select=media_id;
		
		DEBUG.log("GRID","last index slsection",last_select);
				
	});

	//*******************************************************************
	//Ajout du bouton plein écran d'une photo sur la grille *************
	//*******************************************************************	
	
	$('main').on('click.gridOpen', 'div.button-fullscreen', function() {
		
		let = section_active=GRID_Get_SectionActive();
		
		let media_id = parseInt($(this).parent().attr('id').replace(section_active+'_',''));
		
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

function change_selection(media_id)
{
	let = section_active=GRID_Get_SectionActive();
	
	if(GRID_DATAS[section_active].selection.includes(media_id)) 		
	{
		GRID_DATAS[section_active].selection = GRID_DATAS[section_active].selection.filter(h => h !== media_id);
	}
	else 									
	{
		GRID_DATAS[section_active].selection.push(media_id);
	}
	
	DEBUG.log("DATA", "Selection updated",GRID_DATAS[section_active].selection);
}

//*******************************************************************
//Fonction du scroll et chagement/déchargement progressif ***********
//*******************************************************************	

function scroll_refresh()
{
	let = section_active=GRID_Get_SectionActive();
	
	if($('main section.'+section_active).hasClass('hidden') || GRID_scroll_locked) return;
	
	scroll_execute(true);
	scroll_execute(false);
	
	SCROLL_set_position();
}

function scroll_execute(sens) //bottom = true, top = false;
{
	let = section_active=GRID_Get_SectionActive();
	
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
	
	GRID_SECTIONS[section_active].scrolls_mem = $('main').scrollTop();

	let WINDOWS_VIEW = $('main').height();
	let WINDOWS_TOP = GRID_SECTIONS[section_active].scrolls_mem;
	let WINDOWS_LOADED = $('section.date.'+section_active).height();
	let WINDOWS_BOTTOM = WINDOWS_LOADED-(WINDOWS_VIEW+WINDOWS_TOP);

	if(sens) 	senslimit=WINDOWS_BOTTOM;
	else 		senslimit=WINDOWS_TOP;

	if(senslimit < (225*12))
	{
		//AJOUT DE 20 PHOTOS SUPPLEMENTAIRES

		if(	((GRID_OFFSETS[section_active].addedBOTTOM<GRID_SECTIONS[section_active].countmem) && sens) ||
			((GRID_OFFSETS[section_active].addedTOP<0) && !sens))
		{
			GRID_OFFSETS[section_active].fillbottom=sens;	

			if(sens) 	GRID_SECTIONS[section_active].offset = GRID_OFFSETS[section_active].addedBOTTOM; //request
			else		GRID_SECTIONS[section_active].offset=Math.abs(GRID_OFFSETS[section_active].addedTOP+GRID.configelements); //request
			
			GRID_SECTIONS[section_active].elements=GRID.configelements;	
			GRID_SECTIONS[section_active].update=true;
			GRID_load("scroll");
			
			DEBUG.log("GRID",GRID_OFFSETS[section_active], "added to",senschar);
			
			//SUPRESSION DE 20 PHOTOS
			
			//à faire aprsè la mise à jour de l'index en add
		}
		else 
		{
			DEBUG.log("SCROLL","nothing added to",senschar);
		}
	}
}

function GRID_delete(sens)
{
	let = section_active=GRID_Get_SectionActive();
	
	if(sens) 	senschar="top";
	else 		senschar="bottom";
	
	if(GRID_OFFSETS[section_active].addedBOTTOM>maxelementmemory)
	{
		let i=GRID.configelements;
		
		if(sens) 	GRID_OFFSETS[section_active].addedTOP-=i;
		else 		GRID_OFFSETS[section_active].addedBOTTOM-=i;

		if(sens) 	elements = $('main section.' + section_active + ' > div')
		else 		elements = $('main section.' + section_active + ' > div').get().reverse();

		$(elements).each(function() {
			
			$(this).addClass("toremove");
			
			if($(this).hasClass("element")) i--;
			
			if(i<=0) return false;

		});
		
		$('main section.' + section_active + ' > div').each(function() 
		{
			if($(this).hasClass("toremove")) $(this).remove();
		});
		DEBUG.log("GRID",GRID_OFFSETS[section_active],"deleted from",senschar);
		
		SCROLL_Load_Scroll_Bar(GRID_OFFSETS[section_active].addedTOP);
	}
}

//*******************************************************************
//chagement et reset de la grille ***********************************
//*******************************************************************	

function GRID_Get_SectionActive() { return GRID.section_active };

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

function GRID_Release_Scroll()
{
	scroll_locked_up=false;
	scroll_locked_down=false;	
}

function GRID_load(from)
{
	let = section_active=GRID_Get_SectionActive();
	
	DEBUG.log("GRID","GRID LOAD FROM",from);
	
	if(GRID_SECTIONS[section_active].update==true)
	{
		scroll_locked_down=true;
		scroll_locked_up=true;	
		
		DEBUG.log("GRID",section_active,"update request");
		
		GRID_SECTIONS[section_active].update=false;
		
		if(section_active!="explore")
		{
			if(SCROLL[section_active].datas.length==0)
			{
				SCROLL[section_active].loaded=false;
				GRID_SECTIONS[section_active].countmem=-1;
			}
		}

		switch(section_active)
		{
			case "library":
			
				CORE_get('/actions/file-load-list.php?countmem='+GRID_SECTIONS[section_active].countmem+'&sectionactive='+section_active+'&elements='+GRID_SECTIONS[section_active].elements+'&offset='+GRID_SECTIONS[section_active].offset);
				
			break;
			case "untagged":
			
				CORE_get('/actions/file-load-list.php?countmem='+GRID_SECTIONS[section_active].countmem+'&sectionactive='+section_active+'&elements='+GRID_SECTIONS[section_active].elements+'&offset='+GRID_SECTIONS[section_active].offset);
				
			break;
			case "search":
			
				$("#filters").attr('action','/actions/file-search-list.php?countmem='+GRID_SECTIONS[section_active].countmem+'&sectionactive='+section_active+'&offset='+GRID_SECTIONS[section_active].offset+'&tagslist='+GRID_SECTIONS[section_active].taglist);

				GRID_SECTIONS[section_active].taglist=0; //par défaut à 0;
				
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
		
		DEBUG.log("GRID","GRID",section_active,"no action");		
	}
}

window.GRID_CallBack_load = function(data_array)
{
	let = section_active=GRID_Get_SectionActive();
	
	DEBUG.log("GRID_DATAS",data_array);
	
	if(data_array.sectionactive==undefined)
	{
		DEBUG.log("GRID","ERROR","section_active not defined");
		return;		
	}
	
	if(data_array.sectionactive !== section_active)
	{
		scroll_lock_up = false;
		scroll_lock_down = false;

		//GRID_system_reset(data_array.sectionactive, "GRID_CallBack_load section mismatch");
		return;
	}
	
	let regenerate=true;

	if(data_array.count!==undefined)
	{	
		if(data_array.count.total!==undefined)
		{
			let count = data_array.count.total;
			
			GRID_SECTIONS[section_active].countmem=count;
			
			DISPLAY_set_media_count(section_active);
			
			if(GRID_SECTIONS[section_active].countmem!==0 && GRID.changed)
			{
				DEBUG.log("GRID","count mem",GRID_SECTIONS[section_active].countmem);

				if(count<GRID_SECTIONS[section_active].countmem)
				{
					regenerate=false;
					
					DEBUG.log("GRID",'Remove elements in '+section_active+' '+count+' < '+GRID_SECTIONS[section_active].countmem);
					
					let removelement=null;
					
					if(section_active=="untagged") removelement="is_tagged";
					if(section_active=="library")  removelement="is_not_tagged";
					
					if(removelement!=null)
					{
						removedcount = $('main section.'+section_active+' div.element.is_not_tagged').length;
						$('main section.'+section_active+' div.element.is_not_tagged').remove();			
						GRID_SECTIONS[section_active].countmem+=removedcount;
						DISPLAY_set_media_count(section_active);
					}
					
					DISPLAY_selection();
					GRID_load_id();
				}

				if(count==GRID_SECTIONS[section_active].countmem)
				{
					regenerate=false;
				}
				
				GRID_SECTIONS[section_active].update=false;
				
				GRID.changed=false;
			}
			
			GRID_SECTIONS[section_active].countmem=count;
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
											
			OBJ_Dest_date+=(addElement(data_array.dir, bdd, bdd.time_taken_at_date));
			
			if(!GRID_DATAS[section_active].loaded.includes(bdd.id)) GRID_DATAS[section_active].loaded.push(bdd.id); //store all loaded elements

			j++;
		});

		if(GRID_OFFSETS[section_active].fillbottom) 
		{
			GRID_OFFSETS[section_active].addedBOTTOM+=j;
			DEBUG.log("GRID", "Write into",section_active);
			$("main section.date."+section_active).append(OBJ_Dest_date);
			DISPLAY_selection();
			GRID_delete(true);
		}
		else 										
		{
			GRID_OFFSETS[section_active].addedTOP+=j;
			DEBUG.log("GRID", "Write into",section_active);
			$("main section.date."+section_active).prepend(OBJ_Dest_date);
			DISPLAY_selection();
			GRID_delete(false);
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

		GRID_Release_Scroll();
		SCROLL_set_position();

		DEBUG.log("CALLBACK","CallBack_load","Will add element on",section_active);
		
		if(GRID_OFFSETS[section_active].fillbottom) scroll_execute(true);
		else scroll_execute(false);

	}

	DEBUG.log("CALLBACK","CallBack_load",GRID_OFFSETS[section_active]);
}

window.GRID_CallBack_restaure = function(current_id)
{
	$('div#'+current_id).remove();
	
	let count=parseInt($('nav#main span#search_count').html());
	count--;
	$('nav#main span#search_count').html(count);
	
	GRID_reset("GRID_CallBack_restaure","RESTAURETRASH");
}

function GRID_load_id(date)
{
		let = section_active=GRID_Get_SectionActive();
	
	let id=0;
	let prevDate=null;

	$('main section.' + section_active+' div.fullrow').remove();

	$('main section.' + section_active+' div.element').each(function () {

		$(this).attr('id', section_active+'_'+id);
		
		let currentDate=$(this).attr('data-date');

		if(currentDate!==prevDate) 
		{
			let l_date_display = currentDate.substring(6,8) + "/" + currentDate.substring(4,6) + "/" + currentDate.substring(0,4);	
			
			if(l_date_display=="00/00/0000")  	htmldate="Undated";
			else 								htmldate=formatDateLocale(l_date_display);
			
			$(this).before('<div id="'+currentDate+'" class="fullrow"><h2>'+htmldate+'</h2></div>');
		}		
	
		prevDate=currentDate;
		id++;
	});
	
	GRID.max_elements = (id-1);
	
	return (id-1);
}

function addElement(dir, bdd, rawdate)
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
	html+= '<div id="" data-date="'+rawdate+'" class="element notselected wrapper '+file_orientationtxt+'">';
	
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