<?php

define("SESSION_TOKEN", "no-mandatory-session");
require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/datas.php');

?>
<!DOCTYPE html>
<html data-env="<?php echo ENV; ?>">
	<!-- BEGIN HEAD -->
	<head>
		<meta http-equiv="content-type" content="text/html;charset=UTF-8" />
		<meta charset="utf-8" />
		<title>Photo #tag</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

		<!-- HEADER SCRIPTS INCLUDED ON THIS PAGE - START -->

		<link rel="stylesheet" href="core/post.<?php echo DIM; ?>.css" type="text/css"/>
		<link rel="stylesheet" href="style/common.<?php echo filemtime('style/common.'.DIM.'.css'); ?>.<?php echo DIM; ?>.css" type="text/css"/>

		<link rel="stylesheet" href="style/file-infos.<?php echo filemtime('style/file-infos.'.DIM.'.css'); ?>.<?php echo DIM; ?>.css" type="text/css"/>
		<link rel="stylesheet" href="style/file-multi-selection-edit.<?php echo filemtime('style/file-multi-selection-edit.'.DIM.'.css'); ?>.<?php echo DIM; ?>.css" type="text/css"/>
		<link rel="stylesheet" href="style/file-open-fullscreen.<?php echo filemtime('style/file-open-fullscreen.'.DIM.'.css'); ?>.<?php echo DIM; ?>.css" type="text/css"/>
		<link rel="stylesheet" href="style/explore.<?php echo filemtime('style/explore.'.DIM.'.css'); ?>.<?php echo DIM; ?>.css" type="text/css"/>
		<link rel="stylesheet" href="style/filters.<?php echo filemtime('style/filters.'.DIM.'.css'); ?>.<?php echo DIM; ?>.css" type="text/css"/>
	
		<link rel="stylesheet" href="style/index-grid.<?php echo filemtime('style/index-grid.'.DIM.'.css'); ?>.<?php echo DIM; ?>.css" type="text/css"/>
		<link rel="stylesheet" href="style/index-login.<?php echo filemtime('style/index-login.'.DIM.'.css'); ?>.<?php echo DIM; ?>.css" type="text/css"/>
		<link rel="stylesheet" href="style/index-top.<?php echo filemtime('style/index-top.'.DIM.'.css'); ?>.<?php echo DIM; ?>.css" type="text/css"/>
		<link rel="stylesheet" href="style/upload.<?php echo filemtime('style/upload.'.DIM.'.css'); ?>.<?php echo DIM; ?>.css" type="text/css"/>

		<!-- HEADER SCRIPTS INCLUDED ON THIS PAGE - END -->

	</head>
	<!-- END HEAD -->

	<!-- BEGIN BODY -->

	<body class="no-aside-files no-aside-filters no-aside-loading">
	
		<nav id="main">
			<?php
			if(is_session_valid())
			{
				?>
					<div id="mainmenu" class="ux-background mainmenu">				
						<div><button class="library"><span class="material-symbols-outlined">photo</span>&nbsp;<span>Timeline</span><span id="library_count"></span></button></div>
						<div><button class="explore selected"><span class="material-symbols-outlined">explore</span>&nbsp;<span>Explore</span></button></div>
						<div><button class="untagged"><span class="material-symbols-outlined">new_label</span>&nbsp;<span>Untagged</span><span id="untagged_count"></span></button></div>
						<div class="search"><button class="search"><span class="material-symbols-outlined">search</span>&nbsp;<span>quick search</span></button><input type="text" list="fastsearch" autocomplete="off"/></div>
						<div class="last"><a href="actions/logout.php"><button><span class="material-symbols-outlined">logout</span>&nbsp;<span>Logout</span></button></button></a></div>
					</div>
					<div id="searchmenu" class="ux-background hidden mainmenu">				
						<div><button class="return-explore"><span class="material-symbols-outlined">arrow_back</span>&nbsp;<span>Return</span></button></div>
						<div><button class="advanced-filters"><span class="material-symbols-outlined">filter_arrow_right</span>&nbsp;<span id="filterapply"></span></button></div>
						<div><button class="advanced-filters"><span class="material-symbols-outlined">equal</span>&nbsp;<span id="filterresult"></span></button></div>
						<div class="search"><button class="search"><span class="material-symbols-outlined">search</span>&nbsp;<span>quick search</span></button><input type="text" list="fastsearch" autocomplete="off"/></div>
						<div class="last"><a href="actions/logout.php"><button><span class="material-symbols-outlined">logout</span>&nbsp;<span>Logout</span></button></button></a></div>
					</div>
				<?php
			}
			else
			{
				?>
					<div id="loginmenu" class="ux-background mainmenu">				
						<div class="title">Phototag</div>
						<div></div>
						<div></div>
						<div class="last"><button class="login"><span class="material-symbols-outlined">login</span>&nbsp;<span>Login</span></button></button></div>
					</div>					
					<div id="login" class="ux-background hidden">
						<form method="post" data-return="blockreturnlogin" action="actions/login.php" class="post">
							<input type="hidden" name="token" class="token" value=""/>
							<h4>
								<div>Email</div>
								<input type="text" name="email"/>
								<div>Password</div>
								<input type="password" name="password"/>	
								<div class="password-confirmation hidden">Password confirmation</div>
								<input class="password-confirmation hidden" type="password" name="password_verif" autocomplete="off">					
								<div class="code hidden">Code</div>
								<input class="code hidden" type="text" name="code" autocomplete="off">
							</h4>
							<br/>
							<h4>
								<button class="submit">
									<span class="material-symbols-outlined">login</span>&nbsp;&nbsp;<span>Login or Signin</span>
								</button>					
								<button class="">
									<span class="material-symbols-outlined">password</span>&nbsp;&nbsp;<span>Forgot Password</span>
								</button>	
							</h4>	
							<div id="blockreturnlogin" class="blockreturn">
								<div class="loading"><span class="material-symbols-outlined">cycle</span></div>		
								<div class="return alert alert-success"></div>
							</div>						
						</form>		
					<div>	
				<?php		
			}
			?>
		</nav>
		<nav id="status">
			<div id="upload-status" class="ux-infobox ux-background ux-hidden-opacity ux-hidden-zindex">Upload in progress&nbsp;<span id="fileprogress"></span><br><div id="progressbar">45%</div></div>
			<div id="select-status" class="ux-infobox ux-background ux-hidden-opacity ux-hidden-zindex">Selection of&nbsp;<span class="elementscnt"></span></br>			
				<div>
					<div class="deselectall">
						<span class="material-symbols-outlined cursor unselect">radio_button_unchecked</span>
						<span class="material-symbols-outlined cursor select">check_circle</span>
					</div>
					<span id="tag" class="material-symbols-outlined cursor">new_label</span>
					<span id="delete" class="material-symbols-outlined cursor">delete</span>
					<span id="share" class="material-symbols-outlined cursor">share</span>
				</div>
			</div>		
			<div id="select-trash" class="ux-infobox ux-background ux-hidden-opacity ux-hidden-zindex">Move <span class="elementscnt"></span> elements to trash ?</br>			
				<div>
					&nbsp;<span id="delete_confirm" class="material-symbols-outlined cursor">check_small</span>
					&nbsp;<span id="delete_cancel" class="material-symbols-outlined cursor">close_small</span>
				</div>
			</div>			
			<div id="flush-trash" class="ux-infobox ux-background ux-hidden-opacity ux-hidden-zindex">Empty trash</br>	
				<div>
					<span id="flush_confirm" class="material-symbols-outlined cursor">delete_forever</span><span>This action cannot be undone.</span>
				</div>
			</div>	
			<div id="error-message" class="ux-infobox ux-background ux-hidden-opacity ux-hidden-zindex">Error</br>			
				<div></div>
			</div>
			<div id="loading" class="ux-infobox ux-background ux-hidden-opacity ux-hidden-zindex">Action is in progress</br>			
				<span class="material-symbols-outlined">cycle</span>
			</div>
		</nav>
		<?php
			if(is_session_valid())
			{
				?>
				<main>
					<section id="fullscreen" class="hidden">
						<div class="ux button-leftarrow arrows">
							<span class="material-symbols-outlined">arrow_back_2</span>
						</div>
						<div class="ux button-rightarrow arrows">
							<span class="material-symbols-outlined">play_arrow</span>
						</div>
						<div class="menubackground ux-background">
							<div class="ux button-selection notselected">
								<span class="material-symbols-outlined nothover">radio_button_unchecked</span>
								<span class="material-symbols-outlined hover">check_circle</span>
								<span class="material-symbols-outlined caseselected">check</span>
							</div>
							<div class="ux button-return">
								<span class="material-symbols-outlined">close_fullscreen</span>
							</div>
							<div class="ux button-info">
								<span class="material-symbols-outlined">info</span>
							</div>
						</div>
						<div class="media"></div>
					</section>
					<section class="explore hidden"></section>
					<section class="grid library nodate"></section>
					<section class="grid library date"></section>
					<div id="uploaddrag">
						<span id="uploadmedia" class="untagged hidden">Drag & drop here to add files</span>
						<span id="uploadjson" class="untagged hidden">Google Photo supplemental-metadata.json</span>
					</div>
					<section class="grid untagged nodate hidden"></section>
					<section class="grid untagged date hidden"></section>
					<section class="grid search nodate hidden"></section>
					<section class="grid search date hidden"></section>
				</main>

				<aside id="loading" class="ux-background">
				
					<span class="material-symbols-outlined">cycle</span>
					
				</aside>
		
				<aside id="advancedfilters" class="ux-background">
				
					<h2 class="title">Advanced filters</h2>
					
					<button><span class="material-symbols-outlined">check_box_outline_blank</span>&nbsp;<span>Clear all</span></button>
					<button><span class="material-symbols-outlined">check_box</span>&nbsp;<span>Check all</span></button>
					
					<form id="filters" method="post" action="actions/file-search-list.php?offset=0&tagslist=0"/>
					
						<input type="hidden" name="token" class="token" value=""/>
						<input type="hidden" id="filter_tag" name="tag"/>
						<input type="hidden" id="filter_val" name="value"/>
						<input type="hidden" id="filters_exclude" name="filters" value="{}"/>
						<input type="hidden" id="last_checked" name="lastchecked" value="{}"/>						
						<h2 id="tag_location">
							<span class="material-symbols-outlined">globe</span>
							<span>Location</span>
							<span class="material-symbols-outlined cursor">check_box</span>
							<span class="material-symbols-outlined">compare_arrows</span>
							<span class="material-symbols-outlined cursor">check_box_outline_blank</span>
						
						</h2>
						
						<h3 class="tag_location" data-title="tag_location" id="country"><span class="material-symbols-outlined">flag</span><div class="value"></div></h3>
						<h3 class="tag_location" data-title="tag_location" id="city"><span class="material-symbols-outlined">location_city</span><div class="value"></div></h3>
						<h3 class="tag_location" data-title="tag_location" id="place" class="last"><span class="material-symbols-outlined">place</span><div class="value"></div></h3>

						<h2 id="tag_tags">
							<span class="material-symbols-outlined">tag</span>
							<span>Tags</span>
							<span class="material-symbols-outlined cursor">check_box</span>
							<span class="material-symbols-outlined">compare_arrows</span>
							<span class="material-symbols-outlined cursor">check_box_outline_blank</span>
						</h2>
		
						<h3 class="tag_tags" data-title="tag_tags" id="activity"><span class="material-symbols-outlined">directions_run</span><div class="value"></div></h3>				
						<h3 class="tag_tags" data-title="tag_tags" id="comment"><span class="material-symbols-outlined">comment</span><div class="value"></div></h3>
						<h3 class="tag_tags" data-title="tag_tags" id="people"><span class="material-symbols-outlined">group</span><div class="value"></div></h3>
						<h3 class="tag_tags" data-title="tag_tags" id="other" class="last"><span class="material-symbols-outlined">info</span><div class="value"></div></h3>

						<h2 id="tag_date">
							<span class="material-symbols-outlined">calendar_clock</span>
							<span>Date</span>
							<span class="material-symbols-outlined cursor">check_box</span>
							<span class="material-symbols-outlined">compare_arrows</span>
							<span class="material-symbols-outlined cursor">check_box_outline_blank</span>
						</h2>
						
						<h3 class="tag_date" data-title="tag_date" id="years"><span class="material-symbols-outlined">calendar_today</span><div class="value"></div></h3>
						<h3 class="tag_date" data-title="tag_date" id="months" class="last"><span class="material-symbols-outlined">calendar_month</span><div class="value"></div></h3>
					
					</form>
					
				</aside>

				<aside id="infocontent" class="ux-background">
					<form method="post" id="fileinfopost" action="actions/file-selection-load-tags.php" class="post">
						<input type="hidden" name="token" class="token" value=""/>
						<input type="hidden" name="files_hash" class="filesid" value=""/>
					</form>
					<h2 id="file_type"><span class="material-symbols-outlined"></span><span class="title"></span></h2>
					<h3 id="file_hd_error" class="margin hidden"><span>Can't display HD media</span></h3>
					<h3 id="file_original_name" class="margin"><span></span></h3>
					<h3 id="file_size" class="margin"><span></span></h3>
					<div class="informations">
						<h2 id="file_exif_idf0_make_model"><span class="material-symbols-outlined">camera</span><span class="title"></span></h2>
						<h3 id="file_exif_idf0_sensordata0" class="margin"><span></span></h3>
						<h3 id="file_exif_idf0_sensordata1" class="margin"><span></span></h3>
					</div>
					<h2><span class="material-symbols-outlined">calendar_clock</span><span>Date time</span></h2>
					<form method="post" data-return="blockreturndatetime" action="actions/file-save-infos.php?form=time" class="post">
						<input type="hidden" name="token" class="token" value=""/>
						<input type="hidden" name="filesid" class="filesid" value=""/>
						<input type="hidden" name="conflictedit" class="conflictedit" value=""/>
						<input type="hidden" name="utcflag" class="utcflag" value="0"/>	
						<h3 class="ux-tag-time" id="date"><span class="material-symbols-outlined">event</span><span class="unedit"></span><span class="solver hidden">Override all values</span><input name="date" type="date"/></h3>				
						<h3 class="ux-tag-time" id="time"><span class="material-symbols-outlined">nest_clock_farsight_analog</span><span class="unedit"></span><span class="solver hidden">Override all values</span><input name="time" type="time" step="1"/></h3>
						<h3 class="ux-tag-time" id="zone"><span class="material-symbols-outlined">south_america</span><span class="unedit"></span><span class="solver hidden">Override all values</span><select name="zone">
								  <option value="-1200">(UTC-12:00) Baker Island</option>
								  <option value="-1100">(UTC-11:00) Niue</option>
								  <option value="-1000">(UTC-10:00) Hawaii</option>
								  <option value="-0900">(UTC-09:00) Alaska</option>
								  <option value="-0800">(UTC-08:00) Los Angeles</option>
								  <option value="-0700">(UTC-07:00) Denver</option>
								  <option value="-0600">(UTC-06:00) Mexico City</option>
								  <option value="-0500">(UTC-05:00) New York</option>
								  <option value="-0400">(UTC-04:00) Santiago</option>
								  <option value="-0300">(UTC-03:00) Buenos Aires</option>
								  <option value="-0200">(UTC-02:00) South Georgia</option>
								  <option value="-0100">(UTC-01:00) Azores</option>
								  <option value="+0000">(UTC+00:00) London</option>
								  <option value="+0100">(UTC+01:00) Paris</option>
								  <option value="+0200">(UTC+02:00) Cairo</option>
								  <option value="+0300">(UTC+03:00) Moscow</option>
								  <option value="+0330">(UTC+03:30) Tehran</option>
								  <option value="+0400">(UTC+04:00) Dubai</option>
								  <option value="+0430">(UTC+04:30) Kabul</option>
								  <option value="+0500">(UTC+05:00) Karachi</option>
								  <option value="+0530">(UTC+05:30) India (Delhi)</option>
								  <option value="+0545">(UTC+05:45) Nepal (Kathmandu)</option>
								  <option value="+0600">(UTC+06:00) Dhaka</option>
								  <option value="+0630">(UTC+06:30) Myanmar (Yangon)</option>
								  <option value="+0700">(UTC+07:00) Bangkok</option>
								  <option value="+0800">(UTC+08:00) Beijing</option>
								  <option value="+0900">(UTC+09:00) Tokyo</option>
								  <option value="+0930">(UTC+09:30) Adelaide</option>
								  <option value="+1000">(UTC+10:00) Sydney</option>
								  <option value="+1100">(UTC+11:00) Solomon Islands</option>
								  <option value="+1200">(UTC+12:00) Auckland</option>
								  <option value="+1300">(UTC+13:00) Tonga</option>
								  <option value="+1400">(UTC+14:00) Line Islands</option>
							</select>
						</h3>
						<h3 id="utcinfo" class="hidden ux-tag-time">
							<div class="hidden edit">
								<span><input type="checkbox"></span><span>Apply timezone to local time</span>
							</div>
							<div>
								Current time is on UTC+0000 timezone.
							</div>
						</h3>
						<h4 class="edit_ux time" data-form="tag-time">
							<button class="save submit">
								<span class="material-symbols-outlined">Save</span><span>Save</span>
							</button>
							<button class="edit">
								<span class="material-symbols-outlined">edit</span><span>Edit</span>
							</button>
							<button class="cancel">
								<span class="material-symbols-outlined">cancel</span><span >Cancel</span>
							</button>
						</h4>
					</form>
					<div id="blockreturndatetime" class="blockreturn">
						<div class="loading"><span class="material-symbols-outlined">cycle</span></div>		
						<div class="return alert alert-success"></div>
					</div>	
					<h2><span class="material-symbols-outlined">globe</span><span>Location&nbsp;</span><span id="tooltip-location" class="tooltip-title"></span></h2>
					<form method="post" data-return="blockreturnloc" action="actions/file-save-infos.php?form=tag-location" class="post">		
						<input type="hidden" name="token" class="token" value=""/>
						<input type="hidden" name="filesid" class="filesid" value=""/>
						<input type="hidden" name="conflictedit" class="conflictedit" value=""/>	
						<h3 class="ux-tag-location gps" data-tooltip="tooltip-location" data-label="GPS coordinates"><span class="material-symbols-outlined">my_location</span><span id="GPS" class="textlabel"></span></h3>		
						<!--<h3 class="ux-tag-location" id="continent"><span class="material-symbols-outlined">globe_asia</span><span class="unedit"></span><span class="solver hidden">Override all values</span><select name="continent" ><?php foreach($DATAS_contient as $key=>$value) echo '<option value="'.$key.'">'.$value.'</option>'; ?></select></h3>-->		
						<h3 class="ux-tag-location" data-tooltip="tooltip-location" data-label="Country" id="country"><span class="material-symbols-outlined">flag</span><span class="unedit"></span><span class="solver hidden">Override all values</span><select name="country"><?php foreach($DATAS_country as $key=>$value) echo '<option value="'.$key.'">'.$value.'</option>'; ?></select></h3>
						<h3 class="ux-tag-location" data-tooltip="tooltip-location" data-label="City" id="city"><span class="material-symbols-outlined">location_city</span><span class="unedit"></span><span class="solver hidden">Override all values</span><input name="city" type="text" list="tag_city" autocomplete="off"></h3>
						<h3 class="ux-tag-location" data-tooltip="tooltip-location" data-label="Place" id="place"><span class="material-symbols-outlined">place</span><span class="unedit"></span><span class="solver hidden">Override all values</span><input name="place" type="text" list="tag_place" autocomplete="off"></h3>
						<h4 class="edit_ux tag-location" data-form="tag-location">
							<button class="save submit">
								<span class="material-symbols-outlined">Save</span><span>Save</span>
							</button>
							<button class="edit">
								<span class="material-symbols-outlined">edit</span><span>Edit</span>
							</button>
							<button class="cancel">
								<span class="material-symbols-outlined">cancel</span><span >Cancel</span>
							</button>
						</h4>
					</form>
					<div id="blockreturnloc" class="blockreturn">
						<div class="loading"><span class="material-symbols-outlined">cycle</span></div>		
						<div class="return alert alert-success"></div>
					</div>
					<h2><span class="material-symbols-outlined">tag</span><span>Tags&nbsp;</span><span id="tooltip-tags" class="tooltip-title"></span></h2>
					<form method="post" data-return="blockreturntags" action="actions/file-save-infos.php?form=tag-general" class="post">
						<input type="hidden" name="token" class="token" value=""/>
						<input type="hidden" name="filesid" class="filesid" value=""/>
						<input type="hidden" name="conflictedit" class="conflictedit" value=""/>
						<h3 class="ux-tag-general" data-tooltip="tooltip-tags" data-label="Activity" id="activity"><span class="material-symbols-outlined">directions_run</span><span class="unedit"></span><span class="solver hidden">Override all values</span><input name="activity" type="text" list="tag_activity" autocomplete="off"></h3>				
						<h3 class="ux-tag-general" data-tooltip="tooltip-tags" data-label="Comment" id="comment"><span class="material-symbols-outlined">comment</span><span class="unedit"></span><span class="solver hidden">Override all values</span><input name="comment" type="text" list="tag_comment" autocomplete="off"></h3>
						<h3 class="ux-tag-general" data-tooltip="tooltip-tags" data-label="People" id="people"><span class="material-symbols-outlined">group</span><span class="unedit"></span><span class="solver hidden">Override all values</span><input name="people" type="text" list="tag_people" autocomplete="off"></h3>
						<h3 class="ux-tag-general" data-tooltip="tooltip-tags" data-label="Other informations" id="other"><span class="material-symbols-outlined">info</span><span class="unedit"></span><span class="solver hidden">Override all values</span><input name="other" type="text" list="tag_information" autocomplete="off"></h3>
						<h4 class="edit_ux tag-general" data-form="tag-general">
							<button class="save submit">
								<span class="material-symbols-outlined">Save</span><span>Save</span>
							</button>
							<button class="edit">
								<span class="material-symbols-outlined">edit</span><span>Edit</span>
							</button>
							<button class="cancel">
								<span class="material-symbols-outlined">cancel</span><span >Cancel</span>
							</button>
						</h4>
					</form>
					<div id="blockreturntags" class="blockreturn">
						<div class="loading"><span class="material-symbols-outlined">cycle</span></div>		
						<div class="return alert alert-success"></div>
					</div>
					<h2><span class="material-symbols-outlined cursor">shield_lock</span><span>Privacy option</span></h2>						
					<form method="post" action="actions/file-lock.php" class="post">
						<input type="hidden" name="token" class="token" value=""/>
						<input type="hidden" name="filesid" class="filesid" value=""/>
						<input type="hidden" id="lock_status" name="lock_status" value=""/>
						<h3 class="legend hidden lockconflict">Different value detected, select global option below.</h3>
						<div class="privacy_mode_unlocked hidden">
							<h3>The file is available for sharing feature.</h3>
							<h4>
								<button class="submit">
									<span class="material-symbols-outlined">lock_open_right</span><span>Protect my file</span>
								</button>
							</h4>
						</div>
						<div class="privacy_mode_locked hidden">
							<h3>This file is limited for sharing feature.</h3>
							<h4>
								<button class="security submit">
									<span class="material-symbols-outlined">lock</span><span>My file is protected</span>
								</button>
							</h4>
						</div>
					</form>
					<div class="informations">
						<!--<h3 class="legend privacy_mode">Never shared mode means this photo cannot be shared through albums, links, or any other sharing feature.</h3>-->
						<h2><span class="material-symbols-outlined cursor">info</span><span>Other informations</span></h2>
						<h3 class="legend">Added time</h3>
						<h3 id="time_added_at">-</h3>
						<h3 class="legend">Modified date</h3>
						<h3 id="time_modified_at">-</h3>							
						<h4 class="button-exif"><button><span class="material-symbols-outlined cursor">expand_all</span><span class="cursor">Show raw file data</span></button></h4>
						<h3 id="exif" class="hidden"></h3>
					</div>
					<div id="actions">
						<h2><span class="material-symbols-outlined cursor">action_key</span><span>Other actions</span></h2>				
						<h4 class="button-trash"><button><span class="material-symbols-outlined cursor">delete</span><span class="cursor">Move to trash</span></button></h4>
					</div>
					<div id="datalist"></div>
					<datalist id="fastsearch"></datalist>
					<br/>
				</aside>

				<form method="post" id="flushtrash" action="actions/trash-flush.php" class="post">
					<input type="hidden" name="token" class="token" value=""/>
				</form>
				<form method="post" id="filetrash" action="actions/file-delete.php" class="post">
					<input type="hidden" name="token" class="token" value=""/>
					<input type="hidden" name="files_hash" class="filesid" value=""/>
				</form>
			<?php
			}
			else
			{
				echo '<main class="welcome"><img src="images/step1.png"><img src="images/step2.png"><img src="images/step3.png"></main>';
				/*
					No AI: No traitement or automatic sort using AI, no analytic or computer learning.
					You photos are private and no human or not human will see it, only you.
					<br/>
					Advanced filters: use the tag power to retreive a place, an important moment, 
					souvenir very fast, even if it was 10 years ago.
					<br/>
					You free to go, export you data. Take out you tag database if
					anytime you want create you own app. Nothing is lost and everything
					is documented to have easy acces
				*/
			}
		?>
	</body>
	
	
	<footer>
	
	<?php	
		if(ENV=="DEV")
		{
			/*echo "<br/>";
			echo ini_get('session.gc_maxlifetime')."<br/>";
			echo ini_get('display_errors')."<br/>";
			echo ini_get('session.use_strict_mode')."<br/>";*/
		}	
	?>
	
	</footer>
		
	<!-- END BODY -->
		
	<!-- CORE JS FRAMEWORK - START --> 
	<script src='javascript/jquery-3.7.0.min.js' type="text/javascript"></script>
	<script src='javascript/heic2any.min.js' type="text/javascript"></script>
	<!-- CORE JS FRAMEWORK - END --> 	
	
	<!-- OTHER SCRIPTS INCLUDED ON THIS PAGE - START --> 
	<script src='javascript/debug.<?php echo filemtime('javascript/debug.'.DIM.'.js'); ?>.<?php echo DIM; ?>.js'></script>
	<script src='javascript/common.<?php echo filemtime('javascript/common.'.DIM.'.js'); ?>.<?php echo DIM; ?>.js'></script>
	<script src='javascript/display.<?php echo filemtime('javascript/display.'.DIM.'.js'); ?>.<?php echo DIM; ?>.js'></script>
	<script src='javascript/grid.<?php echo filemtime('javascript/grid.'.DIM.'.js'); ?>.<?php echo DIM; ?>.js'></script>
	<script src='javascript/explore.<?php echo filemtime('javascript/explore.'.DIM.'.js'); ?>.<?php echo DIM; ?>.js'></script>
	<script src='javascript/filters.<?php echo filemtime('javascript/filters.'.DIM.'.js'); ?>.<?php echo DIM; ?>.js'></script>
	<script src='javascript/nav.<?php echo filemtime('javascript/nav.'.DIM.'.js'); ?>.<?php echo DIM; ?>.js'></script>
	<script src='javascript/login.<?php echo filemtime('javascript/login.'.DIM.'.js'); ?>.<?php echo DIM; ?>.js'></script>
	<script src='javascript/file-open-fullscreen.<?php echo filemtime('javascript/file-open-fullscreen.'.DIM.'.js'); ?>.<?php echo DIM; ?>.js'></script>
	<script src='javascript/file-info.<?php echo filemtime('javascript/file-info.'.DIM.'.js'); ?>.<?php echo DIM; ?>.js'></script>
	<script src='javascript/file-multi-selection-edit.<?php echo filemtime('javascript/file-multi-selection-edit.'.DIM.'.js'); ?>.<?php echo DIM; ?>.js'></script>
	<script src='javascript/file-upload.<?php echo filemtime('javascript/file-upload.'.DIM.'.js'); ?>.<?php echo DIM; ?>.js'></script>
	<script src='core/post.<?php echo DIM; ?>.js' type="text/javascript"></script>
	
	<?php 
	
	if(is_session_valid()) 
	{
		?><script src='javascript/init.<?php echo filemtime('javascript/init.'.DIM.'.js'); ?>.<?php echo DIM; ?>.js'></script><?php
	}
	?>
	
	<!-- OTHER SCRIPTS INCLUDED ON THIS PAGE - END --> 

</html>