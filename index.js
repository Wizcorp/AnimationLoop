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

var _drawMethods = [];
var _drawMethodsLen = 0;
var _isRunning = false;
var _requestId = null;

// Add a method to run at every frame
function addDrawMethod(fn) {
	if (typeof fn === 'function') {
		_drawMethods.push(fn);
		_drawMethodsLen = _drawMethods.length;
	}
}

// Remove all drawing methods
function removeAllDrawMethods() {
	_drawMethods.length = _drawMethodsLen = 0;
}

// Start the animation loop
function start() {
	
	if (anInstancesIsRunning) {
		return console.error('AnimationLoop: impossible to start, another AnimationLoop instance is already running');
	}
	anInstancesIsRunning = true;
	_isRunning = true;
	
	function onTick() {
		if (!_isRunning) {
			return;
		}
		if (_drawMethodsLen === 0) {
			return stop();
		}
		
		if (_drawMethodsLen === 1) {
			_drawMethods[0]();
		} else {
			for (var i = 0; i < _drawMethodsLen; i++) {
				_drawMethods[i]();
			}
		}
		
		_requestId = requestAnimFrame(onTick);
	}
	
	_requestId = requestAnimFrame(onTick);
}

// Stop the animation loop
function stop() {
	_isRunning = false;
	anInstancesIsRunning = false;
	if (_requestId) {
		cancelAnimFrame(_requestId);
	}
}

module.exports = {
	addDrawMethod: addDrawMethod,
	removeAllDrawMethods: removeAllDrawMethods,
	start: start,
	stop: stop
};

