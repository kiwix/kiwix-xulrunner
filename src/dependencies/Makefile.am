
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
if IS_OLD_GECKO
GECKOSDKURL=$(DEP_MIRROR)/xulrunner-1.9.2.13.en-US.linux-i686.sdk.tar.bz2
else
GECKOSDKURL=$(DEP_MIRROR)/xulrunner-11.0.en-US.linux-$(ARCH).sdk.tar.bz2
endif
else
GECKOSDKURL=$(DEP_MIRROR)/xulrunner-11.0.en-US.mac-$(ARCH).sdk.tar.bz2
endif

if IS_OLD_GECKO
XULRUNNERRUNTIMEURL=$(DEP_MIRROR)/xulrunner-3.6.26.en-US.linux-i686.tar.bz2
else
XULRUNNERRUNTIMEURL=$(DEP_MIRROR)/xulrunner-11.0.en-US.linux-$(ARCH).tar.bz2
endif

####################################################
############ GECKO-SDK
####################################################
xulrunner-sdk.tar.bz2:
	$(DOWNLOADER) xulrunner-sdk.tar.bz2 $(GECKOSDKURL)

xulrunner-11.0.en-US.mac-i386.sdk.tar.bz2:
	$(DOWNLOADER) xulrunner-11.0.en-US.mac-i386.sdk.tar.bz2 $(DEP_MIRROR)/xulrunner-11.0.en-US.mac-i386.sdk.tar.bz2

xulrunner-11.0.en-US.mac-x86_64.sdk.tar.bz2:
	$(DOWNLOADER) xulrunner-11.0.en-US.mac-x86_64.sdk.tar.bz2 $(DEP_MIRROR)/xulrunner-11.0.en-US.mac-x86_64.sdk.tar.bz2

xulrunner-sdk-i386: xulrunner-11.0.en-US.mac-i386.sdk.tar.bz2
	if test ! -d xulrunner-sdk-i386; then tar -xf xulrunner-11.0.en-US.mac-i386.sdk.tar.bz2 && mv xulrunner-sdk xulrunner-sdk-i386 ; fi;

xulrunner-sdk-x86_64: xulrunner-11.0.en-US.mac-x86_64.sdk.tar.bz2
	if test ! -d xulrunner-sdk-x86_64; then tar -xf xulrunner-11.0.en-US.mac-x86_64.sdk.tar.bz2 && mv xulrunner-sdk xulrunner-sdk-x86_64 ; fi;

universal-sdk: xulrunner-sdk-i386 xulrunner-sdk-x86_64
	mkdir -p universal-sdk && cd universal-sdk && ln -sf ../xulrunner-sdk-i386 i386 && 	ln -sf ../xulrunner-sdk-x86_64 x86_64

if IS_WIN
xulrunner-sdk: xulrunner-sdk-win.zip
	if test ! -d xulrunner-sdk; then unzip -o xulrunner-sdk-win.zip ; fi;
else
xulrunner-sdk: xulrunner-sdk.tar.bz2
	if test ! -d xulrunner-sdk; then tar -xf xulrunner-sdk.tar.bz2 ; fi;
endif

# Windows
xulrunner-sdk-win.zip:
	$(DOWNLOADER) xulrunner-sdk-win.zip $(DEP_MIRROR)/xulrunner-11.0.en-US.win32.sdk.zip

####################################################
############ XULRUNNER-RUNTIME
####################################################
xulrunner-runtime.tar.bz2:
	$(DOWNLOADER) xulrunner-runtime.tar.bz2 $(XULRUNNERRUNTIMEURL)

if IS_WIN
xulrunner: xulrunner-win.zip
	if test ! -d xulrunner; then unzip -o xulrunner-win.zip ; fi;
else
xulrunner: xulrunner-runtime.tar.bz2
	if test ! -d xulrunner; then tar -xf xulrunner-runtime.tar.bz2 ; fi;
endif

xulrunner-11.0.en-US.mac-pkg.dmg:
	$(DOWNLOADER) xulrunner-11.0.en-US.mac-pkg.dmg $(DEP_MIRROR)/xulrunner-11.0.en-US.mac-pkg.dmg

