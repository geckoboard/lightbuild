var request = require("request"),
    blinkingDuration = 3,
    Color = {
      RED: { hue: 0, saturation: 255 },
      GREEN: { hue: 25500, saturation: 255 }
    };

function Lightbulb(id, attr, router) {
  this.id = id;
  this.on = attr.state && attr.state.on;
  this.router = router;
}

Lightbulb.find = function(id, router, callback) {
  var url = router.url("lights/" + id);

  request.get({ url: url, json: true }, function(error, response, body) {
    if (error) {
      console.log("Error: couldn't fetch lightbulb with ID " + id);
      console.log(error);
      return;
    }

    var lightbulb = new Lightbulb(id, body, router);
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
      stopBlinking = this.stopBlinking.bind(this);

  request.put({ url: url, json: payload }, function(error, response, body) {
    if (error) {
      console.log("Error: couldn't set lightbulb color");
      console.log(error);
      return;
    }

    if (blink) {
      setTimeout(stopBlinking, blinkingDuration * 1000, color);
    }
  });
};

Lightbulb.prototype.stopBlinking = function(color) {
  this.setColor({
    color: color,
    blink: false
  });
};

module.exports = Lightbulb;
