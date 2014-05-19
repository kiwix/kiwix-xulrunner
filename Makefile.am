# Subdirectories where to exectue Makefile recursively
SUBDIRS = \
	src \
	kiwix \
	desktop \
	static \
	etc

# Files and directories which should be include in the source
# distribution tgz
EXTRA_DIST = \
	kiwix \
	desktop \
	etc \
	android \
	CHANGELOG \
	autogen.sh \
	README

# Additional files to remove by remove by running "make clean"
CLEANFILES = \
	kiwix/components/zimAccessor.$(SHARED_EXT) \
	kiwix/components/zimAccessor.xpt \
	kiwix/components/xapianAccessor.$(SHARED_EXT) \
	kiwix/components/xapianAccessor.xpt \
	kiwix/components/zimXapianIndexer.$(SHARED_EXT) \
	kiwix/components/zimXapianIndexer.xpt \
	kiwix/components/contentManager$(SHARED_EXT). \
	kiwix/components/contentManager.xpt \
	kiwix/components/serverManager.$(SHARED_EXT) \
	kiwix/components/serverManager.xpt \
	kiwix*.deb \
	kiwix*.tar.gz \
	kiwix*.changes \
	kiwix*.dsc

# Additional things to remove by running "make clean"
clean-local:

UPDATE_MIME = \
	if which update-mime-database>/dev/null 2>&1; then \
		update-mime-database $(DESTDIR)$(prefix)/share/mime; \
	fi

UPDATE_DESKTOP = \
	if which update-desktop-database>/dev/null 2>&1 ; then \
		update-desktop-database; \
	fi

# Executed after the "all" rule, responsible to link/copy components
# files to the kiwix/components directory
all-local:
	$(LN_S) -f ../../src/components/zimAccessor/.libs/libZimAccessor.$(SHARED_EXT) ./kiwix/components/zimAccessor.$(SHARED_EXT)
	$(LN_S) -f ../../src/components/zimAccessor/zimAccessor.xpt ./kiwix/components/zimAccessor.xpt
	$(LN_S) -f ../../src/components/xapianAccessor/.libs/libXapianAccessor.$(SHARED_EXT) ./kiwix/components/xapianAccessor.$(SHARED_EXT)
	$(LN_S) -f ../../src/components/xapianAccessor/xapianAccessor.xpt ./kiwix/components/xapianAccessor.xpt
	$(LN_S) -f ../../src/components/zimXapianIndexer/.libs/libZimXapianIndexer.$(SHARED_EXT) ./kiwix/components/zimXapianIndexer.$(SHARED_EXT)
	$(LN_S) -f ../../src/components/zimXapianIndexer/zimXapianIndexer.xpt ./kiwix/components/zimXapianIndexer.xpt
	$(LN_S) -f ../../src/components/contentManager/.libs/libContentManager.$(SHARED_EXT) ./kiwix/components/contentManager.$(SHARED_EXT)
	$(LN_S) -f ../../src/components/contentManager/contentManager.xpt ./kiwix/components/contentManager.xpt
	$(LN_S) -f ../../src/components/serverManager/.libs/libServerManager.$(SHARED_EXT) ./kiwix/components/serverManager.$(SHARED_EXT)
	$(LN_S) -f ../../src/components/serverManager/serverManager.xpt ./kiwix/components/serverManager.xpt

dist-hook:
	rm -rf `find $(DESTDIR)$(distdir) -name "*.git" -o -name "*.so" -o -name "*.apk" -o -name "*.dat" -o -name "*~" -o -name "*#"`
	rm -rf $(DESTDIR)$(distdir)/android/platforms
	rm -rf `find $(DESTDIR)$(distdir) -name "Makefile"`
	find $(DESTDIR)$(distdir)/src/components/ -name 'I*.h' -delete
	find $(DESTDIR)$(distdir) -name 'aclocal.m4' -delete
	find $(DESTDIR)$(distdir)/kiwix/chrome -name 'chrome.manifest' -delete

install-exec-hook:
	rm -rf `find $(DESTDIR)$(libdir) -name "*.la" -o -name "*.a"`
	cd $(DESTDIR)$(libdir)/kiwix/components && ln -sf libZimXapianIndexer.$(SHARED_EXT) zimXapianIndexer.$(SHARED_EXT)
	cd $(DESTDIR)$(libdir)/kiwix/components && ln -sf libContentManager.$(SHARED_EXT) contentManager.$(SHARED_EXT)
	cd $(DESTDIR)$(libdir)/kiwix/components && ln -sf libServerManager.$(SHARED_EXT) serverManager.$(SHARED_EXT)
	cd $(DESTDIR)$(libdir)/kiwix/components && ln -sf libXapianAccessor.$(SHARED_EXT) xapianAccessor.$(SHARED_EXT)
	cd $(DESTDIR)$(libdir)/kiwix/components && ln -sf libZimAccessor.$(SHARED_EXT) zimAccessor.$(SHARED_EXT)


