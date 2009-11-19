SUBDIRS=src
EXTRA_DIST=kiwix
 
install:
	if [ ! -d ${prefix}/share/pixmaps/ ] ; then mkdir ${prefix}/share/pixmaps/ ; fi
	cp desktop/kiwix.png ${prefix}/share/pixmaps/
	if [ ! -d ${prefix}/share/applications/ ] ; then mkdir ${prefix}/share/applications/ ; fi
	cp desktop/kiwix.desktop ${prefix}/share/applications/
	cp -r -v -L ./kiwix ${prefix}/lib/
	for FILE in `find /usr/local/lib/kiwix/ -name \
		"*.svn" -o -name "*.dat" -o -name "*~" -o -name "*#"`; do rm -rf $$FILE ; done
	ln -f -s ${prefix}/lib/kiwix/kiwix.sh ${prefix}/bin/kiwix
	ln -f -s ${prefix}/lib/kiwix/kiwix-compact.sh ${prefix}/bin/kiwix-compact

uninstall:
	rm ${prefix}/share/pixmaps/kiwix.png
	rm ${prefix}/share/applications/kiwix.desktop
	rm -rf ${prefix}/lib/kiwix
	unlink ${prefix}/bin/kiwix
	unlink ${prefix}/bin/kiwix-compact