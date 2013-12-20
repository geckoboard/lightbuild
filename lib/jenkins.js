var request = require('request');

function BuildStatus(status) {
  this.jobs = status.jobs;
}

BuildStatus.prototype.isBroken = function() {
  // The build is broken if any of the Jenkins jobs are either red,
  // or a new build is in progress after the previous one was red
  return this.jobs.some(function(job) {
    return job.color == "red" || job.color == "red_anime";
  });
};

function Jenkins(attr) {
  this.username = attr.username;
  this.password = attr.password;
  this.apiUrl = "https://" + attr.hostname + "/api/json";
}

Jenkins.prototype.getBuildStatus = function(callback) {
  request.get({ url: this.apiUrl, json: true }, function(error, response, body) {
    if (error) {
      console.log("Error fetching build status");
      console.log(error);
      return;
    }

    var status = new BuildStatus(body);
    callback(status);
  }).auth(this.username, this.password);
};

module.exports = Jenkins;
