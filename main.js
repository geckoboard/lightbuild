var Router = require('./lib/router'),
    Jenkins = require('./lib/jenkins'),
    env = process.env,
    refreshRate = 5;

console.log("Autodiscovering Hue router...");

Router.autodiscover(function(router) {
  var lightbulbId = env.LIGHTBULB_ID || 1;

  console.log("Found Hue router: " + router.inspect());

  router.getLightbulb(lightbulbId, function(lightbulb) {
    var jenkins = new Jenkins({
      username: env.JENKINS_USERNAME,
      password: env.JENKINS_PASSWORD,
      hostname: env.JENKINS_HOSTNAME
    });

    setInterval(function() {
      tick(jenkins, lightbulb);
    }, refreshRate * 1000);

    tick(jenkins, lightbulb);
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
