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

let time = 0; // Global time variable
function stream() {
	const ymax = 100;
	const scaleX = d3
		.scaleLinear()
		.domain([0, NUM_POINTS])
		.range([0, canvas.width]);
	const scaleY = d3.scaleLinear().domain([0, ymax]).range([0, canvas.height]);
	const points = [];
	const wavelength = 300; // adjust the wavelength to control the oscillation
	for (let i = 0; i < NUM_POINTS; i++) {
		const y =
			(Math.sin(((i + time) / NUM_POINTS) * wavelength) * ymax) / 2 + ymax / 2;
		points.push({
			x: scaleX(i),
			y: -scaleY(y),
			color: getColor(y, ymax),
		});
	}
	time++;
	return points;
}

function getColor(h, hmax) {
	const colors = [
		[0, 0, 255], //blue
		[0, 255, 0], //green
		[255, 255, 0], //yellow
		[255, 165, 0], //orange
		[255, 0, 0], //red
	];
	const colorSegments = colors.length - 1; // Number of segments between stops
	const segmentSize = hmax / colorSegments;
	const segmentIndex = Math.floor(h / segmentSize);
	const fraction = (h % segmentSize) / segmentSize;
	const startColor = colors[segmentIndex];
	const endColor = colors[segmentIndex + 1];
	const r = Math.round(startColor[0] + fraction * (endColor[0] - startColor[0]));
	const g = Math.round(startColor[1] + fraction * (endColor[1] - startColor[1]));
	const b = Math.round(startColor[2] + fraction * (endColor[2] - startColor[2]));
	return `rgb(${r},${g},${b})`;
}

function draw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	const origin = {
		translateX: 0,
		translateY: canvas.height,
	};
	context.translate(origin.translateX, origin.translateY);

	let prevPoint = null;
	points = stream();
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		if (prevPoint) {
			const gradient = context.createLinearGradient(
				prevPoint.x,
				prevPoint.y,
				point.x,
				point.y
			);
			gradient.addColorStop(0, prevPoint.color);
			gradient.addColorStop(1, point.color);
			context.strokeStyle = gradient;
			context.beginPath();
			context.moveTo(prevPoint.x, prevPoint.y);
			context.lineTo(point.x, point.y);
			context.lineWidth = 1;
			context.stroke();
		}
		prevPoint = point;
	}

	// draw origin
	drawOrigin();

	// last point to check if entire plot
	// is draw and stretch to fit the canvas
	drawPoint(points[points.length - 1]);
	context.translate(-origin.translateX, -origin.translateY);
}

function drawPoint(point) {
	context.beginPath();
	context.arc(point.x, point.y, 5, 0, 2 * Math.PI, false);
	context.fillStyle = "red";
	context.fill();
}

function drawOrigin() {
	context.beginPath();
	context.arc(0, 0, 5, 0, 2 * Math.PI, false);
	context.fillStyle = "green";
	context.fill();
}
