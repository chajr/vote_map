var mapOptions;
var map;
var geocoder;
var directionsDisplay;
var boxes;
var directionsService   = new google.maps.DirectionsService();
var routeBoxer          = new RouteBoxer();
var distance            = 0.5; // km
var centerPoint         = new google.maps.LatLng(50.45072766195573, 19.519992830464616);

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
    geocoder            = new google.maps.Geocoder();
    mapOptions          = {
        center: centerPoint,
        zoom: 12
    };
    map = new google.maps.Map(
        document.getElementById("map-canvas"),
        mapOptions
    );

    for(key in areas) {
        areas[key].renderedArea = new google.maps.Polygon({
            paths: areas[key].points,
            strokeColor: areas[key].backgroundColor,
            strokeOpacity: areas[key].borderOpacity,
            strokeWeight: areas[key].borderSize,
            fillColor: areas[key].borderColor,
            fillOpacity: areas[key].backgroundOpacity
        });
        areas[key].renderedArea.setMap(map);

        placeMarker(
            areas[key].mainPoint,
            map,
            areas[key].mainMarkerName,
            areas[key].mainPointIcon,
            areas[key].mainMarkerDescription,
            key
        );
    }

    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));

    google.maps.event.addListener(map, 'click', function(e) {
        placeMarker(e.latLng, map, null, null, null, null);
    });

}

google.maps.event.addDomListener(window, 'load', initialize);

function placeMarker(position, map, title, icon, description, key) {
    if (!description) {
        description = '<div style="width:150px">' + position.k + ', ' + position.B + '</div>';
    }

    var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: title,
        icon: icon
    });
    var descriptionObject = new google.maps.InfoWindow({
        content: description
    });

    if (key) {
        areas[key].renderedMainPointInfo = descriptionObject;
        areas[key].renderedMainPoint     = marker;
    }

    google.maps.event.addListener(marker, 'click', function() {
        descriptionObject.open(map, marker);
    });
}

$('#submit2').click(function ()
{
    $('.error').hide();
    var addressStart = document.getElementById('address_start').value;
    var addressEnd   = document.getElementById('address_end').value;

    var request = {
        origin:addressStart,
        destination:addressEnd,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);

            var path        = response.routes[0].overview_path;
            boxes           = routeBoxer.box(path, distance);

            drawMarkers();
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
                        createGroupMarker(
                            icrement,
                            enabledGroups[k],
                            groupMarkers
                        );
                    }
                }
            } else {
                createGroupMarker(
                    icrement,
                    enabledGroups[k],
                    groupMarkers
                );
            }
        }
    }
}

function createGroupMarker(icrement, group, groupMarkers) {
    pointGroups[group].renderedMarkers[icrement] = new google.maps.Marker({
        position: groupMarkers[icrement].marker,
        icon: pointGroups[group].image,
        map: map
    });

    pointGroups[group].renderedDescriptions[icrement] = new google.maps.InfoWindow({
        content: groupMarkers[icrement].description
    });

    var description = pointGroups[group].renderedDescriptions[icrement];
    var marker      = pointGroups[group].renderedMarkers[icrement];

    google.maps.event.addListener(
        pointGroups[group].renderedMarkers[icrement],
        'click',
        function()
        {
            description.open(map, marker);
        }
    );
}

$('#submit').click(function()
{
    $('.success').hide();
    $('.error').hide();
    var address = $('#address').val();
    var error   = true;

    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            for (key in areas) {
                var exist = google.maps.geometry.poly.containsLocation(
                    results[0].geometry.location,
                    areas[key].renderedArea
                );

                if (exist) {
                    var request = {
                        origin:results[0].geometry.location,
                        destination:areas[key].mainPoint,
                        travelMode: google.maps.TravelMode.DRIVING
                    };

                    directionsService.route(request, function(response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                                directionsDisplay.setDirections(response);
                            }
                    });

                    areas[key].renderedMainPointInfo.open(map, areas[key].renderedMainPoint);
                    $('.success').show();
                    map.setCenter(results[0].geometry.location);
                    error = false;
                    break;
                }
            }
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }

        if (error) {
            $('.error').show();
        }
    });
});
