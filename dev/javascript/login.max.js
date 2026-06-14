$(document).ready(function(){
	
	$('div#mainmenu div button.login').on('click', function() {
		
		$('nav #login').toggleClass('active');
		
	});	
});

var LOGIN_password_verif_CallBack = function password_verif()
{
	$('nav #login .password-confirmation').removeClass('hidden');
}

var LOGIN_a2f_verif_CallBack = function a2f_verif()
{
	$('nav #login .code').removeClass('hidden');

}