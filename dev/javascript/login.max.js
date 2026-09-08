$(document).ready(function(){
	
	$('div#loginmenu div button.login').on('click', function() {
		
		$('nav #login').toggleClass('active');
		
	});	
	
	$('div.mainmenu div button.logout').on('click', function() {
	
		localStorage.removeItem(APP.userhash + '_last_page');
		localStorage.removeItem(APP.userhash + '_library_count');
		localStorage.removeItem(APP.userhash + '_untagged_count');
		
		window.location.href="/actions/logout.php";
		
	});	
});

window.LOGIN_CallBack_passwordverif = function()
{
	$('nav #login .password-confirmation').removeClass('hidden');
}

window.LOGIN_CallBack_a2fverif = function()
{
	$('nav #login .code').removeClass('hidden');

}