var request = require("request");

function Router(attr) {
  this.id = attr.id;
  this.ipAddress = attr.internalipaddress;
  this.macAddress = attr.macaddress;
}

Router.prototype.inspect = function() {
  var str = [this.id, this.ipAddress, this.macAddress].join(", ");
  return "[Router " + str + "]";
};

Router.autodiscover = function(success) {
  request.get("https://www.meethue.com/api/nupnp", function(error, response, body) {
    if (response.statusCode == 200) {
      var routers = JSON.parse(body);

      if (typeof routers === "undefined" || routers.length === 0) {
        console.log("Error: no routers found");
        return;
      }

      var router = new Router(routers[0]);
      success(router);
    }
    else {
      console.log("Error: " + error);
    }
  });
};

module.exports = Router;
