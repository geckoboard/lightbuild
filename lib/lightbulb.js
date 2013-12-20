var request = require('request'),
    Color = require('./color'),
    blinkingDuration = 3;

function Lightbulb(id, router, attr) {
  var state = attr.state;

  this.id = id;
  this.router = router;
  this.on = state && state.on;
  this.color = new Color(state.hue, state.sat);
  this.blinking = false;
}

Lightbulb.find = function(id, router, callback) {
  var url = router.url("lights/" + id);

  request.get({ url: url, json: true }, function(error, response, body) {
    if (error) {
      console.log("Error: couldn't fetch lightbulb with ID " + id);
      console.log(error);
      return;
    }

    var lightbulb = new Lightbulb(id, router, body);
    callback(lightbulb);
  });
};

Lightbulb.prototype.blinkRed = function() {
  this.setColor({
    color: Color.RED,
    blink: true
  });
};

Lightbulb.prototype.showGreen = function() {
  this.setColor({
    color: Color.GREEN,
    blink: false
  });
};

Lightbulb.prototype.stopBlinking = function(color) {
  this.setColor({
    color: this.color,
    blink: false
  });
};

Lightbulb.prototype.setColor = function(options) {
  var url = this.router.url("lights/" + this.id + "/state"),
      color = options.color,
      blink = options.blink,
      payload = {
        on: this.on,
        hue: color.hue,
        sat: color.saturation,
        alert: blink ? "lselect" : "none"
      },
      stopBlinking = this.stopBlinking.bind(this),
      that = this;

  // Bail out early if the lightbulb is already displaying the colour
  // we're trying to set, unless it's blinking, in which case we need
  // to set the colour again in order to stop the blinking
  if (!this.blinking && this.isDisplayingColor(color)) {
    return;
  }

  request.put({ url: url, json: payload }, function(error, response, body) {
    if (error) {
      console.log("Error: couldn't set lightbulb color");
      console.log(error);
      return;
    }

    if (response.statusCode == 200) {
      that.color = color;
      that.blinking = blink;

      if (blink) {
        setTimeout(stopBlinking, blinkingDuration * 1000);
      }
    }
  });
};

Lightbulb.prototype.isDisplayingColor = function(color) {
  return this.color.isSimilarTo(color);
};

module.exports = Lightbulb;
