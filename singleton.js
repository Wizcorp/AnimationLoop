/**
 * Updated AnimationLoop to be a singleton using :
 * Basic javascript singleton (http://addyosmani.com/resources/essentialjsdesignpatterns/book/#singletonpatternjavascript)
 *
 * Added draw groups so that you can specify which draw group to call, you can only have one draw group
 * running at one time.
 *
 * Keeping the interface between the old 'non-singleton' and this new one means that code can be easily
 * updated to use this if there is only one draw group, and if it wants more than one draw group it can
 * take advantage of the new method signatures.
 *
 * Remove draw methods are currently a bit unintuitive, if the code that uses this feature was to be
 * updated then I would swap the naming of these two around so that they make more sense.  It is done this
 * way to keep the default consistent with any code that would be currently using this class
 *
 */
var AnimationLoop = (function () {
    // Instance stores a reference to the Singleton
    var instance;

    function init() {
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

        // _defaultGroup sets the key when no group is provided
        var _defaultGroup = "default";
        // _drawMethods holds multiple arrays which are accessed via a key
        var _drawMethods = {};
        // _drawMethodsLen holds the length of the _drawMethods array accessed via the same key
        var _drawMethodsLen = {};
        // _isRunning to keep track of state for the singleton
        var _isRunning = false;
        // _requestId of the requestAnimFrame so that it can be stopped
        var _requestId = null;

        // Public methods for the AnimationLoop Singleton
        return {
            /**
             * This function starts the animationloop for a specific group of drawmethods, if
             * no draw group is specified then it draws the default group
             */
            start: function (group) {
                // Take reference of singleton
                var self = this;
                // Check if animationframe is running
                if (_isRunning) {
                    return console.error('AnimationLoop: impossible to start, another AnimationLoop instance is already running');
                }
                // set to running
                _isRunning = true;
                // start group, if no group specified set to _defaultGroup
                group = group || _defaultGroup;

                // Animation Loop update function
                function onTick() {
                    if (!_isRunning) {
                        return;
                    }

                    if (_drawMethodsLen[group] === 0) {
                        return self.stop();
                    }

                    if (_drawMethodsLen[group] === 1) {
                        _drawMethods[group][0]();
                    } else {
                        for (var i = 0; i < _drawMethodsLen[group]; i++) {
                            _drawMethods[group][i]();
                        }
                    }
                    _requestId = requestAnimFrame(onTick);
                }
                _requestId = requestAnimFrame(onTick);
            },

            /**
             * To stop the update it cancels the animation from currently being updated
             */
            stop: function () {
                _isRunning = false;
                if (_requestId) {
                    cancelAnimFrame(_requestId);
                }
            },

            /**
             * To add draw methods to an animation group, if no group is specified it adds the
             * methods to the default group
             */
            addDrawMethod: function (fn, group) {
                if (typeof fn === 'function') {
                    group = group || _defaultGroup;
                    if(!_drawMethods[group]){
                        _drawMethods[group] = [];
                    }
                    _drawMethods[group].push(fn);
                    _drawMethodsLen[group] = _drawMethods[group].length;
                } else {
                    console.error('AnimationLoop.addDrawMethod: expected function')
                }
            },

            /**
             * To remove all draw methods from a group
             * hasOwnProperty provides a safety check if it is edited
             */
            removeAllDrawMethods: function (group) {
                group = group || _defaultGroup;
                if (_drawMethods.hasOwnProperty(group)) {
                    delete _drawMethods[group];
                    delete _drawMethodsLen[group];
                }
            },

            /**
             * To remove all draw methods from every group
             */
            removeDrawMethods: function () {
                for (var group in _drawMethods) {
                    if (_drawMethods.hasOwnProperty(group)) {
                        delete _drawMethods[group];
                        delete _drawMethodsLen[group];
                    }
                }
            }
        };
    }
    return {
        /**
         * Get the AnimationLoop Singleton instance if one exists or create it
         */
        getInstance: function () {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    };
})();

/**
 * For testing in the browser I have added a check so no error fires for module.exports
 */
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = AnimationLoop.getInstance();
else
    window.AnimationLoop = AnimationLoop.getInstance();
