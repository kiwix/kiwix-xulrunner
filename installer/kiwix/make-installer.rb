#!/usr/bin/ruby
=begin
	This script build the nsi installer.
	It's a ruby script. This script is a wrapper over
	NSIS (Nullsoft Scriptable Install System). 
	
	Renaud Gaudin <rgaudin@gmail.com>
    Wilfredo Rodriguez <wilfredor@kiwix.org>
=end

require 'ftools'

class Nsi_output 
	attr_reader :log,:kiwix_size,:arg
	def initialize(arg,files_list)
		# internal variables
		@files = []
		@dirs = []
		@files_list = files_list
		@arg = Hash.new
		@arg = arg
		@kiwix_size = 0
		@log = ""
	end
	
	def make()
		if verify_dirs()
			File.delete(@arg['nsi_output'])if File::exists?(@arg['nsi_output'])
			# build the tree
			in_tree(@arg['source_path'])
			write_file((@arg['nsi_output'].class == IO) ? @arg['nsi_output'] : File.new(@arg['nsi_output'], "w"))
			# compile the nsi file
			# -V0 hide log
			system("makensis -V0 #{@arg['nsi_output']}")
			success()
		end
	end
	
	# return the tree 
	def out_tree()
		# put the tree file on the instalation section nsi file
		$result = "; INSTALLATION PART \n" +
				  "; Section Automatically generated \n"
		@dirs.each do |d|
			$result += "\tCreateDirectory `#{d}` \n"
		end
		# if a portable packed installer
		if @arg['allinone']
			@files.each do |f|
				path_full = @arg['source_path'].gsub("/","\\")+f[0].gsub("..","")
				file_out = f[0].gsub("..","").gsub("\\"+File.basename(path_full),"")
				$result += "\tSetOutPath \"#{@arg['copy_dest_path']}#{file_out}\"\n"
				$result += "\tFile `#{path_full}`\n"
			end
		else
		# if is a installer for copy from a DVD or simple copy
			@files.each do |f|
				$result += "\tCopyFiles /SILENT `#{f[0]}` `#{f[1]}`\n"
			end
		end
		$result += "\n; EXTRACT STUB \n"
		return $result
	end
	
	def write_file(kiwixnsi)
		# writing directory tree for the nsi	
		File.open(@arg['nsi_base'], "r") do |infile|
			while (line = infile.gets)				
				if line.include?"CreateDirectory \"#{@arg['copy_dest_path']}\"" 
					kiwixnsi.puts out_tree
				elsif line.include? "AddSize kiwix_size" 
					kiwixnsi.puts "\tAddSize #{@kiwix_size} ;Size automatically calculated"
				else				
					kiwixnsi.puts line
				end
			end
		end  	  
		kiwixnsi.close 
	end

	# build tree folder
	def in_tree(dvd_path)
		@files_list.each do |dire| 	
			unless dire.empty?
				current_dir = dire.gsub("/"+File.basename(dire),"").gsub("/","\\")
				@dirs << @arg['copy_dest_path'] + current_dir
			end
			Dir.glob(dvd_path+"#{dire}").each do |f|			
				current = f.gsub(dvd_path,"").gsub("/","\\")
				if File.directory? f
					@dirs << @arg['copy_dest_path'] + current
				else
					# installer size
					@kiwix_size += File.stat(f).size
					wd = f.gsub(dvd_path,@arg['relative_path']).gsub("/","\\")
					@files << ["#{wd}", "#{@arg['copy_dest_path']}#{current}", "#{@arg['copy_dest_path']}#{current}"]
				end
			end
		end
	end
		
	# final process
	def success
			# verify if the binary installer exist
			if (File.exist?("#{@arg['bin_output']}"))
				# copy the file in the DVD file hierarchy
				system("cp #{@arg['bin_output']} \"#{@arg['install_dir']}\"")
				@log +=  "\nDone!. #{arg['bin_output']} is in #{arg['install_dir']}"				
			else
				# try make the installer and show all log messages
				system("makensis #{@arg['nsi_output']}")
			end
	end
	
	#look if is a directory
	def is_dir(dire)
		unless File.directory? @arg[dire]
			@log += "\n Error. Directory \"#{@arg[dire]}\" not found \n"
			return false
		else
			return true
		end
	end
	
	def verify_dirs()
		# directory exist	
		return is_dir('source_path') && is_dir('install_dir')
	end
	
end

def help()
	puts "\n\t ruby make-installer.rb --path=<dvd_file_tree_path> <--allinone>\n"
	puts "\n\t allinone: Build a installer packed portable"
	exit()
end

#get argument value
def get_argument(argument)
  if argument.nil?
    return false
  elsif argument =~ /=/    
    return argument.split(/=/)[1]        
  else
    return true
  end
end

begin

	unless ARGV.empty?
	  $source_path = get_argument(ARGV[0])
	else
		help()
	end
	
	# list files for build the installer
	# /**/** is a recursive search in the folder
	files_list = [
		   "/kiwix/{kiwix.exe,application.ini}",
		   "/data/**/**",				
		   "/kiwix/xulrunner/**/**",       
		   "/kiwix/chrome/**/**",          
		   "/kiwix/defaults/**/**",        
		   "/kiwix/components/*.{dll,xpt,js}" 
		]
	arg = Hash.new
	arg = {
		"allinone"       => get_argument(ARGV[1]),
		# get path value
		"source_path"    => $source_path,
		# output nsi,dir and binary installer file
		"nsi_output"     => "kiwix-install.nsi",
		"bin_output"     => "kiwix-install.exe",
		"nsi_base"       => "kiwix-install.nsi.tmpl",
		"install_dir"    => "#{$source_path}install/",
		"copy_dest_path" => "$INSTDIR",
		"relative_path"  => ".."
	}
	# verify arguments need
	out = Nsi_output.new(arg,files_list)
	out.make()
	puts out.log
end	