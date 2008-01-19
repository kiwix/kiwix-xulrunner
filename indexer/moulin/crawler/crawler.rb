#!/usr/bin/ruby

require 'dbi'

# replacement arrays for accented-latin search facilities
SP=["Â","Á","À","È","É","Ê","Ë","Í","Ì","Î","Ò","Ó","Ô","Œ","Ñ","Ú","Ù","Ü","Û","Ÿ","Ç","«","»","¿","¡","—","â","á","à","è","é","ê","ë","í","ì","ï","î","ò","ó","ô","œ","ñ","ú","ü","ù","û","ÿ","ç"]
STD=["A","A","A","E","E","E","E","I","I","I","O","O","O","OE","N","U","U","U","U","Y","C","<",">","?","!","-","a","a","a","e","e","e","e","i","i","i","i","o","o","o","oe","n","u","u","u","u","y","c"]

INDEX_SCHEMA= "CREATE TABLE windex (
	id INTEGER PRIMARY KEY,
	title VARCHAR(250),
	archive INTEGER,
	startoff INTEGER,
	redirect VARCHAR(250),
	stdtitle VARCHAR(250)
);"

# create uniq folder to store datas
Dir.mkdir( UNIQFD ) unless File.exists?( UNIQFD )

# move to mediawiki's place
Dir.chdir( MDWKFD )

# Check DB connection
begin
	INDEXDB = DBI.connect( "DBI:SQLite3:#{UNIQFD}/index.db" )
    DBH = DBI.connect(DBICON, DBIUSER, DBIPASS)
rescue => e
     puts "Unable to connect to Database: #{e.to_s}"
     exit
end

TOTAL_ARTICLES = DBH.select_one("SELECT COUNT(*) FROM page WHERE page_namespace=#{NAMESPAC[:id]}")[0].to_i

def hello
    process_articles()
end

