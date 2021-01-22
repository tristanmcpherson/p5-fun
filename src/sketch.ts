// GLOBAL VARS & TYPES
let speed: p5.Element;
let mouseLinesChecked: boolean = true;
let interLinesChecked: boolean = true;
let selfLinesChecked: boolean = true;

let initSpeed = 1;
let initMouseH = 0;
let initMouseS = 0;

let speedUp: number = initSpeed;
let mouseH = initMouseH;
let mouseS = initMouseS;

function drawGradient(x: number, y: number) {
  let radius = (width) / 3;
  let h = 6;
  for (let r = radius; r > 0; --r) {
    fill(0, 0, h);
    ellipse(x, y, r, r);
    h = (h + 0.01);
  }
}

function* combine<T>(array: T[], n: number, start = 0, prev: T[] = []): any {
  if(n <= 0) {
    yield prev;
    return;
  }

  for(let i = start; i <= array.length - n; i++) {
    yield* combine(array, n - 1, i + 1, [...prev, array[i]]);
  }
}

function combine2<T>(array: T[]): [[number, number], [number, number]][] {
  return [...combine(array, 2)];
}

const pairs = <T>(array: Array<T>) => {
  const pairs: [T, T][] = [];

  for (let i = 0; i < array.length - 1; i++) {
    pairs.push([array[i], array[i + 1]]);
  }

  return pairs;
}

const tri = (i: number) => {
  return 1 - abs(i % 2 - 1)
}

// const distance = (p1: [number, number], p2: [number, number]) => {
//   return sqrt(pow(p2[0] - p1[0], 2) + pow(p2[1] - p1[1], 2));
// }

// P5 WILL AUTOMATICALLY USE GLOBAL MODE IF A DRAW() FUNCTION IS DEFINED
function setup() {
  console.log("🚀 - Setup initialized - P5 is running");

  // FULLSCREEN CANVAS
  createCanvas(windowWidth, windowHeight);

  // SETUP SOME OPTIONS
  frameRate(60);

  // SPEED SLIDER
  speed = createSlider(0, 15, 3, 1);
  speed.position(10, 10);
  speed.style("width", "80px");

  const mouseLines = createCheckbox("Mouse Lines", mouseLinesChecked)
  mouseLines.position(10, 30);
  (mouseLines as any).changed((e: any) => mouseLinesChecked = e.target.checked)
  mouseLines.style("color", "white")
  mouseLines.style("font-family", "Roboto Condensed")
  mouseLines.style("display", "flex")
  mouseLines.style("align-items", "center")
  mouseLines.addClass("children-margin")

  const interLines = createCheckbox("Interconnected Lines", interLinesChecked)
  interLines.position(10, 50);
  (interLines as any).changed((e: any) => interLinesChecked = e.target.checked)
  interLines.style("color", "white")
  interLines.style("font-family", "Roboto Condensed")
  interLines.style("display", "flex")
  interLines.style("align-items", "center")
  interLines.addClass("children-margin")

  const selfLines = createCheckbox("Self Lines", selfLinesChecked)
  selfLines.position(10, 70);
  (selfLines as any).changed((e: any) => selfLinesChecked = e.target.checked)
  selfLines.style("color", "white")
  selfLines.style("font-family", "Roboto Condensed")
  selfLines.style("display", "flex")
  selfLines.style("align-items", "center")
  selfLines.addClass("children-margin")
}

function mousePressed() {
  speedUp = 5;
  mouseH = 26;
  mouseS = 100;
}

function mouseReleased() {
  speedUp = initSpeed;
  mouseH = initMouseH;
  mouseS = initMouseS;
}

const distanceNorm = (p1: [number, number], p2: [number, number], maxD: number) => {
  return map(dist(...p1, ...p2), 0, maxD, 0, 1, true);
}

const distanceNormInv = (p1: [number, number], p2: [number, number], maxD: number) => {
  return map(dist(...p1, ...p2), 0, maxD, 1, 0, true);
}

