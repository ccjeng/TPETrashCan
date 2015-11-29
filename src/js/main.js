
//initialize
//Parse.$ = jQuery;
Parse.initialize('5fzYdG6YMpMPKBNSqvzhEL1OVoXgcVvlCAghW09Q', 'NK9ycOzWNik9d6axOAndjYXwRuycfX2qTIyidyxV');

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
var processCallback = function(res) {
                result = result.concat(res);
                if (res.length == 1000) {
                  process(res[res.length-1].id);
                  return;
                }   
                //console.log(result.length);

                //To print all results
                for(var i=0;i<result.length;i++){
                        //console.log(result[i].id);
                        addMarker(result[i]);
                }

           mc = new MarkerClusterer(map, markers, {gridSize: 80, maxZoom: 14});

}

var process = function(skip) {
    var query = new Parse.Query("TPE112515");

            if (skip) {
              query.greaterThan("objectId", skip);
            }
            query.limit(1000);
            query.ascending("objectId");
            query.find().then(function querySuccess(res) {
                processCallback(res);
            }, function queryFailed(error) {
                console.log('Error: ' + error.code + ' ' + error.message);
            });
}
process(false);


var markers = [];
var image = 'img/pin.png';

google.maps.InfoWindow.prototype.isOpen = function(){
  var map = this.getMap();
  return (map !== null && typeof map !== "undefined");
}

var addMarker = function(data){

  var marker = new google.maps.Marker({
        position : new google.maps.LatLng(data.get('location').latitude, data.get('location').longitude), 
        map : map,
        title : data.get('road') + data.get('address'),
        icon : image
  });

  marker.infowindow = new google.maps.InfoWindow({
      content: '<h4>'+ data.get('region') + '</h4>'
          + '<p><img src="https://maps.googleapis.com/maps/api/streetview?size=400x180&location='
          + data.get('location').latitude +','+data.get('location').longitude+'&fov=90&heading=180&pitch=10"></p>'
          + '<h4>' + data.get('road') + data.get('address') + '</h4>'
          
  });

  markers.push(marker);


  google.maps.event.addListener(marker, 'click', function(e){
      map.panTo( this.position );
      //map.setZoom(17);
      for (var i = 0; i < markers.length; i++) { if(markers[i].infowindow.isOpen()){ markers[i].infowindow.close(); } }
      this.infowindow.open(map, marker);

  });
};


