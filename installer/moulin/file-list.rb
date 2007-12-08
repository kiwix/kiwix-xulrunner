#!/usr/bin/ruby

=begin
	This script is a wizard to build a list of files.
	This list of files will be used to build an NSIS installer
	which won't bundle the files-to-be-installed.
	
	reg <reg@nurv.fr>
=end

def usage(exit_code)
	puts "Usage:\t#{$0} [switches]
        [#{$0} -e SOURCE_PATH COPY_SOURCE_PATH COPY_DEST_PATH LOG_FILE]

	-help		Displays this help message
	-defaults	Uses default values and run
	Else, runs through a wizard dialog.
	"
	exit(exit_code)
end

# Default Path values
$source_path = "../moulin/"
$copy_source_path = "..\\moulin"
$copy_dest_path = "$INSTDIR"
$log_file = "installer-files.log"
$content = String.new

# internal variables
$dirs = []
$files = []

# retrieves source path.
def welcome
	puts "This script will help you generate a FileCopy list for the NSIS uninstaller.\n"

	source_path()
end

def source_path
	puts "Please, enter your moulin's distribution path. This path will serve as source to list all files."
	puts "Distribution Path: [#{$source_path}]: "
	
	a = String.new $stdin.gets
	$source_path = a.chomp unless a.chomp.empty?
	puts "You choosed: #{$source_path}\n"
	path_position()
end

def path_position
	puts "Choose the relative path to your installation files from the _final installer_ on your _final media_."
	puts "Usually, your installer resides in cdrom/installer and your files in cdrom/moulin so path is `../moulin`."
	puts "Path to files (use windows separators. ie: dir\otherdir) [#{$copy_source_path}]: "
	
	a = String.new $stdin.gets
	$copy_source_path = a.chomp unless a.chomp.empty?
	
	puts "You choosed: #{$copy_source_path}\n"
	dest_path()
end

def dest_path
	puts "Choose the _final_ destination path of the files."
	puts "Default is using a user-selected installation path stored in $INSTDIR."
	puts "Final Installation Path [#{$copy_dest_path}]: "
	
	a = String.new $stdin.gets
	$copy_dest_path = a.chomp unless a.chomp.empty?
	install_log()
end

def install_log
	puts "Choose where to write the list. (You can use special value STDOUT."
	puts "Output file [#{$log_file}]: "
	
	a = String.new $stdin.gets
	$log_file = (a.match(/stdout/i)) ? $stdout : a.chomp unless a.chomp.empty?
	process()
end

def bye
	puts "Processing done."
	puts "source_path: #{$source_path}"
	puts "copy_source_path: #{$copy_source_path}"
	puts "log_file: #{$log_file}"
end

def process
	$source_path = $source_path.chop if $source_path[$source_path.length - 1, 1] == "/"
	$out = ($log_file.class == IO) ? $log_file : File.new($log_file, "w")
	recurs_display($source_path)
	
	# Write to File.
$out.puts "
; 
; 
; 
; INSTALLATION PART
; 
; 
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
; 
; UNINSTALLATION PART
; 
; 
;
"
	$files.each do |f|
		$out.puts "\tDelete \"#{f[2]}\""
	end
    $dirs.reverse_each do |d|
		$out.puts "\tRMDir \"#{d}\""
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
			#$out.puts "\tCreateDirectory `#{$copy_dest_path}#{wd}`"
			recurs_display(fp)
		else
			$files << ["#{$copy_source_path}#{wd}", "#{$copy_dest_path}#{wdd}", "#{$copy_dest_path}#{wd}"]
			#$out.puts "\t\tCopyFiles `#{$copy_source_path}#{wd}` `#{$copy_dest_path}#{wdd}`"
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

