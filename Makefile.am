SUBDIRS=src kiwix desktop static
EXTRA_DIST= \
	kiwix \
	desktop \
	static \
	CHANGELOG \
	COMPILE

CLEANFILES= \
	kiwix/components/zimAccessor.so \
	kiwix/components/zimAccessor.dylib \
	kiwix/components/zimAccessor.xpt \
	kiwix/components/xapianAccessor.so \
	kiwix/components/xapianAccessor.dylib \
	kiwix/components/xapianAccessor.xpt \
	kiwix/components/zimXapianIndexer.so \
	kiwix/components/zimXapianIndexer.dylib \
	kiwix/components/zimXapianIndexer.xpt \
	kiwix/components/cluceneAccessor.so \
	kiwix/components/cluceneAccessor.xpt \
	kiwix/components/zimCluceneIndexer.so \
	kiwix/components/zimCluceneIndexer.xpt \
	kiwix*.deb \
	kiwix*.tar.gz \
	kiwix*.changes \
	kiwix*.dsc \
	src/dependences/Makefile

UPDATE_MIME = \
	if which update-mime-database>/dev/null 2>&1; then \
		update-mime-database $(DESTDIR)$(prefix)/share/mime; \
	fi

UPDATE_DESKTOP = \
	if which update-desktop-database>/dev/null 2>&1 ; then \
		update-desktop-database; \
	fi

if IS_OSX
bscript := ""
else
bscript := $(shell readlink -f ./build-kiwix-release.sh)
endif

if IS_OSX
all-local: kiwix/components/xapianAccessor.dylib \
	kiwix/components/xapianAccessor.xpt \
	kiwix/components/zimAccessor.dylib \
	kiwix/components/zimAccessor.xpt \
	kiwix/components/zimXapianIndexer.dylib \
	kiwix/components/zimXapianIndexer.xpt \
	kiwix/components/zimXapianIndexer.dylib \
	kiwix/components/contentManager.xpt \
	kiwix/components/contentManager.dylib
else
all-local: kiwix/components/xapianAccessor.so \
	kiwix/components/xapianAccessor.xpt \
	kiwix/components/zimAccessor.so \
	kiwix/components/zimAccessor.xpt \
	kiwix/components/zimXapianIndexer.so \
	kiwix/components/zimXapianIndexer.xpt \
	kiwix/components/cluceneAccessor.so \
	kiwix/components/cluceneAccessor.xpt \
	kiwix/components/zimCluceneIndexer.so \
	kiwix/components/zimCluceneIndexer.xpt \
	kiwix/components/contentManager.so \
	kiwix/components/contentManager.xpt
endif

dist-hook:
	rm -rf `find $(distdir) -name "*.svn" -o -name "*.dat" -o -name "*~" -o -name "*#"`

kiwix/components/zimAccessor.so: 
	ln -f -s ../../src/components/zimAccessor/.libs/libZimAccessor.so ./kiwix/components/zimAccessor.so

kiwix/components/zimAccessor.xpt: 
	ln -f -s ../../src/components/zimAccessor/zimAccessor.xpt ./kiwix/components/zimAccessor.xpt

kiwix/components/xapianAccessor.so: 
	ln -f -s ../../src/components/xapianAccessor/.libs/libXapianAccessor.so ./kiwix/components/xapianAccessor.so

kiwix/components/xapianAccessor.xpt:
	ln -f -s ../../src/components/xapianAccessor/xapianAccessor.xpt ./kiwix/components/xapianAccessor.xpt

kiwix/components/zimXapianIndexer.so:
	ln -f -s ../../src/components/zimXapianIndexer/.libs/libZimXapianIndexer.so  ./kiwix/components/zimXapianIndexer.so

kiwix/components/zimXapianIndexer.xpt: 
	ln -f -s ../../src/components/zimXapianIndexer/zimXapianIndexer.xpt ./kiwix/components/zimXapianIndexer.xpt

kiwix/components/cluceneAccessor.so: 
	ln -f -s ../../src/components/cluceneAccessor/.libs/libCluceneAccessor.so ./kiwix/components/cluceneAccessor.so

