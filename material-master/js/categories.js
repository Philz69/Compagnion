$(document).ready(function(){
	$('.cards').on('click', function(){
		var cat = $(this).find('.card-heading').text().trim();
		var filters = {filters: {category: cat}};

		filters = $.extend(filters.filters, getFilters(cat));

		document.cookie = 'filters=' + JSON.stringify(filters);

		window.location.href = 'results.html';
	});
});

function getFilters(category){
	var sameCatArray1 = ['Expositions', 'Spectacles', 'Festivals', 'Divers'];
	var filters = {};
	
	if(category === "Restos"){
		filters.r_Price = $('#prix').val();
		filters.r_Offers = $('#offres').val() - 1;

	}else if(sameCatArray1.indexOf(category) > -1){
		filters.date = $('#date').val();
	}

	return filters;
}