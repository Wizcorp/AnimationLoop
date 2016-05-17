// Flag to avoid having multiple AnimationLoop running at the same time in the same game/page/application
var anInstancesIsRunning = false;

// Retrieve the right requestAnimFrame method
var requestAnimFrame =
	window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function (callback) {
		return window.setTimeout(callback, Math.ceil(1000 / 30));
	}
;

// Retrieve the right cancelAnimFrame method
var cancelAnimFrame =
	window.cancelAnimationFrame ||
	window.webkitCancelAnimationFrame ||
	window.mozCancelAnimationFrame ||
	window.oCancelAnimationFrame ||
	window.msCancelAnimationFrame ||
	function (timeoutId) {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	}
;

var drawMethods = [];
var drawMethodsLen = 0;
var isRunning = false;
var requestId = null;

// Add a method to run at every frame
function addDrawMethod(fn) {
	if (typeof fn === 'function') {
		drawMethods.push(fn);
		drawMethodsLen = drawMethods.length;
	}
}

// Remove all drawing methods
function removeAllDrawMethods() {
	drawMethods.length = drawMethodsLen = 0;
}

// Start the animation loop
function start() {
	
	if (anInstancesIsRunning) {
		return console.error('AnimationLoop: impossible to start, another AnimationLoop instance is already running');
	}
	anInstancesIsRunning = true;
	isRunning = true;
	
	function onTick() {
		if (!isRunning) {
			return;
		}
		if (drawMethodsLen === 0) {
			return stop();
		}
		
		if (drawMethodsLen === 1) {
			drawMethods[0]();
		} else {
			for (var i = 0; i < drawMethodsLen; i++) {
				drawMethods[i]();
			}
		}
		
		requestId = requestAnimFrame(onTick);
	}
	
	requestId = requestAnimFrame(onTick);
}

// Stop the animation loop
function stop() {
	isRunning = false;
	anInstancesIsRunning = false;
	if (requestId) {
		cancelAnimFrame(requestId);
	}
}

var instance;

module.exports = function() {
	if (!instance) {
		return instance = {
			addDrawMethod: addDrawMethod,
			removeAllDrawMethods: removeAllDrawMethods,
			start: start,
			stop: stop
		};
	}
	return instance;
};

