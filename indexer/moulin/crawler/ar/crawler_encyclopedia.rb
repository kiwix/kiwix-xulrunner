#!/usr/bin/ruby

STARTTIME = Time.now

# Global defines
LANG    = "ar"
RTL     = true
PROJECT = "encyclopedia"
MASTER = "encyclopedia"
NAMESPAC= {:id => 0, :name => nil}
UNIQID  = Time.now.to_i
UNIQFD  = "/home/reg/var/#{LANG}/#{PROJECT}_#{UNIQID}"
MDWKFD  = "/var/www/reg.kiwix.org/wiki"
DBICON  = "DBI:Mysql:reg_#{LANG}_#{MASTER}"
DBIUSER = "reg"
DBIPASS = "reg"
BLOCK_SIZE	= 10485760 # 10MB

require "./#{LANG}_common.rb"

INCLUDED_NS << {:raw => "بوابة", :url => "%D8%A8%D9%88%D8%A7%D8%A8%D8%A9", :ms => "portal"}
EXCLUDED_NS << {:raw => "نقاش البوابة", :url => "%D9%86%D9%82%D8%A7%D8%B4+%D8%A7%D9%84%D8%A8%D9%88%D8%A7%D8%A8%D8%A9"}

require "../crawler.rb"

hello()

puts "Duration: #{(Time.now - STARTTIME) /60} mn."
