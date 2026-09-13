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
		if(mem!="explore") CORE_get('/actions/file-load-explore.php');
		
		GRID.section_active=mem;
		DISPLAY_section(mem); 
		DISPLAY_set_view('grid');
	}
	else
	{
		DISPLAY_section("explore"); 
	}
	
	mem = localStorage.getItem(APP.userhash+'_library_count');

	if(mem!==null && mem!=="")
	{
		DISPLAY_media_count('library',mem);
	}

	mem = localStorage.getItem(APP.userhash+'_untagged_count');

	if(mem!==null && mem!=="")
	{
		DISPLAY_media_count('untagged',mem);
	}
		
	DISPLAY_set_view("grid");
	//GRID_load("init");
	
});
