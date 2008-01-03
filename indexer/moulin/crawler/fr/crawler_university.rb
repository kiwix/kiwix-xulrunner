#!/usr/bin/ruby

STARTTIME = Time.now

# Global defines
LANG    = "fr"
RTL     = false
PROJECT = "university"
MASTER = "university"
NAMESPAC= {:id => 0, :name => nil}
UNIQID  = Time.now.to_i
UNIQFD  = "/home/reg/var/#{LANG}/#{PROJECT}_#{UNIQID}"
MDWKFD  = "/var/www/reg.kiwix.org/wiki"
DBICON  = "DBI:Mysql:reg_#{LANG}_#{PROJECT}"
DBIUSER = "reg"
DBIPASS = "reg"
BLOCK_SIZE	= 10485760 # 10MB

require "./#{LANG}_common.rb"

INCLUDED_NS << {:raw => "Faculté", :url => "Facult%C3%A9", :ns => "faculty"}
INCLUDED_NS << {:raw => "Département", :url => "D%C3%A9partement", :ns => "department"}

EXCLUDED_NS << {:raw => "Projet", :url => "Projet"}
EXCLUDED_NS << {:raw => "Discussion Projet", :url => "Discussion_Projet"}
EXCLUDED_NS << {:raw => "Discussion Faculté", :url => "Discussion_Facult%C3%A9"}
EXCLUDED_NS << {:raw => "Discussion Département", :url => "Discussion_D%C3%A9partement"}
EXCLUDED_NS << {:raw => "Transwiki", :url => "Transwiki"}
EXCLUDED_NS << {:raw => "Discussion Transwiki", :url => "Discussion_Transwiki"}

require "../crawler.rb"

hello()

puts "Duration: #{(Time.now - STARTTIME) /60} mn."
