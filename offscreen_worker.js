importScripts("d3.v6.min.js.js"); // Replace with the actual path to d3.js

const NUM_POINTS = 4096;
let plotCanvas = null;
let plotContext = null;
let spectrumCanvas = null;
let spectrumContext = null;
let animationStared = false;
self.onmessage = function (event) {
	if (event.data.type === "plotCanvas") {
		plotCanvas = event.data.canvas;
		plotContext = plotCanvas.getContext("2d");
		console.debug("Plot Canvas received", {
			plotCanvas: plotCanvas,
			plotContext: plotContext,
		});
	} else if (event.data.type === "spectrumCanvas") {
		spectrumCanvas = event.data.canvas;
		spectrumContext = spectrumCanvas.getContext("2d");
		console.debug("Spectrum Canvas received", {
			spectrumCanvas: spectrumCanvas,
			spectrumContext: spectrumContext,
		});
	}
	const ready = !!plotCanvas && !!spectrumCanvas;
	if (!animationStared && ready) {
		draw();
		animationStared = true;
	}
};

let time = 0; // Global time variable
function stream() {
	const ymax = 100;
	const xmax = NUM_POINTS;
	const points = [];
	const wavelength = 300; // adjust the wavelength to control the oscillation
	for (let x = 0; x < xmax; x++) {
		const y = (Math.sin(((x + time) / xmax) * wavelength) * ymax) / 2 + ymax / 2;
		points.push({
			x,
			y,
			color: getColor(y, ymax),
		});
	}
	time++;
	return { ymax, points, xmax };
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

function drawPlot() {
	plotContext.clearRect(0, 0, plotCanvas.width, plotCanvas.height);
	const origin = {
		translateX: 0,
		translateY: plotCanvas.height,
	};
	plotContext.translate(origin.translateX, origin.translateY);

	let prevPoint = null;
	const { points, ymax } = stream();
	const scaleX = d3
		.scaleLinear()
		.domain([0, NUM_POINTS])
		.range([0, plotCanvas.width]);
	const scaleY = d3
		.scaleLinear()
		.domain([0, ymax])
		.range([0, plotCanvas.height]);
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		point.x = scaleX(point.x);
		point.y = -scaleY(point.y);
		if (prevPoint) {
			const gradient = plotContext.createLinearGradient(
				prevPoint.x,
				prevPoint.y,
				point.x,
				point.y
			);
			gradient.addColorStop(0, prevPoint.color);
			gradient.addColorStop(1, point.color);
			plotContext.strokeStyle = gradient;
			plotContext.beginPath();
			plotContext.moveTo(prevPoint.x, prevPoint.y);
			plotContext.lineTo(point.x, point.y);
			plotContext.lineWidth = 1;
			plotContext.stroke();
		}
		prevPoint = point;
	}
	// draw origin
	drawOrigin();
	// last point to check if entire plot
	// is draw and stretch to fit the canvas
	drawPoint(points[points.length - 1], "red");
	plotContext.translate(-origin.translateX, -origin.translateY);
}

function drawPoint(point, color) {
	plotContext.beginPath();
	plotContext.arc(point.x, point.y, 5, 0, 2 * Math.PI, false);
	plotContext.fillStyle = color;
	plotContext.fill();
}

function drawOrigin() {
	plotContext.beginPath();
	plotContext.arc(0, 0, 5, 0, 2 * Math.PI, false);
	plotContext.fillStyle = "green";
	plotContext.fill();
}

let prevSpectrumImageData = null;
function drawSpectrum() {
	// draw new spectrum
	const width = 1,
		height = 20;
	spectrumContext.clearRect(0, 0, spectrumCanvas.width, spectrumCanvas.height);
	const { points, xmax } = stream();
	const scaleX = d3
		.scaleLinear()
		.domain([0, xmax])
		.range([0, spectrumCanvas.width]);
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		spectrumContext.beginPath();
		spectrumContext.rect(scaleX(point.x), 0, width, height);
		spectrumContext.fillStyle = point.color;
		spectrumContext.fill();
	}

	if (!!prevSpectrumImageData) {
		spectrumContext.putImageData(prevSpectrumImageData, 0, height);
	}
	prevSpectrumImageData = spectrumContext.getImageData(
		0,
		0,
		spectrumCanvas.width,
		spectrumCanvas.height
	);
}

function draw() {
	// Call the existing drawing functions
	drawPlot();
	drawSpectrum();
	// Right before the next paint, trigger another redraw & rotation.
	requestAnimationFrame(draw);
}
