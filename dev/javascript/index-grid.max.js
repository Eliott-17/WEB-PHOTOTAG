var uniqueid;
var last_select=-1;
var data=null;

$(document).ready(function(){

	g_load_files();

	$('nav').on('click', 'div#select-status div.selection', function() { g_unselect_all(); });		

});

g_unselect_all = function unselect_all()
{
	$('main div.grid div.element').each(function () { if ($(this).hasClass('selected')) $(this).toggleClass('selected notselected');	});
	$('#select-status').fadeOut(300); 
	
	//copy fullscreenview.max.js 97-99
	$('aside#fullscreen_picture').removeClass('selected');
	$('aside#fullscreen_picture div.button-selection').addClass('notselected');
	$('aside#fullscreen_picture div.button-selection').removeClass('selected');
	
	if($('aside#fullscreen_edit').hasClass('fullscreen'))
	{	
		g_fullscreen_edit();
	}
}

g_load_files = function load_files()
{	
	uniqueid=0;

	$('main').off('click.gridSelect');
	$('main').off('click.gridOpen');
	
	if(data===null)
	{
		$.get('actions/filelist.php', function(ldata){
			
			console.log("reload file");
			data=ldata;
			load_grid();

		}, "json")
		.fail(function(xhr, status, error){
			console.error("AJAX error:", status, error);
			console.log(xhr.responseText);
		});
	}
	else 
	{
		console.log("reload from memory");
		load_grid();
	}

}

function load_grid()
{
	let source=null;
	
	if(data.status === "ok") {

		let html_undated = '<section><h3>Unknown date</h3><div class="grid">';
		let html_dated = '<section>';
		let html_mem_date="";

		let count=0;
		let undated_elements=0;

		if($('div#mainmenu button.mylib').hasClass('selected')) source=data.library;
	    if($('div#mainmenu button.untag').hasClass('selected')) source=data.untagged;

		$.each(source, function(i, bdd)
		{				
			if(bdd.time_taken_at=="00000000+0000000000")
			{
				//si on à pas de date
				html_undated += addElement(data.dir, bdd);
				undated_elements++;				
				//console.log(bdd+" match html_untagged_undated");
			}
			else
			{
				//console.log(bdd+" match html_untagged_dated");
										
				let l_date_test = bdd.time_taken_at.substring(0,8);

				let l_date_display = l_date_test.substring(6,8) + "/" + l_date_test.substring(4,6) + "/" + l_date_test.substring(0,4);	
				
				if(html_mem_date=="")
				{
					html_dated+='<h3>'+l_date_display+'</h3><div class="grid">'; //on démarre une nouvelle grille
				}
				else if(html_mem_date!=l_date_test)
				{
					html_dated+='</div><h3>'+l_date_display+'</h3><div class="grid">'; //on démarre une nouvelle grille en fermant la précédente
				}

				html_dated += addElement(data.dir, bdd);
				
				html_mem_date=l_date_test;
			}
			
			count++;
		});
		
				
		html_undated+="<div></section>";
		html_dated+="<div></section>";
		
		if(undated_elements==0) $("main").html(html_dated);
		else $("main").html(html_dated+html_undated);

		//$("main").html(html_untagged_dated+html_untagged_undated+html_tagged);
			
		$('main').on('click.gridSelect', 'div.button-select', function(e) {
			
			$(this).parent().toggleClass('selected notselected');
			
			let current_id = parseInt($(this).parent().attr('id'));
			
			if(e.shiftKey)
			{
				if(last_select>=0)
				{
					//console.log("select from "+last_select+" to "+current_id);
					
					if(current_id>last_select)
					{
						for(i=(last_select+1);i<current_id;i++) 
						{
							//console.log("switch #"+i);
							$('#'+i).toggleClass('selected notselected');
						}
					}
					else
					{
						
						for(i=(current_id+1);i<last_select;i++) 
						{
							//console.log("switch #"+i);
							$('#'+i).toggleClass('selected notselected');
						}
					}	
				}
			}

			last_select=current_id;
			
			g_display_global_selection();

		});
					
		$('main').on('click.gridOpen', 'div.button-fullscreen', function() {
			
			$('aside#fullscreen_picture img').attr("src",$(this).parent().find('img').attr('src').replace('sd','hd'));
			g_fullscreen($(this).parent().attr('id'),(count-1));
			$('nav div#mainmenu').hide();
		});						
	
	} else {
		console.log(data.message);
	}	
}

function addElement(dir, bdd)
{
	let file_orientationtxt="landscape";
	let imglink=bdd.file_hash;
	
	if(bdd.file_orientation==1) file_orientationtxt="portrait";
	if(bdd.file_original_name) imglink=bdd.file_original_name;
	
	let html ="";
	html+= '<div id="'+uniqueid+'" class="element notselected wrapper '+file_orientationtxt+'">';
	html+= '		<img data-id="'+bdd.id+'" src="sd-'+dir+'-'+bdd.file_hash+'.webp" loading="lazy">';
	html+= '	<div class="button-select cursor">';
	html+= '		<span class="material-symbols-outlined nothover">radio_button_unchecked</span>';
	html+= '		<span class="material-symbols-outlined hover">check_circle</span>';
	html+= '		<span class="material-symbols-outlined caseselected">check</span>';
	html+= '	</div>';
	html+= '	<div class="button-fullscreen cursor">';			
	html+= '		<span class="material-symbols-outlined">open_in_full</span>';
	html+= '	</div>';
	html+= '</div>';
	
	uniqueid++;
	
	return html;	
}

g_display_global_selection = function display_global_selection()
{
	let selected_ids = $('.element.selected').map(function() {
		return this.id;
	}).get();
	
	let count=selected_ids.length;

	if(count==0) $('#select-status').fadeOut(300); 
	else 
	{ 
		$('#elementscnt').html(count+" element");
		if(count>1) $('#elementscnt').append("s");
		$('#select-status').fadeIn(300); 
	}
	
	//console.log(selected_ids);
}