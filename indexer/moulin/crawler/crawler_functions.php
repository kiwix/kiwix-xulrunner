<?php

class MoulinCrawlerArchive
{

	public $root	= "/tmp";
	public $index	= -1;
	public $bytes	= 0;
	public $current;
	public $CHUNK_SIZE	= 10485760;

	function __construct ($root)
	{
		$this->root	= $root;
		$this->rotate ();	
	}

	private function rotate ()
	{
		if (!empty($this->current)) {
			fclose($this->current);
			shell_exec("/usr/bin/nohup &&  cd ".$this->root." && /bin/bzip2 ". $this->root . '/' . $this->index." > /dev/null");
		}

		$this->index++;
		$this->current	= fopen($this->root . '/' . $this->index, 'w+');
		$this->bytes	= 0;
	}
	
	public function write ($content)
	{
		if ($this->ark_is_full ())
			$this->rotate ();

		$bytes			= fwrite($this->current, $content);
		$this->bytes   += $bytes;
		return $bytes;
	}

	private function ark_is_full ()
	{
		return $this->bytes >= $this->CHUNK_SIZE;
	}
	
	function __destruct ()
	{
		if (!empty($this->current))
			return fclose($this->current);
	}
}

# transform standard URL to be used as param in regexp.
function str2regex ($str)
{
	$str = str_replace(":", "\\:", $str);
	$str = str_replace("/", "\\/", $str);
	return $str;
}

function html_remove_extras (&$html)
{
	# exclude the top and left frames
	$html = preg_replace('/.*<div id="column-content">/is', '', $html);
	$html = preg_replace("/(.*)<div id=\"column-one\">.*/s", '$1', $html);
	# remove the siteNotice (donate to wikipedia...)
	$html = preg_replace("/<div id=\"siteNotice\">.*<h1 class=\"firstHeading\">/s", '<h1 class="firstHeading">', $html);
	# Remove the links to the article in other-languages + footer
	$html = preg_replace("/<div id=\"p-lang\" class=\"portlet\">.*/s", '', $html);
}

function html_convert_links (&$html)
{
	global $INCLUDED_NS, $EXCLUDED_NS, $INCLUDED_PROJECTS;
	global $moulin_lang, $moulin_proj, $master_proj;

	# transform links to included namespaces
	foreach ($INCLUDED_NS as $ns)
	{
		$html = str_replace("moulin://".$master_proj."/".$moulin_lang."/".$ns['url'].":",
					"moulin://".$master_proj."-".$ns['ns']."/".$moulin_lang."/",
					$html);
	}

	# remove links to not-included namespaces
	foreach ($EXCLUDED_NS as $ns)
	{
		$url = "moulin://".$moulin_proj."/".$moulin_lang."/".$ns['url'].":";
		if (strpos($html, $url) !== FALSE) {
			$html = preg_replace("/<a href=\"moulin:\/\/".$master_proj."\/".$moulin_lang."\/".$ns['url']."\:[^>]*>([^<]*)<\/a>/",
					'$1',
					$html);
		}
	}

	# transform links to other-included projects
	foreach ($INCLUDED_PROJECTS as $pr)
	{
		if (strpos($html, $pr['url']) !== FALSE) {
			$html = preg_replace("/href=\"".str2regex ($pr['url'])."([^\"]+)\"/", 'href="'.$pr['internal'].'$1"', $html);
		}
	}

	# suppress links to non-existing articles
	if (strpos($html, "href=\"/wiki/") !== FALSE) {
		$html = preg_replace("/<a href=\"\/wiki\/[^>]*>(.*)<\/a>/",
					'$1',
					$html);
	}
	if (strpos($html, "href=\"http://pumbaa/") !== FALSE) {
		$html = preg_replace("/<a href=\"http\:\/\/pumbaa\/wiki\/[^>]*>([^<]*)<\/a>/",
					'$1',
					$html);
	}

}

# convert LaTeX images src to moulin-image:
function html_convert_math_images (&$html)
{
	global $moulin_lang;
	if (strpos($html, "/wiki/images/") !== FALSE) {
		$html = preg_replace("/\/wiki\/images\/".$moulin_lang."\/[a-z0-9]{1}\/[a-z0-9]{1}\/[a-z0-9]{1}\/([a-z0-9]*)\.png/",
					'moulin-image://'.$moulin_lang.'/$1',
					$html);
	}
}

# remove Image: links
function html_convert_images (&$html)
{
	global $moulin_lang, $moulin_proj, $master_proj;
	$url = "moulin://".$master_proj."/".$moulin_lang."/Image:";
	if (strpos($html, $url) !== FALSE) {
		$html = preg_replace("/<a href=\"moulin:\/\/".$master_proj."\/".$moulin_lang."\/Image\:[^>]*>([^<]*)<\/a>/",
			'',
			$html);
	}
}

function html_is_redirect (&$html)
{
	return strpos($html, '<span class="redirectText">') !== FALSE;
}

function html_extract_redirect (&$html)
{
	global $moulin_lang, $moulin_proj, $master_proj;
	$article = preg_replace("/<span class=\"redirectText\"><a href=\"moulin\:\/\/".$master_proj."\/".$moulin_lang."\/(.*)\" .*<\/span>/",
		'$1',
		$html);
	return $article;	
}


?>
