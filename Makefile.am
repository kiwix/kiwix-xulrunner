SUBDIRS=src
EXTRA_DIST= \
	kiwix \
	desktop \
	debian \
	CHANGELOG \
	COMPILE

CLEANFILES= \
	./kiwix/components/zimAccessor.so \
	./kiwix/components/zimAccessor.dylib \
	./kiwix/components/zimAccessor.xpt \
	./kiwix/components/xapianAccessor.so \
	./kiwix/components/xapianAccessor.dylib \
	./kiwix/components/xapianAccessor.xpt \
	./kiwix/components/zimXapianIndexer.so \
	./kiwix/components/zimXapianIndexer.dylib \
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
	cd kiwix-0.9 ; dpkg-buildpackage -rfakeroot

rpm: dist
	$(MKDIR_P) ~/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
	echo "%_topdir $${HOME}/rpmbuild" > ~/.rpmmacros
	cp -f kiwix-0.9.tar.gz ~/rpmbuild/SOURCES/
	rpmbuild -ba fedora/kiwix.spec
	cp ~/rpmbuild/RPMS/*/*.rpm .

kiwix-0.9.tar.gz: dist
	echo "Need to recreate tgz"

# Mac OSX rule
# requires install of XR
distmac: kiwix-0.9.tar.gz
	tar xf kiwix-0.9.tar.gz
	rm -rf kiwix_dmg
	$(MKDIR_P) Kiwix.app
	$(MKDIR_P) Kiwix.app/Contents
	$(MKDIR_P) Kiwix.app/Contents/Frameworks
	$(MKDIR_P) Kiwix.app/Contents/MacOS
	$(MKDIR_P) Kiwix.app/Contents/Resources
	rsync -ar kiwix-0.9/kiwix/* Kiwix.app/Contents/Resources/
	find Kiwix.app/Contents/Resources/components/ -type l -delete
	cp src/components/zimAccessor/IZimAccessor.xpt Kiwix.app/Contents/Resources/components/zimAccessor.xpt
	cp src/components/zimAccessor/.libs/libZimAccessor.dylib Kiwix.app/Contents/Resources/components/zimAccessor.dylib
	cp src/components/xapianAccessor/IXapianAccessor.xpt Kiwix.app/Contents/Resources/components/xapianAccessor.xpt
	cp src/components/xapianAccessor/.libs/libXapianAccessor.dylib Kiwix.app/Contents/Resources/components/xapianAccessor.dylib
	cp src/components/zimXapianIndexer/IZimXapianIndexer.xpt Kiwix.app/Contents/Resources/components/zimXapianIndexer.xpt
	cp src/components/zimXapianIndexer/.libs/libZimXapianIndexer.dylib Kiwix.app/Contents/Resources/components/zimXapianIndexer.dylib
	cp src/components/components.list Kiwix.app/Contents/Resources/components/components.list
	rsync -rl /Library/Frameworks/XUL.framework/ Kiwix.app/Contents/Frameworks/XUL.framework/
	cp /Library/Frameworks/XUL.framework/Versions/Current/xulrunner Kiwix.app/Contents/MacOS/xulrunner
	cp kiwix-0.9/kiwix/chrome/icons/default/main.icns Kiwix.app/Contents/Resources/kiwix.icns
	cp src/macosx/Info.plist Kiwix.app/Contents/Info.plist
	chmod -R 755 Kiwix.app

	rm -f Kiwix-0.9.dmg
	bunzip2 -kf src/macosx/kiwix_template.dmg.bz2
	$(MKDIR_P) kiwix_dmg
	hdiutil attach src/macosx/kiwix_template.dmg -noautoopen -quiet -mountpoint ./kiwix_dmg
	rm -rf ./kiwix_dmg/Kiwix.app
	mv Kiwix.app kiwix_dmg/
	hdiutil detach ./kiwix_dmg -quiet -force
	hdiutil convert src/macosx/kiwix_template.dmg -quiet -format UDZO -imagekey zlib-level=9 -o Kiwix-0.9.dmg
	rm -f src/macosx/kiwix_template.dmg


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
