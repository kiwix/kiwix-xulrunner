#!/usr/bin/ruby

STARTTIME = Time.now

# Global defines
LANG    = "simple"
RTL     = true
PROJECT = "books-category"
MASTER = "books"
NAMESPAC= {:id => 14, :name => :NSCategory}
UNIQID  = Time.now.to_i
UNIQFD  = "/var/moulin/#{LANG}/#{PROJECT}_#{UNIQID}"
MDWKFD  = "/var/www/wiki"
DBICON  = "DBI:Mysql:#{LANG}_books"
DBIUSER = "root"
DBIPASS = ""
BLOCK_SIZE	= 10485760 # 10MB

require 'simple_common.rb'

require '../crawler_rss.rb'

hello()

puts "Duration: #{(Time.now - STARTTIME) /60} mn."
