//****************************************************************
//Variables globales *********************************************
//****************************************************************	

let GRID = {
	section_active:"explore",
	//section_active:"untagged",
	section_mem:"",
	offset_mem:null,
	scroll_mem:0,
	max_elements:0,
	changed:false,
	lock:{element_locked:false,ux_user_request:false,ux_user_answer:null},
	hashes:[],
	configelements:20
}
	
//****************************************************************
//Variables locales **********************************************
//****************************************************************	

let SECTIONS = {
    library:	{update:true,offset:0,elements:GRID.configelements,memdata:null,countmem:null},
    untagged: 	{update:true,offset:0,elements:GRID.configelements,memdata:null,countmem:null},
    search: 	{update:true,offset:0,elements:GRID.configelements,memdata:null,countmem:null,taglist:0},
    explore: 	{update:true} //chargé à l'init
};

let OFFSETS = {
    library:	{down:0,up:0,deleted:0,padding:0,fillbottom:true},
    untagged: 	{down:0,up:0,deleted:0,padding:0,fillbottom:true},
    search: 	{down:0,up:0,deleted:0,padding:0,fillbottom:true}
};

let scroll_lock_down = false;	//Chargement progressif: FLAG qui limite l'action scroll quand on est en train de charger la grille
let scroll_lock_down_down = false;
let last_select=-1;		//mémorise le dernier uniqueid sélectioné

let windowheight =  $('body').height();

$(document).ready(function(){

	//****************************************************************
	//Scroll progressif, chargement des éléments *********************
	//****************************************************************	

	$('main').on('scroll', function() {
		
		scroll_refresh();
		
	});

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
						if(!GRID.hashes.includes(media_id)) GRID.hashes.push(media_id);
						$('div#'+GRID.section_active+'_'+i).addClass('selected');
						$('div#'+GRID.section_active+'_'+i).removeClass('notselected');
					}
				}
				else
				{				
					for(i=current_id;i<=last_select;i++) 
					{
						let media_id = parseInt($('div#'+GRID.section_active+'_'+i+' div.media-container').attr('data-id'));
						if(!GRID.hashes.includes(media_id)) GRID.hashes.push(media_id);
						$('div#'+GRID.section_active+'_'+i).addClass('selected');
						$('div#'+GRID.section_active+'_'+i).removeClass('notselected');
					}
				}	
			}
		}
		else
		{
			//***********************************************
			//Mise à jour de la sélection
			//***********************************************
			
			let media_id = parseInt($('div#'+GRID.section_active+'_'+current_id+' div.media-container').attr('data-id'));

			if(GRID.hashes.includes(media_id)) 		
			{
				GRID.hashes = GRID.hashes.filter(h => h !== media_id);
				console.log("GRID", "element deleted from selection");
			}
			else 									
			{
				GRID.hashes.push(media_id);
				console.log("GRID", "element added to selection");
			}


			//***********************************************
			//END - Mise à jour de la sélection
			//***********************************************
		}

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
		
		GRID.scroll_mem = $('main').scrollTop();
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

let srollMem=0;

function scroll_refresh()
{
	let windowHeight = $('main').height();
	let scrollTop = $('main').scrollTop();
	let docHeight = $('section.date.'+GRID.section_active).height()+5;

	if(scrollTop > srollMem && !scroll_lock_down) //scroll down
	{
		GRID_add_element_bottom(scrollTop+windowHeight);
	}
	if(scrollTop < srollMem && !scroll_lock_up) //scroll down
	{	
		GRID_add_element_top(scrollTop);
	}
	
	//console.log($('main').height(),$('main').scrollTop(),$('section.date.'+GRID.section_active).height()+5);
	
	srollMem=scrollTop;
}

