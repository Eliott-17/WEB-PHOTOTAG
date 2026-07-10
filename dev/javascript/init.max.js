const APP = {
		env: document.documentElement.dataset.env
};

$(document).ready(function()
{ 
	if(APP.env=="DEV") DEBUG_enable();

	DISPLAY_set_view("grid");
	GRID_load("init");
});
