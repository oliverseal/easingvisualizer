
function EasingVisualizer(canvasSelector, optionsSelector, customScriptSelector, durationSelector, playSelector, copySelector) {
	this.canvas = document.querySelector(canvasSelector);

	this.optionsSelect = document.querySelector(optionsSelector);
	this.customScriptTextArea = document.querySelector(customScriptSelector);
	this.durationTextField = document.querySelector(durationSelector);
	this.playButton = document.querySelector(playSelector);
	this.copyButton = document.querySelector(copySelector);
	
	this.duration = 1500;
	this.currentEquation = EasingLibrary.easeInQuad;

	this.onAnimationFrameProxy = ScopeLocker.lock(this, this.onAnimationFrame);

	this.visualize(this.currentEquation);


	if (this.optionsSelect) {
		this.fillOptions(EasingLibrary);
		this.optionsSelect.addEventListener('change', ScopeLocker.lock(this, this.onOptionSelectChange));
	}
	
	if (this.customScriptTextArea) {
		this.customScriptTextArea.value = this.currentEquation.toString();
		this.customScriptTextArea.addEventListener('change', ScopeLocker.lock(this, this.onCustomScriptChange));
	}

	if (this.durationTextField) {
		this.durationTextField.value = this.duration;
		this.durationTextField.addEventListener('change', ScopeLocker.lock(this, this.onDurationTextFieldChange));
	}

	if (this.playButton) {
		this.playButton.addEventListener('click', ScopeLocker.lock(this, this.onPlayButtonClick));
	}
	if (this.copyButton) {
		this.copyButton.addEventListener('click', ScopeLocker.lock(this, this.onCopyButtonClick));
	}
}

EasingVisualizer.prototype.fillOptions = function(library) {
	for (var equationName in library) {
		var option = document.createElement('option');
		option.value = equationName;
		option.innerHTML = equationName;

		this.optionsSelect.appendChild(option);
	}

	var customOption = document.createElement('option');
	customOption.value = 'custom';
	customOption.innerHTML = 'custom';
	this.optionsSelect.appendChild(customOption);
}

EasingVisualizer.prototype.visualize = function() {
	this.animationStartTime = (new Date()).getTime();
	this.animationEndTime = this.animationStartTime + this.duration;

	this.canvas.width = this.canvas.parentNode.clientWidth;
	this.canvas.height = this.canvas.parentNode.clientHeight;
	var ctx = this.canvas.getContext('2d');
	ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	requestAnimationFrame(this.onAnimationFrameProxy);
}

EasingVisualizer.prototype.draw = function(percentComplete) {
	var ctx = this.canvas.getContext('2d');
	//put 100% of time at 80% less;
	var width = this.canvas.width * 0.9;
	var height = this.canvas.height * 0.9;

	var maxLeft = this.canvas.width * 0.1;
	var maxTop = this.canvas.height * 0.1;
	//x represents time
	var x = maxLeft + (width - maxLeft) * percentComplete;
	//y represents the value being manipulated
	var y = this.applyEasing(this.currentEquation, percentComplete, height, maxTop, this.duration);

	ctx.strokeStyle = '#000000';
	ctx.lineWidth = 1.0;
	ctx.beginPath();
	ctx.arc(x, y, 2, 0, Math.PI, false);
	ctx.closePath();
	ctx.stroke();
}

EasingVisualizer.prototype.applyEasing = function(easingEquation, percentComplete, start, end, duration) {
	var eased = easingEquation(percentComplete, duration * percentComplete, 0, 1, duration);
	return (end - start) * eased + start;
}

EasingVisualizer.prototype.onAnimationFrame = function(time) {
	this.draw((time - this.animationStartTime)/(this.animationEndTime - this.animationStartTime));
	if (time <= this.animationEndTime) {
		requestAnimationFrame(this.onAnimationFrameProxy);
	}
}

EasingVisualizer.prototype.onOptionSelectChange = function(e) {
	try {
		//loop through to get selected value
		var select = e.currentTarget;
		var options = select.querySelectorAll('option');
		var selectedOption = null;
		for (var i = options.length - 1; i >= 0; i--) {
			var option = options[i];
			if (option.selected) {
				selectedOption = option;
				break;
			}
		};

		if (selectedOption) {
			var newEasing = EasingLibrary[selectedOption.value];
			if (newEasing) {
				this.currentEquation = newEasing;
				this.visualize();
			}
		}
	}
	catch(err) {

	}
}

