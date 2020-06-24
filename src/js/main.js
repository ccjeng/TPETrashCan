// Initialize Firebase

var config = {
    apiKey: "AIzaSyAKzyUWsDXRQzIJesKLpl9Ox1d757pbLRc",
    authDomain: "tptrashcan.firebaseapp.com",
    databaseURL: "https://tptrashcan.firebaseio.com",
    storageBucket: "tptrashcan.appspot.com",
  };
firebase.initializeApp(config);

var database = firebase.database();

var trashIcon = L.icon({
      iconUrl: 'img/trash.png'
});

navigator.geolocation.getCurrentPosition(function(location) {
      var latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);

      var map = L.map('map').setView(latlng, 16);


      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);


      firebase.database().ref('results/').on('value', function(snapshot) {
            result = snapshot.val();
      
            for(var i=0; i<result.length;i++) {
            addMarker(result[i]);
            }
      });  

      var addMarker = function(data){
            var marker = L.marker([data.latitude, data.longitude]).addTo(map);
            marker.bindPopup('<h4>' + data.address+ '</h4>');
      }

});
