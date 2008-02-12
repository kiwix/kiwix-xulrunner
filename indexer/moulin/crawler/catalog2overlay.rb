#!/usr/bin/ruby

usage =<<END

Usage:	./catalog2overlay.rb <lang_code>
END

raise usage if ARGV[0].nil?

LANG	= ARGV[0]

projects = []
projects << "media"

Dir.chdir(LANG)
File.readlines("catalog").each do |l|
	p = l.chomp.split(":")
	next unless p[0] == 'project_codes'
	p[1].split(",").each do |p|
		projects << p
	end
end

OVERLAY_HEAD =<<END
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE window SYSTEM "chrome://moulin/locale/moulin.dtd">
<overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">
<menupopup id="searchpopup">
END

OVERLAY_FOOT =<<END
</menupopup>
</overlay>
END

out = String.new
out << OVERLAY_HEAD
projects.each do |p|
	out << "<menuitem dir=\"&moulin.dir;\" class=\"menuitem-iconic\" image=\"chrome://moulin/content/projects/#{p}_list.png\" label=\"&project.#{p};\" value=\"#{p}\" oncommand=\"UIChangeSearchEngine (this.value);\" />\n"
	
end
out << OVERLAY_FOOT

puts out
