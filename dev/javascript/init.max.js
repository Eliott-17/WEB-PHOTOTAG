let GRID_debug=true;
let CALLBACK_debug=true;
let DISPLAY_debug=true;
let FILEMULTISELECTION_debug=true;

$(document).ready(function()
{ 
	console.log("session valid, init");
	DISPLAY_set_view("grid");
	GRID_load();
});
