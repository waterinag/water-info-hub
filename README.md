#  Water Informatics Team Project Hub



5. Clone the code repo from github
git clone git@github.com:amanchry/water-info-hub.git



Show all listening ports
sudo lsof -i -P -n | grep LISTEN



- Install dependencies
npm install

In dev mode
npx next dev -p 3008


- Start Next JS Project using PM2 process
PORT=3008 pm2 start npm --name "water_info_hub" -- start
pm2 start ecosystem.config.js

- Check status:
pm2 status
pm2 logs water_info_hub







- Update code from GitHub
git pull origin main
git pull --no-rebase --no-autostash origin main
 
- Reinstall dependencies (if needed)
npm install

- Rebuild Next.js
npm run build

- Stop PM2 process
pm2 stop water_info_hub




- Restart PM2 process
pm2 restart water_info_hub





Check all PM2 processes:
pm2 list


Delete the errored one:
pm2 delete 0


(or use the name if needed)
pm2 delete water_info_hub


Then restart the good one if needed:
pm2 restart water_info_hub

If you’re unsure which is which
Run:
pm2 logs 0
pm2 logs 1


#  Water Informatics Team Project Hub
=============
Apache commands
=============


* Enable the virtual host with the following command:**
`sudo a2ensite waterinag.org.conf`

* To disable site**
(here waterinag.org.conf is apache conf file for waterinag.org website)
`sudo a2dissite waterinag.org.conf`


* Restart the Apache webserver to apply the changes:
`sudo systemctl reload apache2`
`sudo systemctl restart apache2`

* List all the enabled sites**
`ls -l /etc/apache2/sites-enabled`

* Test the apache configuration:**
`sudo apachectl configtest`


* Install certbot in Ubuntu (enable ssl certificate)
`sudo apt install certbot python3-certbot-apache`

* Set SSL and enable https**
`sudo certbot --apache -d waterinag.org`









