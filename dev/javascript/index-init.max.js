$(document).ready(function()
{ 
	console.log("session valid, init");
	
	//ux refresh init
	
	$('body').addClass('no-aside');
	$('main section').removeClass('hidden');
	$('nav').removeClass('hidden');
	$('main section#fullscreen').addClass('hidden');
	
	g_load_files();
});
