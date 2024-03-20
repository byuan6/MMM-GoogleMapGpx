Module.register("MMM-GoogleMapGpx",{
    // Default module config.
    defaults: {
        apikey: 'your_api_key',
        origin: 'modules/MMM-GoogleMapGpx/sample_gpx.json',
        pathurl: 'modules/MMM-GoogleMapGpx/sample_path.json',
        style: 'border:0;-webkit-filter: grayscale(100%);filter: grayscale(100%);',
        googleurl: 'https://maps.googleapis.com/maps/api/js?key=@replacemewithgoogleapikey/&callback=googleMapsEvent',
        marker: 'marker2',
        pathCheckSchedule: [500,700,900,1100,1200,1300,1400,1500,1600,1700,1800,1900,2000,2100,2200,],
    },

    // Define start sequence
    start: function() {
        Log.log('Starting module: ' + this.name);
        const self = this;

        this.gpx_json=null;
        this.sendSocketNotification('GOOGLEMAP_GPX_CONFIG', this.config);

        this.waitForMapScript = setInterval(() => {if(self.isGoogleMapsScriptLoaded()) {clearInterval(self.waitForMapScript);} }, 200+Math.floor(Math.random() * 1000));	
    },
    

    socketNotificationReceived: function(notification, payload) {
        Log.log('MMM-GoogleMapGpx: socketNotificationReceived ' + notification);
        Log.log(payload);
        if (notification === 'GOOGLEMAP_GPX_JSON') {
            if((typeof payload.error) === "undefined") {
                this.gpx_json=payload;
                this.updateGpx();    
            }
        } else if (notification === 'GOOGLEMAP_GPX_REVERSEGEO') {
            if((typeof payload.status) !== "undefined" && payload.status=="OK") {
                this.reverseGeo=payload;
//                this.updateDom(this.config.animationSpeed);
                this.updateGeocode();
            }
        } else if (notification === 'GOOGLEMAP_PATH_UPDATE') {
            if((typeof payload) == "object" && 'data' in payload) {
                this.path=payload;
//                this.updateDom(this.config.animationSpeed);
                this.updatePath();
            }
        }
    },


    marker1: "modules/MMM-GoogleMapGpx/van2.png",
    marker2: "modules/MMM-GoogleMapGpx/x-mark-lite-32x32px.png",
    marker3: "modules/MMM-GoogleMapGpx/house-dark-32x32px.png",
    marker4: "modules/MMM-GoogleMapGpx/house-light-32x32px.png",
    marker5: "modules/MMM-GoogleMapGpx/house-red-32.png",
    marker6: "modules/MMM-GoogleMapGpx/yellow-dot-16x16.png",

    getDom: function() {
        console.log("GoogleMapGpx getDom");
        //console.log(this.config);
        const self=this; //used for callbacks, in anonymous functions, where this "refers" to the temporary object created for it, as opposed to the anonymous function created in this object own scope.


        var container = document.createElement("div");

        var holdover = this.holdover = document.createElement("div");
        holdover.style.display = "block";
        holdover.innerHTML = "Location not known yet...";
        container.appendChild(holdover);

        var div = this.div = document.createElement("div");
        div.style.display = "none";
        container.appendChild(div);

        var mapdiv = this.mapdiv = document.createElement("div");
        div.appendChild(mapdiv);
        // iframe.id="vanpower" + Math.floor(new Date().getTime());
        mapdiv.style = "width:"+this.config.width+"px;height:"+this.config.height+"px;" + this.config.style;
        mapdiv.width = this.config.width;
        mapdiv.height = this.config.height;
        mapdiv.id = "gpxmap";

        
        // GOOGLE JAVASCRIPT MAP
        // window.markers=[];
        window.googleMapsEvent=function() {
            console.log("map callback started");
            window.googleMapsScriptLoaded = true;
            console.log("map callback finished");
        };
            window.gpxcallbackFromGoogleBak=function() {
                console.log("map callback started");
                var map = new google.maps.Map(document.getElementById('gpxmap'), {
                    //zoom: 14,
                    zoom: 18,
                    //center: { lat: 49.248499, lng: -123.001375 },
                    center: { lat: self.gpx_json.lat, lng: self.gpx_json.lon },
                    mapTypeId: 'roadmap',
                    //https://developers.google.com/maps/documentation/javascript/examples/style-array#maps_style_array-html
                    disableDefaultUI: true,
                    styles: [
                          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                          {
                              featureType: "administrative.locality",
                              elementType: "labels.text.fill",
                              stylers: [{ color: "#d59563" }],
                          },
                          {
                              featureType: "poi",
                              elementType: "labels.text.fill",
                              stylers: [{ color: "#d59563" }],
                          },
                          {
                              featureType: "poi.park",
                              elementType: "geometry",
                              stylers: [{ color: "#263c3f" }],
                          },
                          {
                              featureType: "poi.park",
                              elementType: "labels.text.fill",
                              stylers: [{ color: "#6b9a76" }],
                          },
                          {
                              featureType: "road",
                              elementType: "geometry",
                              stylers: [{ color: "#38414e" }],
                         },
                         {
                              featureType: "road",
                              elementType: "geometry.stroke",
                              stylers: [{ color: "#212a37" }],
                         },
                         {
                              featureType: "road",
                              elementType: "labels.text.fill",
                              stylers: [{ color: "#9ca5b3" }],
                         },
                         {
                              featureType: "road.highway",
                              elementType: "geometry",
                              stylers: [{ color: "#746855" }],
                         },
                         {
                              featureType: "road.highway",
                              elementType: "geometry.stroke",
                              stylers: [{ color: "#1f2835" }],
                         },
                         {
                              featureType: "road.highway",
                              elementType: "labels.text.fill",
                              stylers: [{ color: "#f3d19c" }],
                         },
                         {
                              featureType: "transit",
                              elementType: "geometry",
                              stylers: [{ color: "#2f3948" }],
                         },
                         {
                              featureType: "transit.station",
                              elementType: "labels.text.fill",
                              stylers: [{ color: "#d59563" }],
                         },
                         {
                              featureType: "water",
                              elementType: "geometry",
                              stylers: [{ color: "#17263c" }],
                         },
                         {
                              featureType: "water",
                              elementType: "labels.text.fill",
                              stylers: [{ color: "#515c6d" }],
                         },
                         {
                              featureType: "water",
                              elementType: "labels.text.stroke",
                              stylers: [{ color: "#17263c" }],
                         },
                    ],
                });
                self.map=map;

                /*
                const image = "/modules/MMM-GoogleMapGpx/van2.png";
                const vanMarker = self.gpxmarker = new google.maps.Marker({
                    position: { lat: self.gpx_json.lat, lng: self.gpx_json.lon },
                    map,
                    icon: image,
                    icon: {
                        url: image,
                        anchor: new google.maps.Point(2, 21),
                    },
                });*/
                console.log(self.name + "sdfsdffd");
                console.log(self.config.marker);
                const configmarker = self.config.marker;
                const whereami = !configmarker ? null 
                                :(configmarker=="marker1") ? self.marker1 
                                :(configmarker=="marker2") ? self.marker2 
                                :(configmarker=="marker3") ? self.marker3 
                                :(configmarker=="marker4") ? self.marker4 
                                :(configmarker=="marker5") ? self.marker5 
                                :(configmarker=="marker6") ? self.marker6 
                                :configmarker;
                console.log(whereami);
                const vanMarker = self.gpxmarker = whereami ?new google.maps.Marker({
                    position: { lat: self.gpx_json.lat, lng: self.gpx_json.lon },
                    map,
                    //icon: image,
                    icon: {
                        url: whereami,
                        anchor: new google.maps.Point(2, 21),
                    },
                }) :new google.maps.Marker({
                    position: { lat: self.gpx_json.lat, lng: self.gpx_json.lon },
                    map,
                });
                console.log(self.gpxmarker);

                console.log("map callback finished");
            };

        let script = document.createElement("script");
        script.setAttribute("src", this.config.googleurl.replace("@replacemewithgoogleapikey/",this.config.apikey) );
        div.appendChild(script);
        //map.innerHTML = "<script async defer src='" + this.config.googleurl.replace("@replacemewithgoogleapikey/",this.config.apikey) + "'></script>";

        // TIME, CENTER COORDINATES
        var topdiv = document.createElement("div");
        topdiv.className="thin xsmall";
        topdiv.style.textAlign="left";
        topdiv.style.position="relative";
        topdiv.style.top=-this.config.height+"px";
        topdiv.style.left="0px";
        topdiv.style.backgroundColor="rgba(0,0,0, 0.5)";
        div.appendChild(topdiv);

        var timediv = document.createElement("div");
        timediv.style.fontSize="8pt";
        //timediv.innerHTML =( new Date(this.gpx_json.time)).toLocaleString();
        self.timediv=timediv;
        topdiv.appendChild(timediv);

        var neardiv = document.createElement("div");
        neardiv.className="thin xsmall dimmed";
        //neardiv.innerHTML = "(" + this.gpx_json.lat + "," + this.gpx_json.lon + ")";
        self.neardiv=neardiv;
        topdiv.appendChild(neardiv);           

        // REVERSE GEOCODE
        var infodiv = document.createElement("div");
        infodiv.style.textAlign="left";
        //infodiv.innerHTML = this.gpx_json.lat + "," + this.gpx_json.lon;
        infodiv.className="thin xsmall normal bright";
        //infodiv.appendChild(addr);
        self.infodiv=infodiv;
        topdiv.appendChild(infodiv);            

        // PATH SEGMENTS
        var segTbl = document.createElement("table");
        //busTbl.className="med";
        segTbl.className="small";
        segTbl.cellPadding=0;
        segTbl.style.textAlign="left";
        segTbl.style.position="relative";
        segTbl.style.top="-40px";
        segTbl.style.left="0px";
        segTbl.style.backgroundColor="rgba(0,0,0, 0.5)";
        self.segTbl=segTbl;
        div.appendChild(segTbl);

        self.poimarkers=[];

        // run any updates that have occurred, while map was loading
        //self.updateGpx();
        //self.updateGeocode();
        //self.updatePath();


        
        
        setInterval(()=>self.sendSocketNotification('GOOGLEMAP_GPX_UPDATE', this.config),60000);
        setInterval(()=>self.sendSocketNotification('GOOGLEMAP_LAST_PATH', this.config),10 * 60000);

        return container;
    },
    isGoogleMapsScriptLoaded: function() {
        console.log("isGoogleMapsScriptLoaded");
        console.log(this.gpx_json);
        console.log(window.googleMapsScriptLoaded);
        console.log(this.isCallbackInvoked);
        if(this.gpx_json)
            if(window.googleMapsScriptLoaded) {
                if(!this.map) {
                    if(!this.isCallbackInvoked) {
                        this.callbackFromGoogle();
                    }
                }
                return true;
            }
        return false;
    },
    callbackFromGoogle:function() {
        console.log("GoogleMapGpx map callback triggered");
        const self = this;
        this.holdover.style.display = "none";
        this.div.style.display = "block";

        //var map = new google.maps.Map(document.getElementById('gpxmap'), {
        var map = new google.maps.Map(this.mapdiv, {
            //zoom: 14,
            zoom: 18,
            //center: { lat: 49.248499, lng: -123.001375 },
            center: { lat: self.gpx_json.lat, lng: self.gpx_json.lon },
            mapTypeId: 'roadmap',
            //https://developers.google.com/maps/documentation/javascript/examples/style-array#maps_style_array-html
            disableDefaultUI: true,
            styles: [
                  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                  {
                      featureType: "administrative.locality",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#d59563" }],
                  },
                  {
                      featureType: "poi",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#d59563" }],
                  },
                  {
                      featureType: "poi.park",
                      elementType: "geometry",
                      stylers: [{ color: "#263c3f" }],
                  },
                  {
                      featureType: "poi.park",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#6b9a76" }],
                  },
                  {
                      featureType: "road",
                      elementType: "geometry",
                      stylers: [{ color: "#38414e" }],
                 },
                 {
                      featureType: "road",
                      elementType: "geometry.stroke",
                      stylers: [{ color: "#212a37" }],
                 },
                 {
                      featureType: "road",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#9ca5b3" }],
                 },
                 {
                      featureType: "road.highway",
                      elementType: "geometry",
                      stylers: [{ color: "#746855" }],
                 },
                 {
                      featureType: "road.highway",
                      elementType: "geometry.stroke",
                      stylers: [{ color: "#1f2835" }],
                 },
                 {
                      featureType: "road.highway",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#f3d19c" }],
                 },
                 {
                      featureType: "transit",
                      elementType: "geometry",
                      stylers: [{ color: "#2f3948" }],
                 },
                 {
                      featureType: "transit.station",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#d59563" }],
                 },
                 {
                      featureType: "water",
                      elementType: "geometry",
                      stylers: [{ color: "#17263c" }],
                 },
                 {
                      featureType: "water",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#515c6d" }],
                 },
                 {
                      featureType: "water",
                      elementType: "labels.text.stroke",
                      stylers: [{ color: "#17263c" }],
                 },
            ],
        });
        //window.oGoogleMap=map;
        this.map=map;

        /*
        const image = "/modules/MMM-GoogleMapGpx/van2.png";
        const vanMarker = self.gpxmarker = new google.maps.Marker({
            position: { lat: self.gpx_json.lat, lng: self.gpx_json.lon },
            map,
            icon: image,
            icon: {
                url: image,
                anchor: new google.maps.Point(2, 21),
            },
        });*/
        const configmarker = self.config.marker;
        const whereami = !configmarker ? null 
                        :(configmarker=="marker1") ? self.marker1 
                        :(configmarker=="marker2") ? self.marker2 
                        :(configmarker=="marker3") ? self.marker3 
                        :(configmarker=="marker4") ? self.marker4 
                        :(configmarker=="marker5") ? self.marker5 
                        :(configmarker=="marker6") ? self.marker6 
                        :configmarker;
        const vanMarker = self.gpxmarker = whereami ?new google.maps.Marker({
            position: { lat: self.gpx_json.lat, lng: self.gpx_json.lon },
            map,
            //icon: image,
            icon: {
                url: whereami,
                anchor: new google.maps.Point(2, 21),
            },
        }) :new google.maps.Marker({
            position: { lat: self.gpx_json.lat, lng: self.gpx_json.lon },
            map,
        });
        //console.log(self.gpxmarker);
        
        this.isCallbackInvoked = true;
        this.sendSocketNotification('GOOGLEMAP_GPX_CONFIG', this.config);
        console.log("map callback finished");
    },


    updateGpx:function() {
        var self=this;
        if(this.timediv==null  || this.neardiv==null){
            console.error("ui not ready for gpx info.  This shouldnt never happen.  It can run before map callback but that is handled");
            return;
        }    
        if(!this.map) {
            console.info("updateGpx(), google map callback not invoked yet");
            return;
        }
        
        const then = new Date(Date.parse(this.gpx_json.time));
        this.timediv.innerHTML ="At " + then.toLocaleString() + ", (" + this.gpx_json.lat + "," + this.gpx_json.lon + ")";
        //this.neardiv.innerHTML ="(" + this.gpx_json.lat + "," + this.gpx_json.lon + ")";
        if(this.map!=null) {
            this.gpxmarker.setPosition( new google.maps.LatLng( self.gpx_json.lat, self.gpx_json.lon ) );
            var myLocation = { lat: self.gpx_json.lat, lng: self.gpx_json.lon };
            this.map.panTo(myLocation);    
        }
    },

    updateGeocode:function() {
        var self=this;
        if(this.infodiv==null || this.reverseGeo==null) {
            console.info("ui race condition, geocode not defined yet");
            return;
        }
        if(!this.map) {
            console.info("updateGeocode(), google map callback not invoked yet");
            return;
        }

        if(self.geomarker!=null)
            self.geomarker.setMap(null);
        var acceptable = ["street_address", "establishment", "general_contractor", "point_of_interest"];
        this.reverseGeo.results.slice(0,2).forEach(function(current, i, arr) {
            const intersection = current.types.filter(x => acceptable.includes(x));
            if(intersection.length!=0) {
                //cannot use this, inside forEach()
                self.neardiv.innerHTML = "";
                self.infodiv.innerHTML = "Probably: " + current.formatted_address;
                var lat = current.geometry.location.lat;
                var lon = current.geometry.location.lng;    
                var map = self.map;
                if(map!=null)
                    if(self.geomarker!=null) {
                        self.geomarker.setPosition( new google.maps.LatLng( lat, lon ) );
                        self.geomarker.setMap(map);
                    } else {
                        var addrMarker = self.geomarker = new google.maps.Marker({
                            position: { lat: lat, lng: lon },
                            map,
                            //icon: image,
                            icon: {
                                url: "/modules/MMM-GoogleMapGpx/house-light-32x32px.png",
                                anchor: new google.maps.Point(15, 15),
                            },
                        });
                    }
                //window.markers.push( [null,current.geometry.location.lat,current.geometry.location.lng,null,"/modules/MMM-GoogleMapGpx/house-light-32x32px.png"] );
            }
        });
    },

    updatePath:function() {
        //console.info("updatePath()");
        var self=this;
        const map = this.map;
        if(this.infodiv==null || this.path==null) {
            console.info("ui race condition, geocode not defined yet");
            return;
        }
        if(!this.map) {
            console.info("updatePath(), google map callback not invoked yet");
            return;
        }
        //console.log(this.pathdisplayed);
        const series = this.path.data.map(s=>Date.parse(s.time));
        //console.info(series);
        const min = Math.min(...series);
        const max = Math.max(...series);
        const pathdisplayed = this.pathdisplayed;
        //console.info(min);
        //console.info(max);
        //console.info(pathdisplayed);
        if(pathdisplayed && pathdisplayed.min==min && pathdisplayed.max==max) {
            console.info("no path change");
            //return;
        } else {
            this.pathdisplayed = { count:this.path.data.length, min:min, max:max};
            //console.info(this.pathdisplayed);
    
            if(this.googlepath!=null)
                this.googlepath.setMap(null);
            
            // initialize an array of LatLng objects. These are your markers in your city
            var path = this.path.data.map((s)=> new google.maps.LatLng(s.lat, s.lon));
            //console.log(path);
    
            // initialize a Polyline object. You can set the color, width, opacity, etc. 
            var googlepath = new google.maps.Polyline({
                path: path,
                geodesic: false,
                strokeColor: '#FFFFFF',
                strokeOpacity: 0.5,
                strokeWeight: 8
            });
    
            // set the polyline's map with your map object from above.
            googlepath.setMap(this.map);
            this.googlepath = googlepath;
            //console.log(this.map);
            //console.log(googlepath);    
        }
        
        if(this.path && this.path.bounds) {
            this.fitOnScreen();
        }
        
        if(this.path && this.path.segment) {
            if(this.segment){
                this.segment.map(s=>!s.geocode ? null : !s.geocode.marker ? null : s.geocode.marker.setMap(null));
            }
            // {  start:start, end:i, 
            //    time1:new Date(time1[start]), 
            //    time2:new Date(time1[i]), 
            //    avgspeed:speed/sec, distance:speed, topspeed:top,
            //  }
            this.segTbl.innerHTML="";
            const segment = this.segment = this.path.segment;
            const len = segment.length;
            for(var i=0; i<len; i++) {
                const item = segment[i];
                const end = this.path.data[item.end];
                var stoptr = document.createElement("tr");
                stoptr.className="normal event small";
                stoptr.style.textAlign="left";
                stoptr.style.verticalAlign="bottom";
                stoptr.innerHTML ="<td style='text-align:center;vertical-align:middle;background-color:white;color:black;padding:5px' rowspan=2>"+(i+1)+"</td><td class='light xsmall'>" 
                                    +(new Date(item.time1)).toLocaleString().replace(",","")
                                    + " to " +(new Date(item.time2)).toLocaleString().replace(",","")
                                    +", "+item.distance+ ", (max)" + item.topspeed 
                                    + "</td>";
                this.segTbl.appendChild(stoptr);

                var stoptr2 = document.createElement("tr");
                stoptr2.className="normal event small";
                stoptr2.style.textAlign="left";
                stoptr2.style.verticalAlign="bottom";
                stoptr2.innerHTML = "<td class='bright'>"+end.lat+","+end.lon+"</td>";
                this.segTbl.appendChild(stoptr2);

                if(item.geocode) {
                    var lat=item.geocode.lat;
                    var lon=item.geocode.lon;
                    var addr=item.geocode.addr;
                    stoptr2.innerHTML = "<td class='bright' >"+addr+"</td>";
                    item.geocode.marker = new google.maps.Marker({
                        position: { lat: lat, lng: lon },
                        map,
                        label: (i+1).toString(),
                        //icon: image,
                        /*icon: {
                            url: "/modules/MMM-GoogleBusSchedule/bus-light-32x32px.png",
                            anchor: new google.maps.Point(15, 15),
                        },*/
                        //icon: current.stopICO,
                    });
                    //if(index==-1) {
                    //    self.poimarkers.push(current);
                    //    const poiMarker = new google.maps.Marker({
                    //        position: { lat: lat, lng: lon },
                    //        map,
                            //icon: image,
                            /*icon: {
                                url: "/modules/MMM-GoogleBusSchedule/bus-light-32x32px.png",
                                anchor: new google.maps.Point(15, 15),
                            },*/
                            //icon: current.stopICO,
                    //    });
                    //    current.marker=poiMarker;
                    //} else
                    //    self.poimarkers[index],departureTime=current.departureTime;
                }
            }
        }
        
    }, 


    fitOnScreen:function(){
        console.log(this.name +" fit");
        var map = this.map;
        var bounds = new google.maps.LatLngBounds();
        if(this.gpx){
            bounds.extend({ lat: this.gpx.lat, lng: this.gpx.lon });
        }
        if(this.path.bounds){
            //const path=this.path.data;
            //const max1=Math.max(...path.map(s=>s.lat));
            //const min1=Math.min(...path.map(s=>s.lat));
            //const max2=Math.max(...path.map(s=>s.lon));
            //const min2=Math.min(...path.map(s=>s.lon));
            //const max1=path.latMax;
            //const min1=path.latMin;
            //const max2=path.lonMax;
            //const min2=path.lonMin;
            //console.log(min1);
            //console.log(min2);
            //console.log(max1);
            //console.log(max2);
            //bounds.extend({ lat: min1, lng: min2 });
            //bounds.extend({ lat: min1, lng: max2 });
            //bounds.extend({ lat: max1, lng: min2 });
            //bounds.extend({ lat: max1, lng: max2 });
            const b = this.path.bounds;
            bounds.extend(b[0]);
            bounds.extend(b[1]);
            bounds.extend(b[2]);
            bounds.extend(b[3]);
            //if(this.directionsRenderer==null) //don't bother resizing, if sized for directions
            map.fitBounds(bounds);
        }
    },

    
});

