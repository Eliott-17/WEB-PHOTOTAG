//****************************************************************
//Variables globales *********************************************
//****************************************************************	

let gSECTION_active="explore";
let gSECTION_active_mem="";
let gSECTION_mem_offset;

let gGRID_scrollmem; 			//Restaure le scroll quand on sirt du fullscreen
	
//****************************************************************
//Variables locales *********************************************
//****************************************************************	

let SECTIONS = {
    library:	{update:true,offset:0,memdata:null,countmem:null},
    untagged: 	{update:true,offset:0,memdata:null,countmem:null},
    search: 	{update:true,offset:0,memdata:null,taglist:0},
    explore: 	{update:true} //chargé à l'init
};

let scroll_lock = false;	//Chargement progressif: FLAG qui limite l'action scroll quand on est en train de charger la grille
let last_select=-1;		//mémorise le dernier uniqueid sélectioné

$(document).ready(function(){

	$('main').on('scroll', function() {
		
		if (scroll_lock || SECTIONS[gSECTION_active].offset==-1) return;

		let scrollTop = $('main').scrollTop();
		let windowHeight = $('main').height();
		let docHeight = $('section.date.'+gSECTION_active).height()+$('section.nodate.'+gSECTION_active).height();
		
		let remaining = docHeight - (scrollTop + windowHeight);
		
		// déclenche quand il reste 25%
		if (remaining < docHeight * 0.25) {
			if(remaining>=0)
			{
				scroll_lock=true;
				SECTIONS[gSECTION_active].update=true;
				SECTIONS[gSECTION_active].offset+=50;
				GRID_load("scroll");
			}
		}
	});

});

function GRID_reset(from,source,searchoption=null)
{
	offset_reset=true;
	
	switch(source)
	{
		case "FILES":

			DEBUG.log("GRID","REQUEST UPDATE library");
			DEBUG.log("GRID","REQUEST UPDATE explore");
			
			SECTIONS["library"].memdata=null;	
			SECTIONS["library"].update=true;	

			SECTIONS["explore"].update=true;

		case "UPLOAD":

			DEBUG.log("GRID","REQUEST UPDATE untagged");
			
			SECTIONS["untagged"].memdata=null;
			SECTIONS["untagged"].update=true;

		break;
		case "SEARCH":		
		
			DEBUG.log("GRID","REQUEST UPDATE search");
			
			SECTIONS["search"].memdata=null;	
			SECTIONS["search"].update=true;	
			
			if(searchoption!=null)
			{
				$('main').scrollTop(0);
				SECTIONS["search"].taglist=searchoption;
			}

		break;
		default:
			offset_reset=false;
		break;
	}
	
	if(SECTIONS[gSECTION_active].offset!=undefined)
	{
		if(offset_reset) 
		{
			gSECTION_mem_offset=SECTIONS[gSECTION_active].offset;
			SECTIONS[gSECTION_active].offset=0;
			DEBUG.log("GRID","GRID offset reset");
		}
	}
	
	DEBUG.log("GRID","Reset request from",from);
}

function GRID_load(from)
{
	scroll_lock=true;
	
	if(SECTIONS[gSECTION_active].update==true)
	{
		DEBUG.log("GRID","GRID",gSECTION_active,"update request");
		
		SECTIONS[gSECTION_active].update=false;

		switch(gSECTION_active)
		{
			case "library":
			
				CORE_get('actions/file-load-list.php?source=0&offset='+SECTIONS[gSECTION_active].offset);

			break;
			case "untagged":
			
				CORE_get('actions/file-load-list.php?source=1&offset='+SECTIONS[gSECTION_active].offset);
			
			break;
			case "search":
			
				$("#filters").attr('action','actions/file-search-list.php?offset='+SECTIONS[gSECTION_active].offset+'&tagslist='+SECTIONS[gSECTION_active].taglist);

				SECTIONS[gSECTION_active].taglist=0; //par défaut à 0;
				
				//TAGLIST=0 > "GRID_CallBack_load" + array("datas"=>$return);
				//TAGLIST=1 > "EXPLORE_CallBack_search" + $tag); + datas
				//TAGLIST=2 > "FILTERS_CallBack_search" + $tag); + datas

				CORE_post($("#filters"));
			
			break;
			case "explore":
			
				CORE_get('actions/file-load-explore.php');
				
			break;
			default: break;	
		}			
	}
	else
	{
		$('main section div.element.memselected').removeClass('memselected');
		
		DEBUG.log("GRID","GRID",gSECTION_active,"no action");		
	}
}

