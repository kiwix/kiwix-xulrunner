#!/usr/bin/ruby

STARTTIME = Time.now

# Global defines
LANG    = "fa"
RTL     = true
PROJECT = "source-category"
MASTER = "source"
NAMESPAC= {:id => 14, :name => "رده"}
UNIQID  = Time.now.to_i
UNIQFD  = "/home/reg/var/#{LANG}/#{PROJECT}_#{UNIQID}"
MDWKFD  = "/var/www/reg.kiwix.org/wiki"
DBICON  = "DBI:Mysql:reg_#{LANG}_#{MASTER}"
DBIUSER = "reg"
DBIPASS = "reg"
BLOCK_SIZE	= 10485760 # 10MB

require "./#{LANG}_common.rb"

#INCLUDED_NS << {:raw => "Portal", :url => "Portal", :ms => "portal"}
EXCLUDED_NS << {:raw => "درگاه", :url => "%D8%AF%D8%B1%DA%AF%D8%A7%D9%87"}
EXCLUDED_NS << {:raw => "بحث درگاه", :url => "%D8%A8%D8%AD%D8%AB_%D8%AF%D8%B1%DA%AF%D8%A7%D9%87"}
EXCLUDED_NS << {:raw => "مؤلف", :url => "%D9%85%D8%A4%D9%84%D9%81"}
EXCLUDED_NS << {:raw => "بحث مؤلف", :url => "%D8%A8%D8%AD%D8%AB_%D9%85%D8%A4%D9%84%D9%81"}
EXCLUDED_NS << {:raw => "برگه", :url => "%D8%A8%D8%B1%DA%AF%D9%87"}
EXCLUDED_NS << {:raw => "بحث برگه", :url => "%D8%A8%D8%AD%D8%AB_%D8%A8%D8%B1%DA%AF%D9%87"}

require "../crawler.rb"

hello()

puts "Duration: #{(Time.now - STARTTIME) /60} mn."
