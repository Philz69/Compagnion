$(document).ready(function(){
	var filters = JSON.parse(getCookieData('filters'));
	
	if(filters !== null && Object.keys(filters).length > 0){
		window.category = filters.category;

		//Set specific filters
		window.sameCatArray1 = ['Expositions', 'Spectacles', 'Festivals', 'Divers'];
		if(window.sameCatArray1.indexOf(filters.category) > -1)
			setOutingFilters();
		else if(filters.category === 'Restos')
			setRestoFilters();

		//get results
		//document.cookie = 'filters=; expires=Thu, 01 Jan 1970 00:00:00 UTC';//delete cookie
		getResults(filters, parseData);//get data and display it with callback
	}else{
		window.location.href = 'categories.html';
	}
});

function getResults(filters, callback){
	var location = getCookieData('geoLocation');

	//try JSON parsing location
	try{
		location = JSON.parse(location);
	}catch(error){//city string. User was not geolocated
		//console.log(location)
	}

	//if geolocated, find city
	if(typeof location.x !== 'undefined' && typeof location.y !== 'undefined'){
		var geocoder = new google.maps.Geocoder;
		reverseGeocode(geocoder, location, returnResults, true);
	}else{
		returnResults(location);
	}

	function returnResults(city){
		$.post("../php/getResults.php", {filters, location: city}, function(results){
			if(city === 'Sherbrooke'){//if Sherbrooke
				$.post("../php/getZap.php", function(zap){
					results = hasZap(JSON.parse(results), JSON.parse(zap));
					callback(results);//already JSON parsed object
				});
			}else{
				callback(JSON.parse(results));
			}
		});
	}
}

function parseData(data){
	$('#overlay').remove();//remove blurring div

	if(window.sameCatArray1.indexOf(category) > -1)
		getData2(data, generateResults);
	else
		generateResults(getData1(data));
}
function generateResults(data){
	//console.log(data);
	//data = orderByDistance(data);
	
	var cont = $($('.container').get(0));

	//if(window.category === 'Restos')
		//cont.append(restoFilter());

	for(var i = 0; i < Object.keys(data).length; ++i){
		if(i % 2 === 0){
			if(i !== 0)
				cont.append('</div>');

			cont.append('<div class="row">');
		}
		
		cont.append(generateHTML(data[i]));
	}

	$('.cards').on('click', function(){
		document.cookie = 'chosenMarker=' + $(this).find('.latLng').text();
		document.cookie = 'name=' + $(this).find('.name').text();
		document.cookie = 'description=' + $(this).find('.description').text();
		window.location.href = 'map.html';
	});

	/*$('#price').on('change', function(){
		var filters ['category'=>window.category, 'r_Price'=>$(this).val()];
		getResults(filters, parseData);
	});*/
}

function hasZap(data, zap){
	for(var i = 0; i < Object.keys(data).length; ++i){
		data[i].zap = false;

		var f;
		for(f in zap){
			//if phone number, postal code or address matches
			var zPhone = (typeof zap[f][9] !== 'undefined' ? zap[f][9].replace(/-/g, '') : null);
			var zPostal = (typeof zap[f][8] !== 'undefined' ? zap[f][8].replace(/ /g, '') : null);
			
			if(data[i].NumeroTelephone == zPhone || data[i].CodePostal == zPostal || (data[i].NumeroCivique == zap[f][3] && data[i].Rue == zap[f][4])){
				data[i].zap = true;
				break;
			}
		}
	}

	return data;
}

function generateHTML(obj){
	console.log(obj);
	var html;
	var coors = obj.coors.x + ', ' + obj.coors.y;
	var zap = '';
	if(obj.zap){
		zap = '<img src="../images/icons/zap.svg" style="width: 30px; position: absolute; right: 25px; top: 30px;"/>';
	}
	if(window.category === 'Restos'){
		var price = generatePrice(obj.price);
		var offers = generateTypes(obj.offers);

		html = '<div class="col-sm-6">\
					<div class="card btn-flat waves-attach cards">\
						<span class="latLng" style="display: none">' + coors + '</span>\
						<span class="name" style="display: none">' + obj.name + '</span>\
						<span class="description" style="display: none">' + obj.description + '</span>\
						<aside class="card-side pull-left card-side-img" style="background-image:url(\'' + obj.img + '\'); background-size:cover; background-position: center;">\
						</aside>\
						<div class="card-main">\
							<div class="card-inner" style="margin-bottom: -30px;">\
								' + zap + '\
								<p class="card-heading">' + obj.name + '</p>\
								<p class="margin-bottom-lg" style="margin-top: -10px">' + clipText(obj.description, 70) + '</p>\
							</div>\
							<div class="card-action">\
								<div class ="row" style="margin-left:10px;">\
									' + offers + '\
								</div>\
							</div>\
						</div>\
					</div>\
				</div>';
	}else{
		html = '<div class="col-sm-6">\
					<div class="card btn-flat waves-attach cards">\
						<span class="latLng" style="display: none">' + coors + '</span>\
						<span class="name" style="display: none">' + obj.name + '</span>\
						<span class="description" style="display: none">' + obj.description + '</span>\
						<aside class="card-side pull-left card-side-img" style="background-image:url(\'' + obj.img + '\'); background-size:cover; background-position: center;">\
						</aside>\
						<div class="card-main">\
							<div class="card-inner">\
								' + zap + '\
								<p class="card-heading">' + obj.name + '</p>\
								<p class="margin-bottom-lg">' + clipText(obj.description, 70) + '</p>\
							</div>\
						</div>\
					</div>\
				</div>';
	}

	return $(html);
}

