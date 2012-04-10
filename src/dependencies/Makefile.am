# OSX uses fat binaries
if IS_OSX
COMPC="gcc -arch i386 -arch x86_64"
COMPCXX="g++ -arch i386 -arch x86_64"
else
COMPC=$(CC)
COMPCXX=$(CXX)
endif

# list of targets is built in configure.ac
deps: ${DEP_LIST}

if IS_LINUX
GECKOSDKURL=http://download.kiwix.org/dev/xulrunner-11.0.en-US.linux-$(ARCH).sdk.tar.bz2
else
GECKOSDKURL=http://download.kiwix.org/dev/xulrunner-11.0.en-US.mac-$(ARCH).sdk.tar.bz2
endif

XULRUNNERRUNTIMEURL=http://download.kiwix.org/dev/xulrunner-11.0.en-US.linux-$(ARCH).tar.bz2

####################################################
############ GECKO-SDK
####################################################
xulrunner-sdk.tar.bz2:
	wget -c $(GECKOSDKURL) -O xulrunner-sdk.tar.bz2
	

xulrunner-sdk: xulrunner-sdk.tar.bz2
	if test ! -d xulrunner-sdk; then tar -xf xulrunner-sdk.tar.bz2 ; fi;

####################################################
############ XULRUNNER-RUNTIME
####################################################
xulrunner-runtime.tar.bz2:
	wget -c $(XULRUNNERRUNTIMEURL) -O xulrunner-runtime.tar.bz2
	

xulrunner: xulrunner-runtime.tar.bz2
	if test ! -d xulrunner; then tar -xf xulrunner-runtime.tar.bz2 ; fi;

xulrunner-11.0.en-US.mac-pkg.dmg:
	wget -O xulrunner-11.0.en-US.mac-pkg.dmg -c http://download.kiwix.org/dev/xulrunner-11.0.en-US.mac-pkg.dmg
	hdiutil attach xulrunner-11.0.en-US.mac-pkg.dmg -noautoopen -quiet  -mountpoint /Volumes/xulrunner
	sudo installer -pkg /Volumes/xulrunner/xulrunner-11.0.en-US.mac.pkg -target /
	hdiutil detach /Volumes/xulrunner -quiet -force

####################################################
############ ZLIB
####################################################

zlib.tar.gz:
	wget -c -O zlib.tar.gz http://download.kiwix.org/dev/zlib-1.2.3.tar.gz 

zlib-1.2.3: zlib.tar.gz
	tar -xf zlib.tar.gz

# Linux
zlib-1.2.3/libz.a: zlib-1.2.3/
	cd zlib-1.2.3 && CFLAGS=" -fPIC " ./configure && make

zlib-1.2.3/libz.so zlib-1.2.3/libz.dylib: zlib-1.2.3/
	cd zlib-1.2.3 && CC=$(COMPC) CXX=$(COMPCXX) CFLAGS=" -fPIC " ./configure --shared && make

# Windows
zlib-1.2.3/zlib.lib: zlib-1.2.3
	cd zlib-1.2.3 ; cp ./win32/Makefile.msc ./ ; sed -e "s/\\-MD/\\-MT/" Makefile.msc > Makefile.msc.custom ; export MAKEFLAGS=; nmake.exe -f Makefile.msc.custom

####################################################
############ XAPIAN
####################################################

xapian-core.tar.gz:
	wget -c -O xapian-core.tar.gz http://download.kiwix.org/dev/xapian-core-1.2.3.tar.gz

xapian-core-1.2.3: xapian-core.tar.gz
	tar -xf xapian-core.tar.gz

# Linux
xapian-core-1.2.3/.libs/libxapian.so xapian-core-1.2.3/.libs/libxapian.dylib: xapian-core-1.2.3/
	cd xapian-core-1.2.3 && EXTERN_PATH=`pwd` CPPFLAGS="-I${CURRENT_PATH}/src/dependencies/zlib-1.2.3/" CXXFLAGS=" -fPIC -L${CURRENT_PATH}/src/dependencies/zlib-1.2.3" ./configure --enable-shared && make

