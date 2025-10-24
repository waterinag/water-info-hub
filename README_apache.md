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







