# MMM-GoogleMapGpx
Displays GPS location from GPSD JSON, or GPX Path on Google Maps.  Reverses Geocode to get closest address of GPS location, and will display closest address of anywhere it stopped in the path file.  X is default marker for current GPS location, which is expected in the origin configuration.  The pathurl configuration points to URL containing a list of GPS location reflecting a track of a GPS device, and is drawn as a bolded line on the map.  Markers are placed where a stop occurred for more than 10min.

Your GPS location, and/or array of GPS coordinates, have to be supplied by yourself.  This software does not interface with any GPS device. 

The required data format is the typical JSON output produced by the Linux command:

```bash
gpspipe -w
```

The pathurl file has the above data, but separated by commas, and wrapped around in array brackets [].  It only requires the records with TPV.  It should ignore the others.

The origin file has the above data, but only 1 TPV record

The respective files above need to be stored in a file.  And this file has to be either put in same directory as the .js files here (and the configuration changed to point to that file, instead of the sample files).  Or it needs to be uploaded to a internet accessible URL, and the configuration for origin and pathurl changed to reflect the url where the JSON can be read.  The gpspipe command is available on most Linux systems with a GPS device connected, and has GPSD installed.  https://kickstartembedded.com/2022/07/23/a-beginners-guide-to-using-gpsd-in-linux/

I upload both a origin and path file to a URL, and update the config to reflect both, so the module will read the respective URL and display.