kiwix/components/cluceneAccessor.xpt:
	ln -f -s ../../src/components/cluceneAccessor/cluceneAccessor.xpt ./kiwix/components/cluceneAccessor.xpt

kiwix/components/zimCluceneIndexer.so:
	ln -f -s ../../src/components/zimCluceneIndexer/.libs/libZimCluceneIndexer.so  ./kiwix/components/zimCluceneIndexer.so

kiwix/components/zimCluceneIndexer.xpt: 
	ln -f -s ../../src/components/zimCluceneIndexer/zimCluceneIndexer.xpt ./kiwix/components/zimCluceneIndexer.xpt

kiwix/components/contentManager.so: 
	ln -f -s ../../src/components/contentManager/.libs/libContentManager.so ./kiwix/components/contentManager.so

kiwix/components/contentManager.xpt:
	ln -f -s ../../src/components/contentManager/contentManager.xpt ./kiwix/components/contentManager.xpt

kiwix/components/zimAccessor.dylib: 
	ln -f -s ../../src/components/zimAccessor/.libs/libZimAccessor.dylib ./kiwix/components/zimAccessor.dylib

kiwix/components/xapianAccessor.dylib: 
	ln -f -s ../../src/components/xapianAccessor/.libs/libXapianAccessor.dylib ./kiwix/components/xapianAccessor.dylib

kiwix/components/zimXapianIndexer.dylib:
	ln -f -s ../../src/components/zimXapianIndexer/.libs/libZimXapianIndexer.dylib  ./kiwix/components/zimXapianIndexer.dylib

kiwix/components/contentManager.dylib: 
	ln -f -s ../../src/components/contentManager/.libs/libContentManager.dylib ./kiwix/components/contentManager.dylib

bindist: 
	cd /tmp && ${bscript} --static $(VERSION)

deb: dist
	if [ `whereis dpkg-buildpackage | cut -f2 -d" "` == "dpkg-buildpackage:" ] ; then echo "You have to install dpkg-buildpackage" ; exit 1 ; fi
	tar -xvzf $(PACKAGE)-$(VERSION).tar.gz
	cp -r debian $(PACKAGE)-$(VERSION)/
	rm -rf `find $(PACKAGE)-$(VERSION)/debian/ -name "*.svn" -o -name "*.dat" -o -name "*~" -o -name "*#"`
	cd $(PACKAGE)-$(VERSION) ; dpkg-buildpackage -rfakeroot

