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
// Load the model first
function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json');
    loadJSON("https://api.covid19api.com/summary", gotData, 'json');
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
    for(var i = 0; i < c.length; i++){
        let k = createElement('h1', c[i].Country);
        k.parent('covidCountries');
        k.addClass('text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-4xl text-left');
        let h = createElement('h1', formatNumber(c[i].TotalConfirmed));
        h.parent('covidCountries');
        h.addClass('text-3xl tracking-tight font-extrabold text-red-600 sm:text-4xl md:text-4xl text-right');
    }
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
    // Classifiy again!
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