// Initialize Firebase
var config = {
   apiKey: "AIzaSyAI6XI-Dx00sr0B3OkzFkWegVqp_HEUPVg",
   authDomain: "feeling-bombay.firebaseapp.com",
   databaseURL: "https://feeling-bombay.firebaseio.com",
   projectId: "feeling-bombay",
   storageBucket: "feeling-bombay.appspot.com",
   messagingSenderId: "249442066662"
};

firebase.initializeApp(config);

var overlay;
var map_g;
USGSOverlay.prototype = new google.maps.OverlayView();

var data = {
   sender: null,
   feeling: null,
   color: null,
   timestamp: null,
   lat: null,
   lng: null
};

var mum_cord = {lat: 19.074, lng: 72.877};
var mig_cord = [
   {lat: 6.465, lng: 3.406},
   {lat: 33.73, lng: 73.084},
   {lat: 23.777, lng: 90.399},
   {lat: 6.927, lng: 79.861},
   {lat: 14.599, lng: 120.984},
   {lat: 35.652, lng: 139.839},
   {lat: 26.826, lng: 30.802},
   {lat: 0.789, lng: 113.921},
   {lat: 61.524, lng: 105.318},
   {lat: 51.165, lng: 10.451}]

function makeInfoBox(controlDiv, map, text) {
   // Set CSS for the control border.
   var controlUI = document.createElement('div');
   controlUI.style.boxShadow = 'rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px';
   controlUI.style.backgroundColor = '#fff';
   controlUI.style.border = '2px solid #fff';
   controlUI.style.borderRadius = '2px';
   controlUI.style.marginBottom = '22px';
   controlUI.style.marginTop = '10px';
   controlUI.style.textAlign = 'center';
   controlDiv.appendChild(controlUI);

   // Set CSS for the control interior.
   var controlText = document.createElement('div');
   controlText.style.color = 'rgb(25,25,25)';
   controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
   controlText.style.fontSize = '100%';
   controlText.style.padding = '6px';
   controlText.textContent = text;
   controlUI.appendChild(controlText);
}

function initAuthentication(onAuthSuccess, data) {
   firebase.auth().signInAnonymously().catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
   });

   firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         // User is signed in.
         data.sender = user.uid;
         onAuthSuccess();
      }
   });
}

function emoButton(emotion, col) {
   data.feeling = emotion;
   data.color = col;
}


function initMapFeelings() {
   var uluru = {lat: 19.074, lng: 72.877};
   var map_f = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: uluru,
      styles: [
         {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }]  // Turn off points of interest.
         }, 
         {
            featureType: 'transit.station',
            stylers: [{ visibility: 'off' }]  // Turn off bus stations, train stations, etc.
         }
      ],
      disableDoubleClickZoom: true,
      streetViewControl: false
   });


   var infoBoxDiv = document.createElement('div');
   makeInfoBox(infoBoxDiv, map_f, 'Pick an emotion or feeling and pin it to a point on the map.');
   map_f.controls[google.maps.ControlPosition.TOP_CENTER].push(infoBoxDiv);
   // Listen for clicks and add the location of the click to firebase.
   map_f.addListener('click', function(e) {
      data.lat = e.latLng.lat();
      data.lng = e.latLng.lng();
      //addToFirebase(data);
      lu = {lat: data.lat, lng: data.lng};
      var temp =  'http://labs.google.com/ridefinder/images/' + data.color
      var marker = new google.maps.Marker({
         position: lu,
         map: map_f,
         icon: temp
      });
      addToFirebase(data);
  });

  initAuthentication(initFirebase.bind(undefined, map_f), data);
}

/** @constructor */

function USGSOverlay(bounds, image, map) {
   // Now initialize all properties.
   this.bounds_ = bounds;
   this.image_ = image;
   this.map_ = map;

   // Define a property to hold the image's div. We'll
   // actually create this div upon receipt of the onAdd()
   // method so we'll leave it null for now.
   this.div_ = null;

   // Explicitly call setMap on this overlay
   this.setMap(map);

};

USGSOverlay.prototype.onAdd = function() {
   var div = document.createElement('div');
   div.style.border = 'none';
   div.style.borderWidth = '0px';
   div.style.position = 'absolute';

   // Create the img element and attach it to the div.
   var img = document.createElement('img');
   img.src = this.image_;
   img.style.width = '100%';
   img.style.height = '100%';
   div.appendChild(img);

   this.div_ = div;

   // Add the element to the "overlayImage" pane.
   var panes = this.getPanes();
   panes.mapPane.appendChild(this.div_);

};

