$(document).ready(function(){

	let isDragging = false;

	document.addEventListener('mousedown', (e) => {
		if (e.shiftKey) {
			isDragging = true;
			document.body.style.userSelect = 'none'; // bloque toute sélection
			e.preventDefault(); // empêche le navigateur de sélectionner le texte
		}
	});

	document.addEventListener('mousemove', (e) => {
		if (isDragging) {
			e.preventDefault(); // bloque sélection même pendant le move
			// ici tu peux gérer ton drag / multi-sélection
		}
	});

	document.addEventListener('mouseup', (e) => {
		if (isDragging) {
			isDragging = false;
			document.body.style.userSelect = ''; // réactive la sélection
		}
	});

	// optionnel : capture selectstart au cas où
	document.addEventListener('selectstart', (e) => {
		if (isDragging) e.preventDefault();
	});

});

function formatDateTime(exifDateTime, mode = 'display') {
    if (!exifDateTime || exifDateTime.length < 19) 
	{
		return 'bad len';
	}

    // Extraction
    const year = exifDateTime.substr(0, 4);
    const month = exifDateTime.substr(4, 2);
    const day = exifDateTime.substr(6, 2);
    const timezone = exifDateTime.substr(8, 5); // ±HHMM
    const hour = exifDateTime.substr(13, 2);
    const minute = exifDateTime.substr(15, 2);
    const second = exifDateTime.substr(17, 2);

    // Mode input (HTML datetime-local)
    if (mode === 'input-datetime') {
        return `${year}-${month}-${day}T${hour}:${minute}`;
    }
    if (mode === 'input-date') {
        return `${year}-${month}-${day}`;
    }
    if (mode === 'input-time') {
        return `${hour}:${minute}:${second}`;
    }
	if (mode === 'input-zone') {
		return timezone;
	}
	
    // Mode display (par défaut)
    const date = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
    ));

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
	  weekday: 'short',
	  day: 'numeric',
	  month: 'short',
	  year: 'numeric',
	  timeZone: 'UTC'
	});
	
	const dateText = dateFormatter.format(date);

	if (mode === 'output-date') {
	  return dateText;
	}

	const timeFormatter = new Intl.DateTimeFormat('en-US', {
	  hour: '2-digit',
	  minute: '2-digit',
	  second: '2-digit',
	  hour12: false,
	  timeZone: 'UTC'
	});
	
	const timeText = timeFormatter.format(date);

	if (mode === 'output-time') {
	  return timeText;
	}

	const zoneText = 'UTC' + timezone;

	if (mode === 'output-zone') {
	  return zoneText;
	}

	return dateText + ', ' + timeText + ', ' + zoneText;
}

/**
 * Convertit une date UTC en format lisible avec la timezone locale.
 * @param {string} utcDateTime - Date au format YYYY-MM-DD HH:MM:SS (UTC).
 * @return {string} Date formatée (ex: "Sat, Mar 7, 2026, 15h29 UTC+0700").
 */
function formatUTCToLocalWithTimezone(utcDateTime) {
    // 1. Parser la date UTC
    const [datePart, timePart] = utcDateTime.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);

    // 2. Créer un objet Date en UTC
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second || 0));

    // 3. Obtenir le décalage horaire du client (format ±HHMM)
    const offsetMinutes = -utcDate.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
    const offsetMins = Math.abs(offsetMinutes % 60);
    const timezoneOffset =
        (offsetMinutes >= 0 ? '+' : '-') +
        String(offsetHours).padStart(2, '0') +
        String(offsetMins).padStart(2, '0');

    // 4. Formater la date en heure locale (avec Intl.DateTimeFormat)
    const options = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
		second: '2-digit',
        hour12: false,
    };

    // Convertir en heure locale et formater
    const localDate = new Date(utcDate); // Conversion automatique en heure locale
    let formattedDate = new Intl.DateTimeFormat('en-US', options).format(localDate);
    //formattedDate = formattedDate.replace(':', 'h'); // Remplacer ":" par "h"

    // 5. Retourner le résultat final
    return `${formattedDate} UTC${timezoneOffset}`;
}
