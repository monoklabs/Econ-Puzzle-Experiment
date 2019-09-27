var execSync = require('child_process').execSync;
var CronJob = require('cron').CronJob;

console.log("start")

var cronJobOptions = {
  cronTime: '*/10 * * * *',
  onTick: function() {
    var productionbranch = 'master';

    var execSync = require('child_process').execSync;
    var spawn = require('child_process').spawn;

    var currentVersion = execSync('git for-each-ref --sort=-committerdate refs/heads/ | grep '+productionbranch).toString().split(/[ \t]+/)[0];
    var latestVersion = execSync('git ls-remote | grep '+productionbranch).toString().split(/[ \t]+/)[0];

    if(currentVersion !== latestVersion){
      console.log("Found new version, updating...")
      execSync('screen -dm bash -c "make update; sleep 5; make screen-autoupdate"', {stdio:[0,1,2]});
      process.exit();
    }
  },
  runOnInit: true
}



var job = new CronJob(cronJobOptions);
job.start()

console.log("AUTOUPDATE STARTED")




