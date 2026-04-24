//LE CHAT

$(document).ready(function() {
    // Gestion du drag & drop
    $(document).on("dragover dragenter", function(e) {
        e.preventDefault();
        e.stopPropagation();
    });

    $(document).on("dragleave dragend", function(e) {
        e.preventDefault();
        e.stopPropagation();
    });

    $(document).on("drop", function(e) {
        e.preventDefault();
        e.stopPropagation();
        let files = Array.from(e.originalEvent.dataTransfer.files);
        if (files.length > 0) {
            uploadFiles(files);
            $('#upload-status').fadeIn(300);
        }
    });
});

function uploadFiles(files) {
    const bar = $('#progressbar');
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    let uploadedSize = 0;
    let errorCount = 0;

    // Fonction pour générer une miniature (image ou vidéo)
    function generateThumbnail(file) {
        return new Promise((resolve, reject) => {
            if (file.type.startsWith('image/')) {
                // Génération de miniature pour une IMAGE
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
                        resolve({ file: file, preview: blob });
                    }, 'image/webp', 0.3);
                };

                const reader = new FileReader();
                reader.onload = function(e) {
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('video/')) {
                // Génération de miniature pour une VIDÉO
                const video = document.createElement('video');
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                video.addEventListener('loadeddata', function() {
                    const width = 320;
                    const height = (video.videoHeight / video.videoWidth) * width;
                    canvas.width = width;
                    canvas.height = height;

                    // Extrait une frame à 1 seconde
                    video.currentTime = 1;
                });

                video.addEventListener('seeked', function() {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(blob => {
                        resolve({ file: file, preview: blob });
                    }, 'image/webp', 0.3);
                });

                video.src = URL.createObjectURL(file);
            } else {
                reject(new Error("Type de fichier non supporté : " + file.type));
            }
        });
    }

    // Upload séquentiel avec génération de miniature
    let chain = Promise.resolve();
    files.forEach(file => {
        chain = chain.then(() => {
			
			// Dans uploadFiles(), avant de traiter chaque fichier
			if (file.size > 55 * 1024 * 1024) { // 55 Mo
				errorCount++;
				$('#upload-status').append(
					`<div id="error${errorCount}" class="text errorresponse">
						<span>${file.name} : Fichier trop volumineux (max 100 Mo)</span>
						&nbsp;<span class="material-symbols-outlined cursor">close_small</span>
					</div>`
				);
				$(`div#error${errorCount} span.cursor`).on('click.error' + errorCount, function() {
					$(this).parent().hide();
				});
				return Promise.resolve(); // Passe au fichier suivant
			}
			
            return generateThumbnail(file)
                .then(({ file, preview }) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('preview', preview, 'preview.webp');

                    return uploadSingle(file, formData);
                })
                .catch(error => {
                    errorCount++;
                    $('#upload-status').append(
                        `<div id="error${errorCount}" class="text errorresponse">
                            <span>${error.message}</span>
                            &nbsp;<span class="material-symbols-outlined cursor">close_small</span>
                        </div>`
                    );
                    $(`div#error${errorCount} span.cursor`).on('click.error' + errorCount, function() {
                        $(this).parent().hide();
                    });
                    return Promise.resolve(); // Continue la chaîne même en cas d'erreur
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
                        uploadedSize += file.size;
                        bar.css('width', Math.round((uploadedSize / totalSize) * 100) + '%');
                        bar.html(Math.round((uploadedSize / totalSize) * 100) + '%');
                        resolve(xhr.responseText);
                    } else {
                        reject(file.name);
                    }
                }
            };

            xhr.open('POST', 'actions/upload.php');
            xhr.send(formData);
        });
    }

    // À la fin de tous les uploads
    chain.then(() => {
        if (errorCount === 0) {
            $('#upload-status').fadeOut(300);
        } else {
            $('#upload-status').append(
                `<div id="errorgeneral" class="text">
                    <span>Upload ended with error(s)</span>
                    &nbsp;<span class="material-symbols-outlined cursor">close_small</span>
                </div>`
            );
            $('div#errorgeneral span.cursor').on('click.errorgeneral', function() {
                $('div#upload-status').hide();
            });
        }
        g_load_files(); // Recharge la liste des fichiers
    });
}

