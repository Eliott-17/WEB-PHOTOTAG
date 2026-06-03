var uniqueid;
var last_select=-1;
var data=null;
var loaded_files=0;
var loading_limit=0;
var flag_selection_has_changed=0;
let loading = false;
let undated=0;

$(document).ready(function(){

	$(window).on('scroll', function() {

		if (loading || data==null) return;

		let scrollTop = $(window).scrollTop();
		let windowHeight = $(window).height();
		let docHeight = $(document).height();

		let remaining = docHeight - (scrollTop + windowHeight);

		// déclenche quand il reste 25%
		if (remaining < docHeight * 0.25) {
			loading=true;
			console.log("reload from scroll");
			load_grid(null, true);
		}
	});

});

g_unselect_all = function unselect_all()
{
	$('main div.element').each(function () { if ($(this).hasClass('selected')) $(this).toggleClass('selected notselected');	});
	g_ux_menu_display($('#select-status'),false);
	//copy from fullscreenview.max.js 97-99
	$('section#fullscreen').removeClass('selected');
	$('section#fullscreen div.button-selection').addClass('notselected');
	$('section#fullscreen div.button-selection').removeClass('selected');

	//copy from file-multi-selection-edit.max.js 15-18
	if(!$('body').hasClass("no-aside") && $('main section#fullscreen').hasClass("hidden"))
	{
		$('body').toggleClass("no-aside");
	}
}

g_load_files = function load_files(force_reload=false)
{	
	uniqueid=0;
	
	if(data===null || force_reload==true)
	{
		CORE_get('actions/file-load-list.php');
	}
	else 
	{
		console.log("reload from memory");
		load_grid();
	}

}

function load_grid(ldata=null, ladd=false)
{	
	$('main').off('click.gridSelect');
	$('main').off('click.gridOpen');

	if(ldata!=null) data=ldata;
	
	let source=null;
	let html_mem_date="";
		
	let total_file_library=data.library.length;
	let total_file_untagged=data.untagged.length;	
	
	$('#untaggedcount').html("&nbsp;("+total_file_untagged+")");
	
	if($('div#mainmenu button.mylib').hasClass('selected')) source=data.library;
	if($('div#mainmenu button.untag').hasClass('selected')) source=data.untagged;

	
	if(ladd==false) //chargement progressif
	{
		loaded_files=0;
		loading_limit=0;
		undated=0;
		$("main section.grid").html("");
	}
	
	$.each(source, function(i, bdd)
	{
		if(i>=loaded_files)
		{	
			if(bdd.time_taken_at_date=="00000000" &&  bdd.time_taken_at_zone=="+0000" && bdd.time_taken_at_time=="000000")
			{
				//si on à pas de date
				if(undated==0) $("main section.nodate").append('<div class="fullrow"><h2>Undated</h2></div>');
				$("main section.nodate").append(addElement(data.dir, bdd));
				undated++;
			}
			else
			{										
				let l_date_test = bdd.time_taken_at_date;

				let l_date_display = l_date_test.substring(6,8) + "/" + l_date_test.substring(4,6) + "/" + l_date_test.substring(0,4);	
				
				if(html_mem_date=="" || html_mem_date!=l_date_test)
				{
					$("main section.date").append('<div class="fullrow"><h2>'+l_date_display+'</h2></div>'); //on démarre une nouvelle grille
				}

				$("main section.date").append(addElement(data.dir, bdd));
				
				html_mem_date=l_date_test;
			}
						
			loaded_files++;
			
			//console.log("loaded: "+i);
		}
		
		if(i>(50+loading_limit)) return false;

	});
	
	loading_limit=loaded_files;

	/*if(undated==0) $("main section.nodate").html('');*/
			
	$('main').on('click.gridSelect', 'div.button-select', function(e) {
		
		let current_id = parseInt($(this).parent().attr('id').replace('grid_',''));
		
		DISPLAY_selection(current_id);
		
		if(g_is_ux_menu_visible($('div#select-trash'))) $('main section.grid div.selected').addClass('delete');

		if(DISPLAY_is_visible_file_info())
		{
			FILEMULTISELECTION_load(); //mettre à jour les infos si on affiche le aside
		}

		if(e.shiftKey)
		{	
			if(last_select>=0)
			{
				if(current_id>last_select)
				{
					for(i=(last_select+1);i<current_id;i++) 
					{
						//console.log("switch #grid_"+i);
						$('#grid_'+i).toggleClass('selected notselected');
					}
				}
				else
				{				
					for(i=(current_id+1);i<last_select;i++) 
					{
						//console.log("switch #grid_"+i);
						$('#grid_'+i).toggleClass('selected notselected');
					}
				}	
			}
		}

		last_select=current_id;
		
		g_display_menu_global_selection();//TODO
	});
	
	FILEOPENFULLSCREEN_set_button_fullscreen();
				
	loading=false;	
}

