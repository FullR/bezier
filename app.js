const canvas = document.getElementById("canvas");
const width = canvas.width = 900;
const height = canvas.height = 500;
const ctx = canvas.getContext("2d");
const controlShapeCheckbox = document.querySelector("#control-shape-checkbox");
const clearButton = document.querySelector("#clear-button");
const last = (arr) => arr[arr.length - 1];

let showingControlShape = controlShapeCheckbox.checked = true; // used in draw function to determine if control shape should be drawn

// initial shape
let controlPoints = [{x: 268, y: 57}, {x: 653, y: 82}, {x: 542, y: 468}, {x: 263, y: 317}, {x: 366,y: 212}, {x: 465,y: 205}, {x: 441,y: 270}]

let b = bezier(controlPoints); // initial bezier points

// listen for clicks to add new points and redraw
canvas.addEventListener("mousedown", (event) => {
  const p = getMousePos(canvas, event);
  controlPoints.push(p);
  b = bezier(controlPoints);
  draw();
});

// listen for clear button click
clearButton.addEventListener("click", () => {
  controlPoints = [];
  b = [];
  draw();
});

// listen for checkbox change
controlShapeCheckbox.addEventListener("change", () => {
  showingControlShape = controlShapeCheckbox.checked;
  draw();
});

draw(); // draw initial shape

// t is the scale of the distance (0 start, 0.5 mid, 1 end)
function getMidPoints(points, t) {
  const top = points.length - 1;
  const midPoints = [];
  for(let i = 0; i < top; i++) {
    const a = points[i];
    const b = points[i + 1];
    if(!t) { // no need for extra math if t is 1 or 0
      midPoints.push(a);
    } else if(t === 1) {
      midPoints.push(b);
    } else { // find the point between a and b
      midPoints.push({
        x: a.x + ((b.x - a.x) * t),
        y: a.y + ((b.y - a.y) * t)
      });
    }
  }
  return midPoints;
}

// getBezierPointIterative and getBezierPointRecursive do the same thing
// I'm using the imperative version to avoid stack overflows (but it probably doesn't matter)
function getBezierPoint(points, t) {
  return getBezierPointIterative(points, t);
}

// Finds the point in the path represented by points at time t
// 0 >= t <= 1
function getBezierPointRecursive(points, t) { // recursive
  const midPoints = getMidPoints(points, t);

  return midPoints.length <= 1 ?
    midPoints[0] :
    getBezierPointRecursive(midPoints, t);
}

function getBezierPointIterative(points, t) { // iterative
  const stack = [points];
  while(last(stack).length >= 2) {
    stack.push(getMidPoints(last(stack), t));
  }
  return last(stack)[0];
}

// calculates final control point for every step between 0 and 1
// steps refers to how many segments the resulting curve should contain
function bezier(points, steps=100) {
  const resultPoints = [];
  const inc = 1 / steps;
  if(points.length <= 1) return resultPoints;

  for(let t = 0; t <= 1; t += inc) {
    resultPoints.push(getBezierPoint(points, t));
  }

  return resultPoints;
}

// connects each point in points with a line on canvas
function drawConnectedPoints(ctx, points) {
  const {length} = points;
  ctx.beginPath();
  for(let i = 0; i < length; i++) {
    const p = points[i];
    if(!i) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y)
    }
  }
  ctx.stroke();
}

// get mouse position relative to canvas
function getMousePos(canvas, {clientX, clientY}) {
  const {left, top} = canvas.getBoundingClientRect();
  return {
    x: clientX - left,
    y: clientY - top
  };
}

// draw bezier curve
function draw() {
  ctx.clearRect(0, 0, width, height);
  drawConnectedPoints(ctx, b);
  if(showingControlShape) {
    ctx.save();
    ctx.strokeStyle = "rgb(200, 200, 200)";
    drawConnectedPoints(ctx, controlPoints);
    ctx.restore();
  }
}
