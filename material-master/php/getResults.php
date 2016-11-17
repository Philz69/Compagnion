<?php
	header('Content-Type: text/plain; charset=utf-8');

	function returnData($data, $catID, $city, $filters = null){
		$_return = [];
		
		foreach($data as $node){
			if($catID[0] !== null){
				$cat = getCat($node, $city);
				$catIDs = explode(',', $cat);//category may be present in many categories
			}else{
				$catIDs = [null];
			}
			foreach($catIDs as $cID){
				if(!in_array($node, $_return)){//check if already in array
					if(array_search($cID, $catID) !== false){
						if($filters !== null){//check if data fits the event
							if(filter($filters, $node, $city) === true)
								array_push($_return, $node);
						}else{
							array_push($_return, $node);
						}
					}
				}
			}
		}

		return $_return;
	}

	/* Only filter for now is the date */
	function filter($filters, $node, $city){ //date filter will only be sent with categories having a timelife. (unless the request is forged)
		$_return = true;
		$r_array = []; $index = 0;
		switch($city){
			case 'Sherbrooke':
				//date filter
				if(isset($filters['date']))
					$dates = [$node['DT01'], $node['DT02']];

				//restaurants specific filters
				if(isset($filters['r_Price']))
					$r_Price = $node['EchellePrix'];
				if(isset($filters['r_Offers']))
					$r_Offers = $node['Offres'];
				break;
			case 'Montréal':
				
				break;
			case 'Laval':
				
				break;
			case 'Québec':

				break;
			case 'Gatineau':
				break;
			default:
				break;
			}

			/* date */
			if(isset($filters['date'])){
				$r_array[$index] = ((strtotime($filters['date']) >= strtotime($dates[0]) && strtotime($filters['date']) <= strtotime($dates[1])) ? true : false);
				++$index;
			}

			/* Restaurants */
			if(isset($filters['r_Price']) && isset($filters['r_Offers'])){
				$r_array[$index] = (($filters['r_Price'] == $r_Price ? true : false) & (strpos($r_Offers, $filters['r_Offers']) > -1 ? true : false));
				++$index;
			}

			foreach($r_array as $val)
				$_return &= $val;


		return $_return == 1 ? true : false;
	}

	function getCat($node, $city){
		switch($city){
			case 'Sherbrooke':
				if(isset($node['Categories'])){
					$cat = $node['Categories'];

				}else if(isset($node['CATEG'])){
					foreach($node['CATEG'] as $node){
						$cat .= $node . ',';
					}
				}
				break;
			case 'Montréal':
				
				break;
			case 'Laval':
				
				break;
			case 'Québec':

				break;
			case 'Gatineau':
				
				break;
		}

		return $cat;
	}

	function skip($array, $skips){
		for($i = 0; $i < $skips; ++$i){
			$tmp = [];

			foreach($array as $node){
				array_push($tmp, $node);
			}
			$array = $tmp[0];
		}
		return $array;
	}

	function sherbrooke($filters){
		$skips = null;
		switch($filters['category']){
			case "Bars":
				$urlSrc = 1;
				$catID = ['5'];
				break;

			case "Magasinage":
				$urlSrc = 1;
				$catID = ['18'];
				break;

			case "Tourisme":
				$urlSrc = 1;
				$catID = ['4', '7', '8'];
				break;

			case "Été":
				$urlSrc = 1;
				$catID = ['12', '13', '14', '15'];
				break;

			case "Hiver":
				$urlSrc = 1;
				$catID = ['14', '16'];
				break;

			case "Divertissements":
				$urlSrc = 1;
				$catID = ['9', '17'];
				break;

			case "Détente":
				$urlSrc = 1;
				$catID = ['19'];
				break;

			case "Expositions":
				$urlSrc = 2;
				$catID = ['Expositions', 'Centre de foires', 'Salons et expositions', 'Salons'];
				break;

			case "Spectacles":
				$urlSrc = 2;
				$catID = ['Spectacles et événements', 'Spectacles'];
				break;

			case "Festivals":
				$urlSrc = 2;
				$catID = ['Fêtes et festivals', 'Événements sportifs', 'Activités et animations'];
				break;

			case "Divers":
				$urlSrc = 2;
				$catID = ['Divers'];
				break;

			case "Restos":
				$urlSrc = 3;
				$catID = [null];
				break;
			default:
				$urlSrc = null;
				break;
		}
		switch($urlSrc){
			case 1:
				$url = "https://www.donneesquebec.ca/recherche/dataset/c3f0a3db-2f74-4a70-a766-ecc0a2f5d5a1/resource/d4cf027d-8bea-4f81-9a14-73f585999036/download/attraits.json";
				break;
			case 2:
				$url = "https://www.donneesquebec.ca/recherche/dataset/c3f0a3db-2f74-4a70-a766-ecc0a2f5d5a1/resource/e5799444-43d6-45cc-a105-660f4b94e4e1/download/evenements.json";
				$skips = 2;
				break;
			case 3:
				$url = "https://www.donneesquebec.ca/recherche/dataset/61b5b4e9-d038-4995-b85a-de039dc1b06b/resource/386e62b2-47ae-43bc-a85a-efbcaf3130ba/download/restaurants.json";
				break;
			default:
				$url = null;
				break;
		}

		return ['url' => $url, 'catID' => $catID, 'skips' => $skips];
	}

	function main(){

		$filters = $_POST['filters'];
		$location = $_POST['location'];

		switch($location){
			case 'Sherbrooke':
				$refs = sherbrooke($filters);
				break;
			case 'Montréal':
				$refs = montreal($filters);
				break;
			case 'Laval':
				$refs = laval($filters);
				break;
			case 'Québec':
				$refs = quebec($filters);
				break;
			case 'Gatineau':
				$refs = gatineau($filters);
				break;
		}
		if($refs['url'] !== null){
			$data = json_decode(file_get_contents($refs['url']), true);
			if($refs['skips'] !== null){
				$data = skip($data, $refs['skips']);
			}

			if(count($filters) > 1){//if has some filters other than the category
				//print_r(returnData($data, $refs['catID'], $location, $filters));

				echo json_encode(returnData($data, $refs['catID'], $location, $filters));
			}else{//no filters
				//print_r(returnData($data, $refs['catID'], $location));

				echo json_encode(returnData($data, $refs['catID'], $location));
			}
		}else{
			echo 'null';
		}
	}

	main();
?>