var Router = require('./lib/router'),
    Jenkins = require('./lib/jenkins'),
    env = process.env,
    refreshRate = 30;

console.log("Autodiscovering Hue router...");

Router.autodiscover(function(router) {
  var lightbulbId = env.LIGHTBULB_ID || 1,
      buildServer = new Jenkins({
        username: env.JENKINS_USERNAME,
        password: env.JENKINS_PASSWORD,
        hostname: env.JENKINS_HOSTNAME
      });

  console.log("Found Hue router: " + router.inspect());

  router.getLightbulb(lightbulbId, function(lightbulb) {
    startTicking(buildServer, lightbulb);
  });
});

function startTicking(buildServer, lightbulb) {
  setInterval(function() {
    tick(buildServer, lightbulb);
  }, refreshRate * 1000);

  tick(buildServer, lightbulb);
}

function tick(buildServer, lightbulb) {
  buildServer.getBuildStatus(function(status) {
    if (status.isBroken()) {
      lightbulb.blinkRed();
    }
    else {
      lightbulb.showGreen();
    }
  });
}
