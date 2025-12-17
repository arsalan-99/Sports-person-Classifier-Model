//python -m http.server 8000
Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/dummy",  
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Drop an image here or click to select",
        autoProcessQueue: false
    });

    
    dz.on("addedfile", function() {
        if (dz.files[1]!=null) {
            dz.removeFile(dz.files[0]);        
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;
        
        var url = "http://127.0.0.1:5000/classify_image";
        // Sending the uploaded image as a base64-encoded string to the Flask backend
        // The backend decodes this image and performs face detection + classification
        $.post(url, {
            image_data: file.dataURL
        },function(data, status) {
            console.log(data);
            if (!data || data.length==0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();                
                $("#error").show();
                return;
            }
            let players = ["alisha_lehmann", "christiano_ronaldo","lionel_messi", "maria_sharapova", "virat_kohli"];
            
            let match = null;
            let bestScore = -1;
            for (let i=0;i<data.length;++i) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if(maxScoreForThisClass>bestScore) {
                    match = data[i];
                    bestScore = maxScoreForThisClass;
                }
            }
            if (match) {
                $("#error").hide();
                $("#resultHolder").show();
                $("#divClassTable").show();

                // Show the uploaded image in a styled container
                let uploadedImg = $(".dz-preview .dz-image img").attr("src");
                let playerName = match.class.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                let resultHtml = `
                    <div class="card border-0">
                        <div class="position-relative rounded-circle overflow-hidden mx-auto custom-circle-image">
                            <img src="${uploadedImg}" alt="Uploaded image">
                        </div>
                        <div class="card-body text-center mt-4">
                            <h4 class="text-uppercase card-title">${playerName}</h4>
                        </div>
                    </div>
                `;
                $("#resultHolder").html(resultHtml);

                let classDictionary = match.class_dictionary;
                for(let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let proabilityScore = match.class_probability[index];
                    let elementName = "#score_" + personName;
                    $(elementName).html(proabilityScore);
                }
            }
            // dz.removeFile(file);            
        });
    });

    $("#submitBtn").on('click', function (e) {
        dz.processQueue();		
    });
}

$(document).ready(function() {
    console.log( "ready!" );
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();

    init();
});