<?php

define("SESSION_TOKEN", "no-mandatory-session");
require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.validation.php');

$fReturn = new fReturn(); //le fetch met fin à l'execution du script par exit();

if(is_session_valid())
{
	$fReturn->addSuccessMessage("Already logged in")->fetch();
}
else
{
	if(!isset($_SESSION['try_a2f'])) $_SESSION['try_a2f']=1;
	
	$validation = new Validation();

	$validation->addVerification('token',				'sha256',			'Token');	
	$validation->addVerification('email',				'email',			'email');
	$validation->addVerification('password',			'password',			'Password');
	$validation->addVerification('password_verif',		'string',			'Password', 0,25);
	$validation->addVerification('code',				'string',			'Code',		0,6);

	$validation->Validate();

	if(!$validation->isValidated())
	{
		$fReturn->addInfoMessage($validation->Message())->fetch();	
	}
	
	//INITIALISATION BDD

	$EasyPDOAuth = new EasyPDO('sqlite:'.$_SERVER['DOCUMENT_ROOT'].'/multimedia/users.db');
	
	//status = 0 require a2f
	//status = 1 OK
	
	$EasyPDOAuth->execbdd("CREATE TABLE IF NOT EXISTS users (
	  id INTEGER PRIMARY KEY,
	  email TEXT NOT NULL UNIQUE,
	  password TEXT NOT NULL,
	  hash TEXT NOT NULL UNIQUE,
	  last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
	  status INTEGER DEFAULT 0,

	  a2f_code TEXT,
	  a2f_exp DATETIME,
	  a2f_next DATETIME);"
	);
	 
	//VERIF SI LE USER EXISTE
	
	$email = strtolower($_POST['email']);
	
	$EasyPDOAuth->addFields('*');
	$EasyPDOAuth->addConditionalData('email',$email);
	$result=$EasyPDOAuth->select('users', 'email=:email');
	
	if(!$result['status'])
	{
		$fReturn->addFailMessage("Fatal error")->fetch();	
	}
	
	$fReturn->addConsole($result['count']);
	
	if($result['count']==0) //account don't exist
	{
		if(empty($_POST['password_verif']))
		{
			$fReturn->addInfoMessage("Confirm you password to create an account.")->addCallBack("LOGIN_password_verif_CallBack")->fetch();	 
		}
		
		if($_POST['password_verif']!=$_POST['password'])
		{
			$fReturn->addWarningMessage("The passwords are different")->fetch();	
		}
		
		$user_hash = bin2hex(random_bytes(32));
		$a2f_code =  random_int(100000, 999999);

		$EasyPDOAuth->addFields('email', $email);
		$EasyPDOAuth->addFields('password', password_hash($_POST['password'], PASSWORD_DEFAULT));
		$EasyPDOAuth->addFields('hash', $user_hash);
		
		$EasyPDOAuth->addFields('a2f_exp', date('Y-m-d H:i:s', time() + 300));	
		$EasyPDOAuth->addFields('a2f_next', date('Y-m-d H:i:s', time() + 2592000));	// 30 days
		$EasyPDOAuth->addFields('a2f_code',$a2f_code);
		
		$return=$EasyPDOAuth->insert('users');
	
		//redirection
	
		if(ENV=="DEV")
		{
			//$fReturn->addConsole(print_r($return, true));
			$fReturn->addConsole($a2f_code);
		}
		
		//TODO send_a2f_email($_POST['email'],$a2f_code);
		$fReturn->addInfoMessage("Please enter the security code received by email")->addCallBack("LOGIN_a2f_verif_CallBack")->fetch(); //CallBack faire apparaitre le chanmp CODE en javascript
	}
	else if($result['count']==1) //account exist
	{				
		if(!password_verify($_POST['password'], $result['datas'][0]['password'])) 
		{
			$fReturn->addWarningMessage("Bad login credential")->fetch();
		}

		$needNewA2F = false;
		$expiredA2F = false;
		$usedA2F = false;
		
		$time = date('Y-m-d H:i:s', time());
		
		//si le champ code n'est pas vide dans la base de données
		//on attends alors que l'utilisateur le saisisse
		
		if(!empty($result['datas'][0]['a2f_code']))
		{
			if(empty($_POST['code'])) 
			{
				$fReturn->addInfoMessage("Please enter the security code received by email")->addCallBack("LOGIN_a2f_verif_CallBack")->fetch();
			}
			
			if($result['datas'][0]['a2f_exp'] < $time OR $_SESSION['try_a2f'] >= 2) 
			{
				$expiredA2F = true;
			}
			else
			{
				if(!hash_equals((string)$result['datas'][0]['a2f_code'], (string)$_POST['code'])) 
				{								
					$_SESSION['try_a2f']++;
					
					$fReturn->addWarningMessage("The code is incorrect")->fetch();
				}	
				else
				{
					$usedA2F = true;
				}
			}
		}
		
		if($result['datas'][0]['a2f_next'] < $time)
		{
			$needNewA2F = true;
		}
		
		if(ENV=="DEV")
		{
			$fReturn->addConsole("Required:".$needNewA2F);
			$fReturn->addConsole("Expired:".$expiredA2F);
			$fReturn->addConsole("Used:".$usedA2F);
		}
			
		if($needNewA2F || $expiredA2F) //code expiré ou besoin de renouveler
		{
			$_SESSION['try_a2f']=0;
			
			$a2f_code =  random_int(100000, 999999);
			$EasyPDOAuth->addFields('a2f_exp', date('Y-m-d H:i:s', time() + 300)); //code expire dans 5 minutes
			$EasyPDOAuth->addFields('a2f_next', date('Y-m-d H:i:s', time() + 2592000));	// nouvelle demande dans 30 jours
			$EasyPDOAuth->addFields('a2f_code',$a2f_code);
			$EasyPDOAuth->addConditionalData('email', $email);
			$EasyPDOAuth->update('users', 'email = :email');	
				
			if(ENV=="DEV")
			{
				$fReturn->addConsole($a2f_code);
			}
			
			//TODO send_a2f_email($_POST['email'],$a2f_code);				
			if($expiredA2F)
			{
				$fReturn->addInfoMessage("This code is expired, you will receive a new one by email");
			}
			else
			{
				$fReturn->addInfoMessage("Please enter the security code received by email");
			}
			
			$fReturn->addCallBack("LOGIN_a2f_verif_CallBack")->fetch(); //CallBack faire apparaitre le chanmp CODE en javascript			
		}
		
		if($usedA2F)
		{			
			$EasyPDOAuth->addFields('a2f_code',"");
			$EasyPDOAuth->addConditionalData('email', $email);
			$EasyPDOAuth->update('users', 'email = :email');				
		}
		
		$_SESSION["USER"] = $result['datas'][0]['hash'];

		//---------------------------------------------
		//initialise directory
		//---------------------------------------------	

		$user_dir = $_SERVER['DOCUMENT_ROOT'].'/multimedia/'.$_SESSION["USER"].'/trash';

		if(!file_exists($user_dir)) {
			if(!mkdir($user_dir, 0777, true))
			{
				$fReturn->addErrorMessage("Fatal error, unable to create user directory.");	
				if(ENV=="DEV") $fReturn->addConsole("Unable to create user dir ".$user_dir);				
				$fReturn->fetch();
			}
		}
		
		$local_recyclebin = $_SERVER['DOCUMENT_ROOT'].'/multimedia/trash';

		if (!file_exists($local_recyclebin)) {
			if(!mkdir($local_recyclebin, 0777, true))
			{
				$fReturn->addErrorMessage("Fatal error, unable to create system directory.");	
				if(ENV=="DEV") $fReturn->addConsole("Unable to create user dir ".$local_recyclebin);
				$fReturn->fetch();
			}
		}

		//---------------------------------------------
		//initialise databse
		//---------------------------------------------	

		$fReturn->addConsole("BDD");
		
		$header =  $_SERVER['DOCUMENT_ROOT'].'/multimedia/'.$_SESSION["USER"];
		$header_file_trash =  $local_recyclebin.'/'.$_SESSION["USER"];
		$commits=[];				
		
		$structureversion=2; //VERSION BDD
		
		for($i=$structureversion; $i>0; $i--)
		{
			$dbfile_original = $header.'.'.$i.'.db';
			
			if(is_file($dbfile_original))
			{
				if($i==$structureversion)
				{		
					$dbfile_final=$dbfile_original;		
					$fReturn->addConsole("NORMAL START");
					break; //normal start	
				}
				else if($i<$structureversion)
				{
					//process de migration stars
					
					$dbfile_migration = $header.'.'.$i.'m'.$structureversion.'.db'; //péprartion du nom du fichier pour la migration
					
					if(copy($dbfile_original,$header_file_trash.'.'.$i.'.'.time().'.backup')) //bacup OK
					{
						if(rename($dbfile_original,$dbfile_migration)) //rename OK
						{
							if(ENV=="DEV") $fReturn->addConsole("Migration processed file ".$dbfile_migration);
						}
						else
						{
							$commits=[]; //empty array = no modification
							if(ENV=="DEV") $fReturn->addConsole("[FAIL] Temp name for ".$dbfile_migration);
						}
					}
					else
					{
						$commits=[]; //enmpty array = no modification
						if(ENV=="DEV") $fReturn->addConsole("[FAIL] Backup for ".$dbfile_migration);
					}
					 
					break;
				}
			}
			else
			{
				array_push($commits,$i); //il faudra migrer vers la dernière version
			}
		}
		
		if(!empty($commits))
		{
			if(ENV=="DEV") $fReturn->addConsole("Commits queue ".print_r($commits,true));

			$EasyPDOUser = new EasyPDO('sqlite:'.$dbfile_migration);
			
			$migration_errors=0;
		
			if(in_array(1,$commits)) //version 1
			{
				//file_status 0 = normal
				//file_status 1 = archived
				//file_status 2 = trashed
				
				if($EasyPDOUser->execbdd("CREATE TABLE IF NOT EXISTS photos (
				  id INTEGER PRIMARY KEY,
				  file_original_name TEXT UNIQUE,
				  file_orientation INTEGER DEFAULT 0,
				  file_hash TEXT,
				  file_status INTEGER DEFAULT 0,
				  file_size INTEGER DEFAULT 0,
				  file_type INTERGER DEFAULT 0,
				  
				  time_taken_at_date TEXT,
				  time_taken_at_time TEXT,
				  time_taken_at_zone TEXT,
				  time_modified_at TEXT,
				  time_added_at TEXT,
				  
				  tag_status INTEGER DEFAULT 0,
				  tag_continent TEXT,
				  tag_country TEXT,
				  tag_city TEXT,
				  tag_place TEXT,
				  tag_activity TEXT,
				  tag_comment TEXT,
				  tag_people TEXT,
				  tag_other TEXT)")===false)
				  {
						$migration_errors=1;
				  }
			}
			  
			if(in_array(2,$commits)) //version 2 - execute to migrate from 1 to 2
			{
				if($EasyPDOUser->execbdd("ALTER TABLE photos ADD COLUMN file_size_webp INTEGER DEFAULT 0;")===false)
				{
					$migration_errors+=10;
				}
				if($EasyPDOUser->execbdd("ALTER TABLE photos ADD COLUMN file_is_private INTEGER DEFAULT 0;")===false)
				{
					$migration_errors+=100;
				}
			}

			$EasyPDOUser->closebdd();
			
			if($migration_errors==0)
			{
				$dbfile_final = $header.'.'.$structureversion.'.db';
				
				if(!rename($dbfile_migration,$dbfile_final)) //cration final file
				{
					$_SESSION["lockdown"]=true;
					$fReturn->addErrorMessage("Fatal error, contact service immediately!")->fetch();	
				}
			}
			else
			{
				$_SESSION["lockdown"]=true;
				if(ENV=="DEV") $fReturn->addConsole("[FAIL] Backup for ".$migration_errors);
				$fReturn->addErrorMessage("Fatal error, contact service immediately!")->fetch();						
			}	
		}
		
		if(!isset($dbfile_final)) $fReturn->addErrorMessage("Unable to access database.")->fetch();
		
		$_SESSION["DB"] = 'sqlite:'.$dbfile_final;
	
		create_session();
		  	
		$fReturn->addRedirect("/index.php")->fetch();		
	}
	else
	{
		$fReturn->addErrorMessage("Fatal error")->fetch();	
	}
}

?>