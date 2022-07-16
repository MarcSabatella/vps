// canvas elements

const canvasDivElem = document.getElementById("canvas-div");
const videoDivElem = document.getElementById("video-div");
const videoElem = document.getElementById("video");
const faceElem = document.getElementById("face");
const cameraDivElem = document.getElementById("camera-div");
const cameraElem = document.getElementById("camera");
const msgElem = document.getElementById("msg");

// control elements

const dividerElem = document.getElementById("divider");
const positionElem = document.getElementById("position");
const alignCaptureElem = document.getElementById("aligncapture");
const verticalElem = document.getElementById("vertical");
const horizontalElem = document.getElementById("horizontal");

const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");
const cancelDisplayEchoElem = document.getElementById("canceldisplayecho");

const startCamElem = document.getElementById("startcam");
const stopCamElem = document.getElementById("stopcam");
const cancelCamEchoElem = document.getElementById("cancelcamecho");
const voiceElem = document.getElementById("voice");

const selectElem = document.getElementById("selectcam");
const defaultElem = selectElem.firstChild;
const selectFaceElem = document.getElementById("selectface");
const defaultFaceElem = selectFaceElem.firstChild;
const selectMicElem = document.getElementById("selectmic");
const defaultMicElem = selectMicElem.firstChild;

const recordElem = document.getElementById("record");

// log elements

const logElem = document.getElementById("log");


//
// device management
//

function gotDevices(mediaDevices) {
  selectElem.innerHTML = '';
  selectElem.appendChild(defaultElem);
  selectFaceElem.innerHTML = '';
  selectFaceElem.appendChild(defaultFaceElem);
  selectMicElem.innerHTML = '';
  selectMicElem.appendChild(defaultMicElem);
  let vcount = 0;
  let acount = 0;
  mediaDevices.forEach(mediaDevice => {
    if (mediaDevice.kind === 'videoinput') {
      const option = document.createElement('option');
      option.value = mediaDevice.deviceId;
      const label = mediaDevice.label || `Camera ${++vcount}`;
      const textNode = document.createTextNode(label);
      option.appendChild(textNode);
      selectElem.appendChild(option);
      // same for same
      const option2 = document.createElement('option');
      option.value = mediaDevice.deviceId;
      const textNode2 = document.createTextNode(label);
      option2.appendChild(textNode2);
      selectFaceElem.appendChild(option2);
    } else if (mediaDevice.kind === 'audioinput') {
      const option = document.createElement('option');
      option.value = mediaDevice.deviceId;
      const label = mediaDevice.label || `Mic/line ${++acount}`;
      const textNode = document.createTextNode(label);
      option.appendChild(textNode);
      selectMicElem.appendChild(option);
    }
  });
}

function devicesChanged (event) {
  navigator.mediaDevices.enumerateDevices().then(gotDevices);
}

function listDevices () {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log("enumerateDevices() not supported.");
    return;
  }
  navigator.mediaDevices.enumerateDevices().then(function(devices) {
    devices.forEach(function(device) {
      console.log(JSON.stringify(device));
    });
  })
  .catch(function(err) {
    console.log(err.name + ": " + err.message);
  });
}

//
// device control
//

var displayMediaOptions = {
  video: {
    cursor: "always"
  },
  audio: {
//    latency: 1.0,
    autoGainControl: false,
    noiseSuppression: false
  }
};

var faceMediaOptions = {
  video: {
    facingMode: { ideal: "user" },
    resizeMode: { ideal: "crop-and-scale" }
  }
};

var userMediaOptions = {
  video: {
    aspectRatio: { ideal: 1.78 },
    facingMode: { ideal: "environment" }
  }
};

var userAudioOptions = {
//    latency: 1.0,
  autoGainControl: false,
  noiseSuppression: false
};

startElem.addEventListener("click", function(evt) {
  if (videoElem.srcObject) {
    stopCapture();
  }
  startCapture();
}, false);

stopElem.addEventListener("click", function(evt) {
  stopCapture();
}, false);

startCamElem.addEventListener("click", function(evt) {
  if (cameraElem.srcObject) {
    stopCamera();
  }
  startCamera();
  if (faceElem.srcObject) {
    stopFace();
  }
  startFace();
}, false);

stopCamElem.addEventListener("click", function(evt) {
  if (cameraElem.srcObject) {
    stopCamera();
  }
  if (faceElem.srcObject) {
    stopFace();
  }
}, false);

