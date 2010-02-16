#!/usr/bin/ruby

require 'rexml/document'
include REXML

raise ArgumentError if ARGV[0].nil?

LANG = ARGV[0]

xlang = Document.new(File.new(LANG+".xml"))
rlang = xlang.root

layoutDirection	= rlang.elements["lang/layoutDirection"].text
windowTitle		= rlang.elements["lang/windowTitle"].text
run				= rlang.elements["lang/run"].text
install			= rlang.elements["lang/install"].text
quit			= rlang.elements["lang/quit"].text

puts "#{layoutDirection}, #{windowTitle}, #{run}, #{install}, #{quit}"

source	= File.readlines("source.ui").join

patt = [
	{:s => 'layoutDirection', :r => layoutDirection},
	{:s => 'windowTitle', :r => windowTitle},
	{:s => 'run', :r => run},
	{:s => 'install', :r => install},
	{:s => 'quit', :r => quit}	
]

patt.each do |p|
	source.gsub!("[[[#{p[:s]}]]]", p[:r])
end

File.open("app.ui", "w") do |f|
	f.write source
end
