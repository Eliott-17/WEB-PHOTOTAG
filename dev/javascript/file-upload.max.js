const bar = $('#progressbar');
let totalSize = 0;// = files.reduce((sum, f) => sum + f.size, 0);
let totalFiles =0;// = files.length;
let uploadedSize;
let errorCount;
let treatedFiles;;
let lock=false;

$(document).ready(function() {
    // Gestion du drag & drop
    $("div#uploaddrag span").on("dragover dragenter", function(e) {
        e.preventDefault();
        e.stopPropagation();
    });

    $("div#uploaddrag span").on("dragleave dragend", function(e) {
        e.preventDefault();
        e.stopPropagation();
    });

    $("span#uploadmedia").on("drop", function(e) {
       
		if(!lock)
		{
			e.preventDefault();
			e.stopPropagation();
			let files = Array.from(e.originalEvent.dataTransfer.files);
			if (files.length > 0) {
				
				DISPLAY_menu($('div#upload-status'),true);
					
				$.get("../core/securitytoken.php")
				.then(token => {
					lock=true;
					uploadMedia(files, token);
				})
				.catch(err => {
					console.error("Can't get token", err);				
					$('#upload-status').append(
						`<div id="errorgeneral" class="text">
							<span>Internal error</span>
							&nbsp;<span class="material-symbols-outlined cursor"></span>
						</div>`
					);
				});
			}
		}
		else
		{
			NAV_CallBack_error("Upload already in progress");
		}
    });

	$("span#uploadjson").on("drop", function(e) {
		
		if(!lock)
		{		
			e.preventDefault();
			e.stopPropagation();
			let files = Array.from(e.originalEvent.dataTransfer.files);
			if (files.length > 0) {
				
				DISPLAY_menu($('div#upload-status'),true);
					
				$.get("../core/securitytoken.php")
				.then(token => {
					uploadMetadata(files, token);
				})
				.catch(err => {
					console.error("Can't get token", err);				
					$('#upload-status').append(
						`<div id="errorgeneral" class="text">
							<span>Internal error</span>
							&nbsp;<span class="material-symbols-outlined cursor"></span>
						</div>`
					);
				});
			}
		}
		else
		{
			NAV_CallBack_error("Upload already in progress");
		}
    });

});

function uploadMetadata(files, token)
{
    totalSize = files.reduce((sum, f) => sum + f.size, 0);
	totalFiles = files.length;
	uploadedSize = 0;
	errorCount = 0;
	treatedFiles = 0;	
    // Upload séquentiel avec génération de miniature
    let chain = Promise.resolve();
    files.forEach(file => {
        chain = chain.then(() => {
			
            if (file.size > 2048) { // 1Mo
                errorCount++;
				$('span#fileprogress').html(treatedFiles+'/'+totalFiles);
                $('#upload-status').append(
                    `<div id="error${errorCount}" class="text errorresponse">
                        <span>${file.name}:<br/>Fichier trop volumineux (max 1 Go)</span>
                        &nbsp;<span class="material-symbols-outlined cursor">close_small</span>
                    </div>`
                );
                $(`div#error${errorCount} span.cursor`).on('click.error' + errorCount, function() {
                    $(this).parent().remove();
                });
                return Promise.resolve();
            }
						
			return CheckFile(file)
			.then(({ time }) => {
				
				const date = new Date(time * 1000);

				const YYYY = date.getUTCFullYear();
				const MM = String(date.getUTCMonth() + 1).padStart(2, '0');
				const DD = String(date.getUTCDate()).padStart(2, '0');

				const HH = String(date.getUTCHours()).padStart(2, '0');
				const mm = String(date.getUTCMinutes()).padStart(2, '0');
				const SS = String(date.getUTCSeconds()).padStart(2, '0');
				
				const formData = new FormData();
				formData.append('token', token);
				formData.append('filename', file.name.replace('.supplement.json',''));
				formData.append('date', YYYY+MM+DD);
				formData.append('time', HH+MM+MM);

				return uploadSingle(file, formData, 'actions/file-save-date-utc.php');
			})
			.catch(error => {
				errorCount++;
				$('span#fileprogress').html(treatedFiles+'/'+totalFiles);
				$('#upload-status').append(
					`<div id="error${errorCount}" class="text errorresponse">
						<span>${file.name}:<br/>${error.message || error}</span>
						&nbsp;<span class="material-symbols-outlined cursor">close_small</span>
					</div>`
				);
				$(`div#error${errorCount} span.cursor`).on('click.error' + errorCount, function() {
					$(this).parent().remove();
				});
				return Promise.resolve();
			});
        });
    });

    // À la fin de tous les uploads
    chain.then(() => {
        if (errorCount === 0) {
			DISPLAY_menu($('div#upload-status'),false);
        } else {
            $('#upload-status').append(
                `<div id="errorgeneral" class="text">
                    <span>Upload terminé avec ${errorCount} erreur(s)</span>
                    &nbsp;<span class="material-symbols-outlined cursor">close_small</span>
                </div>`
            );
            $('div#errorgeneral span.cursor').on('click.errorgeneral', function() {
                DISPLAY_menu($('div#upload-status'),false);
				$('#upload-status div.text').remove("");
            });
			bar.css('width', '100%');
            bar.html('100%');
			
        }
		lock=false;
        //NAV_open_untagg(true); // Recharge la liste des fichiers
    });
}
		
