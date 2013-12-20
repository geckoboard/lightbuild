var request = require("request");

function Lightbulb(id, attr) {
  this.id = id;
  this.on = attr.state && attr.state.on;
}

Lightbulb.find = function(id, router, callback) {
  var url = router.url("lights/" + id);

  request.get(url, function(error, response, body) {
    if (body) {
      var attr = JSON.parse(body);
      callback(new Lightbulb(id, attr));
    }
  });
};

Lightbulb.prototype.blinkRed = function() {
  console.log("*blink* *blink* *blink* RED");
};

Lightbulb.prototype.showGreen = function() {
  console.log("So green");
};

module.exports = Lightbulb;
