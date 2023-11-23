importScripts("d3.v6.min.js.js"); // Replace with the actual path to d3.js
const NUM_POINTS = 4096;
let canvas = null;
let context = null;
self.onmessage = function (event) {
	if (!!event.data.canvas) {
		canvas = event.data.canvas;
		context = canvas.getContext("2d");
		console.debug("Canvas received", { canvas, context });
	} else {
		draw();
	}
};

function stream() {
	const scaleX = d3
		.scaleLinear()
		.domain([0, NUM_POINTS])
		.range([0, canvas.width]);
	const scaleY = d3.scaleLinear().domain([0, 100]).range([0, canvas.height]);
	const points = [];
	for (let i = 0; i < NUM_POINTS; i++) {
		const y = Math.random() * 100;
		points.push({
			x: scaleX(i),
			y: -scaleY(y),
		});
	}
	return points;
}

function draw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	const origin = {
		translateX: 0,
		translateY: canvas.height,
	};
	context.translate(origin.translateX, origin.translateY);

	points = stream();
	context.beginPath();
	context.moveTo(points[0].x, points[0].y);
	points.forEach((point) => {
		context.lineTo(point.x, point.y);
	});
	context.lineWidth = 1;
	context.strokeStyle = "black";
	context.stroke();

	context.beginPath();
	context.arc(0, 0, 5, 0, 2 * Math.PI, false);
	context.fillStyle = "green";
	context.fill();

	// last point to check if entire plot is drawn
	// and stretch to fit the canvas
	const lastPoint = points[points.length - 1];
	context.beginPath();
	context.arc(lastPoint.x, lastPoint.y, 5, 0, 2 * Math.PI, false);
	context.fillStyle = "red";
	context.fill();

	context.translate(-origin.translateX, -origin.translateY);
}
