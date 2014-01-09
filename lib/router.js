var request = require('request'),
    Lightbulb = require('./lightbulb'),
    deviceType = "lightbuild";

function Router(attr) {
  this.id = attr.id;
  this.ipAddress = attr.internalipaddress;
  this.macAddress = attr.macaddress;
  this.username = "lightbuild";
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

Router.prototype.isAuthenticated = function(callback) {
  request.get(this.url(), function(error, response, body) {
    // We expect a JSON object back from this API call, so if we get an Array
    // it's because an error occurred (though the status code will be 200).
    var payload = JSON.parse(body),
        success = !(payload instanceof Array);

    callback(response.statusCode == 200 && success);
  });
};

Router.prototype.authenticate = function(callback) {
  var url = this.baseURL(),
      payload = { devicetype: deviceType, username: this.username };

  request.post({ url: url, json: payload }, function(error, response, body) {
    var result;

    if (response.body instanceof Array) {
      // For some bizarre reason, the Philips Hue API will return a JSON-encoded
      // singleton array containing a single JSON object. If it has a "success"
      // key, then the API call succeeded; if it has an "error" key, it did not.
      // Unfortunately both of these cases will return a 200 status code.
      result = response.body[0];
    }

    // Call back with true if authentication succeeded, false otherwise
    callback(response.statusCode == 200 && result && result.success);
  });
};

Router.prototype.getLightbulb = function(id, callback) {
  var url = this.url("lights/" + id);
  Lightbulb.find(id, this, callback);
};

Router.prototype.baseURL = function() {
  return "http://" + this.ipAddress + "/api/";
};

Router.prototype.url = function(path) {
  var url = this.baseURL() + this.username + "/";

  if (path) {
    url += path;
  }

  return url;
};

module.exports = Router;