function uploadMedia(files, token) {

    totalSize = files.reduce((sum, f) => sum + f.size, 0);
	totalFiles = files.length;	
	uploadedSize = 0;
	errorCount = 0;
	treatedFiles = 0;	
    // Upload séquentiel avec génération de miniature
    let chain = Promise.resolve();
    files.forEach(file => {
        chain = chain.then(() => {
            if (file.size > 1024 * 1024 * 1024) { // 1Go
                errorCount++;
				$('span#fileprogress').html(treatedFiles+'/'+totalFiles);
                $('#upload-status').append(
                    `<div id="error${errorCount}" class="text errorresponse">
                        <span>${file.name}:<br/>Fichier trop volumineux (max 1 Go)</span>
                        &nbsp;<span class="material-symbols-outlined cursor">close_small</span>
                    </div>`
                );
                $(`div#error${errorCount} span.cursor`).on('click.error' + errorCount, function() {
                    $(this).parent().remove();
                });
                return Promise.resolve();
            }
			
			let ThumbnailFileType = file.type;
						
			if(file.type=="")
			{
				const lastDot = file.name.lastIndexOf('.');

				if (lastDot === -1 || lastDot === 0) 
				{
					return '';//no . in the file
				}
				else
				{
					let ext = file.name.substring(lastDot + 1).toLowerCase();
					
					if (ext === "heic" || ext === "heif")
					{
						ThumbnailFileType="image/"+ext;
					}
				}
			}
	
			return generateThumbnail(file,ThumbnailFileType)
			.then(({ file, preview, orientation }) => {
				const formData = new FormData();
				formData.append('file', file);
				formData.append('preview', preview, 'preview.webp');
				formData.append('orientation', orientation);
				formData.append('token', token);
				return uploadSingle(file, formData, 'actions/file-upload.php');
			})
			.catch(error => {
				errorCount++;
				$('span#fileprogress').html(treatedFiles+'/'+totalFiles);
				$('#upload-status').append(
					`<div id="error${errorCount}" class="text errorresponse">
						<span>${file.name}:<br/>${error.message || error}</span>
						&nbsp;<span class="material-symbols-outlined cursor">close_small</span>
					</div>`
				);
				$(`div#error${errorCount} span.cursor`).on('click.error' + errorCount, function() {
					$(this).parent().remove();
				});
				return Promise.resolve();
			});
        });
    });

    // À la fin de tous les uploads
    chain.then(() => {
        if (errorCount === 0) {
			DISPLAY_menu($('div#upload-status'),false);
        } else {
            $('#upload-status').append(
                `<div id="errorgeneral" class="text">
                    <span>Upload terminé avec ${errorCount} erreur(s)</span>
                    &nbsp;<span class="material-symbols-outlined cursor">close_small</span>
                </div>`
            );
            $('div#errorgeneral span.cursor').on('click.errorgeneral', function() {
                DISPLAY_menu($('div#upload-status'),false);
				$('#upload-status div.text').remove("");
            });
			bar.css('width', '100%');
            bar.html('100%');
        }
		lock=false;
        NAV_open_untagg(true); // Recharge la liste des fichiers
    });
}

