SUBDIRS=src
EXTRA_DIST= \
	kiwix \
	desktop 

dist-hook:
	rm -rf `find . -name "*.svn" -o -name "*.dat" -o -name "*~" -o -name "*#"`

install:
	if [ ! -d ${prefix}/share/pixmaps/ ] ; then mkdir ${prefix}/share/pixmaps/ ; fi
	cp desktop/kiwix.png ${prefix}/share/pixmaps/
	if [ ! -d ${prefix}/share/applications/ ] ; then mkdir ${prefix}/share/applications/ ; fi
	cp desktop/kiwix.desktop ${prefix}/share/applications/
	cp -r -v -L ./kiwix ${prefix}/lib/
	ln -f -s ${prefix}/lib/kiwix/kiwix.sh ${prefix}/bin/kiwix
	ln -f -s ${prefix}/lib/kiwix/kiwix-compact.sh ${prefix}/bin/kiwix-compact
	cp src/components/zimAccessor/.libs/libZimAccessor.so ${prefix}/lib/kiwix/components/zimAccessor.so
	cp src/components/zimAccessor/IZimAccessor.xpt ${prefix}/lib/kiwix/components/zimAccessor.xpt
	cp src/components/xapianAccessor/.libs/libXapianAccessor.so ${prefix}/lib/kiwix/components/xapianAccessor.so
	cp src/components/xapianAccessor/IXapianAccessor.xpt ${prefix}/lib/kiwix/components/xapianAccessor.xpt
	cp src/components/zimXapianIndexer/.libs/libZimXapianIndexer.so ${prefix}/lib/kiwix/components/zimXapianIndexer.so
	cp src/components/zimXapianIndexer/IZimXapianIndexer.xpt ${prefix}/lib/kiwix/components/zimXapianIndexer.xpt

uninstall:
	rm ${prefix}/share/pixmaps/kiwix.png
	rm ${prefix}/share/applications/kiwix.desktop
	rm -rf ${prefix}/lib/kiwix
	unlink ${prefix}/bin/kiwix
	unlink ${prefix}/bin/kiwix-compact