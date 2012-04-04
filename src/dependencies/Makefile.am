# list of targets is built in configure.ac
deps: ${DEP_LIST}

if IS_LINUX
GECKOSDKURL=http://download.kiwix.org/dev/xulrunner-11.0.en-US.linux-$(ARCH).sdk.tar.bz2
else
GECKOSDKURL=http://download.kiwix.org/dev/xulrunner-11.0.en-US.mac-$(ARCH).sdk.tar.bz2
endif

if IS_LINUX
XULRUNNERRUNTIMEURL=http://download.kiwix.org/dev/xulrunner-11.0.en-US.linux-$(ARCH).tar.bz2
else
XULRUNNERRUNTIMEURL=http://download.kiwix.org/dev/xulrunner-11.0.en-US.mac-pkg.dmg
endif

####################################################
############ GECKO-SDK
####################################################
xulrunner-sdk.tar.bz2:
	wget -c $(XULRUNNERRUNTIMEURL) -O xulrunner-sdk.tar.bz2
	

xulrunner-sdk: xulrunner-sdk.tar.bz2
	if test ! -d xulrunner-sdk; then tar -xf xulrunner-sdk.tar.bz2 ; fi;

####################################################
############ XULRUNNER-RUNTIME
####################################################
xulrunner-runtime.tar.bz2:
	wget -c $(GECKOSDKURL) -O xulrunner-runtime.tar.bz2
	

xulrunner: xulrunner-runtime.tar.bz2
	if test ! -d xulrunner; then tar -xf xulrunner-runtime.tar.bz2 ; fi;

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

zlib-1.2.3/libz.so: zlib-1.2.3/
	cd zlib-1.2.3 && CFLAGS=" -fPIC " ./configure --shared && make

# OSX
libz-fat.a: zlib-1.2.3/
	cd zlib-1.2.3 && CC="gcc -arch $(ARCH)" CXX="g++ -arch $(ARCH)" CPP="gcc -E" CXXCPP="g++ -E" CFLAGS=" -fPIC " ./configure --enable-static --disable-shared && make && cp libz.a ../libz-fat.a

libz-i386.a: libz-fat.a
	lipo -thin i386 libz-fat.a -output libz-i386.a

libz-x86_64.a: libz-fat.a
	lipo -thin x86_64 libz-fat.a -output libz-x86_64.a

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
xapian-core-1.2.3/.libs/libxapian.a: xapian-core-1.2.3/
	cd xapian-core-1.2.3 && EXTERN_PATH=`pwd` CPPFLAGS="-I${CURRENT_PATH}/src/dependences/zlib-1.2.3/" CXXFLAGS=" -fPIC -L${CURRENT_PATH}/src/dependences/zlib-1.2.3" ./configure --enable-static --enable-shared && make

xapian-core-1.2.3/.libs/libxapian.so: xapian-core-1.2.3/
	cd xapian-core-1.2.3 && EXTERN_PATH=`pwd` CPPFLAGS="-I${CURRENT_PATH}/src/dependences/zlib-1.2.3/" CXXFLAGS=" -fPIC -L${CURRENT_PATH}/src/dependences/zlib-1.2.3" ./configure --enable-static --enable-shared && make

# OSX
libxapian-fat.a: libxapian-i386.a libxapian-x86_64.a
	lipo libxapian-i386.a libxapian-x86_64.a -create -output libxapian-fat.a

libxapian-i386.a: xapian-core-1.2.3/
	cd xapian-core-1.2.3 && EXTERN_PATH=`pwd` CC="gcc -arch i386" CXX="g++ -arch i386" CPP="gcc -E" CXXCPP="g++ -E" CPPFLAGS="-I${CURRENT_PATH}/src/dependences/zlib-1.2.3/" CXXFLAGS=" -fPIC -L${CURRENT_PATH}/src/dependences/zlib-1.2.3" ./configure --enable-static --disable-shared && make clean && make && mv .libs/libxapian.a ../libxapian-i386.a

libxapian-x86_64.a: xapian-core-1.2.3/
	cd xapian-core-1.2.3 && EXTERN_PATH=`pwd` CC="gcc -arch x86_64" CXX="g++ -arch x86_64" CPP="gcc -E" CXXCPP="g++ -E" CPPFLAGS="-I${CURRENT_PATH}/src/dependences/zlib-1.2.3/" CXXFLAGS=" -fPIC -L${CURRENT_PATH}/src/dependences/zlib-1.2.3" ./configure --enable-static --disable-shared && make clean && make && mv .libs/libxapian.a ../libxapian-x86_64.a

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

