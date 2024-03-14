'use strict';

const NodeHelper = require('node_helper');
var http = require('http');
var https = require('https');

module.exports = NodeHelper.create({
  start: function() {
    console.log('Starting node helper: MMM-GoogleMapGpx');
    this.isfound=false;

    //
    var self=this;
    setInterval(()=>self.fetchGpxJson(),60000);
    setInterval(()=>self.scheduleGpxPath(),60000);
  },

  // Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    var self = this;
    console.log(notification);
    console.log(payload);
    if(payload == null) {
      console.log("null payload, aborting notification");
      return;
    }

    if (notification === 'GOOGLEMAP_GPX_CONFIG') {
      this.config = payload;
      console.log(this.name + " GOOGLEMAP_GPX_CONFIG complete, getting GPS location" );
      const origin = this.config.origin;
      //.forEach(function(current, i, arr) {
      if(!self.isfound) {
        self.url = origin;
        self.fetchGpxJson();
        //isfound , is set in fetchGpxJson();
        this.fetchGpxPath();
      } else {
        self.sendSocketNotification('GOOGLEMAP_GPX_JSON', self.gpx);
        self.sendSocketNotification('GOOGLEMAP_GPX_REVERSEGEO', self.reverseGeo);
        self.sendSocketNotification('GOOGLEMAP_PATH_UPDATE', self.path);
      }
    }
  },

  calcDistance: function(tpv) {
    var gpx = this.gpx;
    if(gpx==null)
      return -1;
    var lat1 = tpv.lat;
    var lon1 = tpv.lon;
    var lat2 = gpx.lat;
    var lon2 = gpx.lon;
    // https://www.movable-type.co.uk/scripts/latlong.html#:~:text=%E2%88%9Ax%C2%B2%20%2B%20y%C2%B2-,JavaScript%3A,trigs%20%2B%202%20sqrts%20for%20haversine.
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    /*Note in these scripts, I generally use lat/lon for lati­tude/longi­tude in degrees,
     and φ/λ for lati­tude/longi­tude in radians – having found that mixing degrees & radians 
     is often the easiest route to head-scratching bugs...*/
     return d;
  },

  fetchGpxJson: function() {
    console.log("fetchGpxJson");
    var self=this;
    if(this.config==null) {
      console.error("No config");
      return;
    }

    var origin=this.url;
    if(typeof origin=="object" && "lat" in origin && "lon" in origin) {
      this.gpx = origin;
      if(!this.isfound) {
        this.isfound=true;
        this.sendSocketNotification('GOOGLEMAP_GPX_JSON', this.gpx);  
        self.fetchReverseGeocode();
      }
      return;
    }

    var url=origin;
    http.get(url, res => {
      console.log("http callback handler for " + url);
      let data = [];
      const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
      res.on('data', chunk => {
        data.push(chunk);
      });
      res.on('end', () => {
        var html = ""+data;
        console.log('Response ended: ' + html.substring(0,100));
        //console.log(html.indexOf('TPV'));
        if(html.indexOf('TPV') != -1) {
          console.log("sending GOOGLEMAP_GPX_JSON from " + url);
          self.isfound=true;
          self.url = url;
          var gpx=JSON.parse(html);
          if('data' in gpx && 'lat' in gpx.data && 'lon' in gpx.data)
            gpx = gpx.data;
          var d=self.calcDistance(gpx);
          self.gpx=gpx;
//console.log(self.gpx);
//          if(d>30 || d==-1){
//console.log(self.reverseGeo);
//console.log(d);
          if(d>30 || d==-1 || !self.reverseGeo  ) {
            self.sendSocketNotification('GOOGLEMAP_GPX_JSON', self.gpx);
            console.log(self.name + " location change, getting geocode");
            self.fetchReverseGeocode();
          } else
            console.log(["GPx update negligible distance (meters)",d]);
        }
      });
    }).on('error', err => {
      console.log('Error: ', err.message);
    });
  },


  fetchReverseGeocode: function() {
    var self=this;
    //https://maps.googleapis.com/maps/api/geocode/json?latlng=49.226923333,-122.943695&key=<GOOGLE_API_CODE>
    var url="https://maps.googleapis.com/maps/api/geocode/json?latlng="+this.gpx.lat+","+this.gpx.lon+"&key=" + this.config.apikey;
    https.get(url, res => {
            console.log("https callback handler for google geocode " + url);
            let data = [];
            const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
            res.on('data', chunk => {
              data.push(chunk);
            });
            res.on('end', () => {
//console.log(data);
              var html = ""+data.join('');
              console.log('Response ended: ' + html.substring(0,100));
              //console.log('Response ended: ' + html);
              //console.log(html.indexOf('"status" : "OK"'));
              if(html.indexOf(' "status" : "OK"') != -1) {
                console.log("good geocode, sending GOOGLEMAP_GPX_REVERSEGEO");
                self.reverseGeo=JSON.parse(html);
                self.sendSocketNotification('GOOGLEMAP_GPX_REVERSEGEO', self.reverseGeo);
              } else {
                self.reverseGeo=null;
              }
            });
    }).on('error', err => {
      console.log('Error: ', err.message);
    });
  },

  scheduleGpxPath: function() {
    const config = this.config;
    const schedule = config.pathCheckSchedule;
    const now = new Date();
    const hmm = now.getHours()*100+now.getMinutes();
    if(schedule && (typeof schedule=="array") && schedule.indexOf(hmm)!=-1)
      this.fetchGpxPath();
  },
  fetchGpxPath: function() {
    var self=this;
    var url=this.config.pathurl; //"http://100.24.142.145:10000/gpx.php?cmd=get";

    const urlParts = new URL(url);
    const protocol = urlParts.protocol.startsWith("https://") ? https : http ;
    protocol.get(url, res => {
            console.log("http callback handler for path " + url);
            let data = [];
            const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
            res.on('data', chunk => {
              data.push(chunk);
            });
            res.on('end', () => {
//console.log(data);
              var html = ""+data.join('');
              console.log('Response ended: ' + html.substring(0,100));
              //console.log('Response ended: ' + html);
              //console.log(html.indexOf('"status" : "OK"'));
              if(html.indexOf('{"class":"TPV"') != -1) {
                console.log(self.name + "good TPV, constructing GOOGLEMAP_PATH_UPDATE");
                self.path=JSON.parse(html);
                const path=self.path.data;

                //console.log(self.name + "bounds timeout");
                const max1=Math.max(...path.map(s=>s.lat));
                const min1=Math.min(...path.map(s=>s.lat));
                const max2=Math.max(...path.map(s=>s.lon));
                const min2=Math.min(...path.map(s=>s.lon));
                
                self.path.bounds = [{ lat: min1, lng: min2 },
                  { lat: min1, lng: max2 },
                  { lat: max1, lng: min2 },
                  { lat: max1, lng: max2 }];
                  //self.path.latMin = min1;
                  //self.path.lonMin = min2;
                  //self.path.latMax = max1;
                  //self.path.lonMax = max2;
  

                //find stops
                //find distance travelled for stops
                //get geocode for stops
                var segment=[];
                var start=0;
                var sec=0;
                var speed=0;
                var top = 0;
                const five_min = 5 * 60 * 1000;
                const timestop = path.map(s=>Date.parse(s.time));
                var len = path.length;
                //console.log(len);
                //console.log(timestop);
                for(var i=0; i<len-1; i++) {
                  //console.log(self.name + " " + i);
                  const time1 = timestop[i];
                  const time2 = timestop[i+1];
                  const timespan = time2-time1;

                  const before = path[i];
                  const after = path[i+1];
                  if(timespan>five_min){
                    var info = {start:start, end:i, 
                      time1:new Date(timestop[start]), time2:new Date(timestop[i]), 
                      avgspeed:self.convertSpeed(speed/sec), 
                      distance:self.convertLength(speed), 
                      topspeed:self.convertSpeed(top),
                    }
                    segment.push(info);
                    start = i+1;
                    sec=0;
                    speed=0;
                    top=0;
                    // this.reverseGeo.results.slice(0,2).forEach(function(current, i, arr) {
                    //const intersection = current.types.filter(x => acceptable.includes(x));
                    //self.neardiv.innerHTML = "";
                    //self.infodiv.innerHTML = "Probably: " + current.formatted_address;
                    //var lat = current.geometry.location.lat;
                    //var lon = current.geometry.location.lng;    
                    info.geocode = null;
                    self.callbackReverseGeocode(before.lat,before.lon,(json)=>{
                      json.results.slice(0,1).forEach(function(current, j, arr) {
                        //const intersection = current.types.filter(x => acceptable.includes(x));
                        var inforef = info;
                        inforef.geocode = {addr: current.formatted_address,
                                        lat:current.geometry.location.lat,
                                        lon:current.geometry.location.lng,
                        };
                        self.sendSocketNotification('GOOGLEMAP_PATH_UPDATE', self.path);
                      });
                    });
                  } else {
                    sec += timespan;
                    speed += timespan*(before.speed + after.speed)/2000;
                    top = Math.max(top, after.speed);  
                  }
//                  if(timespan>30000) {
//                    console.log("|".repeat(100*timespan/60000));
//                    console.log(timespan);
//                    console.log(timespan/60000);  
//                    console.log(new Date(time1),new Date(time2))
//                  }
                }
                var d=self.calcDistance(path[len-1]);
                //console.log(d);
                if(d>30) {
                  var info2={start:start, end:i, 
                    time1:new Date(timestop[start]), time2:new Date(timestop[len-1]), 
                    avgspeed:self.convertSpeed(speed/sec), 
                    distance:self.convertLength(speed), 
                    topspeed:self.convertSpeed(top),
                  }
                  segment.push(info2);  
                  info2.geocode = null;
                  self.callbackReverseGeocode(path[len-1].lat,path[len-1].lon,(json)=>{
                    json.results.slice(0,1).forEach(function(current, j, arr) {
                      //const intersection = current.types.filter(x => acceptable.includes(x));
                      info2.geocode = {addr: current.formatted_address,
                                      lat:current.geometry.location.lat,
                                      lon:current.geometry.location.lng,
                      };
                    });
                    self.sendSocketNotification('GOOGLEMAP_PATH_UPDATE', self.path);
                  });
                }

                self.path.segment = segment;
                self.sendSocketNotification('GOOGLEMAP_PATH_UPDATE', self.path);
              } else {
                self.path=null;
              }
            });
    }).on('error', err => {
      console.log('Error: ', err.message);
    });
  },

  convertSpeed: function(m_per_sec){
    return Math.round(2.23694*m_per_sec) + "mph";
  },
  convertLength: function(meter){
    return Math.round(meter/1609.34)+"mi";
  },

  callbackReverseGeocode: function(lat, lon, callback) {
    var self=this;
    //https://maps.googleapis.com/maps/api/geocode/json?latlng=49.226923333,-122.943695&key=<GOOGLE_API_CODE>
    var url="https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lon+"&key=" + this.config.apikey;
    https.get(url, res => {
            console.log("https callback handler for google geocode " + url);
            let data = [];
            const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
            res.on('data', chunk => {
              data.push(chunk);
            });
            res.on('end', () => {
              var html = ""+data.join('');
              console.log('Response ended: ' + html.substring(0,100));
              //console.log('Response ended: ' + html);
              //console.log(html.indexOf('"status" : "OK"'));
              if(html.indexOf(' "status" : "OK"') != -1) {
                console.log("good geocode");
                var reverseGeo=JSON.parse(html);
                callback(reverseGeo);
              }
            });
    }).on('error', err => {
      console.log('Error: ', err.message);
    });
  },


});

