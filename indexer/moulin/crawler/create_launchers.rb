#!/usr/bin/ruby

usage	=<<END

Usage:	./create_launchers.rb <lang> <dir>
Ex:		./create_laucnhers.rb es ltr
END

source	= '#!/usr/bin/ruby

STARTTIME = Time.now

# Global defines
LANG    = "[[[LANG]]]"
RTL     = [[[RTL]]]
PROJECT = "[[[PROJECT]]]"
MASTER = "[[[MASTER]]]"
NAMESPAC= {:id => 0, :name => nil}
UNIQID  = Time.now.to_i
UNIQFD  = "/home/reg/var/#{LANG}/#{PROJECT}_#{UNIQID}"
MDWKFD  = "/var/www/reg.kiwix.org/wiki"
DBICON  = "DBI:Mysql:reg_#{LANG}_#{PROJECT}"
DBIUSER = "reg"
DBIPASS = "reg"
BLOCK_SIZE	= 10485760 # 10MB

require "./#{LANG}_common.rb"

#INCLUDED_NS << {:raw => "Portal", :url => "Portal"}
#EXCLUDED_NS << {:raw => "Portal Discussion", :url => "Portal Discussion"}

require "../crawler.rb"

hello()

puts "Duration: #{(Time.now - STARTTIME) /60} mn."
'

raise usage if ARGV[1].nil?

LANG	= ARGV[0]
DIR		= ARGV[1]
RTL		= DIR =~ /rtl/i ? true : false

Dir.chdir(LANG)

projects = {}
File.readlines("catalog").each do |l|
	p = l.chomp.split(":")
	next if p[0] == 'project_codes'
	projects[p[0]] = p[1]
end

projects.each do |project, title|
	master = project.split("-")[0]
	tconfig = String.new source
	[
		{:s => "PROJECT", :r => project},
		{:s => "MASTER", :r => master},
		{:s => "LANG", :r => LANG},
		{:s => "RTL", :r => RTL.to_s},
	].each do |p|
		tconfig.gsub!("[[[#{p[:s]}]]]", p[:r])
	end

	File.open("crawler_#{project}.rb", "w") { |f| f.write tconfig }
	system("chmod +x crawler_#{project}.rb")

end