EasingVisualizer.prototype.onCustomScriptChange = function(e) {
	eval('EasingLibrary.custom = ' + this.customScriptTextArea.value);
	this.currentEquation = EasingLibrary.custom;

	if (this.optionsSelect) {
		var options = this.optionsSelect.querySelectorAll('option');
		for (var i = options.length - 1; i >= 0; i--) {
			var option = options[i];
			if (option.value == 'custom') {
				option.selected = true;
				break;
			}
		};
	}
}

EasingVisualizer.prototype.onDurationTextFieldChange = function(e) {
	var duration = Number(this.durationTextField.value);
	if (!isNaN(duration)) {
		this.duration = duration;
		this.visualize();
	}
}

EasingVisualizer.prototype.onPlayButtonClick = function(e) {
	this.visualize();
}

EasingVisualizer.prototype.onCopyButtonClick = function(e) {
	this.customScriptTextArea.value = this.currentEquation.toString();
	this.visualize();
}

//I blatantly stole this logic from Actionscript 2 concepts WAY BACK IN DA DAY
function ScopeLocker(f) { this.func = f; }
ScopeLocker.prototype.func = function(){}
ScopeLocker.lock = function(obj, func) {
    var f = function() {
        var target = arguments.callee.target;
        var func = arguments.callee.func;
        if(func && target)
            return func.apply(target, arguments);
        return null;
    };

    f.target = obj;
    f.func = func;

    return f;
}

