let GRID_debug=false;
let CALLBACK_debug=false;
let DISPLAY_debug=false;
let FILEMULTISELECTION_debug=false;

$(document).ready(function()
{ 
	console.log("session valid, init");
	DISPLAY_set_view("grid");
	GRID_load();
});
