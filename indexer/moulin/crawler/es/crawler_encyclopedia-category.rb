#!/usr/bin/ruby

STARTTIME = Time.now

# Global defines
LANG    = "es"
RTL     = false
PROJECT = "encyclopedia-category"
MASTER = "encyclopedia"
NAMESPAC= {:id => 14, :name => :NSCategory}
UNIQID  = Time.now.to_i
UNIQFD  = "/home/reg/var/#{LANG}/#{PROJECT}_#{UNIQID}"
MDWKFD  = "/var/www/reg.kiwix.org/wiki"
DBICON  = "DBI:Mysql:reg_#{LANG}_encyclopedia"
DBIUSER = "reg"
DBIPASS = "reg"
BLOCK_SIZE	= 10485760 # 10MB

require 'simple_common.rb'

require '../crawler.rb'

hello()

puts "Duration: #{(Time.now - STARTTIME) /60} mn."