window.GRID_CallBack_load = function(data_array)
{
	let regenerate=true;

	if(data_array.count!==undefined)
	{
		$('span#'+gSECTION_active+'_count').html(' ('+data_array.count+')');
		
		if(SECTIONS[gSECTION_active].countmem!==undefined)
		{
			if(SECTIONS[gSECTION_active].countmem===null)
			{
				SECTIONS[gSECTION_active].countmem=data_array.count;
			}
			else
			{
				if(data_array.count<SECTIONS[gSECTION_active].countmem)
				{
					regenerate=false;
					
					DEBUG.log("GRID",'Remove elements');
					
					$('main section div.element.memselected').remove();
					DISPLAY_selection();
					GRID_load_id();
				}

				if(data_array.count==SECTIONS[gSECTION_active].countmem)
				{
					regenerate=false;
				}
				
				SECTIONS[gSECTION_active].offset=gSECTION_mem_offset;
			}
			
			SECTIONS[gSECTION_active].countmem=data_array.count;
		}
	}
	
	if(regenerate)
	{		
		if(SECTIONS[gSECTION_active].offset<=0) $("main section."+gSECTION_active).html('');

		OBJ_Dest_nodate = $("main section.nodate."+gSECTION_active);
		OBJ_Dest_date = $("main section.date."+gSECTION_active);
		OBJ_Select_both = $("main section.grid");
		
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
			
			if(bdd.time_taken_at_date=="00000000" &&  bdd.time_taken_at_zone=="00000" && bdd.time_taken_at_time=="000000")
			{
				//si on à pas de date
				if(OBJ_Dest_nodate.html()=='') OBJ_Dest_nodate.append('<div class="fullrow"><h2>Undated</h2></div>');
				OBJ_Dest_nodate.append(addElement(data_array.dir, bdd));
			}
			else
			{										
				let l_date_test = bdd.time_taken_at_date;

				let l_date_display = l_date_test.substring(6,8) + "/" + l_date_test.substring(4,6) + "/" + l_date_test.substring(0,4);	
				
				if(SECTIONS[gSECTION_active].memdata==null || SECTIONS[gSECTION_active].memdata!=l_date_test)
				{
					OBJ_Dest_date.append('<div class="fullrow"><h2>'+formatDateLocale(l_date_display)+'</h2></div>'); //on démarre une nouvelle grille
				}

				OBJ_Dest_date.append(addElement(data_array.dir, bdd));
								
				SECTIONS[gSECTION_active].memdata=l_date_test;
			}
			
			j++;
		});
			
		if(max_display<50) SECTIONS[gSECTION_active].offset=-1; //bloquage du scroll

		//****************************************************************
		//Attribution d'un uniqueid aux éléments chargés *****************
		//****************************************************************		
			
		let id = GRID_load_id();
		
		//****************************************************************
		//Déchagrement des précents boutons ******************************
		//****************************************************************	

		$('main').off('click.gridSelect');
		$('main').off('click.gridOpen');
		$('main').off('click.gridRestaure');
		
		
		//****************************************************************
		//Ajout du bouton de restoration (en mode corbeille) *************
		//****************************************************************	

		$('main').on('click.gridRestaure', 'div.button-restaure', function(e) {
			
			let current_id = $(this).parent().attr('id');
			let hash = $('div#'+current_id+' div.media-container').attr('data-src');
			
			CORE_get('actions/file-restaure.php?hash='+hash+'&id='+current_id);	
		});
		//****************************************************************
		//Ajout du bouton de sélection d'une photo sur la grille *********
		//****************************************************************	

		$('main').on('click.gridSelect', 'div.button-select', function(e) {
			
			let current_id = parseInt($(this).parent().attr('id').replace(gSECTION_active+'_',''));
					
			//****************************************************************
			//Logique de sélection en lot avec la touche SHIFT ***************
			//****************************************************************		

			if(e.shiftKey)
			{	
				if(last_select>=0)
				{				
					if(current_id>last_select)
					{
						for(i=(last_select+1);i<current_id;i++) 
						{
							$('div#'+gSECTION_active+'_'+i).addClass('selected');
							$('div#'+gSECTION_active+'_'+i).removeClass('notselected');
						}
					}
					else
					{				
						for(i=(current_id+1);i<last_select;i++) 
						{
							$('div#'+gSECTION_active+'_'+i).addClass('selected');
							$('div#'+gSECTION_active+'_'+i).removeClass('notselected');
						}
					}	
				}
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
			
			let media_id = parseInt($(this).parent().attr('id').replace(gSECTION_active+'_',''));
			
			let max = (id);
			
			gGRID_scrollmem = $('main').scrollTop();
			vFILEOPEN_currentid=media_id;
			max_id=max;
			ArrowDisplay(media_id, max); 
			FILEOPENFULLSCREEN_Loadmedia(media_id);
			DISPLAY_set_view("fullscreen");	//order before DISPLAY_selection is important
			DISPLAY_selection(vFILEOPEN_currentid,true);
		});	
		
		DISPLAY_selection();
		
	}

	$('main section div.element.memselected').removeClass('memselected');
	
	scroll_lock=false;

	DEBUG.log("CALLBACK","CallBack_load",SECTIONS[gSECTION_active].offset,regenerate);
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

	$('main section.' + gSECTION_active+' div.element').each(function () {
		$(this).attr('id', gSECTION_active+'_'+id);
		id++;
	});
	
	return id;
	
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

	if(bdd.file_type == 0) 
	{
		html+= '		<img src="sd-'+before+bdd.file_hash+'" loading="lazy">';
	}
	if(bdd.file_type == 1)
	{
		html+= '		<video src="hd-'+before+bdd.file_hash+'" poster="sd-'+bdd.file_hash+'" controlslist="nodownload nofullscreen noremoteplayback"></video>';
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
		html+= '		<span class="material-symbols-outlined">open_in_full</span>';
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