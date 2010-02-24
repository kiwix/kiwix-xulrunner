#!/usr/bin/ruby
=begin
	This script build the nsi installer.
	It's a ruby script. This script is a wrapper over
	NSIS (Nullsoft Scriptable Install System). 
	
	reg <reg@nurv.fr>
	wilfredor <wilfredor@kiwix.org>
=end

require 'ftools'
def usage()
	puts "\n ruby make-installer.rb --path=<path_to_the_dvd_file_tree>\n"
	exit()
end
# directory tree used in the nsi installer
$copy_dest_path = "$INSTDIR"

# relative path for the installer 
# really in DVD_PATH/kiwix/install/win/
$relative_path = ".."
# file generated for build the install and unistall
# section in the nsi file
$nsi_base = "kiwix-install.nsi.tmpl"
$nsi_output = "kiwix-install.nsi"

# internal variables
$files = []
$dirs = []

# list files for build the installer
# /**/** is a recursive search in the folder
$files_list = [
   "/kiwix/{kiwix.exe,application.ini}",
   "/data/**/**",				
   "/kiwix/xulrunner/**/**",       
   "/kiwix/chrome/**/**",          
   "/kiwix/defaults/**/**",        
   "/kiwix/components/*.{dll,xpt,js}" 
]

# make a nsis file buildind the file tree from the path
def process
	File.delete($nsi_output)if File::exists?($nsi_output)
	$source_path = $source_path.chop if $source_path[$source_path.length - 1, 1] == "/"
	# make a new output file
	kiwixnsi = ($nsi_output.class == IO) ? $nsi_output : File.new($nsi_output, "w")
	# build the tree
	build_tree($copy_source_path)
	# writing directory tree for the nsi	
	File.open($nsi_base, "r") do |infile|
		while (line = infile.gets)
			kiwixnsi.puts "#{line}"
			if "#{line}".include?"CreateDirectory \"$INSTDIR\"" then
				# put the tree file on the instalation section nsi file
				kiwixnsi.puts "; INSTALLATION PART \n"
				kiwixnsi.puts "; Section Automatically generated make-installer.rb \n"
				$dirs.each do |d|
					kiwixnsi.puts "\tCreateDirectory `#{d}`"
				end
				$files.each do |f|
					kiwixnsi.puts "\tCopyFiles `#{f[0]}` `#{f[1]}`"
				end
				kiwixnsi.puts "\n; EXTRACT STUB \n"				
			end
		end
	end  	  
	kiwixnsi.close 
	# compile the nsi file
	# /V0 hide log
	system("makensis /V0 #{$nsi_output}")
end

# build tree folder
def build_tree(dvd_path)
	$files_list.each do |dire| 
		current_dir = dire.gsub("/"+File.basename(dire),"").gsub("/","\\")
		$dirs << $copy_dest_path + current_dir
		Dir.glob(dvd_path+"#{dire}").each do |f|
			wd = f.gsub(dvd_path,$relative_path).gsub("/","\\")
			current = f.gsub(dvd_path,"").gsub("/","\\")
			if File.directory? f
				$dirs << $copy_dest_path + current
			else
				$files << ["#{wd}", "#{$copy_dest_path}#{current}", "#{$copy_dest_path}#{current}"]
			end
		end
	end
	puts "Done!!. Please, remember copy #{$nsi_output.gsub("nsi","exe")} to DVD_PATH/kiwix/install/win/"
end

# argument path
if ARGV[0].nil? 
	usage() # show help
else	
	if ARGV[0].include?"--path="
		# get path value
		$copy_source_path = ARGV[0].gsub "--path=",""
		# directory exist
		if File.directory? $copy_source_path
			$source_path = $copy_source_path
			process() # run main procedure
		else
			puts "\n Error. The directory \"#{$copy_source_path}\" not found \n"
		end	
	else
		usage() # show help
	end
end	