# OSX
libicuio-fat.a: /opt/local/lib/libicuio.a
	cp /opt/local/lib/libicuio.a libicuio-fat.a

libicuio-i386.a: libicuio-fat.a
	lipo -thin i386 libicuio-fat.a -output libicuio-i386.a

libicuio-x86_64.a: libicuio-fat.a
	lipo -thin x86_64 libicuio-fat.a -output libicuio-x86_64.a

libicudata-fat.a: /opt/local/lib/libicudata.a
	cp /opt/local/lib/libicudata.a libicudata-fat.a

libicudata-i386.a: libicudata-fat.a
	lipo -thin i386 libicudata-fat.a -output libicudata-i386.a

libicudata-x86_64.a: libicudata-fat.a
	lipo -thin x86_64 libicudata-fat.a -output libicudata-x86_64.a

libicuuc-fat.a: /opt/local/lib/libicuuc.a
	cp /opt/local/lib/libicuuc.a libicuuc-fat.a

libicuuc-i386.a: libicuuc-fat.a
	lipo -thin i386 libicuuc-fat.a -output libicuuc-i386.a

libicuuc-x86_64.a: libicuuc-fat.a
	lipo -thin x86_64 libicuuc-fat.a -output libicuuc-x86_64.a

libicui18n-fat.a: /opt/local/lib/libicui18n.a
	cp /opt/local/lib/libicui18n.a libicui18n-fat.a

libicui18n-i386.a: libicui18n-fat.a
	lipo -thin i386 libicui18n-fat.a -output libicui18n-i386.a

libicui18n-x86_64.a: libicui18n-fat.a
	lipo -thin x86_64 libicui18n-fat.a -output libicui18n-x86_64.a

libicule-fat.a: /opt/local/lib/libicule.a
	cp /opt/local/lib/libicule.a libicule-fat.a

libicule-i386.a: libicule-fat.a
	lipo -thin i386 libicule-fat.a -output libicule-i386.a

libicule-x86_64.a: libicule-fat.a
	lipo -thin x86_64 libicule-fat.a -output libicule-x86_64.a

libiculx-fat.a: /opt/local/lib/libiculx.a
	cp /opt/local/lib/libiculx.a libiculx-fat.a

libiculx-i386.a: libiculx-fat.a
	lipo -thin i386 libiculx-fat.a -output libiculx-i386.a

libiculx-x86_64.a: libiculx-fat.a
	lipo -thin x86_64 libiculx-fat.a -output libiculx-x86_64.a

libicutu-fat.a: /opt/local/lib/libicutu.a
	cp /opt/local/lib/libicutu.a libicutu-fat.a

libicutu-i386.a: libicutu-fat.a
	lipo -thin i386 libicutu-fat.a -output libicutu-i386.a

libicutu-x86_64.a: libicutu-fat.a
	lipo -thin x86_64 libicutu-fat.a -output libicutu-x86_64.a

# Linux
icu/source/lib/libicuio.a icu/source/lib/libicudata.a icu/source/lib/libicuuc.a icu/source/lib/libicui18n.a icu/source/lib/libicule.a icu/source/lib/libiculx.a icu/source/lib/libicutu.a: icu/
	cd icu/source && mkdir -p build && CFLAGS=" -fPIC " ./runConfigureICU Linux --prefix=$(DEP_PATH)/icu/source/build --enable-static && make && make install

icu/source/lib/libicuio.so icu/source/lib/libicudata.so icu/source/lib/libicuuc.so icu/source/lib/libicui18n.so icu/source/lib/libicule.so icu/source/lib/libiculx.so icu/source/lib/libicutu.so: icu/
	cd icu/source && mkdir -p build && CFLAGS=" -fPIC " ./runConfigureICU Linux --prefix=$(DEP_PATH)/icu/source/build && make && make install

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

# Linux
sqlite-autoconf-3071000/.libs/libsqlite3.a: sqlite-autoconf-3071000/
	cd sqlite-autoconf-3071000 && CFLAGS=" -fPIC " ./configure --enable-static --enable-shared && make

sqlite-autoconf-3071000/.libs/libsqlite3.so: sqlite-autoconf-3071000/
	cd sqlite-autoconf-3071000 && CFLAGS=" -fPIC " ./configure --enable-static --enable-shared && make

# OSX
libsqlite3-fat.a: sqlite-autoconf-3071000/
	cd sqlite-autoconf-3071000 && CC="gcc -arch i386 -arch x86_64" CXX="g++ -arch i386 -arch x86_64" CPP="gcc -E" CXXCPP="g++ -E" CFLAGS=" -fPIC " ./configure --enable-static --disable-shared && make && cp .libs/libsqlite3.a ../libsqlite3-fat.a

