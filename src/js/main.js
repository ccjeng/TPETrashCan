
//initialize
//Parse.$ = jQuery;
Parse.initialize('5fzYdG6YMpMPKBNSqvzhEL1OVoXgcVvlCAghW09Q', 'NK9ycOzWNik9d6axOAndjYXwRuycfX2qTIyidyxV');

//Get user location HTML5 >> if no location, set default location


var defaultLocationLatitude = 25.0339031;
var defaultLocationLongitude = 121.5645098;

var currentLocationLatitude = defaultLocationLatitude;
var currentLocationLongitude = defaultLocationLongitude;
 
function getLocation() {
  if (navigator.geolocation) {
          var geo=navigator.geolocation;
          var option={
                enableAcuracy:false,
                maximumAge:0,
                timeout:600000
                };
          geo.getCurrentPosition(successCallback,
                                 errorCallback,
                                 option
                                 );
          }
  else {
        alert('此瀏覽器不支援地理定位功能!');
  }

  function successCallback(position) {
        currentLocationLatitude = position.coords.latitude;
        currentLocationLongitude = position.coords.longitude;    

        console.log('successCallback = ' + currentLocationLatitude + ',' + currentLocationLongitude);

        map.panTo( new google.maps.LatLng(currentLocationLatitude, currentLocationLongitude) );

  }
  function errorCallback(error) {
        var errorTypes={
              0:"不明原因錯誤",
              1:"使用者拒絕提供位置資訊",
              2:"無法取得位置資訊",
              3:"位置查詢逾時"
              };
        console.log(errorTypes[error.code]);
        console.log("code=" + error.code + " " + error.message); //開發測試時用
  }
}


var map;
function initMap() {
  getLocation();

  console.log(currentLocationLatitude + ',' + currentLocationLongitude);

  var mapOptions = {
     center: {lat: currentLocationLatitude, lng: currentLocationLongitude},
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById("map"), mapOptions);

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
    var query = new Parse.Query("TPE201509");

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

//

/*
google.maps.InfoWindow.prototype.isOpen = function(){
  var map = this.getMap();
  return (map !== null && typeof map !== "undefined");
}*/


var markers = [];
var image = 'img/pin.png';

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
      //for (var i = 0; i < markers.length; i++) { if(markers[i].infowindow.isOpen()){ markers[i].infowindow.close(); } }
      this.infowindow.open(map, marker);
  });
};