//////////////// Robert Penner equations ////////////////////////////////////////////////
var EasingLibrary = {
  easeInQuad: function(x, t, b, c, d) {
    return c * (t /= d) * t + b;
  },
  easeOutQuad: function(x, t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
  },
  easeInOutQuad: function(x, t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
    return -c / 2 * ((--t) * (t - 2) - 1) + b;
  },
  easeInCubic: function(x, t, b, c, d) {
    return c * (t /= d) * t * t + b;
  },
  easeOutCubic: function(x, t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
  },
  easeInOutCubic: function(x, t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
  },
  easeInQuart: function(x, t, b, c, d) {
    return c * (t /= d) * t * t * t + b;
  },
  easeOutQuart: function(x, t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  },
  easeInOutQuart: function(x, t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
  },
  easeInQuint: function(x, t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
  },
  easeOutQuint: function(x, t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
  },
  easeInOutQuint: function(x, t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
  },
  easeInSine: function(x, t, b, c, d) {
    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
  },
  easeOutSine: function(x, t, b, c, d) {
    return c * Math.sin(t / d * (Math.PI / 2)) + b;
  },
  easeInOutSine: function(x, t, b, c, d) {
    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
  },
  easeInExpo: function(x, t, b, c, d) {
    return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
  },
  easeOutExpo: function(x, t, b, c, d) {
    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
  },
  easeInOutExpo: function(x, t, b, c, d) {
    if (t == 0) return b;
    if (t == d) return b + c;
    if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
  },
  easeInCirc: function(x, t, b, c, d) {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
  },
  easeOutCirc: function(x, t, b, c, d) {
    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
  },
  easeInOutCirc: function(x, t, b, c, d) {
    if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
    return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
  },
  easeInElastic: function(x, t, b, c, d) {
    var s = 1.70158;
    var p = 0;
    var a = c;
    if (t == 0) return b;
    if ((t /= d) == 1) return b + c;
    if (!p) p = d * .3;
    if (a < Math.abs(c)) {
      a = c;
      var s = p / 4;
    } else var s = p / (2 * Math.PI) * Math.asin(c / a);
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
  },
  easeOutElastic: function(x, t, b, c, d) {
    var s = 1.70158;
    var p = 0;
    var a = c;
    if (t == 0) return b;
    if ((t /= d) == 1) return b + c;
    if (!p) p = d * .3;
    if (a < Math.abs(c)) {
      a = c;
      var s = p / 4;
    } else var s = p / (2 * Math.PI) * Math.asin(c / a);
    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
  },
  easeInOutElastic: function(x, t, b, c, d) {
    var s = 1.70158;
    var p = 0;
    var a = c;
    if (t == 0) return b;
    if ((t /= d / 2) == 2) return b + c;
    if (!p) p = d * (.3 * 1.5);
    if (a < Math.abs(c)) {
      a = c;
      var s = p / 4;
    } else var s = p / (2 * Math.PI) * Math.asin(c / a);
    if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
  },
  easeInBack: function(x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
  },
  easeOutBack: function(x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
  },
  easeInOutBack: function(x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
  },
  easeInBounce: function(x, t, b, c, d) {
    return c - EasingLibrary.easeOutBounce(x, d - t, 0, c, d) + b;
  },
  easeOutBounce: function(x, t, b, c, d) {
    if ((t /= d) < (1 / 2.75)) {
      return c * (7.5625 * t * t) + b;
    } else if (t < (2 / 2.75)) {
      return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
    } else if (t < (2.5 / 2.75)) {
      return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
    } else {
      return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
    }
  },
  easeInOutBounce: function(x, t, b, c, d) {
    if (t < d / 2) return EasingLibrary.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
    return EasingLibrary.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
  },
  //Some Oliver creations/experiments
  easeOutYoYo: function (x, t, b, c, d) {
    if (x < 0.5)
        t = t*2;
    else {
        t = t*2 - x;
    }
    return -c * (t /= d) * (t - 2) + b;
  },
  //soulwire organics (Justin Windle)
  soulwireEaseInSine: function (x, t, b, c, d) {
    return -c * Math.cos(x * (Math.PI / 2)) + c + b;
  },
  soulwireEaseOutSine: function (x, t, b, c, d) {
    return c * Math.sin(x * (Math.PI / 2)) + b;
  },
  soulwireBreathShort: function (x, t, b, c, d) {
    return c * Math.abs(Math.cos(x)*Math.sin(x)) + b;
  },
  soulwireTwinkleIn: function (x, t, b, c, d) {
    t = t * 0.0015;
    var f = Math.sin(t)*Math.sin(t*1.5);
    return b + Math.abs(f) * (c - b);
  },
  soulwireTwinkleOut: function (x, t, b, c, d) {
    var f = Math.sin(Math.tan(Math.cos(x)*(1.2*(x*2.05))));
    return b + Math.abs(f) * (c - b);
  },
  soulwireAttack: function (x, t, b, c, d) {
    t = t * 0.0015;
    var f = Math.sin(Math.tan(t)*0.05);
    return b + Math.abs(f) * (c - b);
  },
  soulwireElasticGrow: function (x, t, b, c, d) {
    t = t * 0.0015;
    var f = Math.cos(Math.sin(t*3))*Math.sin(t*0.2);
    return b + Math.abs(f) * (c - b);
  },
  soulwireKnock: function (x, t, b, c, d) {
    t = t * 0.0015;
    var f = Math.sin(Math.pow(8,Math.sin(t)));
    return b + Math.abs(f) * (c - b);
  },
  soulwireBounce: function (x, t, b, c, d) {
    t = t * 0.0015;
    var f = Math.sin(Math.exp(Math.cos(t*0.8))*2);
    return b + Math.abs(f) * (c - b);
  },
  soulwireBlinkOut: function (x, t, b, c, d) {
    t = t * 0.0015;
    var f = Math.sin(t-Math.PI*Math.tan(t)*0.01);
    return b + Math.abs(f) * (c - b);
  },
  soulwireHeartbeat: function (x, t, b, c, d) {
    t = t * 0.0015;
    var f = Math.pow(Math.sin(t*Math.PI),12);
    return b + Math.abs(f) * (c - b);
  },
  soulwireHeartbeatNatural: function (x, t, b, c, d) {
    t = t * 0.0015;
    var f = Math.cos(Math.sin(t)*Math.tan(t*Math.PI)*Math.PI/8);
    return b + Math.abs(f) * (c - b);
  },
  soulwireHeartbeatErratic: function (x, t, b, c, d) {
    t = t * 0.0015;
    var f = Math.sin(Math.tan(t)*Math.pow(Math.sin(t),10));
    return b + Math.abs(f) * (c - b);
  },
  soulwireHeartbeatSteady: function (x, t, b, c, d) {
    t = t * 0.0015;
    var f = Math.cos(Math.sin(t*3)+t*3);
    return b + Math.abs(f) * (c - b);
  },
  soulwireBounceGrow: function (x, t, b, c, d) {
    t = t * 0.0015;
    var f = Math.pow(Math.abs(Math.sin(t*2))*0.6,Math.sin(t*2))*0.6;
    return b + Math.abs(f) * (c - b);
  }
};


(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());