### Forked from BigBlueButton/bigbluebutton

BigBlueButton is an open-source virtual classroom designed to help teachers teach and learners learn.  

- You can install BigBlueButton on Ubuntu 22.04 using [bbb-install.sh](https://github.com/bigbluebutton/bbb-install).
- For full technical documentation of BigBlueButton see [https://docs.bigbluebutton.org/](https://docs.bigbluebutton.org/).
- BigBlueButton and the BigBlueButton Logo are trademarks of [BigBlueButton Inc](https://bigbluebutton.org).

## Managing/Deploying/Updating

`~/bigbluebutton` - the live build. **nothing in here should ever be touched manually except config files.**

`~/bigbluebutton/dev` - our fork. changes get pulled into here from Git, then `./deploy.sh` scripts within individual components have to be run to push that particular component to live.

there's also `./run_dev.sh` and `./run_prod.sh` scripts inside components for local dev. they'll swap the component to dev mode without a build step just for a quick test, and then set the component back to the prod build, respectively. i found some issues with using these, they don't seem to be quite representative of how things worked on live, so i chose to ignore them.

i've found using `./deploy.sh` for everything is best. downside is a small build step and no simple script to revert the changes afterwards. if you need to revert back, you'd have to pull the previous commit in and then re-run `./deploy.sh`. upside though, it's exactly how things will end up on live, guaranteed.

**e.g. to push live a change to the html5 component (probably the only one we'll change any time soon)**
```bash
# 1. pull the changes into the /dev folder
~$ ./update_dev {branch_name}

# 2. navigate to the html5 component
~$ cd /bigbluebutton/dev/bigbluebutton/bigbluebutton-html5

# 3. deploy it
~$ ./deploy.sh
```

if you do want to use the `run_dev` and `run_prod` scripts for quick testing, there's a script in the home directory to automate slightly
- `./try_dev.sh` -- runs the run-dev script for the html5 component, awaits a Ctrl+C press, then swaps back to prod with run-prod

additional useful bits
```bash
# list commands
~$ bbb-conf

# stop the server
~$ sudo bbb-conf --stop

# start the server
~$ sudo bbb-conf --start

# restart (for config changes)
~$ sudo bbb-conf --restart

# check on status of components
~$ bbb-conf --status
```

## Monitoring

to launch
```bash
# 1. navigate to monitoring component
~$ cd ~/bigbluebutton/bbb-monitoring

# 2. update/start docker images
~$ sudo docker-compose up -d

# 3. then go to /monitoring/ on the domain to view Grafana metrics
```

additional useful bits
```bash
# stop monitoring component
~$ sudo docker-compose stop

# view monitoring logs
~$ sudo docker-compose up
```