# OSX Join
xapian-core-1.2.3/build/libxapian.dylib xapian-core-1.2.3/build/xapian-compact: xapian-core-1.2.3/build-i386/lib/libxapian.dylib xapian-core-1.2.3/build-x86_64/lib/libxapian.dylib xapian-core-1.2.3/build-i386/bin/xapian-compact xapian-core-1.2.3/build-x86_64/bin/xapian-compact
	mkdir -p xapian-core-1.2.3/build && cd xapian-core-1.2.3/build && lipo ../build-x86_64/lib/libxapian.dylib ../build-i386/lib/libxapian.dylib -create -output libxapian.dylib && lipo ../build-x86_64/bin/xapian-compact ../build-i386/bin/xapian-compact -create -output xapian-compact

# OSX i386
xapian-core-1.2.3/build-i386/lib/libxapian.dylib xapian-core-1.2.3/build-i386/bin/xapian-compact: xapian-core-1.2.3
	cd xapian-core-1.2.3 && mkdir -p build-i386 && EXTERN_PATH=`pwd` CC="gcc -arch i386" CXX="g++ -arch i386" CPPFLAGS="-I${CURRENT_PATH}/src/dependencies/zlib-1.2.3/" CXXFLAGS=" -fPIC -L${CURRENT_PATH}/src/dependencies/zlib-1.2.3" ./configure --enable-shared --prefix=$(DEP_PATH)/xapian-core-1.2.3/build-i386 && make clean && make && make install

# OSX x86_64
xapian-core-1.2.3/build-x86_64/lib/libxapian.dylib xapian-core-1.2.3/build-x86_64/bin/xapian-compact: xapian-core-1.2.3
	cd xapian-core-1.2.3 && mkdir -p build-x86_64 && EXTERN_PATH=`pwd` CC="gcc -arch x86_64" CXX="g++ -arch x86_64" CPPFLAGS="-I${CURRENT_PATH}/src/dependencies/zlib-1.2.3/" CXXFLAGS=" -fPIC -L${CURRENT_PATH}/src/dependencies/zlib-1.2.3" ./configure --enable-shared --prefix=$(DEP_PATH)/xapian-core-1.2.3/build-x86_64 && make clean && make && make install

# Windows
xapian-core-1.2.3/win32/Release/libs/libunicode.lib: xapian-core-1.2.3 xapian-win32.zip
	cd xapian-core-1.2.3/win32; sed -e "s/\\-MD/\\-MT/" config.mak > config.mak.bis
	cd xapian-core-1.2.3/win32; sed -e "s/C\\:\\\gnu\\\zlib123-dll/C\\:\\\mozilla\\-build\\\moulinkiwix\\\src\\\dependences\\\zlib\\-1\\.2\\.3/" config.mak.bis > config.mak
	cd xapian-core-1.2.3/win32; sed -e "s/zdll\\.lib/zlib\\.lib/" config.mak > config.mak.bis
	cd xapian-core-1.2.3/win32; sed -e "s/.ZLIB_DIR.\\\include/(ZLIB_DIR)/" config.mak.bis > config.mak
	cd xapian-core-1.2.3/win32; sed -e "s/.ZLIB_DIR.\\\lib/(ZLIB_DIR)/" config.mak > config.mak.bis
	cd xapian-core-1.2.3/win32; cp config.mak.bis config.mak
	cd xapian-core-1.2.3/win32; sed "/harness/{x;p;x;}" Makefile > Makefile.bis
	cd xapian-core-1.2.3/win32; sed "s/^.*harness.*$$/42:/" Makefile.bis > Makefile
	cd xapian-core-1.2.3/win32; export MAKEFLAGS=; nmake.exe -f Makefile

####################################################
############ ICU
####################################################

icu4c-4_4_2-src.tgz:
	wget -c -O icu4c-4_4_2-src.tgz http://download.kiwix.org/dev/icu4c-4_4_2-src.tgz

