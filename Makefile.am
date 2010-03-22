SUBDIRS=src
EXTRA_DIST= \
	kiwix \
	desktop \
	debian \
	CHANGELOG
CLEANFILES= \
	./kiwix/components/xapianAccessor.so \
	./kiwix/components/xapianAccessor.xpt \
	./kiwix/components/zimAccessor.so \
	./kiwix/components/zimAccessor.xpt \
	./kiwix/components/zimXapianIndexer.so \
	./kiwix/components/zimXapianIndexer.xpt

all-local: ./kiwix/components/xapianAccessor.so \
	./kiwix/components/xapianAccessor.xpt \
	./kiwix/components/zimAccessor.so \
	./kiwix/components/zimAccessor.xpt \
	./kiwix/components/zimXapianIndexer.so \
	./kiwix/components/zimXapianIndexer.xpt
	

dist-hook:
	rm -rf `find . -name "*.svn" -o -name "*.dat" -o -name "*~" -o -name "*#"`

install:
	if [ ! -d ${DESTDIR}/${prefix}/share/pixmaps/ ] ; then mkdir ${DESTDIR}/${prefix}/share/pixmaps/ ; fi
	cp desktop/kiwix.png ${DESTDIR}/${prefix}/share/pixmaps/
	if [ ! -d ${DESTDIR}/${prefix}/share/applications/ ] ; then mkdir ${DESTDIR}/${prefix}/share/applications/ ; fi
	cp desktop/kiwix.desktop ${DESTDIR}/${prefix}/share/applications/
	cp -r -v -L ./kiwix ${DESTDIR}/${prefix}/lib/
	ln -f -s ${DESTDIR}/${prefix}/lib/kiwix/kiwix.sh ${DESTDIR}/${prefix}/bin/kiwix
	ln -f -s ${DESTDIR}/${prefix}/lib/kiwix/kiwix-compact.sh ${DESTDIR}/${prefix}/bin/kiwix-compact
	cp src/components/zimAccessor/.libs/libZimAccessor.so ${DESTDIR}/${prefix}/lib/kiwix/components/zimAccessor.so
	cp src/components/zimAccessor/IZimAccessor.xpt ${DESTDIR}/${prefix}/lib/kiwix/components/zimAccessor.xpt
	cp src/components/xapianAccessor/.libs/libXapianAccessor.so ${DESTDIR}/${prefix}/lib/kiwix/components/xapianAccessor.so
	cp src/components/xapianAccessor/IXapianAccessor.xpt ${DESTDIR}/${prefix}/lib/kiwix/components/xapianAccessor.xpt
	cp src/components/zimXapianIndexer/.libs/libZimXapianIndexer.so ${DESTDIR}/${prefix}/lib/kiwix/components/zimXapianIndexer.so
	cp src/components/zimXapianIndexer/IZimXapianIndexer.xpt ${DESTDIR}/${prefix}/lib/kiwix/components/zimXapianIndexer.xpt
	cp src/indexer/kiwix-index ${DESTDIR}/${prefix}/bin/kiwix-index
	cp src/server/kiwix-serve ${DESTDIR}/${prefix}/bin/kiwix-serve

uninstall:
	rm -f ${DESTDIR}/${prefix}/bin/kiwix-index
	rm -f ${DESTDIR}/${prefix}/share/pixmaps/kiwix.png
	rm -f ${DESTDIR}/${prefix}/share/applications/kiwix.desktop
	rm -rf ${DESTDIR}/${prefix}/lib/kiwix
	rm -f ${DESTDIR}/${prefix}/bin/kiwix
	rm -f ${DESTDIR}/${prefix}/bin/kiwix-compact

./kiwix/components/xapianAccessor.so: 
	ln -f -s ../../src/components/xapianAccessor/.libs/libXapianAccessor.so ./kiwix/components/xapianAccessor.so

./kiwix/components/xapianAccessor.xpt:
	ln -f -s ../../src/components/xapianAccessor/IXapianAccessor.xpt ./kiwix/components/xapianAccessor.xpt

./kiwix/components/zimAccessor.so: 
	ln -f -s ../../src/components/zimAccessor/.libs/libZimAccessor.so ./kiwix/components/zimAccessor.so

./kiwix/components/zimAccessor.xpt: 
	ln -f -s ../../src/components/zimAccessor/IZimAccessor.xpt ./kiwix/components/zimAccessor.xpt

./kiwix/components/zimXapianIndexer.so:
	ln -f -s ../../src/components/zimXapianIndexer/.libs/libZimXapianIndexer.so  ./kiwix/components/zimXapianIndexer.so

./kiwix/components/zimXapianIndexer.xpt: 
	ln -f -s ../../src/components/zimXapianIndexer/IZimXapianIndexer.xpt ./kiwix/components/zimXapianIndexer.xpt

bindist: 
	${BINDIST_INTRO_MESSAGE}

deb: dist
	if [ `whereis dpkg-buildpackage | cut -f2 -d" "` == "dpkg-buildpackage:" ] ; then echo "You have to install dpkg-buildpackage" ; exit 1 ; fi
	tar -xvzf kiwix-0.9.tar.gz
	cd kiwix-0.9 ; ./configure ; dpkg-buildpackage -rfakeroot

rpm: dist
	mkdir -p ~/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
	echo "%_topdir $${HOME}/rpmbuild" > ~/.rpmmacros
	cp -f kiwix-0.9.tar.gz ~/rpmbuild/SOURCES/
	rpmbuild -ba fedora/kiwix.spec
	cp ~/rpmbuild/RPMS/*/*.rpm .
