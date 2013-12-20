var request = require('request');

function BuildStatus(status) {
  this.jobs = status.jobs;
}

BuildStatus.prototype.isBroken = function() {
  return this.jobs.some(function(job) {
    return job.color == "red" || job.color == "red_anime";
  });
};

function Jenkins(attr) {
  this.username = attr.username;
  this.password = attr.password;
  this.hostname = attr.hostname;
  this.apiUrl = "https://" + this.username + ":" + this.password + "@" + this.hostname + "/api/json";
}

Jenkins.prototype.getBuildStatus = function(callback) {
  request.get(this.apiUrl, function(error, response, body) {
    if (response.statusCode == 200) {
      var status = JSON.parse(body);
      callback(new BuildStatus(status));
    }
  });
};

module.exports = Jenkins;
