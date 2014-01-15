var request = require('request'),
    Color = require('./color'),
    blinkingDuration = 3;

function Light(id, bridge, attr) {
  var state = attr.state;

  this.id = id;
  this.bridge = bridge;
  this.on = state && state.on;
  this.color = new Color(state.hue, state.sat);
  this.blinking = false;
}

Light.find = function(id, bridge, callback) {
  var url = bridge.url("lights/" + id);

  request.get({ url: url, json: true }, function(error, response, body) {
    if (error) {
      console.log("Error: couldn't fetch light with ID " + id);
      console.log(error);
      return;
    }

    var light = new Light(id, bridge, body);
    callback(light);
  });
};

Light.prototype.blinkRed = function() {
  this.setColor({
    color: Color.RED,
    blink: true
  });
};

Light.prototype.showGreen = function() {
  this.setColor({
    color: Color.GREEN,
    blink: false
  });
};

Light.prototype.stopBlinking = function(color) {
  this.setColor({
    color: this.color,
    blink: false
  });
};

Light.prototype.setColor = function(options) {
  var url = this.bridge.url("lights/" + this.id + "/state"),
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

  // Bail out early if the light is already displaying the colour
  // we're trying to set, unless it's blinking, in which case we need
  // to set the colour again in order to stop the blinking
  if (!this.blinking && this.isDisplayingColor(color)) {
    return;
  }

  request.put({ url: url, json: payload }, function(error, response, body) {
    if (error) {
      console.log("Error: couldn't set light color");
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

Light.prototype.isDisplayingColor = function(color) {
  return this.color.isSimilarTo(color);
};

module.exports = Light;