rpm: dist
	$(MKDIR_P) ~/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
	echo "%_topdir $${HOME}/rpmbuild" > ~/.rpmmacros
	cp -f $(PACKAGE)-$(VERSION).tar.gz ~/rpmbuild/SOURCES/
	rpmbuild -ba fedora/kiwix.spec
	cp ~/rpmbuild/RPMS/*/*.rpm .

xo: 
	echo Not ready yet

# alter preferences: default skin is sugar. probably content location too.

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
	cp ./kiwix/components/zimAccessor.xpt Kiwix.app/Contents/Resources/components/zimAccessor.xpt
	cp ./kiwix/components/zimAccessor.dylib Kiwix.app/Contents/Resources/components/zimAccessor.dylib
	cp ./kiwix/components/xapianAccessor.xpt Kiwix.app/Contents/Resources/components/xapianAccessor.xpt
	cp ./kiwix/components/xapianAccessor.dylib Kiwix.app/Contents/Resources/components/xapianAccessor.dylib
	cp ./kiwix/components/zimXapianIndexer.xpt Kiwix.app/Contents/Resources/components/zimXapianIndexer.xpt
	cp ./kiwix/components/zimXapianIndexer.dylib Kiwix.app/Contents/Resources/components/zimXapianIndexer.dylib
	cp ./kiwix/components/contentManager.xpt Kiwix.app/Contents/Resources/components/contentManager.xpt
	cp ./kiwix/components/contentManager.dylib Kiwix.app/Contents/Resources/components/contentManager.dylib
	cp src/components/components.list Kiwix.app/Contents/Resources/components/components.list
	rsync -rl /Library/Frameworks/XUL.framework/ Kiwix.app/Contents/Frameworks/XUL.framework/
	cp /Library/Frameworks/XUL.framework/Versions/Current/xulrunner Kiwix.app/Contents/MacOS/xulrunner
	cp ./src/dependences/aria2/bin/aria2c Kiwix.app/Contents/Resources/aria2c
	cp $(PACKAGE)-$(VERSION)/kiwix/chrome/icons/default/main.icns Kiwix.app/Contents/Resources/kiwix.icns
	cp $(PACKAGE)-$(VERSION)/kiwix/chrome/icons/default/zim.icns Kiwix.app/Contents/Resources/kiwix-ZIM.icns
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
	cd src/ctpp2/src ; if [ ! -f ctpp2.lib ] ; then make -f Makefile.mvsc ; fi
	cd src/pugixml ; if [ ! -f pugixml.lib ] ; then make -f Makefile.mvsc ; fi
	cd src/components/xapianAccessor ; if [ ! -f xapianAccessor.dll ] ; then make -f Makefile.mvsc ; fi
	cd src/components/zimAccessor ; if [ ! -f zimAccessor.dll ] ; then make -f Makefile.mvsc ; fi
	cd src/components/zimXapianIndexer ; if [ ! -f zimXapianIndexer.dll ] ; then make -f Makefile.mvsc ; fi
	cd src/components/contentManager ; if [ ! -f contentManager.dll ] ; then make -f Makefile.mvsc ; fi
	cp src/components/xapianAccessor/xapianAccessor.dll kiwix/components/
	cp src/components/xapianAccessor/IXapianAccessor.xpt kiwix/components/xapianAccessor.xpt
	cp src/components/zimAccessor/zimAccessor.dll kiwix/components/
	cp src/components/zimAccessor/IZimAccessor.xpt kiwix/components/zimAccessor.xpt
	cp src/components/zimXapianIndexer/zimXapianIndexer.dll kiwix/components/
	cp src/components/zimXapianIndexer/IZimXapianIndexer.xpt kiwix/components/zimXapianIndexer.xpt
	cp src/components/contentManager/contentManager.dll kiwix/components/
	cp src/components/contentManager/IContentManager.xpt kiwix/components/contentManager.xpt
	cp -r src/dependences/xulrunner ./kiwix
	cp /c/Program\ Files/Microsoft\ Visual\ Studio\ 9.0/VC/redist/x86/Microsoft.VC90.CRT/* kiwix/xulrunner/
	cp -r src/dependences/xz/windows/liblzma.dll ./kiwix/xulrunner
	cp src/dependences/icu/bin/icudt*.dll ./kiwix/xulrunner
	cp src/dependences/icu/bin/icuin*.dll ./kiwix/xulrunner
	cp src/dependences/icu/bin/icuuc*.dll ./kiwix/xulrunner
	cp static/results.tmpl kiwix/chrome/static/results.tmpl
	rm -rf kiwix/xulrunner/dictionaries
	rm -rf kiwix/xulrunner/xulrunner-stub.exe
	rm -rf kiwix/xulrunner/README
	cd src/indexer ; if [ ! -f kiwix-index.exe ] ; then make -f Makefile.mvsc ; fi	
	cd src/manager ; if [ ! -f kiwix-manage.exe ] ; then make -f Makefile.mvsc ; fi	
	cd src/installer ; if [ ! -f kiwix-install.exe ] ; then make -f Makefile.mvsc ; fi	
	cp src/indexer/kiwix-index.exe ./kiwix/xulrunner
	cp src/manager/kiwix-manage.exe ./kiwix/xulrunner
	cp src/installer/kiwix-install.exe ./kiwix/xulrunner

windist: 
	rm -rf dvd/install dvd/kiwix
	svn update dvd/install
	svn update dvd/kiwix
	cp -rf kiwix dvd/
