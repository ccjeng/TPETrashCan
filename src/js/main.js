
//initialize
var myFirebaseRef = new Firebase("https://tptrashcan.firebaseio.com/results");

//Get user location
var defaultLocationLatitude = 25.0339031;
var defaultLocationLongitude = 121.5645098;

var currentLocationLatitude = defaultLocationLatitude;
var currentLocationLongitude = defaultLocationLongitude;

function getLocation() {
  if (navigator.geolocation) {
        var option={
            enableAcuracy:false,
            maximumAge:0,
            timeout:600000
        };
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, option);
  }
  else {
        alert('此瀏覽器不支援地理定位功能!');
  }

  function successCallback(position) {
        currentLocationLatitude = position.coords.latitude;
        currentLocationLongitude = position.coords.longitude;    

        currentMarker();


  }
  function errorCallback(error) {
        var errorTypes={
              0:"不明原因錯誤",
              1:"使用者拒絕提供位置資訊",
              2:"無法取得位置資訊",
              3:"位置查詢逾時"
              };
        alert(errorTypes[error.code]);
        console.log("code=" + error.code + " " + error.message); //開發測試時用
  }
}


var map;
function initMap() {

  var mapOptions = {
      center: {lat: currentLocationLatitude, lng: currentLocationLongitude},
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById("map"), mapOptions);

  getLocation();

}

function currentMarker(){

  var GeoMarker = new GeolocationMarker(map);

  GeoMarker.setCircleOptions({fillColor: '#808080'});

  google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function() {
     map.setCenter(this.getPosition());
     //map.fitBounds(this.getBounds());
  });

  google.maps.event.addListener(GeoMarker, 'geolocation_error', function(e) {
     alert('無法取得位置資訊. ' + e.message);
  });

  GeoMarker.setMap(map);

}

var mc;
var result = [];

function getTrashCanData() {

	myFirebaseRef.on("value", function(snapshot) {

	  	result = snapshot.val();

		for(var i=0; i<result.length;i++) {
			addMarker(result[i]);
		} 
	}, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	});
}

getTrashCanData();

var markers = [];
var image = 'img/pin.png';

google.maps.InfoWindow.prototype.isOpen = function(){
  var map = this.getMap();
  return (map !== null && typeof map !== "undefined");
}

var addMarker = function(data){

  var marker = new google.maps.Marker({
        position : new google.maps.LatLng(data.latitude, data.longitude), 
        map : map,
        title : data.address,
        icon : image
  });

  marker.infowindow = new google.maps.InfoWindow({
      content: '<h4>'+ data.region + '</h4>'
          + '<p><img src="https://maps.googleapis.com/maps/api/streetview?size=400x180&location='
          + data.latitude +','+data.longitude +'&fov=90&heading=180&pitch=10"></p>'
          + '<h4>' + data.address+ '</h4>'
          
  });

  markers.push(marker);


  google.maps.event.addListener(marker, 'click', function(e){
      map.panTo( this.position );
      //map.setZoom(17);
      for (var i = 0; i < markers.length; i++) { if(markers[i].infowindow.isOpen()){ markers[i].infowindow.close(); } }
      this.infowindow.open(map, marker);

  });
};