xr_target/xulrunner-11.0.en-US.mac.pkg: xulrunner-11.0.en-US.mac-pkg.dmg
	mkdir -p xr_{mount,target}
	hdiutil detach ./xr_mount -quiet -force || /usr/bin/true
	hdiutil attach xulrunner-11.0.en-US.mac-pkg.dmg -noautoopen -quiet  -mountpoint ./xr_mount
	cp -r ./xr_mount/xulrunner-11.0.en-US.mac.pkg ./xr_target/
	hdiutil detach ./xr_mount -quiet -force || /usr/bin/true

xr_target/xulrunner-11.0.en-US.mac/XUL.framework: xr_target/xulrunner-11.0.en-US.mac.pkg
	./tools/unpkg.py ./xr_target/xulrunner-11.0.en-US.mac.pkg

# Windows
xulrunner-win.zip:
	$(DOWNLOADER) xulrunner-win.zip $(DEP_MIRROR)/xulrunner-11.0.en-US.win32.zip

####################################################
############ ZLIB
####################################################

zlib.tar.gz:
	$(DOWNLOADER) zlib.tar.gz $(DEP_MIRROR)/zlib-1.2.3.tar.gz 

zlib-1.2.3: zlib.tar.gz
	tar -xf zlib.tar.gz

# Linux
zlib-1.2.3/static/lib/libz.a: zlib-1.2.3/
	cd zlib-1.2.3 && mkdir -p static && CC=$(COMPC) CXX=$(COMPCXX) CFLAGS=" -fPIC " ./configure --prefix=$(DEP_PATH)/zlib-1.2.3/static && make clean && make && make install

zlib-1.2.3/shared/lib/libz.so zlib-1.2.3/shared/lib/libz.dylib: zlib-1.2.3/ zlib-1.2.3/static/lib/libz.a
	cd zlib-1.2.3 && mkdir -p shared && CC=$(COMPC) CXX=$(COMPCXX) CFLAGS=" -fPIC " ./configure --shared --prefix=$(DEP_PATH)/zlib-1.2.3/shared && make clean && make && make install

# Windows
zlib-1.2.3/zlib.lib: zlib-1.2.3
	cd zlib-1.2.3 ; cp ./win32/Makefile.msc ./ ; sed -e "s/\\-MD/\\-MT/" Makefile.msc > Makefile.msc.custom ; export MAKEFLAGS=; nmake.exe -f Makefile.msc.custom

####################################################
############ XAPIAN
####################################################

xapian-core.tar.gz:
	$(DOWNLOADER) xapian-core.tar.gz $(DEP_MIRROR)/xapian-core-1.2.3.tar.gz

xapian-core-1.2.3: xapian-core.tar.gz
	tar -xf xapian-core.tar.gz

# Linux
xapian-core-1.2.3/build/lib/libxapian.so: xapian-core-1.2.3/
	cd xapian-core-1.2.3 mkdir -p build && EXTERN_PATH=`pwd` CPPFLAGS="-I${CURRENT_PATH}/src/dependencies/zlib-1.2.3/" CXXFLAGS=" -fPIC -L${CURRENT_PATH}/src/dependencies/zlib-1.2.3" ./configure --enable-shared --enable-static --prefix=$(DEP_PATH)/xapian-core-1.2.3/build && make clean && make clean && make && make install

# OSX Join
xapian-core-1.2.3/build/lib/libxapian.dylib xapian-core-1.2.3/build/bin/xapian-compact: xapian-core-1.2.3/build-i386/lib/libxapian.dylib xapian-core-1.2.3/build-x86_64/lib/libxapian.dylib xapian-core-1.2.3/build-i386/bin/xapian-compact xapian-core-1.2.3/build-x86_64/bin/xapian-compact
	mkdir -p xapian-core-1.2.3/build/{lib,bin} && cd xapian-core-1.2.3/build/lib && cp -r ../../build-i386/include ../ && lipo ../../build-x86_64/lib/libxapian.dylib ../../build-i386/lib/libxapian.dylib -create -output libxapian.dylib && lipo ../../build-x86_64/lib/libxapian.a ../../build-i386/lib/libxapian.a -create -output libxapian.a && cd ../bin && lipo ../../build-x86_64/bin/xapian-compact ../../build-i386/bin/xapian-compact -create -output xapian-compact

