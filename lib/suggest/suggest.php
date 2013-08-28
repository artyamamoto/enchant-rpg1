<? header("Content-Type: text/json; Charset=UTF-8"); 

	echo json_encode(array(
		array("text" => "渋谷" //,"url" => 'javascript: void(0);'
		),
		array("text" => "新宿" //,"url" => 'javascript: void(0);'
		),
		array("text" => "上野" //,"url" => 'javascript: void(0);'
		),
		array("text" => "原宿"),
		array("text" => "池袋"),
		array("text" => "吉祥寺"),
	));
?>
