#!/usr/bin/ruby

STARTTIME = Time.now

# Global defines
LANG    = "fa"
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

INCLUDED_NS << {:raw => "درگاه", :url => "%D8%AF%D8%B1%DA%AF%D8%A7%D9%87", :ms => "portal"}
EXCLUDED_NS << {:raw => "بحث درگاه", :url => "%D8%A8%D8%AD%D8%AB_%D8%AF%D8%B1%DA%AF%D8%A7%D9%87"}

require "../crawler.rb"

hello()

puts "Duration: #{(Time.now - STARTTIME) /60} mn."