# OSX i386
xapian-core-1.2.3/build-i386/lib/libxapian.dylib xapian-core-1.2.3/build-i386/bin/xapian-compact: xapian-core-1.2.3
	cd xapian-core-1.2.3 && mkdir -p build-i386 && EXTERN_PATH=`pwd` CC="gcc -arch i386" CXX="g++ -arch i386" CPPFLAGS="-I${CURRENT_PATH}/src/dependencies/zlib-1.2.3/" CXXFLAGS=" -fPIC -L${CURRENT_PATH}/src/dependencies/zlib-1.2.3" ./configure --enable-shared --enable-static --prefix=$(DEP_PATH)/xapian-core-1.2.3/build-i386 && make clean && make && make install

# OSX x86_64
xapian-core-1.2.3/build-x86_64/lib/libxapian.dylib xapian-core-1.2.3/build-x86_64/bin/xapian-compact: xapian-core-1.2.3
	cd xapian-core-1.2.3 && mkdir -p build-x86_64 && EXTERN_PATH=`pwd` CC="gcc -arch x86_64" CXX="g++ -arch x86_64" CPPFLAGS="-I${CURRENT_PATH}/src/dependencies/zlib-1.2.3/" CXXFLAGS=" -fPIC -L${CURRENT_PATH}/src/dependencies/zlib-1.2.3" ./configure --enable-shared --enable-static --prefix=$(DEP_PATH)/xapian-core-1.2.3/build-x86_64 && make clean && make && make install

# Windows
xapian-win32.zip:
	$(DOWNLOADER) xapian-win32.zip $(DEP_MIRROR)/xapian-1.2.3-win32.zip

xapian-core-1.2.3/win32: xapian-win32.zip
	unzip -o xapian-win32.zip
	mv win32 ./xapian-core-1.2.3/

xapian-core-1.2.3/win32/Release/libs/libunicode.lib: xapian-core-1.2.3 xapian-core-1.2.3/win32
	cd xapian-core-1.2.3/win32; sed -e "s/\\-MD/\\-MT/" config.mak > config.mak.bis
	cd xapian-core-1.2.3/win32; sed -e "s/C\\:\\\gnu\\\zlib123-dll/C\\:\\\slave\\\windows\\-32b\\\build\\\src\\\dependencies\\\zlib\\-1\\.2\\.3/" config.mak.bis > config.mak
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
	$(DOWNLOADER) icu4c-4_4_2-src.tgz $(DEP_MIRROR)/icu4c-4_4_2-src.tgz

icu4c-49_1_1-src.tgz:
	$(DOWNLOADER) icu4c-49_1_1-src.tgz $(DEP_MIRROR)/icu4c-49_1_1-src.tgz

if IS_OLD_ICU
icu/: icu4c-4_4_2-src.tgz
	tar xf icu4c-4_4_2-src.tgz
else
icu/: icu4c-49_1_1-src.tgz
	tar xf icu4c-49_1_1-src.tgz
endif

# Linux
icu/source/build/lib/libicudata.so icu/source/lib/libicuuc.so icu/source/build/lib/libicui18n.so: icu/
	cd icu/source && mkdir -p build && CFLAGS=" -fPIC " ./runConfigureICU Linux --prefix=$(DEP_PATH)/icu/source/build --disable-samples --disable-tests --disable-extras --enable-static && make clean && make && make install

# OSX FAT join
icu/source/build/lib/libicudata.dylib icu/source/build/lib/libicuuc.dylib icu/source/build/lib/libicui18n.dylib: icu/source/build-x86_64/lib/libicudata.dylib icu/source/build-x86_64/lib/libicuuc.dylib icu/source/build-x86_64/lib/libicui18n.dylib icu/source/build-i386/lib/libicudata.dylib icu/source/build-i386/lib/libicuuc.dylib icu/source/build-i386/lib/libicui18n.dylib
	mkdir -p icu/source/build/{bin,lib} && cd icu/source/build/lib && lipo ../../build-x86_64/lib/libicudata.dylib ../../build-i386/lib/libicudata.dylib -create -output libicudata.dylib && lipo ../../build-x86_64/lib/libicuuc.dylib ../../build-i386/lib/libicuuc.dylib -create -output libicuuc.dylib && lipo ../../build-x86_64/lib/libicui18n.dylib ../../build-i386/lib/libicui18n.dylib -create -output libicui18n.dylib && lipo ../../build-x86_64/lib/libicudata.a ../../build-i386/lib/libicudata.a -create -output libicudata.a && lipo ../../build-x86_64/lib/libicuuc.a ../../build-i386/lib/libicuuc.a -create -output libicuuc.a && lipo ../../build-x86_64/lib/libicui18n.a ../../build-i386/lib/libicui18n.a -create -output libicui18n.a && cp -r ../../build-i386/include ../

