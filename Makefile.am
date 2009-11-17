SUBDIRS = src

install:
	cp -r -v -L ./kiwix ${prefix}/lib/
	for FILE in `find /usr/local/lib/kiwix/ -name \
		"*.svn" -o -name "*.dat" -o -name "*~" -o -name "*#"`; do rm -rf $$FILE ; done
	ln -f -s ${prefix}/lib/kiwix/kiwix.sh ${prefix}/bin/kiwix
	ln -f -s ${prefix}/lib/kiwix/kiwix-compact.sh ${prefix}/bin/kiwix-compact

uninstall:
	rm -rf ${prefix}/lib/kiwix
	unlink ${prefix}/bin/kiwix
	unlink ${prefix}/bin/kiwix-compact