var Router = require('./lib/router'),
    env = process.env,
    refreshRate = 5;

console.log("Autodiscovering router...");

Router.autodiscover(function(router) {
  console.log("Found router: " + router.inspect());

  router.getLightbulb(env.LIGHTBULB_ID, function(lightbulb) {
    setInterval(function() {
      tick(lightbulb);
    }, refreshRate * 1000);
  });
});

function tick(lightbulb) {
  lightbulb.blinkRed();
}