USGSOverlay.prototype.draw = function() {
   // We use the south-west and north-east
   // coordinates of the overlay to peg it to the correct position and size.
   // To do this, we need to retrieve the projection from the overlay.
   var overlayProjection = this.getProjection();

   // Retrieve the south-west and north-east coordinates of this overlay
   // in LatLngs and convert them to pixel coordinates.
   // We'll use these coordinates to resize the div.
   var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
   var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

   // Resize the image's div to fit the indicated dimensions.
   var div = this.div_;
   div.style.opacity = "0.8"
   div.style.left = sw.x + 'px';
   div.style.top = ne.y + 'px';
   div.style.width = (ne.x - sw.x) + 'px';
   div.style.height = (sw.y - ne.y) + 'px';
};

USGSOverlay.prototype.onRemove = function() {
   this.div_.parentNode.removeChild(this.div_);
};


// Set the visibility to 'hidden' or 'visible'.
USGSOverlay.prototype.hide = function() {
   if (this.div_) {
   // The visibility property must be a string enclosed in quotes.
      this.div_.style.visibility = 'hidden';
   }
};

USGSOverlay.prototype.show = function() {
   if (this.div_) {
      this.div_.style.visibility = 'visible';
   }
};


USGSOverlay.prototype.toggle = function() {
   if (this.div_) {
      if (this.div_.style.visibility === 'hidden') {
         this.show();
      } else {
         this.hide();
      }
   }
};

// Detach the map from the DOM via toggleDOM().
// Note that if we later reattach the map, it will be visible again,
// because the containing <div> is recreated in the overlay's onAdd() method.
USGSOverlay.prototype.toggleDOM = function() {
   if (this.getMap()) {
      // Note: setMap(null) calls OverlayView.onRemove()
      this.setMap(null);
   } else {
      this.setMap(this.map_);
   }
};

function initMapMigration() {
   var uluru = {lat: 19.074, lng: 72.877};
   var map_m = new google.maps.Map(document.getElementById('map'), {
      zoom: 3,
      center: uluru,
      styles: [
         {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }]  // Turn off points of interest.
         }, 
         {
            featureType: 'transit.station',
            stylers: [{ visibility: 'off' }]  // Turn off bus stations, train stations, etc.
         }
      ],
      disableDoubleClickZoom: true,
   streetViewControl: false
   });

   var infoBoxDiv = document.createElement('div');
   makeInfoBox(infoBoxDiv, map_m, 'Did you migrate to Mumbai? Put a pin on the place where you were born and another one on a place in Mumbai where live now. Connect them.');
   map_m.controls[google.maps.ControlPosition.TOP_CENTER].push(infoBoxDiv);

   var marker = new google.maps.Marker({
      position: mum_cord,
      map: map_m,
   });

   for (var m in mig_cord) {
          // Add the circle for this city to the map.
       var cityCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map_m,
            center: mig_cord[m],
            radius: 500
       });

      var path = new google.maps.Polyline({
          path: [mum_cord, mig_cord[m]],
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 3
        });

        path.setMap(map_m);
   }

   map_m.addListener('click', function(e) {
      data.lat = e.latLng.lat();
      data.lng = e.latLng.lng();
      //addToFirebase(data);
      lu = {lat: data.lat, lng: data.lng};

       var cityCircle = new google.maps.Circle({
            strokeColor: '#008000',
            strokeOpacity: 0.8,
            fillColor: '#008000',
            fillOpacity: 0.35,
            map: map_m,
            center: lu,
            radius: 100
       });

      var path = new google.maps.Polyline({
          path: [mum_cord, lu],
          geodesic: true,
          strokeColor: '#008000',
          strokeOpacity: 1.0,
          strokeWeight: 0.5
      });

      path.setMap(map_m);
   });

   return map_m;

}

function overlay_1800() {
   if(overlay != null) {
      overlay.setMap(null);
   }
   var srcImage_1800 = 'Bom1860_1890.png';

   var bounds_1800 = new google.maps.LatLngBounds(
            new google.maps.LatLng(18.90, 72.775),
            new google.maps.LatLng(19.045, 72.905));

   overlay = new USGSOverlay(bounds_1800, srcImage_1800, map);
};

