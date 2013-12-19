var Router = require('./lib/router');

console.log("Autodiscovering router...");

Router.autodiscover(function(router) {
  console.log("Found router: " + router.inspect());
});
