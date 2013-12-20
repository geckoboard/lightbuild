function Color(hue, sat) {
  this.hue = hue;
  this.saturation = sat;
}

Color.RED   = new Color(0, 255);
Color.GREEN = new Color(25500, 255);

Color.prototype.isSimilarTo = function(other) {
  return this.hue === other.hue &&
         Math.abs(this.saturation - other.saturation) < 2.0;
};

module.exports = Color;
