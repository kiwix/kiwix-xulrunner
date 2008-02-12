#!/usr/bin/ruby

STARTTIME = Time.now

# Global defines
LANG    = "es"
RTL     = false
PROJECT = "encyclopedia-category"
MASTER = "encyclopedia"
NAMESPAC= {:id => 14, :name => "Categoría"}
UNIQID  = Time.now.to_i
UNIQFD  = "/home/reg/var/#{LANG}/#{PROJECT}_#{UNIQID}"
MDWKFD  = "/var/www/reg.kiwix.org/wiki"
DBICON  = "DBI:Mysql:reg_#{LANG}_#{MASTER}"
DBIUSER = "reg"
DBIPASS = "reg"
BLOCK_SIZE	= 10485760 # 10MB

require "./#{LANG}_common.rb"

INCLUDED_NS << {:raw => "Portal", :url => "Portal", :ms => "portal"}
INCLUDED_NS << {:raw => "Anexo", :url => "Anexo", :ms => "appendix"}

EXCLUDED_NS << {:raw => "Portal Discusión", :url => "Portal_Discusi%C3%B3n"}
EXCLUDED_NS << {:raw => "Wikiproyecto", :url => "Wikiproyecto"}
EXCLUDED_NS << {:raw => "Wikiproyecto Discusión", :url => "Wikiproyecto_Discusi%C3%B3n"}
EXCLUDED_NS << {:raw => "Anexo Discusión", :url => "Anexo_Discusi%C3%B3n"}

require "../crawler.rb"

hello()

puts "Duration: #{(Time.now - STARTTIME) /60} mn."