function addElement(dir, bdd)
{
	let file_orientationtxt="landscape";
	let imglink=bdd.file_hash;
	
	if(bdd.file_orientation==1) file_orientationtxt="portrait";
	if(bdd.file_original_name) imglink=bdd.file_original_name;
		
	let html ="";
	let ux = "photo";
	html+= '<div id="grid_'+uniqueid+'" class="element notselected wrapper '+file_orientationtxt+'">';
	
	html+= '	<div class="media-container" data-type="'+bdd.file_type+'" data-src="'+bdd.file_hash+'" data-id="'+bdd.id+'" id="media_'+bdd.id+'">';
	
	if(bdd.file_type == 0) 
	{
		html+= '		<img src="sd-'+bdd.file_hash+'" loading="lazy">';
	}
	if(bdd.file_type == 1)
	{
		html+= '		<video src="hd-'+bdd.file_hash+'" poster="sd-'+bdd.file_hash+'" controlslist="nodownload nofullscreen noremoteplayback"></video>';
		ux = "video";
	}
	
	html+= '	</div>';
	
	html+= '	<div class="button-select cursor">';
	html+= '		<span class="material-symbols-outlined nothover">radio_button_unchecked</span>';
	html+= '		<span class="material-symbols-outlined hover">check_circle</span>';
	html+= '		<span class="material-symbols-outlined caseselected">check</span>';
	html+= '	</div>';
	html+= '	<div class="button-fullscreen cursor '+ux+'">';			
	html+= '		<span class="material-symbols-outlined">open_in_full</span>';
	html+= '	</div>';
	html+= '</div>';
	
	uniqueid++;
	
	return html;	
}

g_display_menu_global_selection = function display_menu_global_selection()
{
	let selected_ids = $('.element.selected').map(function() {
		return this.id;
	}).get();
	
	let loaded_files=selected_ids.length;

	if(loaded_files<=1) 
	{	
		if(!$('body').hasClass("no-aside") && $('section#fullscreen').hasClass('hidden')) $('body').addClass("no-aside");
		g_ux_menu_display($('#select-status'), false); //.addClass("ux-hidden");		
	}
	else
	{ 
		$('.elementscnt').html(loaded_files+" elements");
		g_ux_menu_display($('#select-status'), true);//.removeClass("ux-hidden"); 
	}
	
	//console.log(selected_ids);
}

var g_ux_menu_display = function ux_menu_display(object, visibility)
{
	if(visibility)
	{
		object.removeClass("ux-hidden-zindex");	
		object.removeClass("ux-hidden-opacity");	
	}
	else
	{
		object.addClass("ux-hidden-opacity");
		
		setTimeout(function() { object.addClass("ux-hidden-zindex"); }, 500);
	}		
}

var g_is_ux_menu_visible = function is_ux_menu_visible(object)
{
	return !object.hasClass("ux-hidden-zindex");
}