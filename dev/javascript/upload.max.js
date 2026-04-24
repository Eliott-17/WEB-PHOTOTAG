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
}