//only for restaurants
function generatePrice(price){
	var html = '<div id="price">';
	for(var i = 0; i < price/2; ++i){
		html += '<img src="../images/icons/money.svg"/>';
	}
	html += '</div>';

	return html;
}
function generateTypes(offers){
	var node1 = '<span class="label-green col-sm-3" style="text-align:center; margin:0px 10px;"> DÉJEUNER </span>'
	var node2 = '<span class="label-teal500 col-sm-3" style="text-align:center; margin:0px 10px;"> DINER </span>';
	var node3 = '<span class="label-teal900 col-sm-3" style="text-align:center; margin:0px 10px;"> SOUPER </span>';

	var html = '<div id="offers">';

	if(offers.indexOf('0') == -1){
		if(offers.indexOf('1') > -1 || offers.indexOf('2') > -1)
			html += node1;
		
		if(offers.indexOf('3') > -1)
			html += node2;

		if(offers.indexOf('4') > -1)
			html += node3;

	}else{//not specified
		html += node1 + node2 + node3;
	}

	html += '</div>';

	return html;
}

function orderByDistance(data){
}

function getDistance(p1, p2){
	return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2))
}

function getData1(data){
	var _return = {};
	for(var i = 0; i < data.length; ++i){
		_return[i] = {};
		_return[i].name = data[i].Nom;
		_return[i].description = data[i].DescriptionCourte;
		_return[i].img = data[i].FichierImage;
		_return[i].coors = {x: data[i].Latitude, y: data[i].Longitude};
		_return[i].zap = data[i].zap;

		//only for restaurants, add price and type
		if(window.category === 'Restos'){
			_return[i].price = data[i].EchellePrix;
			_return[i].offers = data[i].Offres;
		}
	}

	return _return;
}
function getData2(data, callback){
	var _return = {}, index = 0;
	for(var i = 0; i < data.length; ++i){
		setLocation(data[i].LOC, function(coors){
			_return[index] = {};
			_return[index].name = data[index].TITRE;
			_return[index].description = data[index].DESCRIP;
			_return[index].img = data[index].URL_PHOTO;
			_return[index].coors = 	{x: coors.lat, y: coors.lng};
			_return[index].zap = data[index].zap;
			++index;

			if(index == data.length)
				callback(_return);
		});
	}
}

function reverseGeocode(geocoder, latLng, callback, rCity){
	rCity = (typeof rCity !== 'undefined' ? true : false);

	geocoder.geocode({'location': {lat: latLng.x,  lng: latLng.y}}, function(result, status){
		if(status === google.maps.GeocoderStatus.OK){
			if(rCity)
				callback(findCity(result));
			else
				callback(result[1]);
		}else{
			alert('ERROR: ' + status + ', ' + result);
		}
	});
}

function findCity(obj){
	var result, index;
	for(index in obj){
		var splitString = obj[index].formatted_address.split(',');

		if(splitString.length === 3 && splitString[1].trim() === 'QC' && splitString[2].trim() === 'Canada'){
			result = splitString[0].trim().split( )[0];
			break;
		}
	}

	return result;
}

function setLocation(address, callback){
	$.post('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=AIzaSyDlEyZEkjcdbC5Vux34DDuIOnAAiBJi11U', function(data){
		if(data.status === "OK"){
			var coors = data.results[0].geometry.location;
			callback(coors);
		}else{
			alert('Error.');
		}
	});
}

function clipText(text, length){
	if(text.length > length)
		return (text.slice(0, length) + '...');
	else
		return text;
}
/**** Category specific functions ****/
function setOutingFilters(){

}

function setRestoFilters(){

}

function restoFilter(){
	var filter = '<div class="col-sm-6" style="margin-left: 25%;">\
					<div class="card " style="text-align: center;" >\
						<div class="card-main ">\
								<div class="card-inner">\
									<p class="card-heading"> Restaurants </p>\
									    <div class="row" style="margin-left: 25%; margin-top: -2.5%; margin-bottom: 5%;">\
									        <div class="col-sm-7">\
									             <input type="range" id="price" min="0" max="10" value="0"></input>\
									        </div>\
										 </div>\
									   <div class="checkbox checkbox-adv col-sm-4">\
										<label for="dejeuner">\
											<input class="access-hide" id="dejeuner" type="checkbox">Déjeuner</input>\
											<span class="checkbox-circle"></span><span class="checkbox-circle-check"></span><span class="checkbox-circle-icon icon">done</span>\
										</label>\
									</div>\
									<div class="checkbox checkbox-adv col-sm-4">\
										<label for="dinner">\
											<input class="access-hide" id="dinner" type="checkbox">Dinner</input>\
											<span class="checkbox-circle"></span><span class="checkbox-circle-check"></span><span class="checkbox-circle-icon icon">done</span>\
										</label>\
									</div>\
									<div class="checkbox checkbox-adv  col-sm-4">\
										<label for="souper">\
											<input class="access-hide" id="souper" type="checkbox">Souper</input>\
											<span class="checkbox-circle"></span><span class="checkbox-circle-check"></span><span class="checkbox-circle-icon icon">done</span>\
										</label>\
									</div>\
								</div>\
						</div>\
					</div>\
				</div>\
		    </div>\
			</div>';
			return filter;
}