icu/: icu4c-4_4_2-src.tgz
	tar xf icu4c-4_4_2-src.tgz

# Linux
icu/source/lib/libicudata.so icu/source/lib/libicuuc.so icu/source/lib/libicui18n.so: icu/
	cd icu/source && mkdir -p build && CFLAGS=" -fPIC " ./runConfigureICU Linux --prefix=$(DEP_PATH)/icu/source/build && make && make install

# OSX FAT join
icu/source/build/libicudata.dylib icu/source/build/libicuuc.dylib icu/source/build/libicui18n.dylib: icu/source/build-x86_64/lib/libicudata.dylib icu/source/build-x86_64/lib/libicuuc.dylib icu/source/build-x86_64/lib/libicui18n.dylib icu/source/build-i386/lib/libicudata.dylib icu/source/build-i386/lib/libicuuc.dylib icu/source/build-i386/lib/libicui18n.dylib
	mkdir -p icu/source/build && cd icu/source/build && lipo ../build-x86_64/lib/libicudata.dylib ../build-i386/lib/libicudata.dylib -create -output libicudata.dylib && lipo ../build-x86_64/lib/libicuuc.dylib ../build-i386/lib/libicuuc.dylib -create -output libicuuc.dylib && lipo ../build-x86_64/lib/libicui18n.dylib ../build-i386/lib/libicui18n.dylib -create -output libicui18n.dylib

# OSX i386
icu/source/build-i386/lib/libicudata.dylib icu/source/build-i386/lib/libicuuc.dylib icu/source/build-i386/lib/libicui18n.dylib: icu/
	cd icu/source && mkdir -p build-i386 && CFLAGS=" -fPIC " ./runConfigureICU MacOSX --prefix=${DEP_PATH}/icu/source/build-i386 --with-library-bits=32 --disable-samples --disable-tests --disable-extras && make clean && make && make install

# OSX x86_64
icu/source/build-x86_64/lib/libicudata.dylib icu/source/build-x86_64/lib/libicuuc.dylib icu/source/build-x86_64/lib/libicui18n.dylib: icu/
	cd icu/source && mkdir -p build-x86_64 && CFLAGS=" -fPIC " ./runConfigureICU MacOSX --prefix=${DEP_PATH}/icu/source/build-x86_64 --with-library-bits=64 --disable-samples --disable-tests --disable-extras && make clean && make && make install

icu.zip:
	wget -c http://download.kiwix.org/dev/icu4c-4_4-Win32-msvc9.zip -O icu.zip

icu-win: icu.zip
	unzip -d icu-win/ icu.zip

####################################################
############ SQLITE
####################################################

sqlite-autoconf-3071000.tar.gz:
	wget -c -O sqlite-autoconf-3071000.tar.gz http://download.kiwix.org/dev/sqlite-autoconf-3071000.tar.gz

sqlite-autoconf-3071000: sqlite-autoconf-3071000.tar.gz
	tar xf sqlite-autoconf-3071000.tar.gz

sqlite-autoconf-3071000/.libs/libsqlite3.so sqlite-autoconf-3071000/.libs/libsqlite3.dylib: sqlite-autoconf-3071000/
	cd sqlite-autoconf-3071000 && CC=$(COMPC) CXX=$(COMPCXX) CFLAGS=" -fPIC " ./configure --enable-shared && make

####################################################
############ MICROHTTPD
####################################################

libmicrohttpd-0.9.19.tar.gz: 
	wget -c -O libmicrohttpd-0.9.19.tar.gz http://download.kiwix.org/dev/libmicrohttpd-0.9.19.tar.gz

libmicrohttpd-0.9.19: libmicrohttpd-0.9.19.tar.gz
	tar xf libmicrohttpd-0.9.19.tar.gz

