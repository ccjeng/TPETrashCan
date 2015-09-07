
//initialize
//Parse.$ = jQuery;
Parse.initialize('5fzYdG6YMpMPKBNSqvzhEL1OVoXgcVvlCAghW09Q', 'NK9ycOzWNik9d6axOAndjYXwRuycfX2qTIyidyxV');

//Get user location HTML5 >> if no location, set default location


var map;
function initMap() {

  var mapOptions = {
     center: {lat: 25.0339031, lng: 121.5645098},
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

                mc = new MarkerClusterer(map, markers, {gridSize: 80, maxZoom: 16});

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
var addMarker = function(data){
  var marker = new google.maps.Marker({
        position : new google.maps.LatLng(data.get('location').latitude, data.get('location').longitude), 
        map : map,
        title : data.get('road') + data.get('address')
  });

  marker.infowindow = new google.maps.InfoWindow({
      content: '<h3>' + data.get('road') + data.get('address') + '</h3>'
          + '<p><img src="https://maps.googleapis.com/maps/api/streetview?size=200x180&location='
          + data.get('location').latitude +','+data.get('location').longitude+'&fov=90&heading=180&pitch=10"></p>'
          
  });

  markers.push(marker);

  google.maps.event.addListener(marker, 'click', function(e){
      map.panTo( this.position );
      //map.setZoom(17);
      //for (var i = 0; i < markers.length; i++) { if(markers[i].infowindow.isOpen()){ markers[i].infowindow.close(); } }
      this.infowindow.open(map, marker);
  });
};


