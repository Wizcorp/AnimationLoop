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

// Class
function AnimationLoop() {
	this._drawMethods = [];
	this._drawMethodsLen = 0;
	this._isRunning = false;
	this._requestId = null;
}

// Add a method to run at every frame
AnimationLoop.prototype.addDrawMethod = function (fn) {
	if (typeof fn === 'function') {
		this._drawMethods.push(fn);
		this._drawMethodsLen = this._drawMethods.length;
	}
};

// Remove all drawing methods
AnimationLoop.prototype.removeAllDrawMethods = function () {
	this._drawMethods.length = this._drawMethodsLen = 0;
};

// Start the animation loop
AnimationLoop.prototype.start = function () {
	var that = this;
	
	if (this._isRunning) {
		return;
	}
	this._isRunning = true;
	
	function onTick() {
		if (!that._isRunning) {
			return;
		}
		if (that._drawMethodsLen === 0) {
			return this.stop();
		}
		
		if (that._drawMethodsLen === 1) {
			that._drawMethods[0]();
		} else {
			for (var i = 0; i < that._drawMethodsLen; i++) {
				that._drawMethods[i]();
			}
		}
		
		that._requestId = requestAnimFrame(onTick);
	}
	
	this._requestId = requestAnimFrame(onTick);
};

// Stop the animation loop
AnimationLoop.prototype.stop = function () {
	this._isRunning = false;
	if (this._requestId) {
		cancelAnimFrame(this._requestId);
	}
};

var instance;

// Returns a shared instance of AnimationLoop.
function getInstance() {
	if (instance) {
		return instance;
	}
	return instance = new AnimationLoop();
}

// Expose
module.exports = AnimationLoop;
module.exports.getInstance = getInstance;