function GRID_add_element_top(loffset)
{	
	if(loffset>(225*3)) 
	{
		if($('main').scrollTop()<(($('section.date.'+GRID.section_active).height()+5)-(225*10))) //on supprime si on à 20 ligne en bas du scroll (200 éléments en mémoire) à tester 5 lignes
		{
			let i=0;
			
			$($('main section.' + GRID.section_active + ' > div').get().reverse()).each(function() {
				
				$(this).addClass("toremove");
				
				if($(this).hasClass("element")) i++;
				
				if(i>=20) return false;

			});
			
			OFFSETS[GRID.section_active].up-=i;					

			$('main section.' + GRID.section_active + ' > div').each(function() 
			{

				if($(this).hasClass("toremove"))
				{
					$(this).remove();
				}
			});
			
			scroll_lock_down=false; //release
			DEBUG.log("GRID","delete request from autofill page bottom");
		}
		else
		{
			DEBUG.log("GRID","scrolling up no action");
		}
	}
	else
	{
		if(OFFSETS[GRID.section_active].deleted>0)
		{		
			let elementstoload = OFFSETS[GRID.section_active].deleted-GRID.configelements;
			
			OFFSETS[GRID.section_active].fillbottom=false;		
			
			if(elementstoload<0)
			{
				SECTIONS[GRID.section_active].offset=0;
				SECTIONS[GRID.section_active].elements=OFFSETS[GRID.section_active].deleted;				
			}
			else
			{
				SECTIONS[GRID.section_active].offset=elementstoload;
				SECTIONS[GRID.section_active].elements=GRID.configelements;
			}
			
			OFFSETS[GRID.section_active].deleted-=SECTIONS[GRID.section_active].elements;
			
			SECTIONS[GRID.section_active].update=true;
			
			console.log(OFFSETS[GRID.section_active],SECTIONS[GRID.section_active]);
			
			DEBUG.log("GRID","update request from autofill page top");
			GRID_load("scroll");
		}
		else
		{
			scroll_lock_up=false;//block
		}
	}
}

function GRID_add_element_bottom(loffset)
{		
	let positionlast  = $('main section.'+GRID.section_active+' div.element').last()[0].offsetTop;

	if(positionlast>=(loffset+(225*3))) //3 ligne préchargées
	{		
		if($('main').scrollTop()>(225*10)) //on supprime si on à 20 ligne en haut du scroll (200 éléments en mémoire) à tester 5 lignes
		{
			let element_to_delete = GRID.configelements+OFFSETS[GRID.section_active].padding;
			let last_line_index=0;
			
			if(element_to_delete!=0)
			{
				OFFSETS[GRID.section_active].padding=0;
				
				//mark to remove

				$('main section.' + GRID.section_active + ' > div').each(function() {
					
					$(this).addClass("toremove");
					
					if($(this).hasClass("element")) 
					{
						last_line_index = this.offsetTop;
						element_to_delete--;
					}
					
					if(element_to_delete<=0) return false;

				});
				
				//remove element ro remove on the last line to keep full line
				
				$('main section.' + GRID.section_active + ' div.element').each(function() {

					if(this.offsetTop==last_line_index && $(this).hasClass("toremove"))
					{
						$(this).removeClass("toremove");
						OFFSETS[GRID.section_active].padding++;

					}

				});

				//effective removal
				
				$('main section.' + GRID.section_active + ' > div').each(function() {

					if($(this).hasClass("toremove"))
					{
						$(this).remove();
					}
				});
				
				OFFSETS[GRID.section_active].deleted+=(GRID.configelements-OFFSETS[GRID.section_active].padding);

				scroll_lock_up=false; //release
				DEBUG.log("GRID","delete request from autofill page bottom");
				
				GRID_load_id();
			}
		}
		else
		{
			DEBUG.log("GRID","scrolling down no action");
		}
	}
	else
	{
		OFFSETS[GRID.section_active].up+=GRID.configelements;
		OFFSETS[GRID.section_active].fillbottom=true;		

		SECTIONS[GRID.section_active].offset=OFFSETS[GRID.section_active].up;
		SECTIONS[GRID.section_active].elements=GRID.configelements;	
		
		SECTIONS[GRID.section_active].update=true;
		DEBUG.log("GRID","update request from autofill page bottom");
		GRID_load("scroll");
	}
}

