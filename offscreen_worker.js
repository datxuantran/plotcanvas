importScripts("d3.v6.min.js.js"); // Replace with the actual path to d3.js

let canvas = null;
let context = null;
// offscreen_worker.js
self.onmessage = function (e) {
	if (e.data.canvas) {
		// Canvas setup and initial drawing
		console.debug("initialize", e.data);
		canvas = e.data.canvas;
		context = canvas.getContext("2d");
		initialize(e.data.points);
	} else {
		// Handle zoom and pan updates
		console.debug("updateTransform", e.data);
		updateTransform(e.data);
	}
};

var quadtree,
	scale = 1,
	translateX = 0,
	translateY = 0;

function initialize(points) {
	// Initialize the quadtree with the provided points
	quadtree = d3
		.quadtree()
		.x((d) => d.x)
		.y((d) => d.y)
		.addAll(points);

	drawPoints(); // Initial drawing
}

function updateTransform(data) {
	if (data.type === "zoom") {
		scale = data.scale;
		console.debug("zoom", { scale });
	} else if (data.type === "pan") {
		translateX = data.translateX;
		translateY = data.translateY;
		console.debug("pan", { translateX, translateY });
	}
	drawPoints(); // Redraw after transformation update
}

function drawPoints() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.save();
	context.scale(scale, scale);
	context.translate(translateX, translateY);

	// Implement the rest of the drawing logic

	var visibleWidth = canvas.width / scale;
	var visibleHeight = canvas.height / scale;
	var visibleRegion = {
		x0: -translateX,
		y0: -translateY,
		x1: -translateX + visibleWidth,
		y1: -translateY + visibleHeight,
	};

	// Use quadtree to find points in the visible region
	var visiblePoints = [];
	quadtree.visit(function (node, x1, y1, x2, y2) {
		if (!node.length) {
			do {
				var d = node.data;
				if (
					d.x >= visibleRegion.x0 &&
					d.x < visibleRegion.x1 &&
					d.y >= visibleRegion.y0 &&
					d.y < visibleRegion.y1
				) {
					visiblePoints.push(d);
				}
			} while ((node = node.next));
		}
		return (
			x1 >= visibleRegion.x1 ||
			y1 >= visibleRegion.y1 ||
			x2 < visibleRegion.x0 ||
			y2 < visibleRegion.y0
		);
	});

	// Draw lines between points
	if (visiblePoints.length > 1) {
		context.beginPath();
		context.moveTo(visiblePoints[0].x, visiblePoints[0].y);
		visiblePoints.forEach(function (point) {
			context.lineTo(point.x, point.y);
		});
		context.stroke();
	}

	// Draw the visible points
	visiblePoints.forEach(function (point) {
		context.beginPath();
		context.arc(point.x, point.y, 2, 0, 2 * Math.PI);
		context.fill();
	});

	context.restore();
}
