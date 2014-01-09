var request = require('request'),
    Lightbulb = require('./lightbulb');

function Router(attr) {
  this.id = attr.id;
  this.ipAddress = attr.internalipaddress;
  this.macAddress = attr.macaddress;
}

Router.autodiscover = function(callback) {
  request.get("https://www.meethue.com/api/nupnp", function(error, response, body) {
    if (response.statusCode == 200) {
      var routers = JSON.parse(body),
          router;

      if (typeof routers === "undefined" || routers.length === 0) {
        callback(new Error("Hue router not found"));
      } else {
        router = new Router(routers[0]);
        callback(null, router);
      }
    }
    else {
      callback(error);
    }
  });
};

Router.prototype.inspect = function() {
  var str = [this.id, this.ipAddress, this.macAddress].join(", ");
  return "[Router " + str + "]";
};

Router.prototype.getLightbulb = function(id, callback) {
  var url = this.url("lights/" + id);
  Lightbulb.find(id, this, callback);
};

Router.prototype.url = function(path) {
  return "http://" + this.ipAddress + "/api/newdeveloper/" + path;
};

module.exports = Router;