def escape_string( str )
	str.gsub(/"/, '' )
end

def sp2std( str )
    SP.each_index do |i|
        str.gsub!("#{SP[i]}","#{STD[i]}")
    end
    return str
end

def cold_sqlite_req( req )
	begin
		indexdb = DBI.connect( "DBI:SQLite3:#{UNIQFD}/index.db" )
	rescue Exception => e
		puts e.message
		puts e.backtrace
	end
	indexdb.do( req )
	indexdb.disconnect
end

def html_for( title, pi )
	result = ""
	if not (NAMESPAC[:name].nil?)
		ftitle = "#{NAMESPAC[:name]}:#{title}"
	else
		ftitle = title
	end	
	puts "#{pi}: #{ftitle}\n"
	
	title_file = "/tmp/moulin_#{PROJECT}-title_#{UNIQID}"
	File.open( title_file, "w+" ) { |f| f.write ftitle }
	
	# process the wikipedia
	result = %x[CRAWLER="y" MLLANG="#{LANG}" MLPROJECT="#{PROJECT}" /usr/local/bin/php -f #{MDWKFD}/cmd.php #{title_file}]
	
	#transform html
	# exclude the top and left frames
	result.gsub!( /.*<div id=\"column-content\">(.*)/m, '\1' )
	result.gsub!( /(.*)<div id=\"column-one\">.*/m, '\1' )
	# remove the siteNotice (donate to wikipedia...)
	result.gsub!( /<div id=\"siteNotice\">.*<h1 class=\"firstHeading\">/m, '<h1 class="firstHeading">' )
	# Remove the Images links
	#result.gsub!( /<a href=\"[^"><]*\" class=\"new\" title=\"Image:[^"><]*\">Image\:[^<]*<\/a>/, '' )

	#remove links and image to decorative images (like category illus)
	result.gsub!( /<a href=\"[^"><]*\" title=\"#{LOCALIZED_STRINGS[:NSImage][:raw]}\:([^<]*)\.(png|jpg|bmp|svg|gif)\">#{LOCALIZED_STRINGS[:NSImage][:raw]}\:([^<]*)\.(png|jpg|bmp|svg|gif)<\/a>/, '' )
	# Remove the links to the article in other-languages + footer
	result.gsub!( /<div id=\"p-lang\" class=\"portlet\">.*/m, '' )
	# Remove the links to non-existent articles
	result.gsub!( /<a href=\"[^"><]*\" class=\"new\" title=\"[^"><]*\">([^<]*)<\/a>/, '\1' )
	# correct links to math images
	result.gsub!( Regexp.new("/wiki/images/#{LANG}/[a-z0-9]{1}/[a-z0-9]{1}/[a-z0-9]{1}/([a-z0-9]*)\.png"), "moulin-image://#{LANG}/" << '\1' )
	
	INCLUDED_NS.each do |ns|
		result.gsub!(Regexp.new("href=\"moulin://#{MASTER}/#{LANG}/#{ns[:url]}\:([^<\"]*)\""), "href=\"moulin://#{MASTER}-#{ns[:ns]}/#{LANG}/" << '\1' << "\"")
	end

	# remove links to not-included namespaces
	EXCLUDED_NS.each do |ns|
		result.gsub!(Regexp.new("<a href=\"moulin://#{MASTER}/#{LANG}/#{ns[:url]}\:([^<\"]*)\" title=\"[^\"><]*\">([^<]*)<\/a>"), '\2' )	
	end	

	# tranform links to online projects to in-moulin
	INCLUDED_PROJECTS.each do |pr|
		result.gsub!(Regexp.new("<a href=\"#{pr[:url]}([^\"]+)"), "<a href=\"#{pr[:internal]}" + '\1')
	end

	#remove links to non-existing articles (should be red)
	result.gsub!(Regexp.new("<a href=\"http\:\/\/pumbaa\/([^<\"]*)\" title=\"[^\"><]*\">([^<]*)<\/a>"), '\2' )

	#remove Image names
	result.gsub!(Regexp.new("\<span\>#{LOCALIZED_STRINGS[:NSImage][:raw]}\:([^<]*)\.(png|jpg|bmp|svg|gif)</span>"), "") unless LOCALIZED_STRINGS[:NSImage].nil?

	# remove temp file
	File.delete(title_file) if File.exists?(title_file)

	return result.chomp
end

def redir_for( latest )
    begin
        text = DBH.select_one( "select old_text from text where old_id='#{latest}';" )[0]
    rescue
        text = ""
    end
  
    s = text.scan( /.*#REDIRECT(ION)?.{0,2}\:?.{0,2}\[\[(.*)\]\]$.*/mi )
    
    if s.length > 0
		r = s.first.to_s
		INCLUDED_NS.each do |ns|
			r.gsub!(Regexp.new("^#{ns[:raw]}\:(.*)" ), "moulin://#{MASTER}-#{ns[:ns]}/#{LANG}/" + '\1')
		end
    	return r
    else
    	return false
    end
#    text.gsub!( /\[\[(.*)\]\].{0,2}\:?.{0,2}REDIRECT(ION)?#$.*/mi, '\1' )
#    text.gsub!( /.*#REDIRECT(ION)?.{0,2}\:?.{0,2}\[\[(.*)\]\]$.*/mi, '\2' )
#    return text
end

# article processing loop
def process_articles
    archive	= 0
    data	= File.open( "#{UNIQFD}/#{archive}", "w+" )
    
    INDEXDB.do( INDEX_SCHEMA )
    pi = 0
    
    res = DBH.execute("SELECT page_title, page_is_redirect, page_latest FROM page WHERE page_namespace=#{NAMESPAC[:id]} ORDER BY page_title ASC")
    while not res.nil? and row = res.fetch do
	    if pi % 100 == 0
    		GC.start
    	end
    	
    	title = row[0]
    	is_redirect = row[1].to_i
    	latest = row[2]
    	r = redir_for( latest )
    	if not r === false
    		redir = r
    		startoff = data.pos
    	else
    		content = html_for( title, pi )
    		startoff = data.pos
    		data.write( content )
    		data.flush
    		content = nil
    		redir = ""
    	end
	begin 
		INDEXDB.do( "INSERT INTO windex (title, archive, startoff, redirect, stdtitle) VALUES ( \"#{escape_string( title )}\", \"#{archive}\", #{startoff}, \"#{escape_string( redir )}\", \"#{escape_string(sp2std(title))}\" );" )
	rescue Exception => e
		puts "Failed at executing query: INSERT INTO windex (title, archive, startoff, redirect, stdtitle) VALUES ( \"#{escape_string( title )}\", \"#{archive}\", #{startoff}, \"#{escape_string( redir )}\", \"#{escape_string(sp2std(title.to_s).to_s)}\" );"
		puts e.message
		puts e.backtrace
		raise
	end
    	if data.pos > BLOCK_SIZE then
    		data.close
    		Thread.new{ system("/bin/bzip2 #{UNIQFD}/#{archive}") }
    		archive += 1
    		data	= File.open( "#{UNIQFD}/#{archive}", "w+" )
    	end
	pi = pi.next
    end
    
    Thread.new{ system("/bin/bzip2 #{UNIQFD}/#{archive}") }
    
    res.finish
    data.close
    
    bye()
end

def bye

    begin
        DBH.disconnect
        INDEXDB.disconnect
    end
end


