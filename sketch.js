// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY;
let circleRadius = 50; // 半徑為 50，直徑為 100
let isDragging = false; // 用於檢測是否正在拖動圓
let prevX, prevY; // 儲存圓心的前一個位置

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 初始化圓的位置在視窗中間
  circleX = width / 2;
  circleY = height / 2;

  // 初始化前一個位置
  prevX = circleX;
  prevY = circleY;

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  // 如果正在拖動，繪製軌跡
  if (isDragging) {
    stroke(255, 0, 0); // 紅色線條
    strokeWeight(2);
    line(prevX, prevY, circleX, circleY); // 繪製從前一個位置到當前位置的線條
  }

  // 繪製圓
  fill(0, 255, 0, 150); // 半透明綠色
  noStroke();
  ellipse(circleX, circleY, circleRadius * 2);

  // 確保至少檢測到一隻手
  if (hands.length > 0) {
    let isTouching = false; // 檢測是否有手指觸碰圓

    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 繪製手部關鍵點
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 根據左右手設置顏色
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }

        // 檢測食指（keypoints[8]）和大拇指（keypoints[4]）是否同時觸碰圓
        let indexFinger = hand.keypoints[8];
        let thumb = hand.keypoints[4];

        let dIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);
        let dThumb = dist(thumb.x, thumb.y, circleX, circleY);

        if (dIndex < circleRadius && dThumb < circleRadius) {
          // 如果兩者同時觸碰，讓圓跟隨手指移動
          isTouching = true;

          // 更新前一個位置
          prevX = circleX;
          prevY = circleY;

          // 更新圓心位置
          circleX = (indexFinger.x + thumb.x) / 2;
          circleY = (indexFinger.y + thumb.y) / 2;
        }
      }
    }

    // 更新拖動狀態
    isDragging = isTouching;
  } else {
    isDragging = false;
  }
}
