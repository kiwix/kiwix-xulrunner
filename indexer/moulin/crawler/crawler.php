<?php

	require '/home/reg/crawler_functions.php';

	// command-line variables
	define ('MW_NO_OUTPUT_BUFFER', 1);
	chdir("/var/www/reg.kiwix.org/wiki");
	$_ENV ['CRAWLER']	= "Y";
	$_ENV ['MLLANG']	= "fr";
	$_ENV ['MLPROJECT']	= "encyclopedia";

	// MediaWiki variables
	$_SERVER['SERVER_NAME'] 	= "pumbaa"; //"172.16.96.128"; //"pumbaa";
	$_SERVER['REMOTE_ADDR'] 	= "127.0.0.1";
	$_GET['redirect'] 			= "no";
	$_SERVER['REQUEST_METHOD']	= "GET";

	// Language
	$moulinLANG		= $moulin_lang . '/' . $moulin_proj;

	// Paths
	$root_dest		= "/home/reg/var";
	$fd				= $root_dest . '/' . $moulinLANG . '_' . $_SERVER['REQUEST_TIME'];
	$sqlf			= $fd . '/index.db';
	mkdir($fd, 0777, true);

	// Database (crawler)
	$db = new mysqli("localhost", "reg", "reg", 'reg_' . $moulin_lang . '_' . $moulin_proj);
	if (mysqli_connect_errno()) {
    	printf("Connect failed: %s\n", mysqli_connect_error());
	    exit();
	}
	//$db->set_charset("utf8");
	$db->query("SET NAMES 'utf8';");

	// SQL transaction file
	try {
    	$indexdb = new PDO("sqlite:".$sqlf );
    } catch(PDOException $e) {
		print $e->getMessage();
		exit ();
	}
	$indexdb->exec("CREATE TABLE `slots` (
	id INTEGER PRIMARY KEY,
	archive INTEGER,
	soffset INTEGER,
	length INTEGER
);

CREATE TABLE `map` (
	title VARCHAR(250),
	slot INTEGER
);
");
	$indexdb->beginTransaction();

	// main articles loop
	print 'starting crawler: ' . date("c", $_SERVER['REQUEST_TIME'])."\n";

	$stmt	= $db->prepare("SELECT page_title, page_is_redirect, page_latest
	FROM page WHERE page_namespace= ? ORDER BY page_title ASC LIMIT 0,1000;");
	$stmt->bind_param('d', $namespace['id']);
	$stmt->execute();
	$stmt->bind_result($article, $redirect, $latest);
	
	// data buffer
	$archive	= new MoulinCrawlerArchive ($fd);
	$redirects	= array ();
	$count		= 0;

	while ($stmt->fetch()) {
		$count++;
		if (($count % 100) == 0)
			print $count . ': ' .$article."\n";

		// preparing
		ob_start ();
		$_SERVER['PATH_INFO']	= "/".$article;
		$_REQUEST['title']		= $article;
		include "/var/www/reg.kiwix.org/wiki/index.php";

		// using datas
		$moulin_output	 		= ob_get_contents ();

		// redirect
		if ($redirect == 1 || html_is_redirect ($html)) {
			$targetArticle = html_extract_redirect ($html);
			array_push ($redirects, array ('source' => $article, 'target' => $targetArticle));
			ob_end_clean ();
			$moulin_output	= null;
			$wgOut			= new OutputPage;
			continue;
		}

		// html stripping
		html_remove_extras ($moulin_output);
		html_convert_images($moulin_output);
		html_convert_links ($moulin_output);
		html_convert_math_images ($moulin_output);

		// archive infos
		$index		= $archive->index;
		$soffset	= $archive->bytes;
		$length		= $archive->write ($moulin_output);

		//file_put_contents("/var/www/reg.kiwix.org/tmp/".$article.".html", $moulin_output);

		// sqlite index
		$index_stmt = $indexdb->prepare("INSERT INTO `slots` (archive, soffset, length) VALUES (:archive, :soffset, :length);");
		$index_stmt->bindParam(':archive', $index);
		$index_stmt->bindParam(':soffset', $soffset);
		$index_stmt->bindParam(':length', $length);
		$index_stmt->execute();

		$current_slot= $indexdb->lastInsertId ();

		$index_stmt = $indexdb->prepare("INSERT INTO `map` (title, slot) VALUES (:title, :slot);");
		$index_stmt->bindParam(':title', $article);
		$index_stmt->bindParam(':slot', $current_slot);
		$index_stmt->execute();
		
		// cleaning
		ob_end_clean ();
		$moulin_output	= null;
		$wgOut			= new OutputPage;
	}

	// handle redirects
	foreach ($redirects as $redirect)
	{
		$r_stmt = $indexdb->prepare("SELECT `slot` FROM `map` WHERE title = :title;");
		$r_stmt->bindParam(':title', $redirect['target']);
		$r_stmt->execute();
		$slot	= $r_stmt->fetchColumn ();

		$index_stmt = $indexdb->prepare("INSERT INTO `map` (title, slot) VALUES (:title, :slot);");
		$index_stmt->bindParam(':title', $redirect['title']);
		$index_stmt->bindParam(':slot', $slot);
		$index_stmt->execute();
	}

	// Closing handlers
	$indexdb->commit();
	$db->close();
	
	// greetings
	$now = time ();
	$duration = $now - $_SERVER['REQUEST_TIME'];
	print 'exiting crawler: ' . date("c", $now)."\n".'Duration: '.($duration/60)."mn\n";

?>