libmicrohttpd-0.9.19/src/daemon/.libs/libmicrohttpd.so libmicrohttpd-0.9.19/src/daemon/.libs/libmicrohttpd.dylib: libmicrohttpd-0.9.19/
	cd libmicrohttpd-0.9.19 && CC=$(COMPC) CXX=$(COMPCXX) CFLAGS=" -fPIC " ./configure --enable-shared && make

####################################################
############ LZMA
####################################################

xz.tar.bz2:
if IS_WIN
	wget -c http://download.kiwix.org/dev/xz-4.999.9beta.tar.bz2 -O xz.tar.bz2
else 
if IS_OSX
	wget -c http://download.kiwix.org/dev/xz-4.999.9beta.tar.bz2 -O xz.tar.bz2
else
	wget -c http://download.kiwix.org/dev/xz-5.0.3.tar.bz2 -O xz.tar.bz2
endif
endif

xz: xz.tar.bz2
	tar -xf xz.tar.bz2
if IS_WIN
	mv xz-4.999.9beta xz
else
if IS_OSX
	mv xz-4.999.9beta xz
	echo "patching liblzma for OSX"
	cd xz && patch -p0 < ../patches/xz-4.999.9beta-sysctl-darwin.patch && patch -p0 < ../patches/xz-4.999.9beta-lzma-versioninfo.patch
else
	mv xz-5.0.3 xz
endif
endif

xz/src/liblzma/.libs/liblzma.so xz/src/liblzma/.libs/liblzma.dylib: xz/
	cd xz && CC=$(COMPC) CXX=$(COMPCXX) CFLAGS=" -fPIC " ./configure --disable-assembler --enable-shared && make

####################################################
############ ARIA2 (downloaded)
####################################################

aria2c: 
	wget -c -O aria2c http://download.kiwix.org/dev/aria2c.$(ARCH)
	chmod +x aria2c

aria2-1.10.9.dmg:
	wget -c -O aria2-1.14.2.dmg http://download.kiwix.org/dev/aria2-1.14.2.dmg

aria2-1.14.2.pkg: aria2-1.14.2.dmg
	mkdir -p ./aria_dmg
	hdiutil attach aria2-1.14.2.dmg -noautoopen -quiet -mountpoint ./aria_dmg
	cp -r ./aria_dmg/aria2-1.14.2.pkg aria2-1.14.2.pkg
	hdiutil detach ./aria_dmg

aria2-1.14.2/usr/bin/aria2c: aria2-1.14.2.pkg
	${CURRENT_PATH}/../maintenance_tools/unpkg.py aria2-1.14.2.pkg

####################################################
############ CLUCENE
####################################################

clucene-core-0.9.21b.tar.bz2:
	wget -c -O clucene-core-0.9.21b.tar.bz2 http://download.kiwix.org/dev/clucene-core-0.9.21b.tar.bz2

clucene-core-0.9.21b: clucene-core-0.9.21b.tar.bz2
	tar xf clucene-core-0.9.21b.tar.bz2

clucene-core-0.9.21b/src/.libs/libclucene.so clucene-core-0.9.21b/src/.libs/libclucene.dylib: clucene-core-0.9.21b/
	cd clucene-core-0.9.21b && CC=$(COMPC) CXX=$(COMPCXX) CXXFLAGS=" -fPIC " ./configure --enable-shared && make

####################################################
############ CLEANUP (ALL)
####################################################
CLEANFILES= \
	xapian-core-1.2.3 \
	zlib-1.2.3 \
	icu \
	xz \
	aria2-1.14.1 \
	clucene-core-0.9.21b \
	libmicrohttpd-0.9.19 \
	sqlite-autoconf-3071000

DISTCLEANFILES= \
	xapian-core.tar.gz xapian-win32.zip xapian-core-1.2.3 win32 \
	xz.tar.bz2 xz-4.999.9beta xz-5.0.3 \
	xulrunner-sdk-linux.tar.bz2 \
	xulrunner-sdk-win.zip xulrunner-sdk \
	xulrunner-win.zip xulrunner \
	xulrunner-source.tar.bz2 \
	icu icu.zip

# list of targets is built in configure.ac
all-local: deps