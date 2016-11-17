<?php
	header('Content-Type: text/plain; charset=utf-8');

	$url = "https://www.donneesquebec.ca/recherche/dataset/5cc3989e-442b-4f25-8049-d39d44421d6f/resource/0106c060-9559-4ce7-9987-41ec051a1df8/download/nodes.csv";
	$file = file_get_contents($url);

	$data = array_map("str_getcsv", preg_split('/\r*\n+|\r+/', $file));
	array_shift($data);

	echo json_encode($data);
	//print_r($data);
?>