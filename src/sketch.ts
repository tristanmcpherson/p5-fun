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




const fps = 60;
const dotAnimateTimeFrames = 2 * fps;

function drawGradient(x: number, y: number) {
  let radius = (width) / 3;
  let h = 6;
  for (let r = radius; r > 0; --r) {
    fill(0, 0, h);
    ellipse(x, y, r, r);
    h = (h + 0.01);
  }
}

function k_combinations<T>(set: T[], k: number): any {
	var i, j, combs, head, tailcombs;
	
	// There is no way to take e.g. sets of 5 elements from
	// a set of 4.
	if (k > set.length || k <= 0) {
		return [];
	}
	
	// K-sized set has only one K-sized subset.
	if (k == set.length) {
		return [set];
	}
	
	// There is N 1-sized subsets in a N-sized set.
	if (k == 1) {
		combs = [];
		for (i = 0; i < set.length; i++) {
			combs.push([set[i]]);
		}
		return combs;
	}
	
	// Assert {1 < k < set.length}
	
	// Algorithm description:
	// To get k-combinations of a set, we want to join each element
	// with all (k-1)-combinations of the other elements. The set of
	// these k-sized sets would be the desired result. However, as we
	// represent sets with lists, we need to take duplicates into
	// account. To avoid producing duplicates and also unnecessary
	// computing, we use the following approach: each element i
	// divides the list into three: the preceding elements, the
	// current element i, and the subsequent elements. For the first
	// element, the list of preceding elements is empty. For element i,
	// we compute the (k-1)-computations of the subsequent elements,
	// join each with the element i, and store the joined to the set of
	// computed k-combinations. We do not need to take the preceding
	// elements into account, because they have already been the i:th
	// element so they are already computed and stored. When the length
	// of the subsequent list drops below (k-1), we cannot find any
	// (k-1)-combs, hence the upper limit for the iteration:
	combs = [];
	for (i = 0; i < set.length - k + 1; i++) {
		// head is a list that includes only our current element.
		head = set.slice(i, i + 1);
		// We take smaller combinations from the subsequent elements
		tailcombs = k_combinations(set.slice(i + 1), k - 1);
		// For each (k-1)-combination we join it with the current
		// and store it to the set of k-combinations.
		for (j = 0; j < tailcombs.length; j++) {
			combs.push([...head, ...tailcombs[j]]);
		}
	}
	return combs;
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

window.addEventListener("resize", ev => {
  resizeCanvas(windowWidth, windowHeight);
});
// const distance = (p1: [number, number], p2: [number, number]) => {
//   return sqrt(pow(p2[0] - p1[0], 2) + pow(p2[1] - p1[1], 2));
// }

// P5 WILL AUTOMATICALLY USE GLOBAL MODE IF A DRAW() FUNCTION IS DEFINED
function setup() {
  console.log("🚀 - Setup initialized - P5 is running");

  // FULLSCREEN CANVAS
  createCanvas(windowWidth, windowHeight);
  

  colorMode(HSL)
  // SETUP SOME OPTIONS
  frameRate(fps);

  smooth();

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
  mouseH = 10;
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

const colorMap: Map<number, string> = new Map<number, string>();

const colorD = (hue: number, lumMin: number = 70, lumMax: number = 50, alpha: boolean = true, distance: number, maxDistance: number) => {
  const h = floor(map(distance, 0, maxDistance * 2, hue, hue - 40, true));
  const l = floor(map(distance, 0, maxDistance, lumMin, lumMax, true));
  const a = alpha ? floor(map(distance, 0, maxDistance, 100, 20, true)) / 100 : 1;

  return color(h, 100, l, a);
};

const linePointDistance = (point1: [number, number], point2: [number, number], maxD: number, l1 = 70, l2 = 50, h = 222, alpha: boolean, saturation: number = 100) => {
  const d = dist(point1[0], point1[1], point2[0], point2[1]);
  if (d < maxD) {
    linePoint(point1, point2, colorD(h, l1, l2, alpha, d, maxD));
  }
};

function linePoint(point1: [number, number], point2: [number, number], strokeHex: p5.Color = color("#3333CC")) {
  stroke(strokeHex);
  line(point1[0], point1[1], point2[0], point2[1]);
}

let time = 0;


// p5 WILL HANDLE REQUESTING ANIMATION FRAMES FROM THE BROWSER AND WIL RUN DRAW() EACH ANIMATION FROME
function draw() {
  // CLEAR BACKGROUND
  push();

  background(6);
  colorMode(HSL, 360, 100, 100);
  noStroke();
  ellipseMode(RADIUS);

  //drawGradient(width/2, height/2);

  pop();

  const mouse: [number, number] = [mouseX, mouseY];
  
  time += deltaTime/1000 * speedUp;

  const aspectRatio =  height / width;

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

  for (let i = 1; i < pointsPerLine; i++) {
    push();
    stroke("hsla(222, 75%, 50%, 0.5)");

    const topX = scaleX * (startOffset + stepX * (i + topOffset));
    const y = (scaleY / 2) * sin(startOffset + stepY * i + time);
    
    const topY = middleH + y;

    const bottomX = scaleX * (startOffset + stepX * i);
    const bottomY = middleH - y;

    strokeWeight(pointSize * (distanceNormInv([topX, topY], mouse, scaleY * 1.5)));
    point(topX, topY);

    strokeWeight(pointSize * (distanceNormInv([bottomX, bottomY], mouse, scaleY * 1.5)));
    point(bottomX, bottomY);

    topPoints.push([topX, topY]);
    bottomPoints.push([bottomX, bottomY]);
    pop();
  }

  const lineIntersect = height / 2;
  drawInterlines(topPoints, bottomPoints, scaleY);
  drawSelflines(topPoints, bottomPoints, scaleX);
  drawMouselines(topPoints, bottomPoints, scaleX);

}

function drawInterlines(topPoints: [number, number][], bottomPoints: [number, number][], scaleY: number) {
  const pointDistance = scaleY * 1.1;

  if (interLinesChecked) {
    topPoints.forEach(tp => 
      bottomPoints
        .forEach(bp => {
          linePointDistance(tp, bp, pointDistance, 60, 0, 222, true)
        })
    );
  }
}

function drawSelflines(topPoints: [number, number][], bottomPoints: [number, number][], scaleX: number) {
  const selfLinesDistance = scaleX * 1.25;
  if (selfLinesChecked) {
    (k_combinations(topPoints, 2) as any).forEach(((points: any) => linePointDistance(points[0], points[1], selfLinesDistance, 50, 70, 222, true)));
    (k_combinations(bottomPoints, 2) as any).forEach(((points: any) => linePointDistance(points[0], points[1], selfLinesDistance, 50, 70, 222, true)));
  }
}

function drawMouselines(topPoints: [number, number][], bottomPoints: [number, number][], scaleX: number) {
  const mouseDistance = (scaleX * 1.25);
  const mouse: [number, number] = [mouseX, mouseY];

  if (mouseLinesChecked) {

    topPoints.forEach(tp => linePointDistance(tp, mouse, mouseDistance, 60, 30, 22, true));
    bottomPoints.forEach(bp => linePointDistance(bp, mouse, mouseDistance, 60, 30, 22, true));

  }
}

// p5 WILL AUTO RUN THIS FUNCTION IF THE BROWSER WINDOW SIZE CHANGES
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
