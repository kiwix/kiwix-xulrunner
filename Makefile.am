SUBDIRS=src
EXTRA_DIST= \
	kiwix \
	desktop \
	debian \
	CHANGELOG \
	COMPILE

CLEANFILES= \
	./kiwix/components/zimAccessor.so \
	./kiwix/components/zimAccessor.xpt \
	./kiwix/components/xapianAccessor.so \
	./kiwix/components/xapianAccessor.xpt \
	./kiwix/components/zimXapianIndexer.so \
	./kiwix/components/zimXapianIndexer.xpt \
	./kiwix/components/cluceneAccessor.so \
	./kiwix/components/cluceneAccessor.xpt \
	./kiwix/components/zimCluceneIndexer.so \
	./kiwix/components/zimCluceneIndexer.xpt \
	./kiwix*.deb \
	./kiwix*.tar.gz \
	./kiwix*.changes \
	./kiwix*.dsc

all-local: ./kiwix/components/xapianAccessor.so \
	./kiwix/components/xapianAccessor.xpt \
	./kiwix/components/zimAccessor.so \
	./kiwix/components/zimAccessor.xpt \
	./kiwix/components/zimXapianIndexer.so \
	./kiwix/components/zimXapianIndexer.xpt \
	./kiwix/components/cluceneAccessor.so \
	./kiwix/components/cluceneAccessor.xpt \
	./kiwix/components/zimCluceneIndexer.so \
	./kiwix/components/zimCluceneIndexer.xpt

dist-hook:
	rm -rf `find . -name "*.svn" -o -name "*.dat" -o -name "*~" -o -name "*#"`

