var mainPoint;
var contentString1 = 'some content to display';
var mapOptions;
var map;
var marker1;
var infoWindow1;
var testArea;
var geocoder;
var area = [
    new google.maps.LatLng(50.577915, 19.294691),
    new google.maps.LatLng(50.583256, 19.322157),
    new google.maps.LatLng(50.577043, 19.341211),
    new google.maps.LatLng(50.563741, 19.353056),
    new google.maps.LatLng(50.552618, 19.318380),
    new google.maps.LatLng(50.558180, 19.298467)
];
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();


function initialize() {
    directionsDisplay   = new google.maps.DirectionsRenderer();
    mainPoint           = new google.maps.LatLng(50.570452366163686, 19.306543171405792);
    geocoder            = new google.maps.Geocoder();
    mapOptions          = {
        center: mainPoint,
        zoom: 12
    };
    map = new google.maps.Map(
        document.getElementById("map-canvas"),
        mapOptions
    );

    marker1 = new google.maps.Marker({
        position: mainPoint,
        map: map,
        title:"Main point",
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });

    infoWindow1 = new google.maps.InfoWindow({
        content: contentString1
    });
    google.maps.event.addListener(marker1, 'click', function() {
        infoWindow1.open(map, marker1);
    });

    testArea = new google.maps.Polygon({
        paths: area,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#FF0000',
        fillOpacity: 0.35
    });
    testArea.setMap(map);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
}

google.maps.event.addDomListener(window, 'load', initialize);

$('#submit2').click(function ()
{
    $('.error').hide();
    var end;
    var address = document.getElementById('address2').value;

    geocoder.geocode( { 'address': address}, function(results, status)
    {
        if (status == google.maps.GeocoderStatus.OK) {
            end         = results[0].geometry.location;
            var request = {
                origin:mainPoint,
                destination:end,
                travelMode: google.maps.TravelMode.DRIVING
            };

            directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                }
            });
        } else {
            $('.error').text('Geocode was not successful for the following reason: ' + status);
            $('.error').show();
        }
    });
});

$('#submit').click(function()
{
    $('.success').hide();
    $('.error').hide();
    var address = $('#address').val();
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
            var exist = google.maps.geometry.poly.containsLocation(
                results[0].geometry.location,
                testArea
            );

            if (exist) {
                infoWindow1.open(map, marker1);
                $('.success').show();
            } else {
                $('.error').show();
            }
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
});