// Fonction d'upload d'un seul fichier
function uploadSingle(file, formData, action) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.upload.addEventListener('progress', e => {
			if (e.lengthComputable) {
				const currentFileLoaded = Math.min(e.loaded, file.size);
				const percent = ((uploadedSize + currentFileLoaded) / totalSize) * 100;
				bar.css('width', percent + '%');
				bar.html(Math.round(percent) + '%');
			}
		});
	
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {

					datatext="Error response";

					try
					{
						parsed = JSON.parse(xhr.responseText);
						
						try
						{
							datatext=g_treat_reponse_json(parsed);
						}
						catch(err)
						{
							console.error("Can't treat "+err);
						} 
					}
					catch(err)
					{
						console.error("Can't parse");
						parseApacheErrorLog(xhr.responseText);
					}

					uploadedSize += file.size;
					bar.css('width', Math.round((uploadedSize / totalSize) * 100) + '%');
					bar.html(Math.round((uploadedSize / totalSize) * 100) + '%');

					treatedFiles++;	

					$('span#fileprogress').html(treatedFiles+'/'+totalFiles);

					if (datatext === "OK") {
						resolve(datatext);
					} else {
						// Rejette simplement la promesse avec le message d'erreur
						reject(datatext);
					}
				} else {
					reject(`Erreur HTTP (${xhr.status})`);
				}
			}
		};

		xhr.open('POST', action);
		xhr.send(formData);
	});
}

function CheckFile(file) 
{
    if (file.type !== 'application/json') {
        treatedFiles++;
        return Promise.reject(new Error("File not supported"));
    }

    return file.text()
        .then(text => {
            try {
                const json = JSON.parse(text);

                const timestamp = json?.photoTakenTime?.timestamp;

                if (timestamp !== undefined) {
                    return {
                        time: timestamp
                    };
                }

                throw new Error("Time information not found");
            }
            catch (e) {
                throw new Error("File not json " + e.message);
            }
        })
        .catch(error => {
            treatedFiles++;
            throw error;
        });
}

// Fonction pour générer une miniature (image ou vidéo)
function generateThumbnail(file,ThumbnailFileType) 
{
	return new Promise((resolve, reject) => {
		if (ThumbnailFileType.startsWith('image/')) {
			const img = new Image();
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			img.onload = function() {
				const width = img.width / 4;
				const height = img.height / 4;
				canvas.width = width;
				canvas.height = height;
				ctx.drawImage(img, 0, 0, width, height);

				canvas.toBlob(blob => {
					resolve({ file: file, preview: blob, orientation: orientation(img.width, img.height) });
				}, 'image/webp', 0.3);
			};

			const reader = new FileReader();
			reader.onload = function(e) {
				img.src = e.target.result;
			};
			reader.readAsDataURL(file);
		} else if (ThumbnailFileType.startsWith('video/')) {
			const video = document.createElement('video');
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			video.addEventListener('loadeddata', function() {
				const width = 320;
				const height = (video.videoHeight / video.videoWidth) * width;
				canvas.width = width;
				canvas.height = height;
				video.currentTime = 1;
			});

			video.addEventListener('seeked', function() {
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
				canvas.toBlob(blob => {
					resolve({ file: file, preview: blob, orientation: orientation(video.videoWidth, video.videoHeight) });
				}, 'image/webp', 0.3);
			});

			video.src = URL.createObjectURL(file);
		} else {
			reject(new Error("File not supported: "+ThumbnailFileType));
			treatedFiles++;
		}
	});
}

function orientation(width, height) 
{
if (height === 0) return 0;
return (width / height) > 1.3 ? 0 : 1;
}