async function startCapture() {
  msgElem.style.display = "none";
  try {
    displayMediaOptions.audio.echoCancellation = cancelDisplayEchoElem.checked;
    displayMediaOptions.audio.googEchoCancellation = cancelDisplayEchoElem.checked;
    videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    //const devices = await navigator.mediaDevices.enumerateDevices();
    //const audioDevices = devices.filter(device => device.kind === 'audiooutput');
    //await videoElem.setSinkId(audioDevices[0].deviceId);
  } catch(err) {
    console.error("Error: " + err);
  }
}

function stopCapture(evt) {
  let tracks = videoElem.srcObject.getTracks();
  tracks.forEach(track => track.stop());
  videoElem.srcObject = null;
}

async function startFace() {
  msgElem.style.display = "none";
  try {
    // start face camera
    if (selectFaceElem.value != 'None') {
      if (selectFaceElem.value) {
        faceMediaOptions.deviceId = { exact: selectFaceElem.value };
      } else {
        faceMediaOptions.deviceId = 0;
      }
      let w = videoDivElem.offsetWidth;
      if (videoElem.srcObject) {
        w -= videoElem.offsetWidth;
        if (alignCaptureElem.value == 'Center') {
          w /= 2.0;
          faceElem.style.left = 0;
        }
      }
      let h = videoDivElem.offsetHeight;
      faceElem.style.width = w;
      faceMediaOptions.video.width = w;
      faceMediaOptions.video.height = h;
      faceElem.srcObject = await navigator.mediaDevices.getUserMedia(faceMediaOptions);
      //dumpOptionsInfo(faceElem);
    }
  } catch(err) {
    console.error("Error: " + err);
  }
}

function stopFace(evt) {
  try {
    let tracks = faceElem.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    faceElem.srcObject = null;
  } catch(err) {
    console.error("Error: " + err);
  }
}

async function startCamera() {
  msgElem.style.display = "none";
  try {
    if (selectElem.value != 'None') {
      if (selectElem.value) {
        userMediaOptions.video.deviceId = { exact: selectElem.value };
      } else {
        userMediaOptions.video.deviceId = 0;
      }
    }
    else {
      userMediaOptions.video = false;
    }
    if (selectMicElem.value != 'None') {
      if (selectMicElem.value) {
        userAudioOptions.deviceId = { exact: selectMicElem.value };
      } else {
        userAudioOptions.deviceId = 0;
      }
      userAudioOptions.autoGainControl = voiceElem.checked;
      userAudioOptions.noiseSuppression = voiceElem.checked;
      userAudioOptions.echoCancellation = cancelCamEchoElem.checked;
      userMediaOptions.audio = userAudioOptions;
    }
    else {
      userMediaOptions.audio = false;
    }
    if (userMediaOptions.video || userMediaOptions.audio) {
      cameraElem.srcObject = await navigator.mediaDevices.getUserMedia(userMediaOptions);
    }
    //dumpOptionsInfo(cameraElem);
  } catch(err) {
    console.error("Error: " + err);
    alert(err);
  }
}

function stopCamera(evt) {
  try {
    let tracks = cameraElem.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    cameraElem.srcObject = null;
  } catch(err) {
    console.error("Error: " + err);
  }
}

function dumpOptionsInfo(e) {
  const videoTrack = e.srcObject.getVideoTracks()[0];
  if (videoTrack) {
    console.info("Track settings:");
    console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
    console.info("Track constraints:");
    console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
  }
  const audioTrack = e.srcObject.getAudioTracks()[0];
  if (audioTrack) {
    console.info("Track settings:");
    console.info(JSON.stringify(audioTrack.getSettings(), null, 2));
    console.info("Track constraints:");
    console.info(JSON.stringify(audioTrack.getConstraints(), null, 2));
  }
}

//
// canvas management
//

function setSizes() {
  canvasDivElem.style.width = window.innerWidth;
  canvasDivElem.style.height = window.innerHeight;
  //console.log("window width = " + window.innerWidth + "; height = " + window.innerHeight);
  dividerElem.oninput();
}

dividerElem.oninput = function(event) {
  canvasHeight = canvasDivElem.offsetHeight;
  p1 = this.value / 100;
  p2 = 1 - p1;
  videoDivElem.style.height = canvasHeight * p1;
  cameraDivElem.style.height = canvasHeight * p2;
  //console.info("canvasHeight = " + canvasHeight + "; p1 = " + p1 + "; p2 = " + p2);
};

dividerElem.ondblclick = function(event) {
  this.value = 80;
  videoDivElem.style.height = "80%";
  cameraDivElem.style.height = "20%";
  toStorage();
};

