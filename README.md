# MMM-GoogleMapGpx
Displays GPS location from GPSD JSON, or GPX Path on Google Maps.  Reverses Geocode to get closest address of GPS location, and will display closest address of anywhere it stopped in the path file.

Your GPS location, and/or array of GPS coordinates, have to be supplied by yourself.  This software does not interface with any GPS device. 

It can read the typical JSON output produced by the Linux command:

gpspipe -w

This output needs to be stored in a file.  And this file has to be either put in same directory as the .js files here (and the configuration changed to point to that file, instead of the sample files).  Or it needs to be uploaded to a internet accessible URL, and the origin and pathurl changed to reflect the url where the JSON can be read.

Needs Google API key to work.  You can obtain one here:
https://console.cloud.google.com/apis/credentials
The key needs to grant access to these API.
Directions API
Geocoding API
Maps JavaScript API
Maps Static API
Roads API
Routes API

Add configuation to config.js

There are 2 configuration important configuration items
origin: which can be static lat/long in json object format {lat:0, lon:0}
        or a URL pointing to a JSON file with lat and lon attributes.  A TPV record from gpspipe fulfills this requirement
        this will be reflected as X on map.
pathurl: has to contain URL to JSON file with array of TPV
