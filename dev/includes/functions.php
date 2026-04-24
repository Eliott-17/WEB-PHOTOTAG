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
		$pattern = '/(?:[Uu]TC|[Gg]MT)?([+-]\d{1,2}):?(\d{2})|(?:[Uu]TC|[Gg]MT)([+-]\d{1,2})/';

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
		
		return $exifData;
	}
	
	$loc_dir = 'multimedia/'.$_SESSION["USER"].'/';
	$full_dir = $_SERVER['DOCUMENT_ROOT'].'/'.$loc_dir;

?>