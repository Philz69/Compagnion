$(document).ready(function(){
	if(navigator.cookieEnabled === true)
		getLocalisation();
	else
		alert('Please enable cookies.');
});

function getLocalisation(){
	var geolocation = false;

	var cookie = getCookieData('geoLocation');

	if(cookie === null || (cookie === 'redirect' && window.location.pathname.indexOf('villes.html') === -1)){//if geolocation is not set and user not on page of city choosing
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(//doesn't work on onsecured origins
				function(pos){
					document.cookie = "geoLocation=" + JSON.stringify({x: pos.coords.latitude, y: pos.coords.longitude});
				},
				function(error){//can't geolocate, redirect to cities page
					document.cookie = "geoLocation=redirect";
					window.location.href = 'villes.html';
				}
			);
		}
	}
}

function getCookieData(selector){
	var cookies = document.cookie.split(';');
	var _return = null, index;
	for(index in cookies){
		node = cookies[index].split('=');
		if(node[0].trim() === selector){
			_return = node[1];
		}
	}
	return _return;
}