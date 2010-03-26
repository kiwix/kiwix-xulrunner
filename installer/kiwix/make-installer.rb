#!/usr/bin/ruby
=begin
	This script build the nsi installer.
	It's a ruby script. This script is a wrapper over
	NSIS (Nullsoft Scriptable Install System). 
	
	reg <reg@nurv.fr>
	wilfredor <wilfredor@kiwix.org>
=end

require 'ftools'

class Nsi_output 
	attr_reader :arg
	def initialize(arg,files_list)
		# internal variables
		@files = []
		@dirs = []
		
		@files_list = files_list
		@message =""
		@arg = arg
	end
	
	def message
		@message
	end
	
	def make()
		if verify_dirs() then
			File.delete(@arg['nsi_output'])if File::exists?(@arg['nsi_output'])
			# make a new output file
			kiwixnsi = (@arg['nsi_output'].class == IO) ? @arg['nsi_output'] : File.new(@arg['nsi_output'], "w")
			# build the tree
			build_tree(@arg['source_path'])
			write_file(kiwixnsi)
			# compile the nsi file
			# -V0 hide log
			system("makensis -V0 #{@arg['nsi_output']}")
			success()
		end
	end
	  
	def write_file(kiwixnsi)
		# writing directory tree for the nsi	
		File.open(@arg['nsi_base'], "r") do |infile|
			while (line = infile.gets)
				kiwixnsi.puts "#{line}"
				if "#{line}".include?"CreateDirectory \"#{@arg['copy_dest_path']}\"" then
					# put the tree file on the instalation section nsi file
					kiwixnsi.puts "; INSTALLATION PART \n"
					kiwixnsi.puts "; Section Automatically generated \n"
					@dirs.each do |d|
						kiwixnsi.puts "\tCreateDirectory `#{d}`"
					end
					# if a portable packed installer
					if @arg['allinone'] then
						@files.each do |f|
							path_full = @arg['source_path'].gsub("/","\\")+f[0].gsub("..","")
							file_out = f[0].gsub("..","").gsub("\\"+File.basename(path_full),"")
							kiwixnsi.puts "\tSetOutPath \"#{@arg['copy_dest_path']}#{file_out}\""
							kiwixnsi.puts "\tFile `#{path_full}`"
						end
					else
						# if is a installer for copy from a DVD
						@files.each do |f|
							kiwixnsi.puts "\tCopyFiles /SILENT `#{f[0]}` `#{f[1]}`"
					end
					end
					kiwixnsi.puts "\n; EXTRACT STUB \n"				
				end
			end
		end  	  
		kiwixnsi.close 
	end

	# build tree folder
	def build_tree(dvd_path)
			@files_list.each do |dire| 
				current_dir = dire.gsub("/"+File.basename(dire),"").gsub("/","\\")
				@dirs << @arg['copy_dest_path'] + current_dir
				Dir.glob(dvd_path+"#{dire}").each do |f|			
					current = f.gsub(dvd_path,"").gsub("/","\\")
					if File.directory? f
						@dirs << @arg['copy_dest_path'] + current
					else
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
				@message =  "Done!. #{arg['bin_output']} is in #{arg['install_dir']}"				
			else
				# try make the installer and show all log messages
				system("makensis #{@arg['nsi_output']}")
			end
	end
	
	def is_dir(dir)
		if !File.directory? @arg[dir] then
			@message = "\n Error. Directory \"#{@arg[dir]}\" not found \n"
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
	puts "\n ruby make-installer.rb --path=<path_to_the_dvd_file_tree> <--allinone>\n"
	puts "\n allinone: Build a installer packed portable"
	exit()
end

#get argument value
def get_argument(argument)
	if (argument == nil) then
		return false
	elsif argument.include? "=" then		
		return (argument.split "=")[1]				
	else
		return true		
	end
end

begin
	$source_path = get_argument(ARGV[0])
	if !$source_path then
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
	
	puts out.message
end