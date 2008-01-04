#!/usr/bin/ruby

STARTTIME = Time.now

# Global defines
LANG    = "fr"
RTL     = false
PROJECT = "dictionary-portal"
MASTER = "dictionary"
NAMESPAC= {:id => 104, :name => "Portail"}
UNIQID  = Time.now.to_i
UNIQFD  = "/home/reg/var/#{LANG}/#{PROJECT}_#{UNIQID}"
MDWKFD  = "/var/www/reg.kiwix.org/wiki"
DBICON  = "DBI:Mysql:reg_#{LANG}_dictionary"
DBIUSER = "reg"
DBIPASS = "reg"
BLOCK_SIZE	= 10485760 # 10MB

require "./#{LANG}_common.rb"

INCLUDED_NS << {:raw => "Annexe", :url => "Annexe", :ns => "appendix"}
INCLUDED_NS << {:raw => "Portail", :url => "Portail", :ns => "portal"}

EXCLUDED_NS << {:raw => "Discussion Annexe", :url => "Discussion_Annexe"}
EXCLUDED_NS << {:raw => "Transwiki", :url => "Transwiki"}
EXCLUDED_NS << {:raw => "Discussion Transwiki", :url => "Discussion_Transwiki"}
EXCLUDED_NS << {:raw => "Discussion Portail", :url => "Discussion_Portail"}

require "../crawler.rb"

hello()

puts "Duration: #{(Time.now - STARTTIME) /60} mn."
