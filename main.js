var Router = require('./lib/router'),
    Jenkins = require('./lib/jenkins'),
    config = require('./config/jenkins').jenkins,
    env = process.env,
    refreshRate = 30,
    buildServer = new Jenkins({
      username: config.username,
      password: config.password,
      hostname: config.hostname
    });

console.log("Autodiscovering Hue router...");

Router.autodiscover(function(err, router) {
  if (err) {
    console.log("Error: " + err.message);
    process.exit(1);
  }

  console.log("Found Hue router: " + router.inspect());

  router.getLightbulb(env.LIGHTBULB_ID || 1, function(lightbulb) {
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
