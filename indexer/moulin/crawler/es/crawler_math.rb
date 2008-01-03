#!/usr/bin/ruby

require 'dbi'

#puts "#{Time.now.to_s} Starting..."

LANG = "es"

$IMAGES_FOLDER = "/var/www/reg.kiwix.org/wiki/images/#{LANG}"
$BLOCK_SIZE	= 5242880 # 5MB
$DATA_PATH	= "/home/reg/var/#{LANG}/_math/"
INDEX_SCHEMA= "CREATE TABLE windex (
	id INTEGER PRIMARY KEY,
	title VARCHAR(250),
	archive INTEGER,
	startoff INTEGER,
	redirect VARCHAR(250),
	stdtitle VARCHAR(250)
);"

Dir.mkdir( $DATA_PATH )

$index	= DBI.connect( "DBI:Sqlite3:#{$DATA_PATH}index.db" )
$archive	= 0
$data	= File.open( "#{$DATA_PATH}#{$archive}", "w+" )

$index.do( INDEX_SCHEMA )

$all_md5 = []

def recurs_browse( folder )
	d = Dir.new( folder )
	d.each do |f|
		next if ["..","."].include? f
		file =  "#{d.path}/#{f}"
		md5 = f.gsub('.png','')
		if file =~ /^.*\.png$/ and not $all_md5.include? md5
#		  puts f
    	   content = File.open( file ).read
    	   startoff = $data.pos
    	   $data.write( content )
			puts "INSERT INTO windex (title, archive, startoff) VALUES ( \"#{md5}\", \"#{$archive}\", #{startoff} );"
    	   #$index.do( "INSERT INTO windex (title, archive, startoff) VALUES ( \"#{md5}\", \"#{$archive}\", #{startoff} );" )
    	   $all_md5 << md5
    	   if $data.pos > $BLOCK_SIZE then
    	   	$data.close
    	   	$archive += 1
    	   	$data	= File.open( "#{$DATA_PATH}#{$archive}", "w+" )
    	   end
		end
		recurs_browse( file ) if File.directory? file			
	end
end

recurs_browse( $IMAGES_FOLDER )

$data.close
$index.disconnect

#puts "#{Time.now.to_s} Done."

