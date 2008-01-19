#!/usr/bin/ruby

STARTTIME = Time.now

# Global defines
LANG    = "ar"
RTL     = true
PROJECT = "source-category"
MASTER = "source"
NAMESPAC= {:id => 14, :name => "تصنيف"}
UNIQID  = Time.now.to_i
UNIQFD  = "/home/reg/var/#{LANG}/#{PROJECT}_#{UNIQID}"
MDWKFD  = "/var/www/reg.kiwix.org/wiki"
DBICON  = "DBI:Mysql:reg_#{LANG}_#{MASTER}"
DBIUSER = "reg"
DBIPASS = "reg"
BLOCK_SIZE	= 10485760 # 10MB

require "./#{LANG}_common.rb"

#INCLUDED_NS << {:raw => "Portal", :url => "Portal", :ms => "portal"}
EXCLUDED_NS << {:raw => "مؤلف", :url => "%D9%85%D8%A4%D9%84%D9%81"}
EXCLUDED_NS << {:raw => "نقاش المؤلف", :url => "%D9%86%D9%82%D8%A7%D8%B4_%D8%A7%D9%84%D9%85%D8%A4%D9%84%D9%81"}
EXCLUDED_NS << {:raw => "صفحة", :url => "%D8%B5%D9%81%D8%AD%D8%A9"}
EXCLUDED_NS << {:raw => "نقاش الصفحة", :url => "%D9%86%D9%82%D8%A7%D8%B4_%D8%A7%D9%84%D8%B5%D9%81%D8%AD%D8%A9"}

require "../crawler.rb"

hello()

puts "Duration: #{(Time.now - STARTTIME) /60} mn."
