// Classifier Variable
let classifier;
// Model URL
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/tX5wOUtYY/';

// Video
let video;
let flippedVideo;
// To store the classification
let label = "";

let pause_state = false;
let playing = "Pause Mask Detection";
let paused = "Start Mask Detection";

let mask_result = "Yay! Keep wearing your mask!";
let mask_off = "Masks are a simple barrier to help prevent your respiratory droplets from reaching others. Studies show that masks reduce the spray of droplets when worn over the nose and mouth.";
let mask_on = "Thanks for doing your part to prevent the spread of COVID-19. Check out some more COVID-19 information below as well as up to date statistics on its spread.";
let mask_off_nose = "Make sure your mask is over your nose and mouth and secure it under your chin and try to fit it snugly against the sides of your face."

let covidData;
let covidGlobal;

let fipsInput;
let zipInput;
let mask;
let covert;

L.mapquest.key = 'KPWhVIiFhObASlw1rwU6ZGQns9bxa3sB';
var geocoder = L.mapquest.geocoding();
// Load the model first
function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json');
    loadJSON("https://api.covid19api.com/summary", gotData, 'json');
    mask = loadJSON('mask-usage.json', 'json');
    convert = loadJSON('zipConvert.json', 'json');
}

function gotData(data){
    covidData = data;
}

function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }

function setup() {
    canvas = createCanvas(640, 480);
    canvas.parent('video')
    // Create the video
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();

    flippedVideo = ml5.flipImage(video);
    // Start classifying
    classifyVideo();
    document.getElementById("pause_button").innerHTML = playing;
    document.getElementById("mask_info").innerHTML = mask_on;
    document.getElementById("label").innerHTML = mask_result;
    document.getElementById("covidGlobal").innerHTML = formatNumber(covidData.Global.TotalConfirmed);
    let c = covidData.Countries;
    for(var i = 0; i < 0; i++){
        let k = createElement('h1', c[i].Country);
        k.parent('covidCountries');
        k.addClass('text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-4xl text-left');
        let h = createElement('h1', formatNumber(c[i].TotalConfirmed));
        h.parent('covidCountries');
        h.addClass('text-3xl tracking-tight font-extrabold text-red-600 sm:text-4xl md:text-4xl text-right');
    }
    zipLookUp();
}

function draw() {
    background(0);
    // Draw the video
    image(flippedVideo, 0, 0);
    //Setting the label and info
    if(label == "Mask"){
        mask_result = "Yay! Keep wearing your mask!";
        document.getElementById("mask_info").innerHTML = mask_on;
    }if (label == "No Mask") {
        mask_result = "No mask? What gives?";
        document.getElementById("mask_info").innerHTML = mask_off;
    } if(label == "Off Nose"){
        mask_result = "You need to wear your mask properly";
        document.getElementById("mask_info").innerHTML = mask_off_nose;
    }

    document.getElementById("label").innerHTML = mask_result;
     
}

// Get a prediction for the current video frame
function classifyVideo() {
    flippedVideo = ml5.flipImage(video)
    classifier.classify(flippedVideo, gotResult);
    flippedVideo.remove();
}

// When we get a result
function gotResult(error, results) {
    // If there is an error
    if (error) {
        console.error(error);
        return;
    }
    // The results are in an array ordered by confidence.
    // console.log(results[0]);
    label = results[0].label;
    // Classifiy again
    classifyVideo();
}

//Pauses capture to prevent excessive battery usage
function pauseCapture(){
    if(pause_state == false){
        video.pause();
        pause_state = true;
        document.getElementById("pause_button").innerHTML = paused;
    }else{
        video.play();
        pause_state = false;
        document.getElementById("pause_button").innerHTML = playing;
    }

}

//Gets Zip Code input and converts it to FIPS code for data lookup
function getZipCode(){
    zipInput = document.getElementById("zip").value;
    for(var i = 0; i < convert.codes.length; i++){
        if(zipInput == convert.codes[i].zip){
            fipsInput = convert.codes[i].stCountyFp;
            document.getElementById("place").innerHTML = convert.codes[i].countyName + ", " + convert.codes[i].state;
        }
    }
    getMaskData();
}

//Uses FIPS code to retrieve mask wearing data
function getMaskData(){
    if(mask){
        for(var i = 0; i < mask.maskData.length; i++){
            if(fipsInput == mask.maskData[i].countyfp){
                document.getElementById("always-text").innerHTML = Math.round(mask.maskData[i].always * 100)+"%";
                document.getElementById("always-bar").style.width = Math.round(mask.maskData[i].always * 100)+"%";
                document.getElementById("frequently-text").innerHTML = Math.round(mask.maskData[i].frequently * 100)+"%";
                document.getElementById("frequently-bar").style.width = Math.round(mask.maskData[i].frequently * 100)+"%";
                document.getElementById("sometimes-text").innerHTML = Math.round(mask.maskData[i].sometimes * 100)+"%";
                document.getElementById("sometimes-bar").style.width = Math.round(mask.maskData[i].sometimes * 100)+"%";
                document.getElementById("rarely-text").innerHTML = Math.round(mask.maskData[i].sometimes * 100)+"%";
                document.getElementById("rarely-bar").style.width = Math.round(mask.maskData[i].sometimes * 100)+"%";
                document.getElementById("never-text").innerHTML = Math.round(mask.maskData[i].sometimes * 100)+"%";
                document.getElementById("never-bar").style.width = Math.round(mask.maskData[i].sometimes * 100)+"%";
            }
        }
    }

}

//Gets users current location
function zipLookUp(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(setCoord);
    }else{
        alert("Location service is not supported. Please enter your zip code to see data");
    }
}
//sends users current location to MapQuest GeoEncoder to turn into zip code
function setCoord(position){
    geocoder.reverse([position.coords.latitude,position.coords.longitude], geocodingCallback);
}

//Returns MapQuest results and triggers the page to update with user's location
function geocodingCallback(error, result) {
  console.log(result);
    document.getElementById("zip").value = result.results[0].locations[0].postalCode;
    getZipCode();
}