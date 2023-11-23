importScripts("d3.v6.min.js.js"); // Replace with the actual path to d3.js
let canvas = null;
let context = null;
self.onmessage = function (event) {
	if (!!event.data.canvas) {
		canvas = event.data.canvas;
		context = canvas.getContext("2d");
		console.log("Canvas received");
	} else {
		draw();
	}
};

const NUM_POINTS = 4096;
const stream = () => {
	const timestampt = Date.now();
	const points = [];
	for (let i = 0; i < NUM_POINTS; i++) {
		points.push({
			x: i,
			y: Math.sin(i / 100) * 100,
		});
	}
	return points;
};

// todo: add a function to convert object to world coordinates
const objectToWorld = (points) => {
	const xmin_o = 0;
	const xmax_o = NUM_POINTS;
	const ymin_o = -100;
	const ymax_o = 100;
	const xmin_w = 0;
	const xmax_w = canvas.width;
	const ymin_w = 0;
	const ymax_w = canvas.height;
	const x_w = (x_o) => x_o * ((xmax_w - xmin_w) / (xmax_o - xmin_o)) + xmin_w;
	const y_w = (y_o) => y_o * ((ymax_w - ymin_w) / (ymax_o - ymin_o)) + ymin_w;
	for (let i = 0; i < points.length; i++) {
		points[i].x = x_w(points[i].x);
		points[i].y = y_w(points[i].y) + 300;
	}
	return points;
};

const draw = () => {
	context.clearRect(0, 0, canvas.width, canvas.height);
	points = stream();
	points = objectToWorld(points);
	console.log(points);

	context.beginPath();
	context.moveTo(points[0].x, points[0].y);
	points.forEach((point) => {
		context.lineTo(point.x, point.y);
	});
	context.lineWidth = 1;
	context.strokeStyle = "black";
	context.stroke();
};
