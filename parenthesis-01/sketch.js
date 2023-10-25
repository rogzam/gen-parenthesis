let video;
let poseNet;
let poses = [];
let paused = false;
let numCircles = 22;
let frameRateValue = 10;
let circleSpacing = 35;
let showVideo = true;
let initialCircleSize = 20;

let lerpBaseSpeed = 0.24;
let lerpSpeeds = Array.from({ length: numCircles }, (_, i) => lerpBaseSpeed - i * (lerpBaseSpeed / numCircles));
let leftEyeCirclePositions = [];
let rightEyeCirclePositions = [];

let spacingType = 'none'; // Options: 'linear', 'exponential', or 'none'
let spacingMultiplier = 1.1;

let lastUpdateTimes = Array.from({ length: numCircles }, () => 0);
let delayAmount = 65;  

let options = {
  flipHorizontal: true
};

function preload() {
  myFont = loadFont("consolas.ttf");
}

function setup() {
  createCanvas(800, 800);
  video = createCapture(VIDEO);
  video.size(width, height);

  poseNet = ml5.poseNet(video, options, modelReady);
  poseNet.on("pose", results => poses = results);
  video.hide();

  frameRate(frameRateValue);

  for (let i = 0; i < numCircles; i++) {
    leftEyeCirclePositions.push({ x: width / 2, y: height / 2 });
    rightEyeCirclePositions.push({ x: width / 2, y: height / 2 });
  }
}

function draw() {
  if (!paused) {
    background(0, 0, 0, 0);
    clear();

    translate(width, 0);
    scale(-1, 1);

    if (showVideo) {
      tint(255, 21);
      image(video, 0, 0, width, height);
      filter(THRESHOLD);
      noTint();
    }

    scale(-1, 1);
    translate(-width, 0);

    drawKeypoints();
  } else {
    background(0, 0, 0, 0);
    fill(255);
    textAlign(CENTER, CENTER);
    textFont(myFont);
    textSize(16);
    text("- click to start -", width / 2, height / 2);
  }
}

function drawKeypoints() {
  if (poses.length > 0) {
    let pose = poses[0].pose;
    let leftEye = pose.keypoints.find(k => k.part === "leftEye");
    let rightEye = pose.keypoints.find(k => k.part === "rightEye");

    if (leftEye && rightEye) {
      noFill();
      stroke(255);

      for (let i = 0; i < numCircles; i++) {
        // Check if enough time has passed for this circle
        if (millis() - lastUpdateTimes[i] > delayAmount * i) {
          leftEyeCirclePositions[i].x = lerp(leftEyeCirclePositions[i].x, leftEye.position.x, lerpSpeeds[i]);
          leftEyeCirclePositions[i].y = lerp(leftEyeCirclePositions[i].y, leftEye.position.y, lerpSpeeds[i]);

          rightEyeCirclePositions[i].x = lerp(rightEyeCirclePositions[i].x, rightEye.position.x, lerpSpeeds[i]);
          rightEyeCirclePositions[i].y = lerp(rightEyeCirclePositions[i].y, rightEye.position.y, lerpSpeeds[i]);

          lastUpdateTimes[i] = millis();  // Update the timestamp
        }

        let circleRadius;
        if (spacingType === 'linear') {
          circleRadius = initialCircleSize + i * circleSpacing * spacingMultiplier;
        } else if (spacingType === 'exponential') {
          circleRadius = initialCircleSize + circleSpacing * pow(spacingMultiplier, i);
        } else {
          circleRadius = initialCircleSize + i * circleSpacing;
        }

        ellipse(leftEyeCirclePositions[i].x, leftEyeCirclePositions[i].y, circleRadius);
        ellipse(rightEyeCirclePositions[i].x, rightEyeCirclePositions[i].y, circleRadius);
      }
    }
  }
}


function mouseClicked() {
  paused = !paused;
}

function modelReady() {
  select('#status').hide();
}

