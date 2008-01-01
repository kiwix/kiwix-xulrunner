#!/usr/bin/ruby

usage	=<<END

Usage:	./create_docroot.rb <lang>
Ex:		./create_docroot.rb es
END

config	=<<END
<?php

$wgSitename         = "[[[TITLE]]]";
$wgLanguageCode		= "[[[LANG]]]";

$wgScriptPath       = "/wiki";
if ($_ENV['CRAWLER'])
    $wgArticlePath      = "moulin://[[[MASTER]]]/".$wgLanguageCode."/$1";
else
    $wgArticlePath      = "/".$wgLanguageCode."/[[[MASTER]]]/index.php/$1";

$wgDBname           = "reg_".$wgLanguageCode."_[[[MASTER]]]";
$wgDBuser           = "reg";
$wgDBpassword       = "reg";

$wgUploadDirectory	= "./images/".$wgLanguageCode;
$wgUploadPath		= "/wiki/images/".$wgLanguageCode;
$wgMathPath         = $wgUploadPath;
$wgMathDirectory    = $wgUploadDirectory;
$wgTmpDirectory     = $wgUploadDirectory;

$wgExtraNamespaces = array(
	//100 => "Portal",
);

//$wgNamespacesWithSubpages[100] = true;

?>
END

configsub =<<END
<?php

    include("../[[[LANG]]]/[[[MASTER]]]/config.php");

?>
END

index	=<<END
<?php

    $moulinLANG = "[[[LANG]]]/[[[PROJECT]]]";

    chdir("../../wiki");
    include("index.php");

?>
END

raise usage if ARGV[0].nil?

LANG	= ARGV[0]
DOCROOT	= "/var/www/reg.kiwix.org"

Dir.chdir(LANG)
Dir.mkdir("#{DOCROOT}/#{LANG}") if not File.exists?("#{DOCROOT}/#{LANG}")
#Dir.mkdir("../logs/#{LANG}") if not File.exists?("../logs/#{LANG}")

projects = {}
File.readlines("catalog").each do |l|
	p = l.chomp.split(":")
	next if p[0] == 'project_codes'
	projects[p[0]] = p[1]
end

projects.each do |project, title|
	master = project.split("-")[0]
	if (project == master)
		tconfig = String.new config
	else
		tconfig = String.new configsub
	end
	tindex	= String.new index
	[
		{:s => "PROJECT", :r => project},
		{:s => "MASTER", :r => master},
		{:s => "LANG", :r => LANG},
		{:s => "TITLE", :r => projects[master]}
	].each do |p|
		tconfig.gsub!("[[[#{p[:s]}]]]", p[:r])
		tindex.gsub!("[[[#{p[:s]}]]]", p[:r])
	end

	Dir.mkdir("#{DOCROOT}/#{LANG}/#{project}") if not File.exists?("#{DOCROOT}/#{LANG}/#{project}")
	
	File.open("#{DOCROOT}/#{LANG}/#{project}/config.php", "w") { |f| f.write tconfig }
	File.open("#{DOCROOT}/#{LANG}/#{project}/index.php", "w") { |f| f.write tindex }

end