# OSX i386
icu/source/build-i386/lib/libicudata.dylib icu/source/build-i386/lib/libicuuc.dylib icu/source/build-i386/lib/libicui18n.dylib: icu/
	cd icu/source && mkdir -p build-i386 && CFLAGS=" -fPIC " ./runConfigureICU MacOSX --prefix=${DEP_PATH}/icu/source/build-i386 --with-library-bits=32 --disable-samples --disable-tests --disable-extras --enable-static && make clean && make && make install

# OSX x86_64
icu/source/build-x86_64/lib/libicudata.dylib icu/source/build-x86_64/lib/libicuuc.dylib icu/source/build-x86_64/lib/libicui18n.dylib: icu/
	cd icu/source && mkdir -p build-x86_64 && CFLAGS=" -fPIC " ./runConfigureICU MacOSX --prefix=${DEP_PATH}/icu/source/build-x86_64 --with-library-bits=64 --disable-samples --disable-tests --disable-extras --enable-static && make clean && make && make install

icu.zip:
	$(DOWNLOADER) icu.zip $(DEP_MIRROR)/icu4c-4_4-Win32-msvc9.zip

icu/lib/icuio.lib icu/lib/icudata.lib icu/lib/icuuc.lib icu/lib/icui18n.lib: icu.zip
	unzip -o icu.zip

####################################################
############ MICROHTTPD
####################################################

libmicrohttpd-0.9.19.tar.gz: 
	$(DOWNLOADER) libmicrohttpd-0.9.19.tar.gz $(DEP_MIRROR)/libmicrohttpd-0.9.19.tar.gz

libmicrohttpd-0.9.19: libmicrohttpd-0.9.19.tar.gz	
	tar xf libmicrohttpd-0.9.19.tar.gz

libmicrohttpd-0.9.19/build/lib/libmicrohttpd.so: libmicrohttpd-0.9.19/
	cd libmicrohttpd-0.9.19 && mkdir -p build && CC=$(COMPC) CXX=$(COMPCXX) CFLAGS=" -fPIC " ./configure --enable-shared --enable-static --disable-https --without-libgcrypt --without-libcurl --prefix=$(DEP_PATH)/libmicrohttpd-0.9.19/build  && make clean && make && make install

# OSX Join
libmicrohttpd-0.9.19/build/lib/libmicrohttpd.dylib: libmicrohttpd-0.9.19/build-i386/lib/libmicrohttpd.dylib libmicrohttpd-0.9.19/build-x86_64/lib/libmicrohttpd.dylib
	mkdir -p libmicrohttpd-0.9.19/build/lib && cd libmicrohttpd-0.9.19/build/lib && lipo ../../build-x86_64/lib/libmicrohttpd.dylib ../../build-i386/lib/libmicrohttpd.dylib -create -output libmicrohttpd.dylib && lipo ../../build-x86_64/lib/libmicrohttpd.a ../../build-i386/lib/libmicrohttpd.a -create -output libmicrohttpd.a && cp -r ../../src/include ../

# OSX i386
libmicrohttpd-0.9.19/build-i386/lib/libmicrohttpd.dylib: libmicrohttpd-0.9.19/
	cd libmicrohttpd-0.9.19 && mkdir -p build-i386 && CC="gcc -arch i386" CXX="g++ -arch i386" CFLAGS=" -fPIC " ./configure --enable-shared --enable-static --prefix=$(DEP_PATH)/libmicrohttpd-0.9.19/build-i386 && make clean && make && make install

# OSX x86_64
libmicrohttpd-0.9.19/build-x86_64/lib/libmicrohttpd.dylib: libmicrohttpd-0.9.19/
	cd libmicrohttpd-0.9.19 && mkdir -p build-x86_64 && CC="gcc -arch x86_64" CXX="g++ -arch x86_64" CFLAGS=" -fPIC " ./configure --enable-shared --enable-static --prefix=$(DEP_PATH)/libmicrohttpd-0.9.19/build-x86_64 && make clean && make && make install

####################################################
############ LZMA
####################################################

xz.tar.bz2:
if IS_OSX
	$(DOWNLOADER) xz.tar.bz2 $(DEP_MIRROR)/xz-4.999.9beta.tar.bz2
