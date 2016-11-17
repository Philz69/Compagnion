function initMap() {//name has to be initMap since that was passed in the google maps api request
	var usrLoc = getCookieData('geoLocation');
	var usrCoors = true;
	try{usrLoc = JSON.parse(center); }catch(error){usrCoors = false};//check if geolocated

	var chosenMarker = getCookieData('chosenMarker').split(', '); chosenMarker = {lat: parseFloat(chosenMarker[0]), lng: parseFloat(chosenMarker[1])};//the chosen place

	/**var mapCenter = (usrCoors ? {lat: usrLoc.x, lng: usrLoc.y} : chosenMarker);**/
    var mapCenter = (usrCoors ? {lat: 45.3854814, lng: -71.9955969} : chosenMarker);
    
	var map = new google.maps.Map(document.getElementById('map'), {
		center: mapCenter,
		zoom: 14
	});

	if(usrCoors)
		var markers = [{lat: center.x, lng: center.y}, chosenMarker];
	else
		markers = [chosenMarker];

	//console.log(markers)
	addMarkers(markers, map);
	//addMarkers(getCookieData('chosenMarker'), map);
	//document.cookie = 'chosenMarker=; expires=Thu, 01 Jan 1970 00:00:00 UTC';

	if(usrCoors){//draw route only if user was geolocated
		var request = {
			origin: markers[0],
			destination: markers[1],
			travelMode: google.maps.TravelMode.TRANSIT
		};
		drawRoute(request, map);
	}

	showInfo();
    
}

function addMarkers(latLngs, map){
	for(var i = 0; i < latLngs.length; ++i){
		if(i === 0) var sIcon = "../images/icons/marker_black.svg"; else var sIcon = "../images/icons/marker_red.svg";

		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(latLngs[i].lat, latLngs[i].lng),
			icon: sIcon,
			map: map
		});

		/*google.maps.event.addListener(marker, 'click', (function(marker){
			var displayedMarker = null;
			return function(){
				if(displayedMarker !== null)
					displayedMarker.setIcon('../images/icons/marker_red.svg');
				marker.setIcon("../images/icons/marker_black.svg");
				displayedMarker = marker;
			}			
		})(marker));*/
	}
}

function drawRoute(request, map){
	var display = new google.maps.DirectionsRenderer();
	var service = new google.maps.DirectionsService();

	display.setMap(map);

	service.route(request, function(response, status) {
	    if (status == google.maps.DirectionsStatus.OK) {
	    	$('#overlay').remove();
	    	console.log('gfhjgkh')
	      	display.setDirections(response);
    	}else{
    		console.log('nope');
    	}
  	});
}

function updateRoute(travelmode){
        var request = {
			origin: markers[0],
			destination: markers[1],
			travelMode: travelmode
		};
        drawRoute(request, map);
}

function showInfo(){
$(map).append('<div class="btn-group" style="width: fit-content; margin: auto;">\
<button type="button" class="btn btn-primary active" style="margin: auto;" id="transitbus"  onclick="updateRoute(google.maps.TravelMode.TRANSIT)">\
  <img src="../images/icons/bus.svg">\
</button>\
<button type="button" class="btn btn-primary" style="margin: auto;" id="transitcar" onclick="updateRoute(google.maps.TravelMode.DRIVING)">\
  <img src="../images/icons/car.svg">\
  </button>\
<button type="button" class="btn btn-primary" style="margin: auto;" id="transitbike" onclick="updateRoute(google.maps.TravelMode.BICYCLING)">\
<img src="../images/icons/bike.svg">\
</button>\
<button type="button" class="btn btn-primary" style="margin: auto;" id="transitwalk" onclick="updateRoute(google.maps.TravelMode.WALKING)">\
<img src="../images/icons/walk.svg">\
</button>\
</div>');
	var name = getCookieData('name');
	($('.row').eq(0)).append('<p id="name" style="font-family: Trebuchet MS; font-size: 2em; width: 60%; margin-left: auto; margin-right: auto; margin-bottom: -.5em; margin-top: 3em; text-align: center;">' + name + '</p>');

	var description = getCookieData('description');
	($('.row').eq(1)).append('<p id="desc" style="font-family: Trebuchet MS; font-size: 1.1em; width: 50%; margin-left: auto; margin-right: auto; text-align: center;">' + description + '</p>');
}