libsqlite3-i386.a: libsqlite3-fat.a
	lipo -thin i386 libsqlite3-fat.a -output libsqlite3-i386.a

libsqlite3-x86_64.a: libsqlite3-fat.a
	lipo -thin x86_64 libsqlite3-fat.a -output libsqlite3-x86_64.a

####################################################
############ MICROHTTPD
####################################################

libmicrohttpd-0.9.19.tar.gz: 
	wget -c -O libmicrohttpd-0.9.19.tar.gz http://download.kiwix.org/dev/libmicrohttpd-0.9.19.tar.gz

libmicrohttpd-0.9.19: libmicrohttpd-0.9.19.tar.gz
	tar xf libmicrohttpd-0.9.19.tar.gz

libmicrohttpd-0.9.19/src/daemon/.libs/libmicrohttpd.a: libmicrohttpd-0.9.19/
	cd libmicrohttpd-0.9.19 && CFLAGS=" -fPIC " ./configure --enable-static --enable-shared && make

libmicrohttpd-0.9.19/src/daemon/.libs/libmicrohttpd.so: libmicrohttpd-0.9.19/
	cd libmicrohttpd-0.9.19 && CFLAGS=" -fPIC " ./configure --enable-static --enable-shared && make

# OSX
libmicrohttpd-fat.a: libmicrohttpd-0.9.19/
	cd libmicrohttpd-0.9.19 && CC="gcc -arch i386 -arch x86_64" CXX="g++ -arch i386 -arch x86_64" CPP="gcc -E" CXXCPP="g++ -E" CFLAGS=" -fPIC " ./configure --enable-static --disable-shared && make && cp src/daemon/.libs/libmicrohttpd.a ../libmicrohttpd-fat.a

libmicrohttpd-i386.a: libmicrohttpd-fat.a
	lipo -thin i386 libmicrohttpd-fat.a -output libmicrohttpd-i386.a

libmicrohttpd-x86_64.a: libmicrohttpd-fat.a
	lipo -thin x86_64 libmicrohttpd-fat.a -output libmicrohttpd-x86_64.a

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

xz/src/liblzma/.libs/liblzma.a: xz/
	cd xz && CFLAGS=" -fPIC " ./configure --disable-assembler --enable-static --disable-shared && make

xz/src/liblzma/.libs/liblzma.so: xz/
	cd xz && CFLAGS=" -fPIC " ./configure --disable-assembler --enable-static --enable-shared && make

# OSX
liblzma-fat.a: xz/
	cd xz && CC="gcc -arch i386 -arch x86_64" CXX="g++ -arch i386 -arch x86_64" CPP="gcc -E" CXXCPP="g++ -E" CFLAGS=" -fPIC " ./configure --with-libiconv-prefix=/opt/local --with-libintl-prefix=/opt/local --disable-assembler --enable-static --disable-shared && make && cp src/liblzma/.libs/liblzma.a ../liblzma-fat.a

liblzma-i386.a: liblzma-fat.a
	lipo -thin i386 liblzma-fat.a -output liblzma-i386.a

liblzma-x86_64.a: liblzma-fat.a
	lipo -thin x86_64 liblzma-fat.a -output liblzma-x86_64.a

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

clucene-core-0.9.21b/src/.libs/libclucene.a: clucene-core-0.9.21b/
	cd clucene-core-0.9.21b && CXXFLAGS=" -fPIC " ./configure --enable-static --disable-shared && make

clucene-core-0.9.21b/src/.libs/libclucene.so: clucene-core-0.9.21b/
	cd clucene-core-0.9.21b && CXXFLAGS=" -fPIC " ./configure --enable-static --enable-shared && make

# OSX
libclucene-fat.a: clucene-core-0.9.21b/
	cd clucene-core-0.9.21b && CC="gcc -arch i386 -arch x86_64" CXX="g++ -arch i386 -arch x86_64" CPP="gcc -E" CXXCPP="g++ -E" CXXFLAGS=" -fPIC " ./configure --enable-static --disable-shared && make && cp src/.libs/libclucene.a ../libclucene-fat.a

libclucene-i386.a: libclucene-fat.a
	lipo -thin i386 libclucene-fat.a -output libclucene-i386.a

libclucene-x86_64.a: libclucene-fat.a
	lipo -thin x86_64 libclucene-fat.a -output libclucene-x86_64.a

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