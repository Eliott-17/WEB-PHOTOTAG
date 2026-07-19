$(document).ready(function(){
	
	$('div#loginmenu div button.login').on('click', function() {
		
		$('nav #login').toggleClass('active');
		
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