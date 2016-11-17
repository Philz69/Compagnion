$(document).ready(function(){
	$('.col-sm-4').on('click', function(){
		var city = $(this).find('.card-heading').text().trim();
		if(city === 'Sherbrooke'){
			//setLocation(city);
			setCity(city);
		}else{
			alert('Nous n\'avons présentement aucune information sur cette ville. Veuillez choisir une autre. Merci.');
		}
	});
});

function setLocation(city){
	$.post('https://maps.googleapis.com/maps/api/geocode/json?address=' + city + ', QC, Canada&key=AIzaSyDlEyZEkjcdbC5Vux34DDuIOnAAiBJi11U', function(data){
		if(data.status === "OK"){
			var coors = data.results[0].geometry.location;
			document.cookie = 'geoLocation=' + JSON.stringify({x: coors.lat, y: coors.lng});
			window.location.href = 'categories.html';//redirect to main page
		}else{
			alert('Could not get your location. Please try again.');
		}
	});
}

function setCity(city){
	document.cookie = 'geoLocation='  + city;
	window.location.href = 'categories.html';//redirect to main page
}