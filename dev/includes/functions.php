<?php

	function formatDateTime($exifDateTime) {
		// Extraire les parties de la chaîne
		$year = substr($exifDateTime, 0, 4);
		$month = substr($exifDateTime, 4, 2);
		$day = substr($exifDateTime, 6, 2);
		$timezone = substr($exifDateTime, 8, 5); // ±HHMM (ex: +0700)
		$hour = substr($exifDateTime, 13, 2);
		$minute = substr($exifDateTime, 15, 2);
		$second = substr($exifDateTime, 17, 2);

		// Créer un objet DateTime en UTC
		$dateString = "$year-$month-$day $hour:$minute:$second";
		$dateTime = DateTime::createFromFormat('Y-m-d H:i:s', $dateString, new DateTimeZone('UTC'));

		// Formater la date en anglais (sans appliquer le décalage, car la date est déjà locale)
		$formattedDate = $dateTime->format('D, j F Y H\hi');

		// Retourner le résultat avec le fuseau horaire
		return $formattedDate . ' UTC' . $timezone;
	}

	function extractTimezoneFromString($text) {
		// Regex pour capturer un seul fuseau horaire valide (avec signe ou préfixe UTC/GMT)
		//$pattern = '/(?:[Uu]TC|[Gg]MT)?([+-]\d{1,2}):?(\d{2})|(?:[Uu]TC|[Gg]MT)([+-]\d{1,2})/';
		$pattern = '/(?:[Uu]TC|[Gg]MT)?([+-](?:\d{2}|\d{1,2}(?=:))):?(\d{2})|(?:[Uu]TC|[Gg]MT)([+-]\d{1,2})/'; //correction 22/06

		if (preg_match($pattern, $text, $matches)) {
			// Cas 1: Format +07:00, -03:30, +0700
			if (!empty($matches[1]) && !empty($matches[2])) {
				$sign = $matches[1][0]; // + ou -
				$hours = substr($matches[1], 1); // Extraire les heures sans le signe
				$minutes = $matches[2];
				// Formater en ±HHMM
				return $sign . str_pad($hours, 2, '0', STR_PAD_LEFT) . str_pad($minutes, 2, '0', STR_PAD_LEFT);
			}
			// Cas 2: Format UTC+2, GMT-5
			elseif (!empty($matches[3])) {
				$sign = $matches[3][0]; // + ou -
				$hours = substr($matches[3], 1); // Extraire les heures sans le signe
				// Formater en ±HH00
				return $sign . str_pad($hours, 2, '0', STR_PAD_LEFT) . '00';
			}
		}
		return null; // Aucun fuseau valide trouvé
	}

	function displayExifData($data, $indent = 0) {
		foreach ($data as $key => $value) {
			if (is_array($value)) {
				echo str_repeat("&nbsp;", $indent) . "<strong>$key:</strong><br>";
				displayExifData($value, $indent + 4);
			} else {
				echo str_repeat("&nbsp;", $indent) . "<strong>$key:</strong> $value<br>";
				
				$fuseau=extractTimezoneFromString($value);
				if($fuseau!=null) echo "<br>Fuseau trouvé:".$fuseau."<br>";
			}
		}
	}

	function cleanExif($data) {

		if (!is_array($data)) {
			return is_string($data)
				? mb_convert_encoding($data, 'UTF-8', 'UTF-8')
				: $data;
		}

		foreach ($data as $k => $v) {

			if (in_array(strtolower($k), ['makernote', 'thumbnail'])) {
				unset($data[$k]);
				continue;
			}

			$data[$k] = cleanExif($v);
		}

		return $data;
	}

	function getExifData($imagePath)
	{	
		// Vérifier si le fichier existe
		if (!file_exists($imagePath)) {
			return("File does not exist");
		}

		// Lire les données EXIF
		
		$exifData = exif_read_data($imagePath, 0, true);

		// Vérifier si des données EXIF existent
		if ($exifData === false) {
			return("No data found");
		}
		
		return cleanExif($exifData);
	}
	
	//GET VIDEO TIME & timezone

	function getVideoDate($info, $filename = null) 
	{
		$result = [
			"datetime" => "00000000000000",
			"timezone_mode" => 3,
			"offset" => "+0000",
			"lat" => 0,
			"lon" => 0
		];

		$timestamp = null;

		/*
		1. METADATA
		*/

		if (!empty($info['tags']['quicktime']['creation_date'][0])) {

			$dt = new DateTime($info['tags']['quicktime']['creation_date'][0]);

			$timestamp = $dt->getTimestamp();

			$result["offset"] = $dt->format('O');
			$result["timezone_mode"] = 0;
		}

		if ($timestamp === null) {

			if (!empty($info['quicktime']['timestamps_unix']['create'])) {

				$ts = min($info['quicktime']['timestamps_unix']['create']);

				if ($ts > 0 && $ts != -2082844800) {
					$timestamp = $ts;
					$result["timezone_mode"] = 1;
				}
			}
		}

		/*
		2. GPS
		*/

		if ($result["timezone_mode"] === 1) {

			if (!empty($info['tags']['quicktime']['gps_latitude'][0]) &&
				!empty($info['tags']['quicktime']['gps_longitude'][0])) {

				$result["lat"] = (float)$info['tags']['quicktime']['gps_latitude'][0];
				$result["lon"] = (float)$info['tags']['quicktime']['gps_longitude'][0];

				$result["timezone_mode"] = 2;
			}
		}

		/*
		3. FILENAME
		*/

		if ($timestamp === null && $filename !== null) {

			$date = null;
			$time = null;

			if (preg_match('/(19\d{2}|20\d{2}|29\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])/', $filename, $d)) {
				$date = $d[0];
			}

			if (preg_match('/([01]\d|2[0-3])([0-5]\d)([0-5]\d)/', $filename, $t)) {
				$time = $t[0];
			}

			if ($date && checkdate(substr($date,4,2), substr($date,6,2), substr($date,0,4))) {

				if (!$time) $time = "000000";

				$timestamp = strtotime(
					substr($date,0,4) . "-" .
					substr($date,4,2) . "-" .
					substr($date,6,2) . " " .
					substr($time,0,2) . ":" .
					substr($time,2,2) . ":" .
					substr($time,4,2)
				);

				$result["timezone_mode"] = 1;
			}
		}

		/*
		4. FINAL
		*/

		if ($timestamp === null) {
			return $result;
		}

		$result["datetime"] = gmdate("YmdHis", $timestamp);

		return $result;
	}
	
	function retreive_sort_tags($array_lib,$array_tags,$DATAS_country,$DATAS_months)
	{		
		$return="";

		foreach ($array_lib as $index => $row) {
			
			$return.='\n'.$index.'-';
			
			foreach ($array_tags as $key => $_) {
				
				$val = $row[$key] ?? null;

				if ($val !== null) {

					if($key=='time_taken_at_date')
					{
						//months
						$period='months';
						$month = (int)substr($val, 4, 2);
						$array_tags[$period][$month] = ($array_tags[$period][$month] ?? 0) + 1;

						//year						
						$period='years';
						$year = (int)substr($val, 0, 4);
						$array_tags[$period][$year] = ($array_tags[$period][$year] ?? 0) + 1;
					}
					else
					{								
						if($key=='tag_country') 
						{
							if(!isset($array_tags[$key][$DATAS_country[$val]]))
							{
								$array_tags[$key][$DATAS_country[$val]][0] = 1;
								$array_tags[$key][$DATAS_country[$val]][1] = $val;
							}
							else
							{
								$array_tags[$key][$DATAS_country[$val]][0]++;
							}
						}
						else 					
						{
							if (!isset($array_tags[$key][$val])) 
							{
								$array_tags[$key][$val][0] = 1;
								$array_tags[$key][$val][1] = $array_lib[$index]['file_hash'];
							}
							else
							{
								$array_tags[$key][$val][0]++;	
							}
						}
					}
				}
			}
		}
		
		unset($array_tags['time_taken_at_date']);
	
		//MONTH SORT
		
		if(isset($array_tags['months']))
		{
			$array_new=[];

			foreach ($array_tags['months'] as $key => $value) 
			{
				$array_new[] = [$key, $DATAS_months[(int)$key], $value];
			}
			
			$array_tags['months']=$array_new;

			usort($array_tags['months'], function ($a, $b) {
				return $a[0] <=> $b[0];
			});
			
		}
		
		//YEAR sort
		
		if(isset($array_tags['years']))
		{	
			$array_new=[];
			
			foreach ($array_tags['years'] as $key => $value) 
			{
				$array_new[] = [$key, (string)$key, $value];
			}
			
			$array_tags['years']=$array_new;

			usort($array_tags['years'], function ($a, $b) {
				return $b[0] <=> $a[0];
			});
			
			
			foreach ($array_tags as $key => &$tags) 
			{
				if($key!='years' && $key!='months')
				{				
					arsort($tags); // tri décroissant par valeur
				}
			}
			unset($tags);	
		}
		
		return $array_tags;
		
	}
		
	$loc_dir = 'multimedia/'.$_SESSION["USER"].'/';
	$full_dir = $_SERVER['DOCUMENT_ROOT'].'/'.$loc_dir;
	

?>