var warning = 0;
const video = document.getElementById('video')
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('../../static/js/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri("../../static/js/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri('../../static/js/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('../../static/js/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('../../static/js/models')
]).then(startWebcam)
.then(faceRecognition);


// START THE WEBCAM PERMISSION
function startWebcam() 
{
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    // IF USER HAD NOT PROVIDED THE PERMISSION THEN DIRECT LOGOUT 
      window.location.href = "http://127.0.0.1:8000/logout";
      // video.srcObject = stream;
      // alert("Please Provide Camera Persion Otherwise You Cant Give Exam")
      // document.getElementById("text_content").innerHTML = "Please Reset The Permisson And Then Start The Page";
    });
}
const imageanother = document.getElementById("profileimage").src;
console.log(imageanother);
function getLabeledFaceDescriptions() {
  const labels = ["Radhika"];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
        const img = await faceapi.fetchImage(imageanother);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
        // const getuser = new faceapi.LabeledFaceDescriptors(label, descriptions);
        // console.log(getuser);
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

// PLAYING THE VIDEO CONTINUE
async function faceRecognition() {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    // console.log(detections)
    // console.log(resizedDetections)
    
    if(detections)
    {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      // faceapi.draw.drawDetections(canvas, resizedDetections)
      // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
      const results = resizedDetections.map((d) => {
        return faceMatcher.findBestMatch(d.descriptor);
      });
      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: result,
        });
        drawBox.draw(canvas);
        // if(options.label == 'unknown')
        // {
        //   console.log("GOT YOU USER");
        // }
        if(results[0]._label == 'unknown')
        {
          alert('You Are Not The Authorise User For The Exam Or Multiple User Detected')
          window.location.href = "http://127.0.0.1:8000/logout";

        }
        // console.log(results[0]._label)
      });
    }
    else
    {
      // alert("Please Be Availbale At Camera And Dont Place Mobile Or Any Think Near Camera")
    }
    
    if(detections.length == '1'){
      console.log("1 person");
    }else if(detections.length == '0'){
      console.log("0 person");
      var per0 = 1;
      warning=eval(warning+per0);
      alert("Please Dont Move Too Much Or Dont Place Mobile Near You");
    }else if(detections.length <= '2'){
      console.log("2 person");
      var per1 = 1;
      warning=eval(warning+per1);
      alert("Multiple User Detected");
    }
    if(warning <= 5){
      console.log(warning);
    }
    if(warning >= 5){
      window.location.href = "http://127.0.0.1:8000/logout";
    }
    
  }, 2000)
})
}
var elem = document.documentElement;
// function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
setTimeout(function() {
  var myCheck = document.getElementById("click_to_record");
  var myFullscreen = document.getElementById("click_to_fullscreen");
  if (myCheck) {
      myCheck.click();
  }
  },1000);

  setTimeout(function() {
    var myFullscreen = document.getElementById("click_to_fullscreen");
    if (myFullscreen) {
      console.log(myFullscreen);
        myFullscreen.click();
    }
    },500);
  var elem = document.documentElement;
  function openFullscreen() {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }
  }



  // TIME CHECKING
  setInterval(function () {
    var d = new Date();
    var seconds = d.getMinutes() * 60 + d.getSeconds(); //convet 00:00 to seconds for easier caculation
    var fiveMin = 60 * 5; //five minutes is 300 seconds!
    var timeleft = fiveMin - seconds % fiveMin; // let's say 01:30, then current seconds is 90, 90%300 = 90, then 300-90 = 210. That's the time left!
    var result = parseInt(timeleft / 60) + ':' + timeleft % 60; //formart seconds into 00:00 
    document.getElementById('timechecker').innerHTML = result;

}, 500)


  // AUDIO CHECKING CODE
  click_to_record.addEventListener('click',function(){
      
  var speech = true;
  window.SpeechRecognition = window.webkitSpeechRecognition;

  const recognition = new SpeechRecognition();
  recognition.interimResults = true;
  var count = 10;
  // setInterval(async () => {
  recognition.addEventListener('result', e => {
      const transcript = Array.from(e.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')  
          // console.log(transcript); 
          console.log(count)
          alert("Dont Speak!");
          window.location.href = "http://127.0.0.1:8000/logout";
          document.getElementById("convert_text").innerHTML = transcript;
          document.getElementById("warnings").innerHTML = count;
          alerted = true;
          // console.log(transcript)
          
      document.getElementById("convert_text").innerHTML = transcript;
      // console.log(transcript);
      alert("Dont Speech Too Much");
      window.location.href = "http://127.0.0.1:8000/logout";
      });
  // }, 5000)
  setInterval(async () => {
      if (speech == true) {
          recognition.start();
      }
      else
      {
        console.log("TEST HERE")
      }
  }, 5000)
  })

  

