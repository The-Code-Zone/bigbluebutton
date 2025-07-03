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
- pull the changes into the `/dev` folder. the script in the home folder automates this; just give it any branch from the main repo
  - `~$ ./update_dev {branch_name}`
- navigate to the component
  - `~$ cd /bigbluebutton/dev/bigbluebutton/bigbluebutton-html5`
- deploy it
  - `~$ ./deploy.sh`

if you do want to use the `run_dev` and `run_prod` scripts for quick testing, there's a script in the home directory to automate slightly
- `./try_dev.sh` -- runs the run-dev script for the html5 component, awaits a Ctrl+C press, then swaps back to prod with run-prod

random extra bits
- server can be stopped and started with `~$ sudo bbb-conf --stop` and `~$ sudo bbb-conf --start`.
- can check on status of components with `~$ bbb-conf --status`. it'll say if things are currently active or aren't running for some reason
- `~$ bbb-conf` will list all the basic commands

## Monitoring
1. `~$ cd ~/bigbluebutton/bbb-monitoring`
2. `~$ sudo docker-compose up -d` -- update/start monitoring docker images.
3.  go to `/monitoring` on the domain to view Grafana metrics
   
`~$ sudo docker-compose stop` to stop monitoring

`~$ sudo docker-compose up` (omitting `-d`/`-detach`) to view docker logs in the terminal