function GRID_reset(from,source,searchoption=null)
{
	offset_reset=false;

	if(source=="FILES")
	{
		DEBUG.log("GRID","REQUEST UPDATE library");
		DEBUG.log("GRID","REQUEST UPDATE explore");
		
		SECTIONS["library"].memdata=null;	
		SECTIONS["library"].update=true;	

		SECTIONS["explore"].update=true;
		
		offset_reset=true;
	}
	
	if(source=="UPLOAD" || source=="FILES")
	{
		DEBUG.log("GRID","REQUEST UPDATE untagged");
		
		SECTIONS["untagged"].memdata=null;
		SECTIONS["untagged"].update=true;

		offset_reset=true;
	}

	if(source=="SEARCH" || source=="FILES")
	{
		DEBUG.log("GRID","REQUEST UPDATE search");
		
		SECTIONS["search"].memdata=null;	
		SECTIONS["search"].update=true;	
		
		if(searchoption!=null)
		{
			$('main').scrollTop(0);
			SECTIONS["search"].taglist=searchoption;
		}
		
		offset_reset=true;
	}
	
	if(SECTIONS[GRID.section_active].offset!=undefined)
	{
		if(offset_reset) 
		{
			if(SECTIONS[GRID.section_active].offset!=0)
			{
				GRID.offset_mem=SECTIONS[GRID.section_active].offset;
			}
			SECTIONS[GRID.section_active].offset=0;
			DEBUG.log("GRID","offset reset. Mem:",GRID.offset_mem);
		}
	}
	
	DEBUG.log("GRID","Reset request from",from);
}

