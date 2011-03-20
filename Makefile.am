SUBDIRS=src
EXTRA_DIST= \
	kiwix \
	desktop \
	static \
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

UPDATE_MIME = \
	if which update-mime-database>/dev/null 2>&1; then \
		update-mime-database $(DESTDIR)$(prefix)/share/mime; \
	fi

UPDATE_DESKTOP = \
	if which update-desktop-database>/dev/null 2>&1 ; then \
		update-desktop-database; \
	fi

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
	rm -rf `find $(distdir) -name "*.svn" -o -name "*.dat" -o -name "*~" -o -name "*#"`
	mv $(distdir)/kiwix/chrome/chrome.manifest.prod $(distdir)/kiwix/chrome/chrome.manifest
	cd $(distdir)/kiwix/chrome/ ; ${JAR} c -f locale.jar locale/
	rm -rf $(distdir)/kiwix/chrome/locale
	cd $(distdir)/kiwix/chrome/ ; ${JAR} c -f content.jar content/
	rm -rf $(distdir)/kiwix/chrome/content
	cd $(distdir)/kiwix/chrome/ ; ${JAR} c -f skin.jar skin/
	rm -rf $(distdir)/kiwix/chrome/skin

install:
	if [ ! -d ${DESTDIR}/${prefix}/share/pixmaps/ ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/pixmaps/ ; fi
	cp desktop/kiwix.png ${DESTDIR}/${prefix}/share/pixmaps/
	if [ ! -d ${DESTDIR}/${prefix}/share/mime/packages/ ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/mime/packages/ ; fi
	cp desktop/kiwix.xml ${DESTDIR}/${prefix}/share/mime/packages/
	if [ ! -d ${DESTDIR}/${prefix}/share/application-registry/ ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/application-registry/ ; fi
	cp desktop/kiwix.applications ${DESTDIR}/${prefix}/share/application-registry/kiwix-applications
	if [ ! -d ${DESTDIR}/${prefix}/share/applications/ ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/applications/ ; fi
	if [ ! -d ${DESTDIR}/${bindir} ] ; then $(MKDIR_P) ${DESTDIR}/${bindir}/ ; fi
	if [ ! -d ${DESTDIR}/${libdir} ] ; then $(MKDIR_P) ${DESTDIR}/${libdir}/ ; fi
	cp desktop/kiwix.desktop ${DESTDIR}/${prefix}/share/applications/
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/ ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/ ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/ ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/ ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/8x8/ ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/8x8/ ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/8x8/mimetypes ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/8x8/mimetypes ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/8x8/apps ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/8x8/apps ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/16x16/ ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/16x16/ ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/16x16/mimetypes ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/16x16/mimetypes ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/16x16/apps ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/16x16/apps ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/22x22/ ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/22x22/ ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/22x22/mimetypes ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/22x22/mimetypes ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/22x22/apps ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/22x22/apps ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/24x24/ ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/24x24/ ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/24x24/mimetypes ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/24x24/mimetypes ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/24x24/apps ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/24x24/apps ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/32x32/ ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/32x32/ ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/32x32/mimetypes ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/32x32/mimetypes ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/32x32/apps ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/32x32/apps ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/48x48/ ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/48x48/ ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/48x48/mimetypes ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/48x48/mimetypes ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/48x48/apps ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/48x48/apps ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/256x256/ ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/256x256/ ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/256x256/mimetypes ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/256x256/mimetypes ; fi
	if [ ! -d ${DESTDIR}/${prefix}/share/icons/hicolor/256x256/apps ] ; then $(MKDIR_P) ${DESTDIR}/${prefix}/share/icons/hicolor/256x256/apps ; fi
	cp desktop/kiwix_8x8.png ${DESTDIR}/${prefix}/share/icons/hicolor/8x8/mimetypes/application-x-zim.png
	cp desktop/kiwix_8x8.png ${DESTDIR}/${prefix}/share/icons/hicolor/8x8/apps/kiwix.png
	cp desktop/kiwix_16x16.png ${DESTDIR}/${prefix}/share/icons/hicolor/16x16/mimetypes/application-x-zim.png
	cp desktop/kiwix_16x16.png ${DESTDIR}/${prefix}/share/icons/hicolor/16x16/apps/kiwix.png
	cp desktop/kiwix_22x22.png ${DESTDIR}/${prefix}/share/icons/hicolor/22x22/mimetypes/application-x-zim.png
	cp desktop/kiwix_22x22.png ${DESTDIR}/${prefix}/share/icons/hicolor/22x22/apps/kiwix.png
	cp desktop/kiwix_24x24.png ${DESTDIR}/${prefix}/share/icons/hicolor/24x24/mimetypes/application-x-zim.png
	cp desktop/kiwix_24x24.png ${DESTDIR}/${prefix}/share/icons/hicolor/24x24/apps/kiwix.png
	cp desktop/kiwix_32x32.png ${DESTDIR}/${prefix}/share/icons/hicolor/32x32/mimetypes/application-x-zim.png
	cp desktop/kiwix_32x32.png ${DESTDIR}/${prefix}/share/icons/hicolor/32x32/apps/kiwix.png
	cp desktop/kiwix_48x48.png ${DESTDIR}/${prefix}/share/icons/hicolor/48x48/mimetypes/application-x-zim.png
	cp desktop/kiwix_48x48.png ${DESTDIR}/${prefix}/share/icons/hicolor/48x48/apps/kiwix.png
	cp desktop/kiwix_256x256.png ${DESTDIR}/${prefix}/share/icons/hicolor/256x256/mimetypes/application-x-zim.png
	cp desktop/kiwix_256x256.png ${DESTDIR}/${prefix}/share/icons/hicolor/256x256/apps/kiwix.png
	cp -r -v -L ./kiwix ${DESTDIR}/${libdir}/ 2>/dev/null
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
	$(UPDATE_DESKTOP) 

uninstall:
	rm -f ${DESTDIR}/${bindir}/kiwix-index
	rm -f ${DESTDIR}/${prefix}/share/pixmaps/kiwix.png
	rm -f ${DESTDIR}/${prefix}/share/mime/packages/kiwix.xml
	rm -f ${DESTDIR}/${prefix}/share/applications/kiwix.desktop
	rm -f ${DESTDIR}/${prefix}/share/application-registry/kiwix-applications
	rm -f ${DESTDIR}/${prefix}/share/icons/hicolor/8x8/mimetypes/application-x-zim.png
	rm -f ${DESTDIR}/${prefix}/share/icons/hicolor/8x8/apps/kiwix.png
	rm -f ${DESTDIR}/${prefix}/share/icons/hicolor/16x16/mimetypes/application-x-zim.png
	rm -f ${DESTDIR}/${prefix}/share/icons/hicolor/16x16/apps/kiwix.png
	rm -f ${DESTDIR}/${prefix}/share/icons/hicolor/22x22/mimetypes/application-x-zim.png
	rm -f ${DESTDIR}/${prefix}/share/icons/hicolor/22x22/apps/kiwix.png
	rm -f ${DESTDIR}/${prefix}/share/icons/hicolor/24x24/mimetypes/application-x-zim.png
	rm -f ${DESTDIR}/${prefix}/share/icons/hicolor/24x24/apps/kiwix.png
	rm -f ${DESTDIR}/${prefix}/share/icons/hicolor/48x48/mimetypes/application-x-zim.png
	rm -f ${DESTDIR}/${prefix}/share/icons/hicolor/48x48/apps/kiwix.png
	rm -f ${DESTDIR}/${prefix}/share/icons/hicolor/256x256/mimetypes/application-x-zim.png
	rm -f ${DESTDIR}/${prefix}/share/icons/hicolor/256x256/apps/kiwix.png
	rm -rf ${DESTDIR}/${libdir}/kiwix
	rm -f ${DESTDIR}/${bindir}/kiwix
	rm -f ${DESTDIR}/${bindir}/kiwix-compact
	rm -f ${DESTDIR}/${bindir}/kiwix-serve
	$(UPDATE_DESKTOP) 

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
	tar -xvzf $(PACKAGE)-$(VERSION).tar.gz
	cd $(PACKAGE)-$(VERSION) ; dpkg-buildpackage -rfakeroot

rpm: dist
	$(MKDIR_P) ~/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
	echo "%_topdir $${HOME}/rpmbuild" > ~/.rpmmacros
	cp -f $(PACKAGE)-$(VERSION).tar.gz ~/rpmbuild/SOURCES/
	rpmbuild -ba fedora/kiwix.spec
	cp ~/rpmbuild/RPMS/*/*.rpm .

# Mac OSX rule
# requires install of XR
distmac: dist
	tar xf $(PACKAGE)-$(VERSION).tar.gz
	rm -rf kiwix_dmg
	$(MKDIR_P) Kiwix.app
	$(MKDIR_P) Kiwix.app/Contents
	$(MKDIR_P) Kiwix.app/Contents/Frameworks
	$(MKDIR_P) Kiwix.app/Contents/MacOS
	$(MKDIR_P) Kiwix.app/Contents/Resources
	rsync -ar $(PACKAGE)-$(VERSION)/kiwix/* Kiwix.app/Contents/Resources/
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
	cp $(PACKAGE)-$(VERSION)/kiwix/chrome/icons/default/main.icns Kiwix.app/Contents/Resources/kiwix.icns
	cp src/macosx/Info.plist Kiwix.app/Contents/Info.plist
	chmod -R 755 Kiwix.app

	rm -f $(PACKAGE)-$(VERSION).dmg
	bunzip2 -kf src/macosx/kiwix_template.dmg.bz2
	$(MKDIR_P) kiwix_dmg
	hdiutil attach src/macosx/kiwix_template.dmg -noautoopen -quiet -mountpoint ./kiwix_dmg
	rm -rf ./kiwix_dmg/Kiwix.app
	mv Kiwix.app kiwix_dmg/
	hdiutil detach ./kiwix_dmg -quiet -force
	hdiutil convert src/macosx/kiwix_template.dmg -quiet -format UDZO -imagekey zlib-level=9 -o $(PACKAGE)-$(VERSION).dmg
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
