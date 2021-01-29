let apigClient = apigClientFactory.newClient({ apiKey: "" });
let inputBox = document.getElementById("searchInput");


function searchImages() {
    let searchQuery = inputBox.value;
    if(!searchQuery){
        alert("Please enter image you are looking for");
    }
    else{
        apigClient.searchGet({ "q": searchQuery })
            .then(function (result) {
                console.log("==============================")
                console.log("response data is ", result.data);
                console.log("==============================");
                showImages(result.data);
            }).catch(function (result) {
            alert("Cannot find label.");
        });
    }
}

async function showImages(images) {
    $("#imageContainer").empty();
    console.log("images is", images)
    if(!images.length){
        alert("No Images Found!");
    }else{
        images.forEach(path => {
            $('#imageContainer').append(`<div class="col-md-4 nopadding"><div class="thumbnail">
                <a href="${path.url}" target="_blank">
                <img src="${path.url}" alt="Lights" style="width:100%"></a></div></div>`)
        });
    }
}

inputBox.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("searchButton").click();
    }
});


$(function () {
    // check for support (webkit only)
    if (!('webkitSpeechRecognition' in window))
        return;

    var input = document.getElementById('searchInput');
    var record = document.getElementById('micSearchButton');
    // setup recognition
    const talkMsg = 'Speak now';
    // seconds to wait for more input after last
    const patience = 5;
    var prefix = '';
    var isSentence;
    var recognizing = false;
    var timeout;
    var oldPlaceholder = null;
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    function restartTimer() {
        timeout = setTimeout(function () {
            recognition.stop();
        }, patience * 1000);
    }

    recognition.onstart = function () {
        oldPlaceholder = input.placeholder;
        input.placeholder = talkMsg;
        recognizing = true;
        restartTimer();
    };

    recognition.onend = function () {
        recognizing = false;
        clearTimeout(timeout);
        if (oldPlaceholder !== null)
            input.placeholder = oldPlaceholder;
    };

    recognition.onresult = function (event) {
        clearTimeout(timeout);

        // get SpeechRecognitionResultList object
        var resultList = event.results;
        // go through each SpeechRecognitionResult object in the list
        var finalTranscript = '';
        var interimTranscript = '';
        for (var i = event.resultIndex; i < resultList.length; ++i) {
            var result = resultList[i];
            // get this result's first SpeechRecognitionAlternative object
            var firstAlternative = result[0];
            if (result.isFinal) {
                finalTranscript = firstAlternative.transcript;
            } else {
                interimTranscript += firstAlternative.transcript;
            }
        }
        // capitalize transcript if start of new sentence
        var transcript = finalTranscript || interimTranscript;
        transcript = !prefix || isSentence ? capitalize(transcript) : transcript;
        // append transcript to cached input value
        input.value = prefix + transcript;

        restartTimer();
    };

    record.addEventListener('click', function (event) {
        event.preventDefault();

        // stop and exit if already going
        if (recognizing) {
            recognition.stop();
            return;
        }
        // Cache current input value which the new transcript will be appended to
        var endsWithWhitespace = input.value.slice(-1).match(/\s/);
        prefix = !input.value || endsWithWhitespace ? input.value : input.value + ' ';

        // check if value ends with a sentence
        isSentence = prefix.trim().slice(-1).match(/[\.\?\!]/);

        // restart recognition
        recognition.start();
    }, false);
});

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}




