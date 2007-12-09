#!/usr/bin/ruby

usage =<<END

Usage:	./import_sql.rb <lang_code> <project_url> <date> <db_code>
Ex:		./import_sql.rb es eswikibooks 20071203 books
END

raise usage if ARGV[3].nil?

LANG	= ARGV[0]
PROJECT	= ARGV[1]
DATE	= ARGV[2]
DBNAME	= ARGV[3]

Dir.chdir(LANG)

#system("sed -i -e 's/) TYPE=InnoDB;/) TYPE=MyISAM;/' #{PROJECT}-#{DATE}-*.sql")
system("mysql -ureg -preg reg_#{LANG}_#{DBNAME} < #{PROJECT}-#{DATE}-categorylinks.sql")
system("mysql -ureg -preg reg_#{LANG}_#{DBNAME} < #{PROJECT}-#{DATE}-externallinks.sql")
system("mysql -ureg -preg reg_#{LANG}_#{DBNAME} < #{PROJECT}-#{DATE}-imagelinks.sql")
system("mysql -ureg -preg reg_#{LANG}_#{DBNAME} < #{PROJECT}-#{DATE}-interwiki.sql")
system("mysql -ureg -preg reg_#{LANG}_#{DBNAME} < #{PROJECT}-#{DATE}-langlinks.sql")
system("mysql -ureg -preg reg_#{LANG}_#{DBNAME} < #{PROJECT}-#{DATE}-redirect.sql")
system("mysql -ureg -preg reg_#{LANG}_#{DBNAME} < #{PROJECT}-#{DATE}-templatelinks.sql")

