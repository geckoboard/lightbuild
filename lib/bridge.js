var request = require('request'),
    Lightbulb = require('./lightbulb'),
    deviceType = "lightbuild";

function Bridge(attr) {
  this.id = attr.id;
  this.ipAddress = attr.internalipaddress;
  this.macAddress = attr.macaddress;
  this.username = "lightbuild";
}

Bridge.autodiscover = function(callback) {
  request.get("https://www.meethue.com/api/nupnp", function(error, response, body) {
    if (response.statusCode == 200) {
      var bridges = JSON.parse(body),
          bridge;

      if (typeof bridges === "undefined" || bridges.length === 0) {
        callback(new Error("Hue bridge not found"));
      } else {
        bridge = new Bridge(bridges[0]);
        callback(null, bridge);
      }
    }
    else {
      callback(error);
    }
  });
};

Bridge.prototype.inspect = function() {
  var str = [this.id, this.ipAddress, this.macAddress].join(", ");
  return "[Bridge " + str + "]";
};

Bridge.prototype.isAuthenticated = function(callback) {
  request.get(this.url(), function(error, response, body) {
    // We expect a JSON object back from this API call, so if we get an Array
    // it's because an error occurred (though the status code will be 200).
    var payload = JSON.parse(body),
        success = !(payload instanceof Array);

    callback(response.statusCode == 200 && success);
  });
};

Bridge.prototype.authenticate = function(callback) {
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

Bridge.prototype.getLightbulb = function(id, callback) {
  var url = this.url("lights/" + id);
  Lightbulb.find(id, this, callback);
};

Bridge.prototype.baseURL = function() {
  return "http://" + this.ipAddress + "/api/";
};

Bridge.prototype.url = function(path) {
  var url = this.baseURL() + this.username + "/";

  if (path) {
    url += path;
  }

  return url;
};

module.exports = Bridge;
