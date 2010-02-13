#!/usr/bin/ruby

=begin
	This script is a wizard to build a list of files.
	This list of files will be used to build an NSIS installer
	which won't bundle the files-to-be-installed.
	
	reg <reg@nurv.fr>
=end

def usage(exit_code)
	puts "Usage:\t#{$0} [switches]
        [#{$0} -e SOURCE_PATH COPY_SOURCE_PATH COPY_DEST_PATH LOG_FILE>]

	-help		Displays this help message
	-defaults	Uses default values and run
	Else, runs through a wizard dialog.
	"
	exit(exit_code)
end

# Default Path values
# This path is necesary for make the
# Directory tree used in the nsi installer
# Place here the main kiwix application folder
$source_path = "../kiwix/"
$copy_source_path = "..\\kiwix"
$copy_dest_path = "$INSTDIR"
# File generated for build the install and unistall
# section in the nsi file
$log_file = "installer-files"
$content = String.new

# internal variables
$dirs = []
$files = []
$formats = []

# welcome and help start message
def welcome
	puts ".-------------------------------------------------------------.\n"
	puts "|   This script will help you generate a                      |\n"
	puts "|   FileCopy Section list for the NSIS installer file.        |\n"
	source_path()
end

# retrieves source path.
def source_path
	puts "|   This path will serve as source to list all files.         |\n"
	puts "|   The output is a default file called 'installer-files'     |\n"	
	puts "|                                                             |\n"
	puts "|   NOTE: Please, remember copy all the 'installer-files'     |\n"
	puts "|         content in the nsis      installer file             |\n"
	puts "'-------------------------------------------------------------'\n\n"
	puts "Please, enter your kiwix's distribution path.\nDefault distribution Path: [#{$source_path}]: "
	
	a = String.new $stdin.gets
	$source_path = a.chomp unless a.chomp.empty?
	puts "\nYou choosed: #{$source_path}\n"
	path_position()
end

def path_position
	puts "Choose the relative path to your installation files \n"
	puts "from the _final installer_ on your _final media_. \n"
	puts "Usually, your installer resides in cdrom/installer \n"
	puts "and your files in cdrom/kiwix so path is `../kiwix`.\n\n"
	puts "Path to files (use windows separators. ie: dir\otherdir) [#{$copy_source_path}]: "
	
	a = String.new $stdin.gets
	$copy_source_path = a.chomp unless a.chomp.empty?
	
	puts "\nYou choosed: #{$copy_source_path}\n\n"
	dest_path()
end

def dest_path
	puts "Choose the _final_ destination path of the files.\n"
	puts "Default is using a user-selected installation path stored in $INSTDIR.\n"
	puts "Final Installation Path [#{$copy_dest_path}]: "
	
	a = String.new $stdin.gets
	$copy_dest_path = a.chomp unless a.chomp.empty?
	install_log()
end

def install_log
	puts "Choose where to write the list. (You can use special value STDOUT.\n"
	puts "Output file [#{$log_file}]: "
	
	a = String.new $stdin.gets
	$log_file = (a.match(/stdout/i)) ? $stdout : a.chomp unless a.chomp.empty?
	process()
end

def bye
	puts "Processing done.\n"
	puts "source_path: #{$source_path} \n"
	puts "copy_source_path: #{$copy_source_path} \n"
	puts "log_file: #{$log_file} \n"
	puts "Please, remember copy all the #{$log_file} content in the nsis file \n"
end

def process
	$source_path = $source_path.chop if $source_path[$source_path.length - 1, 1] == "/"
	$out = ($log_file.class == IO) ? $log_file : File.new($log_file, "w")
	recurs_display($source_path)
	
# Write to File.
$out.puts "
; 
; Please, Copy the follow section to the kiwix nsis file
; 
; INSTALLATION PART
;
"
	$dirs.each do |d|
		$out.puts "\tCreateDirectory `#{d}`"
	end
	$files.each do |f|
		$out.puts "\tCopyFiles `#{f[0]}` `#{f[1]}`"
	end
	$out.puts "
; 
; 
; EXTRACT STUB
;
"
	$files.each do |f|
		$out.puts "\tCopyFiles `raw-format` `#{f[1]}\\format`" if f[2] =~ /datas.*format/
		$out.puts "\tnsexec::exectolog `\"$EXEDIR\\bunzip2.exe\" \"#{f[2]}\"`" if f[2] =~ /datas.*[0-9]\.(bz2|gz)/
	end
    bye()
end

def recurs_display(dir)
	Dir.foreach(dir) do |f|
		next if [".","..", "moulin-linux","xulrunner-linux","moulin-mac.app","installed"].include? f
		fp	= dir+File::SEPARATOR+f
		wd	= fp.slice($source_path.length, fp.length).gsub("/","\\")
		wdd	= wd.slice(0, (wd.length - (f.length + 1)))
		if (File.ftype(fp) == "directory")
			$dirs << "#{$copy_dest_path}#{wd}"
			recurs_display(fp)
		else
			$files << ["#{$copy_source_path}#{wd}", "#{$copy_dest_path}#{wdd}", "#{$copy_dest_path}#{wd}"]
			
			$formats << ["raw-format", "#{$copy_dest_path}#{wdd}\\format", "#{$copy_dest_path}#{wd}"] if fp =~ /datas.*format/
		end
	end
end

# test if advanced mode
if (ARGV.length == 5 and ARGV[0] == "-e") # assuming expert mode: take care !
    $source_path = ARGV[1]
    $copy_source_path = ARGV[2]
    $copy_dest_path = ARGV[3]
    $log_file = ARGV[4]
    process()
elsif (ARGV.length == 1 and ARGV[0].match(/default/))
	process()
elsif (ARGV.length == 1 and ARGV[0].match(/help/))
	usage(0)
else
	welcome() # Launch the wizard.
end