//ORIGINAL CODE


/*
$(document).ready(function(){
    //const dropzone = $("#dropzone");

    $(document).on("dragover dragenter", function(e){
        e.preventDefault();
        e.stopPropagation();
        //dropzone.addClass("dragover");
    });

    $(document).on("dragleave dragend", function(e){
        e.preventDefault();
        e.stopPropagation();
        //dropzone.removeClass("dragover");
    });

    $(document).on("drop", function(e){
        e.preventDefault();
        e.stopPropagation();

        // Convert FileList → Array
        let files = Array.from(e.originalEvent.dataTransfer.files);
        if(files.length > 0){
            uploadFiles(files);
			$('#upload-status').fadeIn(300);
        }
    });
});

function uploadFiles(files){
    const bar = $('#progressbar');
    const totalSize = files.reduce((sum,f)=>sum+f.size,0);
    let uploadedSize = 0; // taille cumulée des fichiers terminés
	
	//console.log("Total:"+totalSize);

    function uploadSingle(file){
        return new Promise((resolve,reject)=>{
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('file', file);

			xhr.upload.addEventListener('progress', e => {
				if(e.lengthComputable){
					const currentFileLoaded = Math.min(e.loaded, file.size); // <- ici
					const percent = ((uploadedSize + currentFileLoaded)/totalSize)*100;

					bar.css('width', percent + '%');
					bar.html(Math.round(percent) + '%');
					
					//console.log("Event progress "+file.name+" "+currentFileLoaded);
				}
			});

            xhr.onreadystatechange = function(){
                if(xhr.readyState === 4){
                    if(xhr.status === 200){
                        // ajout exact de la taille terminée
                        uploadedSize += file.size;
                        bar.css('width', Math.round((uploadedSize/totalSize)*100)+'%');
                        bar.html(Math.round((uploadedSize/totalSize)*100)+'%');
                        resolve(xhr.responseText);
						
						//console.log("Event state "+file.name+" "+uploadedSize);
						
                    } else {
                        reject(file.name);
						//console.log("Reject "+file.name);
                    }
                }
            };

            xhr.open('POST','actions/upload.php');
            xhr.send(formData);
        });
    }

    // Upload séquentiel
	let errorCount = 0;

	let chain = Promise.resolve();
	files.forEach(file => {
		chain = chain.then(() => 
			uploadSingle(file)
			.then(response => {
				if(response != "OK"){
					errorCount++;
					
					$('#upload-status').append('<div id="error'+errorCount+'" class="text errorresponse"><span>'+response+'</span>&nbsp;<span class="material-symbols-outlined cursor">close_small</span></div>');
					$('div#error'+errorCount+' span.cursor').on('click.error'+errorCount, function() { $(this).parent().hide(); });	
				}
			})
			.catch(name => {
				errorCount++;
				
				$('#upload-status').append('<div id="error'+errorCount+'" class="text errorresponse"><span>'+name+'</span>&nbsp;<span class="material-symbols-outlined cursor">close_small</span></div>');
				$('div#error'+errorCount+' span.cursor').on('click.error'+errorCount, function() { $(this).parent().hide(); });
	
			})
		);
	});

	chain.then(()=>{
		if(errorCount === 0){
			$('#upload-status').fadeOut(300); // cache seulement si pas d'erreur
		} else {
			$('#upload-status').append('<div id="errorgeneral" class="text"><span>Upload ended with error(s)</span>&nbsp;<span class="material-symbols-outlined cursor">close_small</span></div>');
			$('div#errorgeneral span.cursor').on('click.errorgeneral', function() { $('div#upload-status').hide(); });
		}
		g_load_files();
	});
*/