| Path                     |  
:-------------------------:|
![](https://raw.githubusercontent.com/studio-1b/MMM-GoogleMapGpx/main/docs/MMM-GoogleMapGpx%20Screenshot%20from%202024-03-13%2022-29-30.png)  

> [!NOTE]
> Uses Google Maps Geocode API, to get addresses from coordinates.
> Google Maps Geocode API is described below, but you don't to understand it to get it to work:
> [https://developers.google.com/maps/documentation/geocoding/requests-reverse-geocoding](https://developers.google.com/maps/documentation/geocoding/requests-reverse-geocoding)


# Platform for the module

Module to be installed in the MagicMirror application, described in below link.

[https://github.com/MagicMirrorOrg/MagicMirror](https://github.com/MagicMirrorOrg/MagicMirror)

The MagicMirror application is built on the [node.js](https://nodejs.org/en) application platform, and node.js package dependencies can be managed by [npm](https://www.npmjs.com/) application.

# Installation
### Pre-requisites: A Google Cloud webservices key needs to grant access to these API:

    Directions API
    Geocoding API
    Maps JavaScript API
    Maps Static API

> [!WARNING]
> Needs Google API key to work.  You can obtain one here:
> [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials).
> The key needs to have permissions to the API indicated above.

### Step 1: Clone module from github, and install dependencies for module

These commands entered on linux command line, will retreive the code for the module, and then install the dependency software from npm

```bash
cd <MagicMirror root>/modules/
git clone https://github.com/studio-1b/MMM-GoogleBusSchedule.git
cd MMM-GoogleBusSchedule
npm install
```

### Step 2: Configure MagicMirror to display module

Add this entry to <MagicMirror root>/config/config.js, as entry in *modules: [* array, somewhere at end.

```js
    {
        module: "MMM-GoogleMapGpx",
        header: "VanCave Tracker",
        position: "top_left",
        config: {
            width: 400,
            height: 300,
            apikey: "<GOOGLE_API_KEY>",
            marker: "marker2", // usually http://location, but marker1-6 has built in images
            origin: { lat: 49.22652, lon: -122.94399 },
            pathurl: "modules/MMM-GoogleMapGpx/sample_path.json",
        }
    },
```


## General options: 

There are 3 configuration important configuration items: Google API key, origin, and pathurl
pathurl: 

| Key | Description |
| :-- | :-- |
| width <br> `350` | Width of Map |
| height <br> `300` | Height of Map |
| apikey <br> (required) | Google API key, as specified above (ie. ) |
| origin (required)<br> `modules/MMM-GoogleMapGpx/sample_path.json` | Can be static coordiantes, in javascript object with Latitude,Longitude (ie. {lat: 0, lon: 0} ) or a URL pointing to a JSON file with lat and lon attributes, which is rechecked for changes every minute.  |
| pathurl (required)<br> `modules/MMM-GoogleMapGpx/sample_path.json` | Has to contain URL to JSON file with array of TPV objects (ie. output from gpspipe -w, separated by commas, wrapped in array brackets[]) |
| marker <br> `marker2` | Can be marker1,marker2,marker3,marker4,marker5,marker6, or a URL to image|
| pathCheckSchedule <br> `[500,700,900,1100,1200,1300,1400,1500,1600,1700,1800,1900,2000,2100,2200,]` | Array of any time formatted hhmm, when the path is updated  |


# Details

TPV json file, in the URL pointed to, in origin configuration can look below, but only the lat and lon are necessary

```js
{
  "class": "TPV",
  "device": "/dev/ttyUSB",
  "mode": 3,
  "time": "2024-03-10T06:01:05.000Z",
  "ept": 0.005,
  "lat": 45.226946667,
  "lon": -120.943606667,
  "alt": 118.8,
  "epx": 7.939,
  "epy": 11.676,
  "epv": 32.2,
  "track": 205.06,
  "speed": 0.036,
  "climb": -0.4,
  "eps": 23.35,
  "epc": 64.4
}
```

You will notice the above record for current location, is a very similar to the records below for a path.  The easiest way to get the above, is simply to extract the latest record below.


The path json file, in the URL pointed to, in path configuration can look below, but only the lat,lon,time,speed are necessary.

```js
[
{"class":"TPV","device":"/dev/ttyUSB0","mode":3,"time":"2024-02-29T21:56:38.000Z","ept":0.005,"lat":49.19041,"lon":-123.081038333,"alt":-0.1,"epx":7.546,"epy":11.611,"epv":34.5,"track":158.12,"speed":2.361,"climb":-0.1,"eps":23.22,"epc":69},{"class":"TPV","device":"/dev/ttyUSB0","mode":3,"time":"2024-02-29T21:56:39.000Z","ept":0.005,"lat":49.190393333,"lon":-123.081023333,"alt":-0.1,"epx":7.546,"epy":11.611,"epv":34.5,"track":137.56,"speed":2.027,"climb":0,"eps":23.22,"epc":69},{"class":"TPV","device":"/dev/ttyUSB0","mode":3,"time":"2024-02-29T21:56:40.000Z","ept":0.005,"lat":49.190383333,"lon":-123.081001667,"alt":-0.1,"epx":7.546,"epy":11.611,"epv":34.5,"track":114.46,"speed":1.945,"climb":0,"eps":23.22,"epc":69},{"class":"TPV","device":"/dev/ttyUSB0","mode":3,"time":"2024-02-29T21:56:41.000Z","ept":0.005,"lat":49.19038,"lon":-123.080978333,"alt":-0.1,"epx":7.546,"epy":11.611,"epv":34.5,"track":97.01,"speed":1.667,"climb":0,"eps":23.22,"epc":69}
]
```

The data was generated above

```bash
/usr/bin/gpspipe -w
```

which creates data that looks like above, but without commas between records or the array brackets surrounding the entire file.  Like below

```js
{"class":"TPV","device":"/dev/ttyUSB0","mode":3,"time":"2024-02-29T21:56:38.000Z","ept":0.005,"lat":49.19041,"lon":-123.081038333,"alt":-0.1,"epx":7.546,"epy":11.611,"epv":34.5,"track":158.12,"speed":2.361,"climb":-0.1,"eps":23.22,"epc":69}
{"class":"TPV","device":"/dev/ttyUSB0","mode":3,"time":"2024-02-29T21:56:39.000Z","ept":0.005,"lat":49.190393333,"lon":-123.081023333,"alt":-0.1,"epx":7.546,"epy":11.611,"epv":34.5,"track":137.56,"speed":2.027,"climb":0,"eps":23.22,"epc":69}{"class":"TPV","device":"/dev/ttyUSB0","mode":3,"time":"2024-02-29T21:56:40.000Z","ept":0.005,"lat":49.190383333,"lon":-123.081001667,"alt":-0.1,"epx":7.546,"epy":11.611,"epv":34.5,"track":114.46,"speed":1.945,"climb":0,"eps":23.22,"epc":69}
... other record types too
{"class":"TPV","device":"/dev/ttyUSB0","mode":3,"time":"2024-02-29T21:56:41.000Z","ept":0.005,"lat":49.19038,"lon":-123.080978333,"alt":-0.1,"epx":7.546,"epy":11.611,"epv":34.5,"track":97.01,"speed":1.667,"climb":0,"eps":23.22,"epc":69}
```

to create the data as the path file requires, grep can filter only for TPV records, and the jq file can wrap the output in brackets and places commas between the records

```bash
/usr/bin/gpspipe -w | grep TPV | jq -s .
```
