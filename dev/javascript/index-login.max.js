$(document).ready(function(){
	
	$('div#mainmenu div button.login').on('click', function() {
		
		$('nav #login').toggleClass('active');
		
	});	
});

var g_login_password_verif = function login_password_verif()
{
	$('nav #login .password-confirmation').show();
}

var g_login_a2f_verif = function login_a2f_verif()
{
	$('nav #login .code').show();

}