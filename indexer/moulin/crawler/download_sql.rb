#!/usr/bin/ruby

usage =<<END

Usage:	./download_sql.rb <lang_code> <project_url> <date>
Ex:		./download_sql.rb es eswikibooks 20071203
END

raise usage if ARGV[2].nil?

LANG	= ARGV[0]
PROJECT	= ARGV[1]
DATE	= ARGV[2]

Dir.chdir(LANG)

system("wget http://download.wikimedia.org/#{PROJECT}/#{DATE}/#{PROJECT}-#{DATE}-categorylinks.sql.gz")
system("wget http://download.wikimedia.org/#{PROJECT}/#{DATE}/#{PROJECT}-#{DATE}-externallinks.sql.gz")
system("wget http://download.wikimedia.org/#{PROJECT}/#{DATE}/#{PROJECT}-#{DATE}-imagelinks.sql.gz")
system("wget http://download.wikimedia.org/#{PROJECT}/#{DATE}/#{PROJECT}-#{DATE}-interwiki.sql.gz")
system("wget http://download.wikimedia.org/#{PROJECT}/#{DATE}/#{PROJECT}-#{DATE}-langlinks.sql.gz")
system("wget http://download.wikimedia.org/#{PROJECT}/#{DATE}/#{PROJECT}-#{DATE}-redirect.sql.gz")
system("wget http://download.wikimedia.org/#{PROJECT}/#{DATE}/#{PROJECT}-#{DATE}-templatelinks.sql.gz")

