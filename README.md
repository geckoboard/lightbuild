# lightbuild

Integrates your Jenkins build status with Philips Hue lightbulbs.

## Installation

After installing [node](http://nodejs.org), run:

    npm install

## Usage

Copy the example configuration file, then fill in the details about your
jenkins server:

    cp config/ci.example.json config/ci.json

If it's the first time you're using lightbuild, press the button on the
top of your Hue bridge, then launch lightbuild within 30 seconds:

    ./script/start

The first time you use it, it will attempt to autodiscover your Hue
bridge and request the necessary permissions. You won't have to press
the button again unless you reset the bridge.

By default, lightbuild will use your lightbulb with the ID of 1. To use
a different lightbulb, set the `LIGHT_ID` environment variable:

    LIGHT_ID=3 ./script/start

After connecting to the router, lightbuild will poll your Jenkins server
every 30 seconds and set the lightbulb to be green if all your builds
are green, red otherwise. In addition, when transitioning from green to
red, the lightbulb will briefly blink for three seconds.

## License

BSD 2-Clause
