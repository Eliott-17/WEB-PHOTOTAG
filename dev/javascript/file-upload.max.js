$(document).ready(function() {
    // Gestion du drag & drop
    $("div#uploaddrag").on("dragover dragenter", function(e) {
        e.preventDefault();
        e.stopPropagation();
    });

    $("div#uploaddrag").on("dragleave dragend", function(e) {
        e.preventDefault();
        e.stopPropagation();
    });

    $("div#uploaddrag").on("drop", function(e) {
        e.preventDefault();
        e.stopPropagation();
        let files = Array.from(e.originalEvent.dataTransfer.files);
        if (files.length > 0) {
			
			DISPLAY_menu($('div#upload-status'),true);
				
			$.get("../core/securitytoken.php")
			.then(token => {
				uploadFiles(files, token);
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
    });
});

function orientation(width, height) {
    if (height === 0) return 0;
    return (width / height) > 1.3 ? 0 : 1;
}

function uploadFiles(files, token) {
    const bar = $('#progressbar');
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
	const totalFiles = files.length;
    let uploadedSize = 0;
    let errorCount = 0;
	let treatedFiles = 0;
	
    // Fonction pour générer une miniature (image ou vidéo)
    function generateThumbnail(file) {
        return new Promise((resolve, reject) => {
            if (file.type.startsWith('image/')) {
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
            } else if (file.type.startsWith('video/')) {
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
                reject(new Error("File not supported"));
				treatedFiles++;
            }
        });
    }

    // Upload séquentiel avec génération de miniature
    let chain = Promise.resolve();
    files.forEach(file => {
        chain = chain.then(() => {
            if (file.size > 1024 * 1024 * 1024) { // 256Mo
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

            return generateThumbnail(file)
                .then(({ file, preview, orientation }) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('preview', preview, 'preview.webp');
                    formData.append('orientation', orientation);
					formData.append('token', token);
                    return uploadSingle(file, formData);
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

    // Fonction d'upload d'un seul fichier
    function uploadSingle(file, formData) {
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

            xhr.open('POST', 'actions/file-upload.php');
            xhr.send(formData);
        });
    }

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
        NAV_open_untagg(true); // Recharge la liste des fichiers
    });
}