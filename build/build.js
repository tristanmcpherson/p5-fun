class ColorHelper {
    static getColorVector(c) {
        return createVector(red(c), green(c), blue(c));
    }
    static rainbowColorBase() {
        return [
            color('red'),
            color('orange'),
            color('yellow'),
            color('green'),
            color(38, 58, 150),
            color('indigo'),
            color('violet')
        ];
    }
    static getColorsArray(total, baseColorArray = null) {
        if (baseColorArray == null) {
            baseColorArray = ColorHelper.rainbowColorBase();
        }
        var rainbowColors = baseColorArray.map(x => this.getColorVector(x));
        ;
        let colours = new Array();
        for (var i = 0; i < total; i++) {
            var colorPosition = i / total;
            var scaledColorPosition = colorPosition * (rainbowColors.length - 1);
            var colorIndex = Math.floor(scaledColorPosition);
            var colorPercentage = scaledColorPosition - colorIndex;
            var nameColor = this.getColorByPercentage(rainbowColors[colorIndex], rainbowColors[colorIndex + 1], colorPercentage);
            colours.push(color(nameColor.x, nameColor.y, nameColor.z));
        }
        return colours;
    }
    static getColorByPercentage(firstColor, secondColor, percentage) {
        var firstColorCopy = firstColor.copy();
        var secondColorCopy = secondColor.copy();
        var deltaColor = secondColorCopy.sub(firstColorCopy);
        var scaledDeltaColor = deltaColor.mult(percentage);
        return firstColorCopy.add(scaledDeltaColor);
    }
}
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
function drawGradient(x, y) {
    let radius = (width) / 3;
    let h = 6;
    for (let r = radius; r > 0; --r) {
        fill(0, 0, h);
        ellipse(x, y, r, r);
        h = (h + 0.01);
    }
}
function* combine(array, n, start = 0, prev = []) {
    if (n <= 0) {
        yield prev;
        return;
    }
    for (let i = start; i <= array.length - n; i++) {
        yield* combine(array, n - 1, i + 1, [...prev, array[i]]);
    }
}
function combine2(array) {
    return [...combine(array, 2)];
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
function setup() {
    console.log("🚀 - Setup initialized - P5 is running");
    createCanvas(windowWidth, windowHeight);
    frameRate(60);
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
    mouseH = 26;
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
const colorD = (h, s, d, maxD, l1 = 70, l2 = 50, a) => {
    const l = map(d, 0, maxD, l1, l2, true);
    const ns = map(d, 0, maxD, 1, 0, true);
    return `hsla(${h}, ${s}%, ${l}%, ${ns})`;
};
const linePointDistance = (point1, point2, maxD, r1 = 70, r2 = 50, h = 222, s = 100, a = 0.7) => {
    const d = dist(...point1, ...point2);
    if (d < maxD) {
        linePoint(point1, point2, colorD(h, s, d, maxD, r1, r2, a));
    }
};
function linePoint(point1, point2, strokeHex = "#3333CC") {
    push();
    stroke(strokeHex);
    line(point1[0], point1[1], point2[0], point2[1]);
    pop();
}
let time = 0;
function draw() {
    push();
    background(15);
    colorMode(HSB, 360, 100, 100);
    noStroke();
    ellipseMode(RADIUS);
    drawGradient(width / 2, height / 2);
    pop();
    const mouse = [mouseX, mouseY];
    time += deltaTime / 1000 * speedUp;
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
        topPoints.forEach(tp => bottomPoints
            .forEach(bp => {
            linePointDistance(tp, bp, pointDistance, 60, 0);
        }));
    }
    const selfLinesDistance = scaleX * 1.25;
    if (selfLinesChecked) {
        combine2(topPoints).forEach((points => linePointDistance(points[0], points[1], selfLinesDistance)));
        combine2(bottomPoints).forEach((points => linePointDistance(points[0], points[1], selfLinesDistance)));
    }
    const mouseDistance = (scaleX * 1.25);
    if (mouseLinesChecked) {
        push();
        stroke("#5555FF");
        topPoints.forEach(tp => linePointDistance(tp, mouse, mouseDistance, 50, 30, mouseH, mouseS));
        bottomPoints.forEach(bp => linePointDistance(bp, mouse, mouseDistance, 50, 30, mouseH, mouseS));
        pop();
    }
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
//# sourceMappingURL=../src/src/build.js.map