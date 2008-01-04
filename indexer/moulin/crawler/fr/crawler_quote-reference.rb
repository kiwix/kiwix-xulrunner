#!/usr/bin/ruby

STARTTIME = Time.now

# Global defines
LANG    = "fr"
RTL     = false
PROJECT = "quote-reference"
MASTER = "quote"
NAMESPAC= {:id => 104, :name => "Référence"}
UNIQID  = Time.now.to_i
UNIQFD  = "/home/reg/var/#{LANG}/#{PROJECT}_#{UNIQID}"
MDWKFD  = "/var/www/reg.kiwix.org/wiki"
DBICON  = "DBI:Mysql:reg_#{LANG}_quote"
DBIUSER = "reg"
DBIPASS = "reg"
BLOCK_SIZE	= 10485760 # 10MB

require "./#{LANG}_common.rb"

INCLUDED_NS << {:raw => "Référence", :url => "R%C3%A9f%C3%A9rence", :ns => "reference"}

EXCLUDED_NS << {:raw => "Portail", :url => "Portail"}
EXCLUDED_NS << {:raw => "Discussion Portail", :url => "Discussion_Portail"}
EXCLUDED_NS << {:raw => "Projet", :url => "Projet"}
EXCLUDED_NS << {:raw => "Discussion Projet", :url => "Discussion_Projet"}
EXCLUDED_NS << {:raw => "Discussion Référence", :url => "Discussion_R%C3%A9f%C3%A9rence"}
EXCLUDED_NS << {:raw => "Transwiki", :url => "Transwiki"}
EXCLUDED_NS << {:raw => "Discussion Transwiki", :url => "Discussion_Transwiki"}

require "../crawler.rb"

hello()

puts "Duration: #{(Time.now - STARTTIME) /60} mn."