function GRID_load(from)
{
	DEBUG.log("GRID","GRID LOAD FROM",from);
	
	if(SECTIONS[GRID.section_active].update==true)
	{
		scroll_lock_down=true;
		scroll_lock_up=true;	
		
		DEBUG.log("GRID",GRID.section_active,"update request");
		
		SECTIONS[GRID.section_active].update=false;

		switch(GRID.section_active)
		{
			case "library":
			
				CORE_get('/actions/file-load-list.php?source=0&elements='+SECTIONS[GRID.section_active].elements+'&offset='+SECTIONS[GRID.section_active].offset);
				
			break;
			case "untagged":
			
				CORE_get('/actions/file-load-list.php?source=1&elements='+SECTIONS[GRID.section_active].elements+'&offset='+SECTIONS[GRID.section_active].offset);
				
			break;
			case "search":
			
				$("#filters").attr('action','/actions/file-search-list.php?offset='+SECTIONS[GRID.section_active].offset+'&tagslist='+SECTIONS[GRID.section_active].taglist);

				SECTIONS[GRID.section_active].taglist=0; //par défaut à 0;
				
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
	
	DEBUG.log("DATAS",data_array);

	if(data_array.count!==undefined)
	{	
		if(data_array.count.total!==undefined)
		{
			let count = data_array.count.total;

			$('span#'+GRID.section_active+'_count').html(' ('+count+')');
			
			localStorage.setItem(APP.userhash+'_'+GRID.section_active+'_count', count);
			
			if(SECTIONS[GRID.section_active].countmem!==null && GRID.changed)
			{
				DEBUG.log("GRID","count mem",SECTIONS[GRID.section_active].countmem);

				if(count<SECTIONS[GRID.section_active].countmem)
				{
					regenerate=false;
					
					DEBUG.log("GRID",'Remove elements in '+GRID.section_active+' '+count+' < '+SECTIONS[GRID.section_active].countmem);
					
					if(GRID.section_active=="untagged") 
					{
						removedcount = $('main section.'+GRID.section_active+' div.element.is_tagged').length;
						
						$('main section.'+GRID.section_active+' div.element.is_tagged').remove();
						
						SECTIONS['library'].countmem+=removedcount;
						$('span#library_count').html(' ('+SECTIONS['library'].countmem+')');
						
						localStorage.setItem(APP.userhash+'_library_count', SECTIONS['library'].countmem);
					}
					
					if(GRID.section_active=="library") 
					{
						removedcount = $('main section.'+GRID.section_active+' div.element.is_not_tagged').length;
						
						$('main section.'+GRID.section_active+' div.element.is_not_tagged').remove();

						SECTIONS['untagged'].countmem+=removedcount;
						$('span#untagged_count').html(' ('+SECTIONS['untagged'].countmem+')');
						
						localStorage.setItem(APP.userhash+'_untagged_count', SECTIONS['untagged'].countmem);

					}
					
					DISPLAY_selection();
					GRID_load_id();
				}

				if(count==SECTIONS[GRID.section_active].countmem)
				{
					regenerate=false;
				}
				
				SECTIONS[GRID.section_active].offset=GRID.offset_mem;
				SECTIONS[GRID.section_active].update=false;
				
				DEBUG.log("GRID","Offset restored to",GRID.offset_mem);

				GRID.changed=false;
			}
			
			SECTIONS[GRID.section_active].countmem=count;
		}
	}
	
	if(regenerate)
	{
		DEBUG.log("GRID",'Regenerated');
		
		GRID.lock.element_locked=false;
		
		if(SECTIONS[GRID.section_active].offset<=0 &&OFFSETS[GRID.section_active].fillbottom) $("main section."+GRID.section_active).html('');

		let OBJ_Dest_date = "";//$("main section.date."+GRID.section_active);

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
			
			if(SECTIONS[GRID.section_active].memdata==null || SECTIONS[GRID.section_active].memdata!=l_date_test)
			{
				let htmldate="";

				if(l_date_display=="00/00/0000")  	htmldate="Undated";
				else 								htmldate=formatDateLocale(l_date_display);

				OBJ_Dest_date+=('<div class="fullrow"><h2>'+htmldate+'</h2></div>'); //on démarre une nouvelle grille
			}

			OBJ_Dest_date+=(addElement(data_array.dir, bdd));
							
			SECTIONS[GRID.section_active].memdata=l_date_test;

			j++;
		});

		if(OFFSETS[GRID.section_active].fillbottom) $("main section.date."+GRID.section_active).append(OBJ_Dest_date);
		else 										$("main section.date."+GRID.section_active).prepend(OBJ_Dest_date);

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
	
		if(j>=GRID.configelements) 
		{
			if(OFFSETS[GRID.section_active].fillbottom) 
			{
				GRID_add_element_bottom($('main').height());
				
			}
			else 										
			{
				GRID_add_element_top($('main').scrollTop());
					
			}
			
			scroll_lock_down=false;
			scroll_lock_up=false;	
		}
		else
		{
			if(OFFSETS[GRID.section_active].fillbottom) 
			{
				OFFSETS[GRID.section_active].up-=GRID.configelements;
				OFFSETS[GRID.section_active].up+=j;
				
				scroll_lock_up=false;
			}
			else 										
			{
				scroll_lock_down=false;		
			}
		}
		
		console.log(SECTIONS[GRID.section_active].offset,scroll_lock_down);
		
	}

	DEBUG.log("CALLBACK","CallBack_load",SECTIONS[GRID.section_active].offset,regenerate);
}

window.GRID_CallBack_restaure = function(current_id)
{
	$('div#'+current_id).remove();
	
	let count=parseInt($('nav#main span#filterresult').html());
	count--;
	$('nav#main span#filterresult').html(count);
	
	GRID_reset("","FILES");
}

function GRID_load_id()
{
	let id=0;

	$('main section.' + GRID.section_active+' div').each(function () {

		if($(this).hasClass("element"))
		{
			$(this).attr('id', GRID.section_active+'_'+id);
			id++;
		}
		else
		{
			$(this).attr('id', "date"+GRID.section_active+'_'+id);
		}
	});
	
	GRID.max_elements = (id-1);
	
	return (id-1);
	
	DEBUG.log("GRID","load_id");
}

function addElement(dir, bdd)
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
	html+= '<div id="" class="element notselected wrapper '+file_orientationtxt+'">';
	
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