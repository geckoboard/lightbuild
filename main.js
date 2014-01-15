var Bridge  = require('./lib/bridge'),
    Jenkins = require('./lib/jenkins'),
    config  = require('./config/ci').jenkins,
    env = process.env,
    refreshRate = 30,
    buildServer = new Jenkins({
      username: config.username,
      password: config.password,
      hostname: config.hostname
    });

console.log("Autodiscovering Hue bridge...");

Bridge.autodiscover(function(err, bridge) {
  if (err) {
    console.log("Error: " + err.message);
    process.exit(1);
  }

  console.log("Found Hue bridge: " + bridge.inspect());

  ensureAuthenticated(bridge, function() {
    bridge.getLight(env.LIGHT_ID || 1, function(light) {
      startTicking(buildServer, light);
    });
  });
});

function ensureAuthenticated(bridge, callback) {
  bridge.isAuthenticated(function(isAuthenticated) {
    if (isAuthenticated) {
      callback();
    } else {
      console.log("Requesting permissions to connect to your Hue bridge...");

      bridge.authenticate(function(success) {
        if (!success) {
          console.log("\nError: Lightbuild must be granted permission to connect to your Hue bridge");
          console.log("Please press the link button on top of the bridge, then run lightbuild again within 30 seconds\n");
          process.exit(1);
        }

        callback();
      });
    }
  });
}

function startTicking(buildServer, light) {
  setInterval(function() {
    tick(buildServer, light);
  }, refreshRate * 1000);

  tick(buildServer, light);
}

function tick(buildServer, light) {
  buildServer.getBuildStatus(function(status) {
    if (status.isBroken()) {
      light.blinkRed();
    }
    else {
      light.showGreen();
    }
  });
}