install:
	if [ ! -d ${DESTDIR}/${prefix}/share/pixmaps/ ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/pixmaps/ ; fi
	cp desktop/kiwix.png ${DESTDIR}/${prefix}/share/pixmaps/
	if [ ! -d ${DESTDIR}/${prefix}/share/applications/ ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/applications/ ; fi
	if [ ! -d ${DESTDIR}/${bindir} ] ; then $(MKDIR_P) ${DESTDIR}/${bindir}/ ; fi
	if [ ! -d ${DESTDIR}/${libdir} ] ; then $(MKDIR_P) ${DESTDIR}/${libdir}/ ; fi
	cp desktop/kiwix.desktop ${DESTDIR}/${prefix}/share/applications/
	cp -r -v -L ./kiwix ${DESTDIR}/${libdir}/
	ln -f -s ${DESTDIR}/${libdir}/kiwix/kiwix.sh ${DESTDIR}/${bindir}/kiwix
	ln -f -s ${DESTDIR}/${libdir}/kiwix/kiwix-compact.sh ${DESTDIR}/${bindir}/kiwix-compact
	cp src/components/zimAccessor/.libs/libZimAccessor.so ${DESTDIR}/${libdir}/kiwix/components/zimAccessor.so
	cp src/components/zimAccessor/IZimAccessor.xpt ${DESTDIR}/${libdir}/kiwix/components/zimAccessor.xpt
	cp src/components/xapianAccessor/.libs/libXapianAccessor.so ${DESTDIR}/${libdir}/kiwix/components/xapianAccessor.so
	cp src/components/xapianAccessor/IXapianAccessor.xpt ${DESTDIR}/${libdir}/kiwix/components/xapianAccessor.xpt
	cp src/components/zimXapianIndexer/.libs/libZimXapianIndexer.so ${DESTDIR}/${libdir}/kiwix/components/zimXapianIndexer.so
	cp src/components/zimXapianIndexer/IZimXapianIndexer.xpt ${DESTDIR}/${libdir}/kiwix/components/zimXapianIndexer.xpt
	cp src/components/cluceneAccessor/.libs/libCluceneAccessor.so ${DESTDIR}/${libdir}/kiwix/components/cluceneAccessor.so
	cp src/components/cluceneAccessor/ICluceneAccessor.xpt ${DESTDIR}/${libdir}/kiwix/components/cluceneAccessor.xpt
	cp src/components/zimCluceneIndexer/.libs/libZimCluceneIndexer.so ${DESTDIR}/${libdir}/kiwix/components/zimCluceneIndexer.so
	cp src/components/zimCluceneIndexer/IZimCluceneIndexer.xpt ${DESTDIR}/${libdir}/kiwix/components/zimCluceneIndexer.xpt
	cp src/indexer/kiwix-index ${DESTDIR}/${bindir}/kiwix-index
	cp src/server/kiwix-serve ${DESTDIR}/${bindir}/kiwix-serve

uninstall:
	rm -f ${DESTDIR}/${bindir}/kiwix-index
	rm -f ${DESTDIR}/${prefix}/share/pixmaps/kiwix.png
	rm -f ${DESTDIR}/${prefix}/share/applications/kiwix.desktop
	rm -rf ${DESTDIR}/${libdir}/kiwix
	rm -f ${DESTDIR}/${bindir}/kiwix
	rm -f ${DESTDIR}/${bindir}/kiwix-compact
	rm -f ${DESTDIR}/${bindir}/kiwix-serve

./kiwix/components/zimAccessor.so: 
	ln -f -s ../../src/components/zimAccessor/.libs/libZimAccessor.so ./kiwix/components/zimAccessor.so

./kiwix/components/zimAccessor.xpt: 
	ln -f -s ../../src/components/zimAccessor/IZimAccessor.xpt ./kiwix/components/zimAccessor.xpt

./kiwix/components/xapianAccessor.so: 
	ln -f -s ../../src/components/xapianAccessor/.libs/libXapianAccessor.so ./kiwix/components/xapianAccessor.so

./kiwix/components/xapianAccessor.xpt:
	ln -f -s ../../src/components/xapianAccessor/IXapianAccessor.xpt ./kiwix/components/xapianAccessor.xpt

./kiwix/components/zimXapianIndexer.so:
	ln -f -s ../../src/components/zimXapianIndexer/.libs/libZimXapianIndexer.so  ./kiwix/components/zimXapianIndexer.so

./kiwix/components/zimXapianIndexer.xpt: 
	ln -f -s ../../src/components/zimXapianIndexer/IZimXapianIndexer.xpt ./kiwix/components/zimXapianIndexer.xpt

./kiwix/components/cluceneAccessor.so: 
	ln -f -s ../../src/components/cluceneAccessor/.libs/libCluceneAccessor.so ./kiwix/components/cluceneAccessor.so

./kiwix/components/cluceneAccessor.xpt:
	ln -f -s ../../src/components/cluceneAccessor/ICluceneAccessor.xpt ./kiwix/components/cluceneAccessor.xpt

./kiwix/components/zimCluceneIndexer.so:
	ln -f -s ../../src/components/zimCluceneIndexer/.libs/libZimCluceneIndexer.so  ./kiwix/components/zimCluceneIndexer.so

./kiwix/components/zimCluceneIndexer.xpt: 
	ln -f -s ../../src/components/zimCluceneIndexer/IZimCluceneIndexer.xpt ./kiwix/components/zimCluceneIndexer.xpt

bindist: 
	${BINDIST_INTRO_MESSAGE}

deb: dist
	if [ `whereis dpkg-buildpackage | cut -f2 -d" "` == "dpkg-buildpackage:" ] ; then echo "You have to install dpkg-buildpackage" ; exit 1 ; fi
	tar -xvzf kiwix-0.9.tar.gz
	cd kiwix-0.9 ; ./configure ; dpkg-buildpackage -rfakeroot

rpm: dist
	$(MKDIR_P) ~/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
	echo "%_topdir $${HOME}/rpmbuild" > ~/.rpmmacros
	cp -f kiwix-0.9.tar.gz ~/rpmbuild/SOURCES/
	rpmbuild -ba fedora/kiwix.spec
	cp ~/rpmbuild/RPMS/*/*.rpm .

# Windows rule
win:
	cd src/dependences ; make win
	cd src/zimlib/src ; if [ ! -f zim.lib ] ; then make -f Makefile.mvsc ; fi
	cd src/components/xapianAccessor ; if [ ! -f xapianAccessor.dll ] ; then make -f Makefile.mvsc ; fi
	cd src/components/zimAccessor ; if [ ! -f zimAccessor.dll ] ; then make -f Makefile.mvsc ; fi
	cd src/components/zimXapianIndexer ; if [ ! -f zimXapianIndexer.dll ] ; then make -f Makefile.mvsc ; fi
	cp src/components/xapianAccessor/xapianAccessor.dll kiwix/components/
	cp src/components/xapianAccessor/IXapianAccessor.xpt kiwix/components/xapianAccessor.xpt
	cp src/components/zimAccessor/zimAccessor.dll kiwix/components/
	cp src/components/zimAccessor/IZimAccessor.xpt kiwix/components/zimAccessor.xpt
	cp src/components/zimXapianIndexer/zimXapianIndexer.dll kiwix/components/
	cp src/components/zimXapianIndexer/IZimXapianIndexer.xpt kiwix/components/zimXapianIndexer.xpt
	cp -r src/dependences/xulrunner ./kiwix
	cp -r src/dependences/xz-4.999.9beta/windows/liblzma.dll ./kiwix/xulrunner
	cp -r src/dependences/icu/bin/*dll ./kiwix/xulrunner
