var Router = require('./lib/router'),
    Jenkins = require('./lib/jenkins'),
    env = process.env,
    refreshRate = 5;

console.log("Autodiscovering Hue router...");

Router.autodiscover(function(router) {
  console.log("Found Hue router: " + router.inspect());

  router.getLightbulb(env.LIGHTBULB_ID, function(lightbulb) {
    setInterval(function() {
      jenkins = new Jenkins({
        username: env.JENKINS_USERNAME,
        password: env.JENKINS_PASSWORD,
        hostname: env.JENKINS_HOSTNAME
      });

      tick(jenkins, lightbulb);
    }, refreshRate * 1000);
  });
});

function tick(jenkins, lightbulb) {
  jenkins.getBuildStatus(function(status) {
    if (status.isBroken()) {
      lightbulb.blinkRed();
    }
    else {
      lightbulb.showGreen();
    }
  });
}
