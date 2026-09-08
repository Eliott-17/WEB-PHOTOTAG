const APP = {
		env: 			document.documentElement.dataset.env,
		griddisplay: 	parseInt(document.documentElement.dataset.griddisplay),
		userhash:		document.documentElement.dataset.user
};

$(document).ready(function()
{ 
	if(APP.env=="DEV") 
	{
		DEBUG_enable();
		DEBUG.log("DISPLAY","Grid display set at "+APP.griddisplay+" elements");
	}
	
	let mem = localStorage.getItem(APP.userhash+'_last_page');
	
	if(mem!==null && mem!=="")
	{
		if(mem=="search") mem="explore";
		
		GRID.section_active=mem;
		$('div#mainmenu div button.'+mem).addClass("selected");
	}
	else
	{
		$('div#mainmenu div button.explore').addClass("selected");
	}

	mem = localStorage.getItem(APP.userhash+'_library_count');

	if(mem!==null && mem!=="")
	{
		$('span#library_count').html(' ('+mem+')');
	}

	mem = localStorage.getItem(APP.userhash+'_untagged_count');

	if(mem!==null && mem!=="")
	{
		$('span#untagged_count').html(' ('+mem+')');
	}
		
	DISPLAY_set_view("grid");
	GRID_load("init");
	
});
