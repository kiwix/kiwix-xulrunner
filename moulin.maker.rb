#!/usr/bin/ruby

usage =<<END

Usage:	./moulin.maker.rb <lang> <dir> [build]
Ex:		./moulin.maker.rb es ltr
END

raise usage if not ARGV[1]

LANG	= ARGV[0]
DIR		= ARGV[1]
BUILD	= ARGV[2] == 'build' or false

droot	= "../moulin_base_#{LANG}" 
Dir.mkdir(droot) unless File.exists?(droot)

Dir.mkdir("#{droot}/installer")						unless File.exists?("#{droot}/installer")
Dir.mkdir("#{droot}/autorun")						unless File.exists?("#{droot}/autorun")
Dir.mkdir("#{droot}/moulin")						unless File.exists?("#{droot}/moulin")
Dir.mkdir("#{droot}/moulin/datas")					unless File.exists?("#{droot}/moulin/datas")
Dir.mkdir("#{droot}/moulin/components")				unless File.exists?("#{droot}/moulin/components")
Dir.mkdir("#{droot}/moulin/defaults")				unless File.exists?("#{droot}/moulin/defaults")
Dir.mkdir("#{droot}/moulin/defaults/preferences")	unless File.exists?("#{droot}/moulin/defaults/preferences")
Dir.mkdir("#{droot}/moulin/chrome")					unless File.exists?("#{droot}/moulin/chrome")
Dir.mkdir("#{droot}/moulin/chrome/locale")			unless File.exists?("#{droot}/moulin/chrome/locale")

# datas
system("rsync -a binrsc/datas/#{LANG} #{droot}/moulin/datas/")

# xulrunner binaries
system("rsync -a binrsc/moulin-mac.app #{droot}/moulin/")
system("rsync -a binrsc/xulrunner #{droot}/moulin/")
system("rsync -a binrsc/xulrunner-linux #{droot}/moulin/")
system("cp binrsc/moulin.exe #{droot}/moulin/")
system("cp binrsc/moulin-linux #{droot}/moulin/")

# autorun
system("cp binrsc/autorun/mingwm10.dll #{droot}/autorun/")
system("cp binrsc/autorun/QtCore4.dll #{droot}/autorun/")
system("cp binrsc/autorun/QtGui4.dll #{droot}/autorun/")
system("cp binrsc/autorun/_#{LANG}/moulin-autorun.exe #{droot}/autorun/")

# installer
system("cp binrsc/installer/_#{LANG}/moulin-setup.exe #{droot}/installer/")

# components
system("cp components/moulin-imageProtocol/moulin-imageProtocol.js #{droot}/moulin/components/")
system("cp components/moulin-searchProtocol/moulin-searchProtocol.js #{droot}/moulin/components/")
system("cp components/moulinProtocol/moulinProtocol.js #{droot}/moulin/components/")
system("cp binrsc/nsMoulin/moulin.dll #{droot}/moulin/components/")
system("cp binrsc/nsMoulin/moulin.dylib #{droot}/moulin/components/")
system("cp binrsc/nsMoulin/moulin.so #{droot}/moulin/components/")
system("cp binrsc/nsMoulin/moulin.xpt #{droot}/moulin/components/")

# autorun.inf
system("cp autorun/moulin/src/autorun.inf #{droot}/")

# application.ini
system("cp moulin/application.ini #{droot}/moulin/")

# COPYING
system("cp moulin/COPYING #{droot}/moulin/")

# preferences
system("cp moulin/defaults/installed #{droot}/moulin/defaults/")
src	= File.readlines("moulin/defaults/preferences/moulin-prefs.js").join
['general.useragent.locale', 'moulin.datas.language', 'moulin.ui.language'].each do |pr|
	src.gsub!("[[[#{pr}]]]", LANG)
end
src.gsub!("[[[moulin.dir]]]", DIR)
File.open("#{droot}/moulin/defaults/preferences/moulin-prefs.js", "w") do |f|
	f.write src
end

# chrome
system("rsync -a moulin/chrome/content #{droot}/moulin/chrome/")
system("rsync -a moulin/chrome/icons #{droot}/moulin/chrome/")
system("rsync -a moulin/chrome/skin #{droot}/moulin/chrome/")

# locale
system("rsync -C -a moulin/chrome/locale/#{LANG} #{droot}/moulin/chrome/locale/")

# chrome.manifest
src = File.readlines("moulin/chrome/chrome.manifest").join
src.gsub!("[[[LANG]]]", LANG)
File.open("#{droot}/moulin/chrome/chrome.manifest", "w") do |f|
	f.write src
end