positionElem.oninput = function(event) {
  maxOffset = cameraElem.offsetHeight - cameraDivElem.offsetHeight;
  px = maxOffset * (0 - this.value) / 100;
  cameraElem.style.marginTop = px;
  //console.info("maxOffset = " + maxOffset + "; px = " + px);
};

positionElem.ondblclick = function(event) {
  this.value = 0;
  cameraElem.style.marginTop = 0;
  toStorage();
};

alignCaptureElem.oninput = function(event) {
  switch (this.value) {
    case 'Left':
      videoElem.style.marginLeft = 0;
      videoElem.style.marginRight = "auto";
      faceElem.style.left = "auto";
      faceElem.style.right = "0";
      break;
    case 'Center':
      videoElem.style.marginLeft = "auto";
      videoElem.style.marginRight = "auto";
      if (videoElem.srcObject) {
        faceElem.style.left = "0";
      } else {
        faceElem.style.left = "auto";
      }
      faceElem.style.right = "auto";
      break;
    case 'Right':
      videoElem.style.marginLeft = "auto";
      videoElem.style.marginRight = 0;
      faceElem.style.left = "0";
      faceElem.style.right = "auto";
      break;
    default:
      console.error("unrecognized alignment");
  }
};

var vflip = false;
var hflip = false;

function doTransform () {
  var v = vflip ? "rotate(180deg)" : "rotate(0deg)";
  var h = hflip ? "scaleX(-1)" : "scaleX(1)";
  cameraElem.style.transform = v + h;
  var vc = vflip ? "red" : "black";
  var hc = hflip ? "red" : "black";
  verticalElem.style.color = vc;
  horizontalElem.style.color = hc;
}

verticalElem.onclick = function(event) {
  vflip = !vflip;
  doTransform();
  toStorage();
};

horizontalElem.onclick = function(event) {
  hflip = !hflip;
  doTransform();
  toStorage();
};

//
// recording (not implemented)
//

var recording = false;

recordElem.onclick = function(event) {
  if (recording) {
    //stopRecording();
    console.info("Recording ended");
    this.innerText = "Record";
  } else {
    //startRecording();
    console.info("Recording started");
    this.innerText = "Stop";
  }
  recording = !recording;
}

//
// storage management
//

function fromStorage () {
  dividerElem.value = window.localStorage.getItem('divider');
  dividerElem.oninput();
  positionElem.value = window.localStorage.getItem('position');
  positionElem.oninput();
  alignCaptureElem.value = window.localStorage.getItem('alignment');
  alignCaptureElem.oninput();
  vflip = (window.localStorage.getItem('vertical') == 'true');
  hflip = (window.localStorage.getItem('horizontal') == 'true');
  doTransform();
  cancelDisplayEchoElem.checked = (window.localStorage.getItem('canceldisplayecho') == 'true');
  cancelCamEchoElem.checked = (window.localStorage.getItem('cancelcamecho') == 'true');
  voiceElem.checked = (window.localStorage.getItem('voice') == 'true');
}

function toStorage () {
  window.localStorage.setItem('version', "1");
  window.localStorage.setItem('divider', dividerElem.value);
  window.localStorage.setItem('position', positionElem.value);
  window.localStorage.setItem('alignment', alignCaptureElem.value);
  window.localStorage.setItem('vertical', vflip);
  window.localStorage.setItem('horizontal', hflip);
  window.localStorage.setItem('canceldisplayecho', cancelDisplayEchoElem.checked);
  window.localStorage.setItem('cancelcamecho', cancelCamEchoElem.checked);
  window.localStorage.setItem('voice', voiceElem.checked);
}

//
// main
//

// console/log

//console.log = msg => logElem.innerHTML += `${msg}<br>`;
//console.error = msg => logElem.innerHTML += `<span class="error">${msg}</span><br>`;
//console.warn = msg => logElem.innerHTML += `<span class="warn">${msg}<span><br>`;
//console.info = msg => logElem.innerHTML += `<span class="info">${msg}</span><br>`;

// set up storage

dividerElem.onchange = toStorage;
positionElem.onchange = toStorage;
alignCaptureElem.onchange = toStorage;
cancelDisplayEchoElem.onchange = toStorage;
cancelCamEchoElem.onchange = toStorage;
voiceElem.onchange = toStorage;

if (window.localStorage.getItem('version') >= 1) {
  fromStorage();
}

// window size

window.onresize = setSizes;

// get devices

navigator.mediaDevices.enumerateDevices().then(gotDevices);
navigator.mediaDevices.ondevicechange = devicesChanged;
listDevices();
