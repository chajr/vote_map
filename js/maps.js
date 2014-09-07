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

var routeBoxer      = new RouteBoxer();
var distance        = 0.5; // km
var icrement;
var boxes;

for(key in pointGroups) {
    var emptyCheckbox = $('#empty_checkbox').clone();
    emptyCheckbox.find('label').text(pointGroups[key].name);
    emptyCheckbox.find('input').val(pointGroups[key].code);
    $('#group_markers').append(emptyCheckbox);
}

$(document).on('click', '#empty_checkbox input', function()
{
    drawMarkers();
});

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

    google.maps.event.addListener(map, 'click', function(e) {
        placeMarker(e.latLng, map);
    });

}

google.maps.event.addDomListener(window, 'load', initialize);

function placeMarker(position, map) {
    lan = position.B;
    lat = position.k;
    $('#location').text(lat + ', ' + lan);
}

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

                    var path        = response.routes[0].overview_path;
                    boxes           = routeBoxer.box(path, distance);

                    drawMarkers();
                }
            });
        } else {
            $('.error').text('Geocode was not successful for the following reason: ' + status);
            $('.error').show();
        }
    });
});

function drawMarkers()
{
    for(key in pointGroups) {
        var renderedMarkers = pointGroups[key].renderedMarkers;
        for (var l = 0; l < renderedMarkers.length; l++) {
            if (renderedMarkers[l]) {
                renderedMarkers[l].setMap(null);
            }
        }
        pointGroups[key].renderedMarkers = [];
    }

    var enabledGroups = [];
    $('#group_markers input:checked').each(function()
    {
        enabledGroups.push($(this).val());
    });

    for (var k = 0; k < enabledGroups.length; k++) {
        var groupMarkers = pointGroups[enabledGroups[k]].markers;
        for (icrement = 0; icrement < groupMarkers.length; icrement++) {

            if (boxes) {
                for (var i = 0; i < boxes.length; i++) {
                    var boxpolys = new google.maps.Rectangle({
                        bounds: boxes[i],
                        fillOpacity: 0,
                        strokeOpacity: 1.0,
                        strokeColor: '#000000',
                        strokeWeight: 1
                    });

                    var exist = boxpolys.getBounds().contains(groupMarkers[icrement].marker);
                    if (exist) {
                        pointGroups[enabledGroups[k]].renderedMarkers[icrement] = new google.maps.Marker({
                            position: groupMarkers[icrement].marker,
                            icon: pointGroups[enabledGroups[k]].image,
                            map: map
                        });
                    }
                }
            } else {
                pointGroups[enabledGroups[k]].renderedMarkers[icrement] = new google.maps.Marker({
                    position: groupMarkers[icrement].marker,
                    icon: pointGroups[enabledGroups[k]].image,
                    map: map
                });
            }

            //pointGroups[code].renderedDescriptions[icrement] = new google.maps.InfoWindow({
            //    content: groupMarkers[icrement].description
            //});
            //google.maps.event.addListener(
            //    pointGroups[code].renderedMarkers[icrement],
            //    'click',
            //    function()
            //    {
            //        pointGroups[code].renderedDescriptions[icrement]
            //            .open(
            //            map,
            //            pointGroups[code].renderedMarkers[icrement]
            //        );
            //    }
            //);
        }
    }
}

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