const colorD = (h: number, s: number, d: number, maxD: number, l1: number = 70, l2: number = 50, a: number) => {
  const l = map(d, 0, maxD, l1, l2, true);
  const ns = map(d, 0, maxD, 1, 0, true);
  //const a = map(d, 0, maxD, 1, 0.1);
  return `hsla(${h}, ${s}%, ${l}%, ${ns})`;
};

const linePointDistance = (point1: [number, number], point2: [number, number], maxD: number, r1 = 70, r2 = 50, h = 222, s = 100, a: number = 0.7) => {
  const d = dist(...point1, ...point2);
  if (d < maxD) {
    linePoint(point1, point2, colorD(h, s, d, maxD, r1, r2, a));
  }
};

function linePoint(point1: [number, number], point2: [number, number], strokeHex: string = "#3333CC") {
  push();

  stroke(strokeHex);
  line(point1[0], point1[1], point2[0], point2[1]);

  pop();
}

let time = 0;

// p5 WILL HANDLE REQUESTING ANIMATION FRAMES FROM THE BROWSER AND WIL RUN DRAW() EACH ANIMATION FROME
function draw() {
  // CLEAR BACKGROUND
  push();

  background(15);
  colorMode(HSB, 360, 100, 100);
  noStroke();
  ellipseMode(RADIUS);

  drawGradient(width/2, height/2);

  pop();

  const mouse: [number, number] = [mouseX, mouseY];
  
  time += deltaTime/1000 * speedUp;

  const scaleY = 400;
  const middleH = height / 2;

  // PI/6 start and end left
  const startOffset = PI/6;

  const pointsPerLine = 20;

  const stepX = (TWO_PI - startOffset*2) / pointsPerLine;
  const stepY = (TWO_PI - startOffset*2) / pointsPerLine;

  const period = TWO_PI;
  const scaleX = (width) / (period);

  const topOffset = 0.5;

  const topPoints: [number, number][] = [];
  const bottomPoints: [number, number][] = [];

  const pointSize = scaleY / 20;

  for (var i = 1; i < pointsPerLine; i++) {
    push();
    stroke("hsla(222, 75%, 50%, 0.5)");

    const topX = scaleX * (startOffset + stepX * (i + topOffset));
    const topY = middleH + (scaleY / 2) * sin(startOffset + stepY * i + time);

    const bottomX = scaleX * (startOffset + stepX * i);
    const bottomY = middleH + (scaleY / 2) * -sin(startOffset + stepY * i + time);

    strokeWeight(pointSize * (distanceNormInv([topX, topY], mouse, scaleY * 1.5)));
    point(topX, topY);

    strokeWeight(pointSize * (distanceNormInv([bottomX, bottomY], mouse, scaleY * 1.5)));
    point(bottomX, bottomY);

    topPoints.push([topX, topY]);
    bottomPoints.push([bottomX, bottomY]);
    pop();
  }

  const pointDistance = scaleY * 1.1;
  const lineIntersect = height / 2;
 
  if (interLinesChecked) {
    topPoints.forEach(tp => 
      bottomPoints
        .forEach(bp => {
          linePointDistance(tp, bp, pointDistance, 60, 0)
        })
    );
  }

  const selfLinesDistance = scaleX * 1.25;
  if (selfLinesChecked) {
    combine2(topPoints).forEach((points => linePointDistance(points[0], points[1], selfLinesDistance)));
    combine2(bottomPoints).forEach((points => linePointDistance(points[0], points[1], selfLinesDistance)));
  }

  const mouseDistance = (scaleX * 1.25 );

  if (mouseLinesChecked) {
    push();
    stroke("#5555FF");

    topPoints.forEach(tp => linePointDistance(tp, mouse, mouseDistance, 50, 30, mouseH, mouseS));
    bottomPoints.forEach(bp => linePointDistance(bp, mouse, mouseDistance, 50, 30, mouseH, mouseS));

    pop();
  }
}

// p5 WILL AUTO RUN THIS FUNCTION IF THE BROWSER WINDOW SIZE CHANGES
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
