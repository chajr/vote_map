function initialize() {
    var mainPoint       =  new google.maps.LatLng(50.570452366163686, 19.306543171405792);
    var otherPoint      =  new google.maps.LatLng(50.590667, 19.353914);
    var contentString   = 'some content to display';
    var mapOptions      = {
        center: mainPoint,
        zoom: 12
    };
    var map = new google.maps.Map(
        document.getElementById("map-canvas"),
        mapOptions
    );

    var marker = new google.maps.Marker({
        position: mainPoint,
        map: map,
        title:"Main point"
        //,icon: 'url'
    });
    var marker2 = new google.maps.Marker({
        position: otherPoint,
        map: map,
        title:"Other point"
        //,icon: 'url'
    });

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
    });

    var area = [
        new google.maps.LatLng(50.577915, 19.294691),
        new google.maps.LatLng(50.583256, 19.322157),
        new google.maps.LatLng(50.577043, 19.341211),
        new google.maps.LatLng(50.563741, 19.353056),
        new google.maps.LatLng(50.552618, 19.318380),
        new google.maps.LatLng(50.558180, 19.298467)
        
        
    ];
    var testArea = new google.maps.Polygon({
        paths: area,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#FF0000',
        fillOpacity: 0.35
    });
    testArea.setMap(map);
}
google.maps.event.addDomListener(window, 'load', initialize);