else
	$(DOWNLOADER) xz.tar.bz2 $(DEP_MIRROR)/xz-5.0.3.tar.bz2
endif

xz: xz.tar.bz2
	tar -xf xz.tar.bz2
if IS_OSX
	mv xz-4.999.9beta xz
	echo "patching liblzma for OSX"
	cd xz && patch -p0 < ../patches/xz-4.999.9beta-sysctl-darwin.patch && patch -p0 < ../patches/xz-4.999.9beta-lzma-versioninfo.patch
else
	mv xz-5.0.3 xz
endif

xz/build/lib/liblzma.so: xz/
	cd xz && mkdir -p build && CC=$(COMPC) CXX=$(COMPCXX) CFLAGS=" -fPIC " ./configure --disable-assembler --enable-shared --enable-static --prefix=$(DEP_PATH)/xz/build && make clean && make && make install

# OSX Join
xz/build/lib/liblzma.dylib: xz/build-i386/lib/liblzma.dylib xz/build-x86_64/lib/liblzma.dylib
	mkdir -p xz/build/lib && cd xz/build/lib && lipo ../../build-x86_64/lib/liblzma.dylib ../../build-i386/lib/liblzma.dylib -create -output liblzma.dylib && lipo ../../build-x86_64/lib/liblzma.a ../../build-i386/lib/liblzma.a -create -output liblzma.a

# OSX i386
xz/build-i386/lib/liblzma.dylib: xz/
	cd xz && mkdir -p build-i386 && CC="gcc -arch i386" CXX="g++ -arch i386" CFLAGS=" -fPIC " ./configure --disable-assembler --enable-shared --enable-static --prefix=$(DEP_PATH)/xz/build-i386 && make clean && make && make install

# OSX x86_64
xz/build-x86_64/lib/liblzma.dylib: xz/
	cd xz && mkdir -p build-x86_64 && CC="gcc -arch x86_64" CXX="g++ -arch x86_64" CFLAGS=" -fPIC " ./configure --disable-assembler --enable-shared --enable-static --prefix=$(DEP_PATH)/xz/build-x86_64 && make clean && make && make install

# Windows
xz-5.0.3-windows.zip:
	$(DOWNLOADER) xz-5.0.3-windows.zip $(DEP_MIRROR)/xz-5.0.3-windows.zip

xz-win/bin_i486/liblzma.lib: xz-5.0.3-windows.zip
	mkdir -p xz-win ; unzip -o -d xz-win xz-5.0.3-windows.zip ; cd xz-win/bin_i486 ; cp -v ../doc/liblzma.def . ; lib /def:liblzma.def /out:liblzma.lib /machine:ix86

####################################################
############ ARIA2 (downloaded)
####################################################

aria2c: 
	$(DOWNLOADER) aria2c $(DEP_MIRROR)/aria2c.$(ARCH)
	chmod +x aria2c

# OSX
aria2-1.14.2.dmg:
	$(DOWNLOADER) aria2-1.14.2.dmg $(DEP_MIRROR)/aria2-1.14.2.dmg

aria2-1.14.2.pkg: aria2-1.14.2.dmg
	mkdir -p ./aria_dmg
	hdiutil attach aria2-1.14.2.dmg -noautoopen -quiet -mountpoint ./aria_dmg
	cp -r ./aria_dmg/aria2-1.14.2.pkg aria2-1.14.2.pkg
	hdiutil detach ./aria_dmg

aria2-1.14.2/usr/bin/aria2c: aria2-1.14.2.pkg
	./tools/unpkg.py aria2-1.14.2.pkg

# Windows
aria2c.exe: 
	$(DOWNLOADER) aria2c.exe $(DEP_MIRROR)/aria2c.exe

####################################################
############ CLUCENE
####################################################

clucene-core-0.9.21b.tar.bz2:
	$(DOWNLOADER) clucene-core-0.9.21b.tar.bz2 $(DEP_MIRROR)/clucene-core-0.9.21b.tar.bz2

clucene-core-0.9.21b: clucene-core-0.9.21b.tar.bz2
	tar xf clucene-core-0.9.21b.tar.bz2

