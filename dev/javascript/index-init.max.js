$(document).ready(function()
{ 
	console.log("session valid, init");
	
	//ux refresh init
	
	if(!$('body').hasClass('no-aside')) $('body').toggleClass('no-aside');
	$('main section').removeClass('hidden');
	$('nav').removeClass('hidden');
	$('main section#maincontent').addClass('hidden');
	
	g_load_files();
});