function overlay_1900() {
   if(overlay != null) {
      overlay.setMap(null);
   }
   var srcImage_1900 = 'Bom1903_1919.png';

   var bounds_1900 = new google.maps.LatLngBounds(
            new google.maps.LatLng(18.88, 72.765),
            new google.maps.LatLng(19.068, 72.899));

   overlay = new USGSOverlay(bounds_1900, srcImage_1900, map);
};

function overlay_2100(map) {
   if (overlay != null) {
      overlay.setMap(null);
   }
};

function initMapGeography() {
   var uluru = {lat: 19.0, lng: 72.877};

   map_g = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: uluru,
      styles: [
         {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }]  // Turn off points of interest.
         }, 
         {
            featureType: 'transit.station',
            stylers: [{ visibility: 'off' }]  // Turn off bus stations, train stations, etc.
         }
      ],
      disableDoubleClickZoom: true,
      streetViewControl: false
   });



   var infoBoxDiv = document.createElement('div');
   makeInfoBox(infoBoxDiv, map_g, 'A Mumbaikar through and through? Watch how the neighbourhood you were born in has evolved over the last 100 years. What do you think it would look like in the next 100 years?');
   map_g.controls[google.maps.ControlPosition.TOP_CENTER].push(infoBoxDiv);

   return map_g;

}

function initFirebase(map) {
 // Reference to the clicks in Firebase.
 //var clicks = firebase.child('clicks');
 var clicks = firebase.database().ref().child('clicks');

// 10 minutes before current time.
var startTime = new Date().getTime() - (60 * 10 * 1000);

clicks.on('value', function(snapshot) {
    snap = snapshot.val();
    for (s in snap) {
       var newPosition = snap[s];
       var lu = {lat: newPosition.lat, lng: newPosition.lng};
       var temp_hs =  'http://labs.google.com/ridefinder/images/' + newPosition.color
       var marker = new google.maps.Marker({
          position: lu,
          map: map,
          icon: temp_hs
       });
    }
  }
);
}

/**
    * Updates the last_message/ path with the current timestamp.
    * @param {function(Date)} addClick After the last message timestamp has been updated,
    *     this function is called with the current timestamp to add the
    *     click to the firebase.
    */
function getTimestamp(addClick) {
// Reference to location for saving the last click time.
var ref = firebase.database().ref().child('last_message/' + data.sender);

ref.onDisconnect().remove();  // Delete reference from firebase on disconnect.

// Set value to timestamp.
ref.set(firebase.database.ServerValue.TIMESTAMP, function(err) {
  if (err) {  // Write to last message was unsuccessful.
    console.log(err);
  } else {  // Write to last message was successful.
    ref.once('value', function(snap) {
      addClick(snap.val());  // Add click with same timestamp.
    }, function(err) {
      console.warn(err);
    });
  }
});
}


/**
    * Adds a click to firebase.
    * @param {Object} data The data to be added to firebase.
    *     It contains the lat, lng, sender and timestamp.
    */
function addToFirebase(data) {
getTimestamp(function(timestamp) {
// Add the new timestamp to the record data.
data.timestamp = timestamp;
var ref = firebase.database().ref().child('clicks').push(data, function(err) {
  if (err) {  // Data was not written to firebase.
    console.warn(err);
  }
   });
 });
}

function feelings_activate() {
   document.getElementById('feelings').style.visibility = "visible";
   document.getElementById('geog').style.visibility = "hidden";
   document.getElementById('floating-panel').style.visibility = "hidden";
   initMapFeelings();
}

function geography_activate() {
   document.getElementById('geog').style.visibility = "visible";
   document.getElementById('feelings').style.visibility = "hidden";
   document.getElementById('floating-panel').style.visibility = "visible";
   map = initMapGeography();

   document.getElementById('button_1800').onclick = overlay_1800;
   document.getElementById('button_1900').onclick = overlay_1900;
   document.getElementById('button_2100').onclick = overlay_2100;
}

function migration_activate() {
   document.getElementById('geog').style.visibility = "hidden";
   document.getElementById('feelings').style.visibility = "hidden";
   document.getElementById('floating-panel').style.visibility = "hidden";
   initMapMigration();
}
