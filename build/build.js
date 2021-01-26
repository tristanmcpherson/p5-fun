let speed;
let mouseLinesChecked = true;
let interLinesChecked = true;
let selfLinesChecked = true;
let initSpeed = 1;
let initMouseH = 0;
let initMouseS = 0;
let speedUp = initSpeed;
let mouseH = initMouseH;
let mouseS = initMouseS;
const fps = 60;
const dotAnimateTimeFrames = 2 * fps;
function drawGradient(x, y) {
    let radius = (width) / 3;
    let h = 6;
    for (let r = radius; r > 0; --r) {
        fill(0, 0, h);
        ellipse(x, y, r, r);
        h = (h + 0.01);
    }
}
function k_combinations(set, k) {
    var i, j, combs, head, tailcombs;
    if (k > set.length || k <= 0) {
        return [];
    }
    if (k == set.length) {
        return [set];
    }
    if (k == 1) {
        combs = [];
        for (i = 0; i < set.length; i++) {
            combs.push([set[i]]);
        }
        return combs;
    }
    combs = [];
    for (i = 0; i < set.length - k + 1; i++) {
        head = set.slice(i, i + 1);
        tailcombs = k_combinations(set.slice(i + 1), k - 1);
        for (j = 0; j < tailcombs.length; j++) {
            combs.push([...head, ...tailcombs[j]]);
        }
    }
    return combs;
}
const pairs = (array) => {
    const pairs = [];
    for (let i = 0; i < array.length - 1; i++) {
        pairs.push([array[i], array[i + 1]]);
    }
    return pairs;
};
const tri = (i) => {
    return 1 - abs(i % 2 - 1);
};
window.addEventListener("resize", ev => {
    resizeCanvas(windowWidth, windowHeight);
});
function setup() {
    console.log("🚀 - Setup initialized - P5 is running");
    createCanvas(windowWidth, windowHeight);
    colorMode(HSL);
    frameRate(fps);
    smooth();
    speed = createSlider(0, 15, 3, 1);
    speed.position(10, 10);
    speed.style("width", "80px");
    const mouseLines = createCheckbox("Mouse Lines", mouseLinesChecked);
    mouseLines.position(10, 30);
    mouseLines.changed((e) => mouseLinesChecked = e.target.checked);
    mouseLines.style("color", "white");
    mouseLines.style("font-family", "Roboto Condensed");
    mouseLines.style("display", "flex");
    mouseLines.style("align-items", "center");
    mouseLines.addClass("children-margin");
    const interLines = createCheckbox("Interconnected Lines", interLinesChecked);
    interLines.position(10, 50);
    interLines.changed((e) => interLinesChecked = e.target.checked);
    interLines.style("color", "white");
    interLines.style("font-family", "Roboto Condensed");
    interLines.style("display", "flex");
    interLines.style("align-items", "center");
    interLines.addClass("children-margin");
    const selfLines = createCheckbox("Self Lines", selfLinesChecked);
    selfLines.position(10, 70);
    selfLines.changed((e) => selfLinesChecked = e.target.checked);
    selfLines.style("color", "white");
    selfLines.style("font-family", "Roboto Condensed");
    selfLines.style("display", "flex");
    selfLines.style("align-items", "center");
    selfLines.addClass("children-margin");
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
const distanceNorm = (p1, p2, maxD) => {
    return map(dist(...p1, ...p2), 0, maxD, 0, 1, true);
};
const distanceNormInv = (p1, p2, maxD) => {
    return map(dist(...p1, ...p2), 0, maxD, 1, 0, true);
};
const colorMap = new Map();
const colorD = (hue, lumMin = 70, lumMax = 50, alpha = true, distance, maxDistance) => {
    const h = floor(map(distance, 0, maxDistance * 2, hue, hue - 40, true));
    const l = floor(map(distance, 0, maxDistance, lumMin, lumMax, true));
    const a = alpha ? floor(map(distance, 0, maxDistance, 100, 20, true)) / 100 : 1;
    return color(h, 100, l, a);
};
const linePointDistance = (point1, point2, maxD, l1 = 70, l2 = 50, h = 222, alpha, saturation = 100) => {
    const d = dist(point1[0], point1[1], point2[0], point2[1]);
    if (d < maxD) {
        linePoint(point1, point2, colorD(h, l1, l2, alpha, d, maxD));
    }
};
function linePoint(point1, point2, strokeHex = color("#3333CC")) {
    stroke(strokeHex);
    line(point1[0], point1[1], point2[0], point2[1]);
}
let time = 0;
function draw() {
    push();
    background(6);
    colorMode(HSL, 360, 100, 100);
    noStroke();
    ellipseMode(RADIUS);
    pop();
    const mouse = [mouseX, mouseY];
    time += deltaTime / 1000 * speedUp;
    const aspectRatio = height / width;
    const scaleY = 400;
    const middleH = height / 2;
    const startOffset = PI / 6;
    const pointsPerLine = 20;
    const stepX = (TWO_PI - startOffset * 2) / pointsPerLine;
    const stepY = (TWO_PI - startOffset * 2) / pointsPerLine;
    const period = TWO_PI;
    const scaleX = (width) / (period);
    const topOffset = 0.5;
    const topPoints = [];
    const bottomPoints = [];
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
function drawInterlines(topPoints, bottomPoints, scaleY) {
    const pointDistance = scaleY * 1.1;
    if (interLinesChecked) {
        topPoints.forEach(tp => bottomPoints
            .forEach(bp => {
            linePointDistance(tp, bp, pointDistance, 60, 0, 222, true);
        }));
    }
}
function drawSelflines(topPoints, bottomPoints, scaleX) {
    const selfLinesDistance = scaleX * 1.25;
    if (selfLinesChecked) {
        k_combinations(topPoints, 2).forEach(((points) => linePointDistance(points[0], points[1], selfLinesDistance, 50, 70, 222, true)));
        k_combinations(bottomPoints, 2).forEach(((points) => linePointDistance(points[0], points[1], selfLinesDistance, 50, 70, 222, true)));
    }
}
function drawMouselines(topPoints, bottomPoints, scaleX) {
    const mouseDistance = (scaleX * 1.25);
    const mouse = [mouseX, mouseY];
    if (mouseLinesChecked) {
        topPoints.forEach(tp => linePointDistance(tp, mouse, mouseDistance, 60, 30, 22, true));
        bottomPoints.forEach(bp => linePointDistance(bp, mouse, mouseDistance, 60, 30, 22, true));
    }
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
//# sourceMappingURL=build.js.map