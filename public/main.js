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

var data = {
   sender: null,
   feeling: null,
   color: null,
   timestamp: null,
   lat: null,
   lng: null
};

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
   var map = new google.maps.Map(document.getElementById('map'), {
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
   makeInfoBox(infoBoxDiv, map, 'Pick an emotion or feeling and pin it to a point on the map.');
   map.controls[google.maps.ControlPosition.TOP_CENTER].push(infoBoxDiv);
   // Listen for clicks and add the location of the click to firebase.
   map.addListener('click', function(e) {
      data.lat = e.latLng.lat();
      data.lng = e.latLng.lng();
      //addToFirebase(data);
      lu = {lat: data.lat, lng: data.lng};
      var temp =  'http://labs.google.com/ridefinder/images/' + data.color
      var marker = new google.maps.Marker({
         position: lu,
         map: map,
         icon: temp
      });
      addToFirebase(data);
  });

  initAuthentication(initFirebase.bind(undefined, map), data);
}

function initMapMigration() {
   var uluru = {lat: 19.074, lng: 72.877};
   var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4,
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
   makeInfoBox(infoBoxDiv, map, 'Put a pin on the place where you were born and another one on a place in Mumbai where live now. Connect them.');
   map.controls[google.maps.ControlPosition.TOP_CENTER].push(infoBoxDiv);

}

function initMapGeography() {
   var uluru = {lat: 19.074, lng: 72.877};
   var map = new google.maps.Map(document.getElementById('map'), {
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
   makeInfoBox(infoBoxDiv, map, 'A Mumbaikar through and through? Watch how the neighbourhood you were born in has evolved over the last 100 years. What do you think it would look like in the next 100 years?');
   map.controls[google.maps.ControlPosition.TOP_CENTER].push(infoBoxDiv);

}

function initFirebase(map) {
    // Reference to the clicks in Firebase.
    //var clicks = firebase.child('clicks');
    var clicks = firebase.database().ref().child('clicks');
    console.log(clicks);

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
   console.log(data);
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
   initMapFeelings();
}

function geography_activate() {
   document.getElementById('geog').style.visibility = "visible";
   document.getElementById('feelings').style.visibility = "hidden";
   initMapGeography();
}

function migration_activate() {
   document.getElementById('geog').style.visibility = "hidden";
   document.getElementById('feelings').style.visibility = "hidden";
   initMapMigration();
}
