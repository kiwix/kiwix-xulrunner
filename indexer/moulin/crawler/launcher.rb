#!/usr/bin/ruby

usage	=<<END

Usage:	./launcher.rb <lang>
Ex:		./launcher.rb es
END

raise usage if ARGV[0].nil?

LANG	= ARGV[0]

Dir.chdir(LANG)
Dir.mkdir("../logs") if not File.exists?("../logs")
Dir.mkdir("../logs/#{LANG}") if not File.exists?("../logs/#{LANG}")

projects = []
File.readlines("catalog").each do |l|
	p = l.split(":")[0]
	next if p == 'project_codes'
	projects << p
end

projects.each do |project|
	puts "Starting #{LANG}:#{project}:"
	(0..8).each do |i|
		Thread.new {
			cmd = "./crawler_#{project}.rb #{i} 9 100000 >> ../logs/#{LANG}/#{project}_#{i}.log"
			puts cmd
			system(cmd)
		}
	end
end