clucene-core-0.9.21b/build/lib/libclucene.so: clucene-core-0.9.21b/
	cd clucene-core-0.9.21b && mkdir -p build && CC=$(COMPC) CXX=$(COMPCXX) CXXFLAGS=" -fPIC " ./configure --enable-shared --enable-static --prefix=$(DEP_PATH)/clucene-core-0.9.21b/build && make clean && make && make install

# OSX Join
clucene-core-0.9.21b/build/lib/libclucene.dylib: clucene-core-0.9.21b/build-i386/lib/libclucene.dylib clucene-core-0.9.21b/build-x86_64/lib/libclucene.dylib
	mkdir -p clucene-core-0.9.21b/build/lib && cd clucene-core-0.9.21b/build/lib && lipo ../../build-x86_64/lib/libclucene.dylib ../../build-i386/lib/libclucene.dylib -create -output libclucene.dylib && lipo ../../build-x86_64/lib/libclucene.a ../../build-i386/lib/libclucene.a -create -output libclucene.a

# OSX i386
clucene-core-0.9.21b/build-i386/lib/libclucene.dylib: clucene-core-0.9.21b/
	cd clucene-core-0.9.21b && mkdir -p build-i386 && CC="gcc -arch i386" CXX="g++ -arch i386" CFLAGS=" -fPIC " ./configure --enable-shared --enable-static --prefix=$(DEP_PATH)/clucene-core-0.9.21b/build-i386 && make clean && make && make install

# OSX x86_64
clucene-core-0.9.21b/build-x86_64/lib/libclucene.dylib: clucene-core-0.9.21b/
	cd clucene-core-0.9.21b && mkdir -p build-x86_64 && CC="gcc -arch x86_64" CXX="g++ -arch x86_64" CFLAGS=" -fPIC " ./configure --enable-shared --enable-static --prefix=$(DEP_PATH)/clucene-core-0.9.21b/build-x86_64 && make clean && make && make install

####################################################
############ UUID
####################################################

e2fsprogs-1.42.tar.gz:
	$(DOWNLOADER) e2fsprogs-1.42.tar.gz $(DEP_MIRROR)/e2fsprogs-1.42.tar.gz

e2fsprogs-1.42: e2fsprogs-1.42.tar.gz
	tar xf e2fsprogs-1.42.tar.gz

e2fsprogs-1.42/lib/libuuid.a: e2fsprogs-1.42/
	mkdir -p e2fsprogs-1.42/build && cd e2fsprogs-1.42/ && CC=$(COMPC) CXX=$(COMPCXX) CXXFLAGS=" -fPIC " ./configure --enable-libuuid --prefix=$(DEP_PATH)/e2fsprogs-1.42/build && make clean && make && make install

####################################################
############ ARGTABLE
####################################################

argtable2-13.tar.gz:
	$(DOWNLOADER) argtable2-13.tar.gz $(DEP_MIRROR)/argtable2-13.tar.gz

argtable2-13: argtable2-13.tar.gz
	tar xf argtable2-13.tar.gz

argtable2-13/src/argtable2.lib: argtable2-13
	cd argtable2-13/src ; nmake.exe -f Makefile.nmake

####################################################
############ PTHREAD
####################################################

pthread-win32.zip:
	$(DOWNLOADER) pthread-win32.zip $(DEP_MIRROR)/pthread-win32.zip

pthread-win32/lib/pthreadVC2.lib: pthread-win32.zip
	unzip -o -d pthread-win32 pthread-win32.zip

####################################################
############ CLEANUP (ALL)
####################################################
CLEANFILES=

DISTCLEANFILES= \
	xapian-core.tar.gz xapian-win32.zip \
	xz.tar.bz2 \
	xulrunner-sdk-linux.tar.bz2 \
	xulrunner-sdk-win.zip  \
	xulrunner-win.zip \
	xulrunner-source.tar.bz2 \
	icu.zip aria2c aria2c.i686 aria2c.x86_64 aria2c.exe xz-5.0.3-windows.zip

clean-local:
	-rm -rf xapian-core-1.2.3
	-rm -rf zlib-1.2.3
	-rm -rf icu
	-rm -rf win32
	-rm -rf xz
	-rm -rf xz-4.999.9beta
	-rm -rf aria2-1.14.1
	-rm -rf clucene-core-0.9.21b
	-rm -rf libmicrohttpd-0.9.19
	-rm -rf xz-win

distclean-local:
	-rm -rf xulrunner-sdk
	-rm -rf xulrunner

# list of targets is built in configure.ac
all-local: deps