deb: dist
	if [ `whereis dpkg-buildpackage | cut -f2 -d" "` == "dpkg-buildpackage:" ] ; then echo "You have to install dpkg-buildpackage" ; exit 1 ; fi
	tar -xvzf $(PACKAGE)-$(VERSION).tar.gz
	rm -rf `find $(DESTDIR)$(distdir) -name "Makefile" -o -name "Makefile.in"`
	rm -rf `find $(PACKAGE)-$(VERSION)/debian/ -name "*.git" -o -name "*.dat" -o -name "*~" -o -name "*#"`
	rm -rf `find $(DESTDIR)$(distdir) -name "config.guess" -o -name "config.sub" -o -name "configure"`
	cd $(PACKAGE)-$(VERSION) ; dpkg-buildpackage -rfakeroot

rpm: dist
	$(MKDIR_P) ~/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
	echo "%_topdir $${HOME}/rpmbuild" > ~/.rpmmacros
	cp -f $(PACKAGE)-$(VERSION).tar.gz ~/rpmbuild/SOURCES/
	rpmbuild -ba fedora/kiwix.spec
	cp ~/rpmbuild/RPMS/*/*.rpm .

distdebian: dist
	rm -rf $(DISTDEBIAN_TMP)
	mkdir -p $(DISTDEBIAN_TMP)
	tar -C $(DISTDEBIAN_TMP) -xf $(PACKAGE)-$(VERSION).tar.gz
	tar -C $(DISTDEBIAN_TMP) -czf $(PACKAGE)-$(VERSION)-debian.tar.gz $(PACKAGE)-$(VERSION)

diststatic:
	rm -rf $(STATIC_TMP)
	mkdir -p $(STATIC_TMP)

	cp -Lr ./kiwix $(STATIC_TMP)/
	rm -rf `find $(STATIC_TMP)/kiwix -type d -name .git`
	find $(STATIC_TMP)/kiwix -name '*.inised' -exec rm -rf {} \;
	find $(STATIC_TMP)/kiwix -name 'Makefile' -delete
	find $(STATIC_TMP)/kiwix -name 'Makefile.in' -delete
	find $(STATIC_TMP)/kiwix -name 'Makefile.am*' -delete

	mv $(STATIC_TMP)/kiwix/chrome/content/main/js/logger_rlz.js $(STATIC_TMP)/kiwix/chrome/content/main/js/logger.js

	if [ -f $(STATIC_TMP)/kiwix/chrome/content.jar ] ; then rm -rf $(STATIC_TMP)/kiwix/chrome/content ; fi
	-rm -f $(STATIC_TMP)/kiwix/chrome/chrome.manifest.{prod,dev}
	if [ -f $(STATIC_TMP)/kiwix/chrome/locale.jar ] ; then rm -rf $(STATIC_TMP)/kiwix/chrome/locale ; fi
	if [ -f $(STATIC_TMP)/kiwix/chrome/skin.jar ] ; then rm -rf $(STATIC_TMP)/kiwix/chrome/skin ; fi

	cp -r $(XULRUNNER_RUNTIME_PATH) $(STATIC_TMP)/kiwix/xulrunner
	if [ -f "$(STATIC_TMP)/kiwix/xulrunner/xulrunner-bin" ] ; then chmod +x "$(STATIC_TMP)/kiwix/xulrunner/xulrunner-bin" ; fi
	if [ -f "$(STATIC_TMP)/kiwix/xulrunner/xulrunner" ] ; then chmod +x "$(STATIC_TMP)/kiwix/xulrunner/xulrunner" ; fi
	cp -v $(STATIC_TMP)/kiwix/xulrunner/libplc4.so $(STATIC_TMP)/kiwix/xulrunner/libplc4.so.0d
	cp -v $(STATIC_TMP)/kiwix/xulrunner/libnspr4.so $(STATIC_TMP)/kiwix/xulrunner/libnspr4.so.0d
	cp -v $(STATIC_TMP)/kiwix/xulrunner/libplds4.so $(STATIC_TMP)/kiwix/xulrunner/libplds4.so.0d
	rm -rf $(STATIC_TMP)/kiwix/xulrunner/dictionaries
	rm -f $(STATIC_TMP)/kiwix/xulrunner/xulrunner-stub
	rm -f $(STATIC_TMP)/kiwix/xulrunner/README
	rm -f $(STATIC_TMP)/kiwix/xulrunner/updater
	rm -f $(STATIC_TMP)/kiwix/xulrunner/plugin-container
	rm -f $(STATIC_TMP)/kiwix/xulrunner/mozilla-xremote-client
	rm -f $(STATIC_TMP)/kiwix/xulrunner/crashreporter

	cp -Lv $(EMBED_LIBS) $(STATIC_TMP)/kiwix/xulrunner/
	chmod +x $(STATIC_TMP)/kiwix/xulrunner/*.so

	ln -s ./liblzma.so $(STATIC_TMP)/kiwix/xulrunner/liblzma.so.5

	ln -s ./libz.so $(STATIC_TMP)/kiwix/xulrunner/libz.so.1
	ln -s ./libxapian.so $(STATIC_TMP)/kiwix/xulrunner/libxapian.so.22
	ln -s ./libicuuc.so $(STATIC_TMP)/kiwix/xulrunner/libicuuc.so.44
	ln -s ./libicudata.so $(STATIC_TMP)/kiwix/xulrunner/libicudata.so.44
	ln -s ./libicui18n.so $(STATIC_TMP)/kiwix/xulrunner/libicui18n.so.44
	ln -s ./libicuuc.so $(STATIC_TMP)/kiwix/xulrunner/libicuuc.so.49
	ln -s ./libicudata.so $(STATIC_TMP)/kiwix/xulrunner/libicudata.so.49
	ln -s ./libicui18n.so $(STATIC_TMP)/kiwix/xulrunner/libicui18n.so.49
	ln -s ./libsqlite3.so $(STATIC_TMP)/kiwix/xulrunner/libsqlite3.so.0
	ln -s ./liblzma.so $(STATIC_TMP)/kiwix/xulrunner/liblzma.so.2
	ln -s ./libzim.so $(STATIC_TMP)/kiwix/xulrunner/libzim.so.0
	ln -s ./libctpp2.so $(STATIC_TMP)/kiwix/xulrunner/libctpp2.so.2


	strip `find $(STATIC_TMP)/kiwix -executable -type f | grep -v ".sh" | grep -v ".py" | grep -v sugar` || true

	cp -v src/launcher/kiwix-launcher $(STATIC_TMP)/kiwix/kiwix

	mkdir -p $(STATIC_TMP)/kiwix/bin
	cp -v $(ARIA2_FILES) $(STATIC_TMP)/kiwix/bin/aria2c
	cp -v $(XAPIAN_COMPACT) $(STATIC_TMP)/kiwix/bin/xapian-compact

if WITH_READER
	cp src/reader/kiwix-read $(STATIC_TMP)/kiwix/bin/
endif

if WITH_SEARCHER
	cp src/searcher/kiwix-search $(STATIC_TMP)/kiwix/bin/
endif

if WITH_INDEXER
	cp src/indexer/kiwix-index $(STATIC_TMP)/kiwix/bin/
endif

if WITH_MANAGER
	cp src/manager/kiwix-manage $(STATIC_TMP)/kiwix/bin/
endif

if WITH_INSTALLER
	cp src/installer/kiwix-install $(STATIC_TMP)/kiwix/bin/
endif

if WITH_SERVER
	cp src/server/kiwix-serve $(STATIC_TMP)/kiwix/bin/
endif

	rm $(STATIC_TMP)/kiwix/*.bat
	rm $(STATIC_TMP)/kiwix/xulrunner/libmicrohttpd.so

	tar -C $(STATIC_TMP) -cjf $(PACKAGE)-$(VERSION)-static-$(ARCH).tar.bz2 kiwix

# Sugar for Fedora9
distsugar: diststatic
	rm -rf $(SUGAR_TMP)/Kiwix.activity
	mkdir -p $(SUGAR_TMP)/Kiwix.activity

	tar -xf $(PACKAGE)-$(VERSION)-static-$(ARCH).tar.bz2 -C $(SUGAR_TMP)/Kiwix.activity --strip-components=1

	cp -rv src/sugar/lib src/sugar/activity src/sugar/setup.py $(SUGAR_TMP)/Kiwix.activity/

#	kiwix console tools are not necessary to run kiwix and need pretty much mass storage
#	cp -rv src/sugar/bin/* $(SUGAR_TMP)/Kiwix.activity/bin/

	sed -i -e "s/^pref(\"general.skins.selectedSkin\", \"default\");/pref(\"general.skins.selectedSkin\", \"sugar\");/" $(SUGAR_TMP)/Kiwix.activity/defaults/preferences/preferences.js
	sed -i -e "s/^resource defaultskin skin\/default\//resource defaultskin skin\/sugar\//" $(SUGAR_TMP)/Kiwix.activity/chrome/chrome.manifest
	sed -i -e "s/^resource defaultskin jar:skin.jar!\/skin\/default\//resource defaultskin jar:skin.jar!\/skin\/sugar\//" $(SUGAR_TMP)/Kiwix.activity/chrome/chrome.manifest
	sed -i -e "s/^pref(\"kiwix.downloadRemoteCatalogs\", undefined);/pref(\"kiwix.downloadRemoteCatalogs\", false);/" $(SUGAR_TMP)/Kiwix.activity/defaults/preferences/preferences.js
	sed -i -e "s/^pref(\"kiwix.isHighDPI\", false);/pref(\"kiwix.isHighDPI\", true);/" $(SUGAR_TMP)/Kiwix.activity/defaults/preferences/preferences.js

	rm -f $(SUGAR_TMP)/Kiwix.activity/bin/aria2c

	find $(SUGAR_TMP) -name "\.git" -exec rm -rf {} \; || /bin/true

	cd $(SUGAR_TMP)/Kiwix.activity && find ./ -type f | sed 's,^./,,g' | grep -v MANIFEST > MANIFEST || /bin/true && cd -

	cd $(SUGAR_TMP) && zip -r Kiwix-$(SUGAR_VERSION).xo Kiwix.activity && mv Kiwix-$(SUGAR_VERSION).xo ./Kiwix.activity

	mv $(SUGAR_TMP)/Kiwix.activity/Kiwix-$(SUGAR_VERSION).xo Kiwix-$(SUGAR_VERSION).xo

# Mac OSX rule
# requires install of XR
distmac:

	rm -rf kiwix_dmg
	rm -rf Kiwix.app
	$(MKDIR_P) Kiwix.app
	$(MKDIR_P) Kiwix.app/Contents
# $(MKDIR_P) Kiwix.app/Contents/Frameworks
	$(MKDIR_P) Kiwix.app/Contents/MacOS
	$(MKDIR_P) Kiwix.app/Contents/Resources

# Resources only contain English.lproj
	$(MKDIR_P) Kiwix.app/Contents/Resources/English.lproj
	cp -v src/macosx/InfoPlist.strings Kiwix.app/Contents/Resources/English.lproj/InfoPlist.strings
	cp -v src/macosx/icons/KIWIX-icon-1024.icns Kiwix.app/Contents/Resources/kiwix.icns
	cp -v src/macosx/icons/KIWIX-icon-zim-1024.icns Kiwix.app/Contents/Resources/kiwix-ZIM.icns

# Contents
	cp -v src/macosx/Info.plist Kiwix.app/Contents/Info.plist
	cp -v src/macosx/PkgInfo Kiwix.app/Contents/PkgInfo

# MacOS contains everything
	cp -LR ./kiwix/ Kiwix.app/Contents/MacOS/
	rm -rf `find Kiwix.app/Contents/Resources -type d -name .git`
	find Kiwix.app/Contents/MacOS -name '*.inised' -exec rm -rf {} \;
	find Kiwix.app/Contents/MacOS -name 'Makefile' -delete
	find Kiwix.app/Contents/MacOS -name 'Makefile.in' -delete
	find Kiwix.app/Contents/MacOS -name 'Makefile.am*' -delete

	find Kiwix.app/Contents/MacOS/components/ -type l -delete
	cp -v ./kiwix/components/zimAccessor.xpt Kiwix.app/Contents/MacOS/components/zimAccessor.xpt
	cp -v ./kiwix/components/zimAccessor.dylib Kiwix.app/Contents/MacOS/components/zimAccessor.dylib
	cp -v ./kiwix/components/xapianAccessor.xpt Kiwix.app/Contents/MacOS/components/xapianAccessor.xpt
	cp -v ./kiwix/components/xapianAccessor.dylib Kiwix.app/Contents/MacOS/components/xapianAccessor.dylib
	cp -v ./kiwix/components/zimXapianIndexer.xpt Kiwix.app/Contents/MacOS/components/zimXapianIndexer.xpt
	cp -v ./kiwix/components/zimXapianIndexer.dylib Kiwix.app/Contents/MacOS/components/zimXapianIndexer.dylib
	cp -v ./kiwix/components/contentManager.xpt Kiwix.app/Contents/MacOS/components/contentManager.xpt
	cp -v ./kiwix/components/contentManager.dylib Kiwix.app/Contents/MacOS/components/contentManager.dylib
	cp -v ./kiwix/components/serverManager.xpt Kiwix.app/Contents/MacOS/components/serverManager.xpt
	cp -v ./kiwix/components/serverManager.dylib Kiwix.app/Contents/MacOS/components/serverManager.dylib
	cp -v src/components/components.list Kiwix.app/Contents/MacOS/components/components.list

# XR
	rsync -av --copy-unsafe-links $(DEP_PATH)/xr_target/xulrunner-$(EXACT_GECKO_VERSION).en-US.mac/XUL.framework/Versions/Current/ Kiwix.app/Contents/MacOS/
# cp -v $(DEP_PATH)/xr_target/xulrunner-$(EXACT_GECKO_VERSION).en-US.mac/XUL.framework/Versions/Current/xulrunner Kiwix.app/Contents/MacOS/xulrunner

	find Kiwix.app/Contents/MacOS/components -type f -name '*.dylib' -exec python ./src/macosx/cleanup_rpath.py c {} \;

	find Kiwix.app/Contents/MacOS -type f -name '*.dylib' -exec python ./src/macosx/cleanup_rpath.py l {} \;

	mv Kiwix.app/Contents/MacOS/chrome/content/main/js/logger_rlz.js Kiwix.app/Contents/MacOS/chrome/content/main/js/logger.js

	if [ -f Kiwix.app/Contents/MacOS/chrome/content.jar ] ; then rm -rf Kiwix.app/Contents/MacOS/chrome/content ; fi
	-rm -f Kiwix.app/Contents/MacOS/chrome/chrome.manifest.{prod,dev}
	if [ -f Kiwix.app/Contents/MacOS/chrome/locale.jar ] ; then rm -rf Kiwix.app/Contents/MacOS/chrome/locale ; fi
	if [ -f Kiwix.app/Contents/MacOS/chrome/skin.jar ] ; then rm -rf Kiwix.app/Contents/MacOS/chrome/skin ; fi

	cp -RLv $(EMBED_LIBS) Kiwix.app/Contents/MacOS/

	strip `find Kiwix.app/Contents/MacOS -executable -type f | grep -v ".sh" | grep -v ".py" | grep -v sugar` || true

	mkdir -p Kiwix.app/Contents/MacOS/bin
	cp -v $(ARIA2_FILES) Kiwix.app/Contents/MacOS/bin/aria2c
	cp -v $(XAPIAN_COMPACT) Kiwix.app/Contents/MacOS/bin/xapian-compact

if WITH_INDEXER
	cp -v src/indexer/kiwix-index Kiwix.app/Contents/MacOS/bin/
endif

if WITH_MANAGER
	cp -v src/manager/kiwix-manage Kiwix.app/Contents/MacOS/bin/
endif

if WITH_INSTALLER
	cp -v src/installer/kiwix-install Kiwix.app/Contents/MacOS/bin/
endif

if WITH_SERVER
	cp -v src/server/kiwix-serve Kiwix.app/Contents/MacOS/bin/
endif

if WITH_READER
	cp -v src/reader/kiwix-read Kiwix.app/Contents/MacOS/bin/
endif

if WITH_SEARCHER
	cp -v src/searcher/kiwix-search Kiwix.app/Contents/MacOS/bin/
endif

	chmod +x Kiwix.app/Contents/MacOS/bin/*
	rm Kiwix.app/Contents/MacOS/*.bat

	sed -i -e 's,\.so,\.dylib,g' Kiwix.app/Contents/MacOS/chrome.manifest

# cp -v Kiwix.app/Contents/Frameworks/XUL.framework/Versions/Current/libmozglue.dylib Kiwix.app/Contents/MacOS/libmozglue.dylib

	chmod -R 755 Kiwix.app

	bunzip2 -kf src/macosx/kiwix_template.dmg.bz2
	$(MKDIR_P) kiwix_dmg
	hdiutil attach src/macosx/kiwix_template.dmg -noautoopen -quiet -mountpoint ./kiwix_dmg
	rm -rf ./kiwix_dmg/Kiwix.app
	mv Kiwix.app kiwix_dmg/
	hdiutil detach ./kiwix_dmg -quiet -force
	rm -f $(PACKAGE)-$(VERSION)-$(ARCH).dmg
	hdiutil convert src/macosx/kiwix_template.dmg -quiet -format UDZO -imagekey zlib-level=9 -o $(PACKAGE)-$(VERSION)-$(ARCH).dmg
	rm -f src/macosx/kiwix_template.dmg

universal: $(PACKAGE)-$(VERSION)-i386.dmg $(PACKAGE)-$(VERSION)-x86_64.dmg
	rm -rf universal_tmp
	mkdir -p universal_tmp/{i386,x86_64,ub}

	hdiutil attach $(PACKAGE)-$(VERSION)-i386.dmg -noautoopen -quiet -mountpoint universal_tmp/i386
	hdiutil attach $(PACKAGE)-$(VERSION)-x86_64.dmg -noautoopen -quiet -mountpoint universal_tmp/x86_64

	bunzip2 -kf src/macosx/kiwix_template.dmg.bz2
	hdiutil attach src/macosx/kiwix_template.dmg -noautoopen -quiet -mountpoint universal_tmp/ub
	rm -rf universal_tmp/ub/Kiwix.app
	rsync -av --copy-unsafe-links universal_tmp/x86_64/Kiwix.app universal_tmp/ub/

	lipo -create -output universal_tmp/ub/Kiwix.app/Contents/MacOS/components/zimAccessor.dylib -arch i386 universal_tmp/i386/Kiwix.app/Contents/MacOS/components/zimAccessor.dylib -arch x86_64 universal_tmp/x86_64/Kiwix.app/Contents/MacOS/components/zimAccessor.dylib

	lipo -create -output universal_tmp/ub/Kiwix.app/Contents/MacOS/components/contentManager.dylib -arch i386 universal_tmp/i386/Kiwix.app/Contents/MacOS/components/contentManager.dylib -arch x86_64 universal_tmp/x86_64/Kiwix.app/Contents/MacOS/components/contentManager.dylib

	lipo -create -output universal_tmp/ub/Kiwix.app/Contents/MacOS/components/serverManager.dylib -arch i386 universal_tmp/i386/Kiwix.app/Contents/MacOS/components/serverManager.dylib -arch x86_64 universal_tmp/x86_64/Kiwix.app/Contents/MacOS/components/serverManager.dylib

	lipo -create -output universal_tmp/ub/Kiwix.app/Contents/MacOS/components/xapianAccessor.dylib -arch i386 universal_tmp/i386/Kiwix.app/Contents/MacOS/components/xapianAccessor.dylib -arch x86_64 universal_tmp/x86_64/Kiwix.app/Contents/MacOS/components/xapianAccessor.dylib

	lipo -create -output universal_tmp/ub/Kiwix.app/Contents/MacOS/components/zimXapianIndexer.dylib -arch i386 universal_tmp/i386/Kiwix.app/Contents/MacOS/components/zimXapianIndexer.dylib -arch x86_64 universal_tmp/x86_64/Kiwix.app/Contents/MacOS/components/zimXapianIndexer.dylib

if WITH_INDEXER
	lipo -create -output universal_tmp/ub/Kiwix.app/Contents/MacOS/bin/kiwix-index -arch i386 universal_tmp/i386/Kiwix.app/Contents/MacOS/bin/kiwix-index -arch x86_64 universal_tmp/x86_64/Kiwix.app/Contents/MacOS/bin/kiwix-index
endif

if WITH_MANAGER
	lipo -create -output universal_tmp/ub/Kiwix.app/Contents/MacOS/bin/kiwix-manage -arch i386 universal_tmp/i386/Kiwix.app/Contents/MacOS/bin/kiwix-manage -arch x86_64 universal_tmp/x86_64/Kiwix.app/Contents/MacOS/bin/kiwix-manage
endif

if WITH_INSTALLER
	lipo -create -output universal_tmp/ub/Kiwix.app/Contents/MacOS/bin/kiwix-install -arch i386 universal_tmp/i386/Kiwix.app/Contents/MacOS/bin/kiwix-install -arch x86_64 universal_tmp/x86_64/Kiwix.app/Contents/MacOS/bin/kiwix-install
endif

if WITH_SERVER
	lipo -create -output universal_tmp/ub/Kiwix.app/Contents/MacOS/bin/kiwix-serve -arch i386 universal_tmp/i386/Kiwix.app/Contents/MacOS/bin/kiwix-serve -arch x86_64 universal_tmp/x86_64/Kiwix.app/Contents/MacOS/bin/kiwix-serve
endif

if WITH_READER
	lipo -create -output universal_tmp/ub/Kiwix.app/Contents/MacOS/bin/kiwix-read -arch i386 universal_tmp/i386/Kiwix.app/Contents/MacOS/bin/kiwix-read -arch x86_64 universal_tmp/x86_64/Kiwix.app/Contents/MacOS/bin/kiwix-read
endif

if WITH_SEARCHER
	lipo -create -output universal_tmp/ub/Kiwix.app/Contents/MacOS/bin/kiwix-search -arch i386 universal_tmp/i386/Kiwix.app/Contents/MacOS/bin/kiwix-search -arch x86_64 universal_tmp/x86_64/Kiwix.app/Contents/MacOS/bin/kiwix-search
endif

	find universal_tmp/ub/Kiwix.app/Contents/MacOS/components -type f -name '*.dylib' -exec python ./src/macosx/cleanup_rpath.py c {} \;

	find universal_tmp/ub/Kiwix.app/Contents/MacOS -type f -name '*.dylib' -exec python ./src/macosx/cleanup_rpath.py l {} \;

	find universal_tmp/ub/Kiwix.app/Contents/MacOS/bin -type f -name '*' -exec python ./src/macosx/cleanup_rpath.py b {} \;


	cp -v $(COMPILED_XULRUNNERBIN_FILES) universal_tmp/ub/Kiwix.app/Contents/MacOS/kiwix
	chmod +x universal_tmp/ub/Kiwix.app/Contents/MacOS/kiwix

	cd universal_tmp/ub/Kiwix.app/Contents/MacOS/bin && ln -s ../icudt49l.dat . && cd -

	hdiutil detach universal_tmp/i386 -quiet -force
	hdiutil detach universal_tmp/x86_64 -quiet -force

	hdiutil detach universal_tmp/ub -quiet -force
	rm -f $(PACKAGE)-$(VERSION).dmg
	hdiutil convert src/macosx/kiwix_template.dmg -quiet -format UDZO -imagekey zlib-level=9 -o $(PACKAGE)-$(VERSION).dmg
	rm -f src/macosx/kiwix_template.dmg

if SIGN_BUILD
	./sign_osx_build $(PACKAGE)-$(VERSION).dmg $(PACKAGE)-$(VERSION)s.dmg "$(CERTIFICATE)"
endif

distserver:
	strip src/server/kiwix-serve src/indexer/kiwix-index src/reader/kiwix-read src/searcher/kiwix-search src/manager/kiwix-manage || true
	tar -C src/server/ -cf $(PACKAGE)-$(VERSION)-server_$(ARCH).tar kiwix-serve
	tar -C src/indexer/ -rf $(PACKAGE)-$(VERSION)-server_$(ARCH).tar kiwix-index
	tar -C src/manager/ -rf $(PACKAGE)-$(VERSION)-server_$(ARCH).tar kiwix-manage
	tar -C src/reader/ -rf $(PACKAGE)-$(VERSION)-server_$(ARCH).tar kiwix-read
	tar -C src/searcher/ -rf $(PACKAGE)-$(VERSION)-server_$(ARCH).tar kiwix-search
	bzip2 -f $(PACKAGE)-$(VERSION)-server_$(ARCH).tar

# Windows rule
win:
	cd $(DEP_PATH) ; make
	cd src/components/xapianAccessor ; if [ ! -f xapianAccessor.dll ] ; then make -f Makefile.msvc ; fi
	cd src/components/zimAccessor ; if [ ! -f zimAccessor.dll ] ; then make -f Makefile.msvc ; fi
	cd src/components/zimXapianIndexer ; if [ ! -f zimXapianIndexer.dll ] ; then make -f Makefile.msvc ; fi
	cd src/components/contentManager ; if [ ! -f contentManager.dll ] ; then make -f Makefile.msvc ; fi
	cd src/components/serverManager ; if [ ! -f serverManager.dll ] ; then make -f Makefile.msvc ; fi
	cp src/components/xapianAccessor/xapianAccessor.dll kiwix/components/
	cp src/components/xapianAccessor/IXapianAccessor.xpt kiwix/components/xapianAccessor.xpt
	cp src/components/zimAccessor/zimAccessor.dll kiwix/components/
	cp src/components/zimAccessor/IZimAccessor.xpt kiwix/components/zimAccessor.xpt
	cp src/components/zimXapianIndexer/zimXapianIndexer.dll kiwix/components/
	cp src/components/zimXapianIndexer/IZimXapianIndexer.xpt kiwix/components/zimXapianIndexer.xpt
	cp src/components/contentManager/contentManager.dll kiwix/components/
	cp src/components/contentManager/IContentManager.xpt kiwix/components/contentManager.xpt
	cp src/components/serverManager/serverManager.dll kiwix/components/
	cp src/components/serverManager/IServerManager.xpt kiwix/components/serverManager.xpt
	cp -r $(XULRUNNER_RUNTIME_PATH) ./kiwix

	mv ./kiwix/chrome/content/main/js/logger_rlz.js ./kiwix/chrome/content/main/js/logger.js

	cd ./kiwix/chrome ; make

	if [ -f ./kiwix/chrome/content.jar ] ; then rm -rf ./kiwix/chrome/content ; fi
	-rm -f ./kiwix/chrome/chrome.manifest.{prod,dev}
	if [ -f ./kiwix/chrome/locale.jar ] ; then rm -rf ./kiwix/chrome/locale ; fi
	if [ -f ./kiwix/chrome/skin.jar ] ; then rm -rf ./kiwix/chrome/skin ; fi

	cp -r $(DEP_PATH)/xz-win/bin_i486/liblzma.dll ./kiwix/xulrunner
	cp -r $(DEP_PATH)/pthread-win32/lib/pthreadVC2.dll ./kiwix/xulrunner
	cp $(DEP_PATH)/icu/bin/icudt*.dll ./kiwix/xulrunner
	cp $(DEP_PATH)/icu/bin/icuin*.dll ./kiwix/xulrunner
	cp $(DEP_PATH)/icu/bin/icuuc*.dll ./kiwix/xulrunner
	cp $(DEP_PATH)/libmicrohttpd/bin/*dll ./kiwix/xulrunner
	cp $(DEP_PATH)/msvc100/* ./kiwix/xulrunner/
	rm -rf kiwix/xulrunner/dictionaries
	rm -f kiwix/xulrunner/xulrunner-stub.exe
	rm -f kiwix/xulrunner/README
	rm -f kiwix/xulrunner/updater.exe
	rm -f kiwix/xulrunner/plugin-container.exe
	rm -f kiwix/xulrunner/mozilla-xremote-client.exe
	rm -f kiwix/xulrunner/crashreporter.exe

if WITH_INDEXER
	cd src/indexer ; if [ ! -f kiwix-index.exe ] ; then make -f Makefile.msvc ; fi
	cp src/indexer/kiwix-index.exe ./kiwix/xulrunner
endif

if WITH_MANAGER
	cd src/manager ; if [ ! -f kiwix-manage.exe ] ; then make -f Makefile.msvc ; fi
	cp src/manager/kiwix-manage.exe ./kiwix/xulrunner
endif

if WITH_INSTALLER
	cd src/installer ; if [ ! -f kiwix-install.exe ] ; then make -f Makefile.msvc ; fi
	cp src/installer/kiwix-install.exe ./kiwix/xulrunner
endif

if WITH_SERVER
	cd src/server ; if [ ! -f kiwix-serve.exe ] ; then make -f Makefile.msvc ; fi
	cp src/server/kiwix-serve.exe ./kiwix/xulrunner
endif

	bash -c "sed -e 's,\.so,\.dll,g' kiwix/chrome.manifest > kiwix/chrome.manifest.sed"
	mv kiwix/chrome.manifest.sed kiwix/chrome.manifest
	mkdir -p kiwix/bin
	cp -v $(ARIA2_FILES) kiwix/bin/

windist:
	cp -rf kiwix dvd/
	find dvd/kiwix -name '*.inised' -exec rm -rf {} \;
	find dvd/kiwix -name 'Makefile' -delete
	find dvd/kiwix -name 'Makefile.in' -delete
	find dvd/kiwix -name 'Makefile.am*' -delete
	find dvd/kiwix -name '*.git' -delete
	-rm -f dvd/kiwix/kiwix
	-rm -f dvd/kiwix/kiwix-compact
	-rm -f dvd/kiwix/kiwix/chrome/chrome.manifest.{prod,dev}

wininstaller:
	cd installer ; ruby make-installer.rb --path=../dvd/ --allinone
	mv dvd/install/kiwix-install.exe $(PACKAGE)-$(VERSION)-installer.exe
	cd installer ; ruby make-installer.rb --path=../dvd/
	cd dvd ; 7z a -mx=9 -tzip -r -y -xr\!?svn\* -xr\!?svn ../$(PACKAGE)-$(VERSION)-win.zip install kiwix
