#!/usr/bin/ruby
=begin
       This script build the nsi installer.
       It's a ruby script. This script is a wrapper over
       NSIS (Nullsoft Scriptable Install System).

       Renaud Gaudin <rgaudin@gmail.com>
       Wilfredo Rodriguez <wilfredor@kiwix.org>
=end

# library for file management
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

       # main function in the installer creation
       def make()
               if verify_dirs()
                       # delete nsi file if exist
                       File.delete(@arg['nsi_output'])if File::exists?(@arg['nsi_output'])
                       # build the tree
                       in_tree(@arg['source_path'])
                       # put the tree in nsi
                       write_file((@arg['nsi_output'].class == IO) ? @arg['nsi_output'] :
File.new(@arg['nsi_output'], "w"))
                       # compile the nsi file
                       # -V0 hide log
                       system("makensis -V0 #{@arg['nsi_output']}")
                       # verify the output file binary
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
                               # path of file to install
                               path_full = escape_backslash(@arg['source_path'])+f[0].gsub("..","")
                               # file to install
                               file_out = f[0].gsub("..","").gsub("\\"+File.basename(path_full),"")
                               $result += "\tSetOutPath \"#{@arg['copy_dest_path']}#{file_out}\"\n"
                               $result += "\tFile `#{path_full}`\n"
                       end
               else
               # if is a installer for copy from a DVD or simple copy
                       @files.each do |f|
                               $result += "\tCopyFiles /SILENT `#{f[0]}` `#{f[1]}` `#{f[2]}`\n"
                       end
               end
               $result += "\n; EXTRACT STUB \n"
               # return tree section for put in nsi template
               return $result
       end

       def write_file(kiwixnsi)
               # reading nsi base to generate the final nsi
               File.open(@arg['nsi_base'], "r") do |infile|
                       while (line = infile.gets)
                       # looking for a special line for use as a reference point
                               if line.include?"CreateDirectory \"#{@arg['copy_dest_path']}\""
                               # writing directory tree for the nsi
                                       kiwixnsi.puts out_tree
                               elsif line.include? "AddSize kiwix_size"
                               # space required for installation
                                       kiwixnsi.puts "\tAddSize #{@kiwix_size} ;Size automatically calculated"
                               else
                                       kiwixnsi.puts line
                               end
                       end
               end
               kiwixnsi.close
       end

       # build tree folder saving folders and files
       def in_tree(dvd_path)
               @files_list.each do |dire|
                       unless dire.empty?
							   current_dir = escape_backslash(dire.gsub("/"+File.basename(dire),""))
                               @dirs << @arg['copy_dest_path'] + current_dir
                       end
                       Dir.glob(dvd_path+"#{dire}").each do |f|
                               current = escape_backslash(f.gsub(dvd_path,""))
                               if File.directory? f
                                       @dirs << @arg['copy_dest_path'] + current
                               else
                                       # sum the size of each file to calculate the space required to install
                                       file_size = File.stat(f).size
                                       @kiwix_size += file_size
                                       wd = escape_backslash(f.gsub(dvd_path,@arg['relative_path']))
                                       @files << ["#{wd}", "#{@arg['copy_dest_path']}#{current}", "#{file_size}"]
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
                               # acumule the log message
                               @log +=  "\nDone!. #{arg['bin_output']} is in #{arg['install_dir']}"
                       else
                               # try make the installer and show all log messages
                               system("makensis #{@arg['nsi_output']}")
                       end
       end

       #look if is a directory
       def is_dir(dire)
               unless File.directory? @arg[dire]
                       # acumule the log message
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

       #if is windows, replace to backslash
       def escape_backslash(path_value)
               return @arg['windows']?path_value.gsub("/","\\"):path_value;
       end

end

#show help message
def help()
       puts "\n\t ruby make-installer.rb --path=<dvd_file_tree_path> <--allinone>\n"
       puts "\n\t allinone: Build a installer packed portable"
       exit()
end

#get argument value
def get_argument(argument)
       if argument.nil?
               return false
       # regurn the path value
       elsif (argument.include? "--path=") || (argument.include? "--lang=")
               return argument.split(/=/)[1]
       # if the installer standalone
       elsif argument=="--allinone"
               return true
       else
               return false
       end
end

begin
       # check if you have sent at least one argument
       if (ARGV.empty?)
               help
       else
               # check if it has sent as a parameter "--path"
               $source_path = get_argument(ARGV[0])
               if ($source_path == false)
                       help
               end
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
               # variable for a standalone installer
               "allinone"       => get_argument(ARGV[1]),
               # get path value
               "source_path"    => $source_path,
               # output nsi,dir and binary installer file
               "nsi_output"     => "kiwix-install.nsi",
               "bin_output"     => "kiwix-install.exe",
               # staff needed to build the final file
               "nsi_base"       => "kiwix-install.nsi.tmpl",
               # directory where the installer will be copied
               "install_dir"    => "#{$source_path}install/",
               # defined installation directory nsi_base
               "copy_dest_path" => "$INSTDIR",
               # path relative to the installer with respect to source_path
               "relative_path"  => "..",
               # opearative system backslash
               "windows" => 0
       }
       # verify arguments need
       out = Nsi_output.new(arg,files_list)
       # build the installer
       out.make()
       # displays a message to see how everything went
       puts out.log
end