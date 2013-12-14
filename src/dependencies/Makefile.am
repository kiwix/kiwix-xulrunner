
# OSX uses fat binaries
if IS_OSX
COMPC=gcc -arch i386 -arch x86_64
COMPCXX=g++ -arch i386 -arch x86_64
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
GECKOSDKURL=$(DEP_MIRROR)/xulrunner-14.0.1.en-US.linux-$(ARCH).sdk.tar.bz2
endif
else
GECKOSDKURL=$(DEP_MIRROR)/xulrunner-14.0.1.en-US.mac-$(ARCH).sdk.tar.bz2
endif

if IS_OLD_GECKO
XULRUNNERRUNTIMEURL=$(DEP_MIRROR)/xulrunner-3.6.26.en-US.linux-i686.tar.bz2
else
XULRUNNERRUNTIMEURL=$(DEP_MIRROR)/xulrunner-14.0.1.en-US.linux-$(ARCH).tar.bz2
endif

if IS_LINUX
ANDROIDNDKURL=$(DEP_MIRROR)/android-ndk-r8e-linux-$(ARCH).tar.bz2
ANDROIDSDKURL=$(DEP_MIRROR)/adt-bundle-linux-$(ARCH)-20130219.zip
else
ANDROIDNDKURL=$(DEP_MIRROR)/android-ndk-r8e-darwin-x86_64.tar.bz2
ANDROIDSDKURL=$(DEP_MIRROR)/adt-bundle-mac-x86_64-20130219.zip
endif

####################################################
############ GECKO-SDK
####################################################
xulrunner-sdk.tar.bz2:
	$(DOWNLOADER) xulrunner-sdk.tar.bz2 $(GECKOSDKURL)

xulrunner-14.0.1.en-US.mac-i386.sdk.tar.bz2:
	$(DOWNLOADER) xulrunner-14.0.1.en-US.mac-i386.sdk.tar.bz2 $(DEP_MIRROR)/xulrunner-14.0.1.en-US.mac-i386.sdk.tar.bz2

xulrunner-14.0.1.en-US.mac-x86_64.sdk.tar.bz2:
	$(DOWNLOADER) xulrunner-14.0.1.en-US.mac-x86_64.sdk.tar.bz2 $(DEP_MIRROR)/xulrunner-14.0.1.en-US.mac-x86_64.sdk.tar.bz2

xulrunner-sdk-i386: xulrunner-14.0.1.en-US.mac-i386.sdk.tar.bz2
	test -d xulrunner-sdk-i386 || tar -xf xulrunner-14.0.1.en-US.mac-i386.sdk.tar.bz2
	test -d xulrunner-sdk && mv xulrunner-sdk xulrunner-sdk-i386

xulrunner-sdk-x86_64: xulrunner-14.0.1.en-US.mac-x86_64.sdk.tar.bz2
	test -d xulrunner-sdk-x86_64 || tar -xf xulrunner-14.0.1.en-US.mac-x86_64.sdk.tar.bz2
	test -d xulrunner-sdk && mv xulrunner-sdk xulrunner-sdk-x86_64

universal-sdk: xulrunner-sdk-i386 xulrunner-sdk-x86_64
	test -d universal-sdk || mkdir -p universal-sdk && cd universal-sdk && ln -sf ../xulrunner-sdk-i386 i386 && ln -sf ../xulrunner-sdk-x86_64 x86_64

if IS_WIN
xulrunner-sdk: xulrunner-sdk-win.zip
	test -d xulrunner-sdk || unzip -o xulrunner-sdk-win.zip
else
xulrunner-sdk: xulrunner-sdk.tar.bz2
	test -d xulrunner-sdk || tar -xf xulrunner-sdk.tar.bz2
if IS_OLD_GCC
	sed -i -e 's,#define HAVE_CPP_CHAR16_T 1,#undef HAVE_CPP_CHAR16_T,g' xulrunner-sdk/include/xpcom-config.h
endif
endif

# Windows
xulrunner-sdk-win.zip:
	$(DOWNLOADER) xulrunner-sdk-win.zip $(DEP_MIRROR)/xulrunner-14.0.1.en-US.win32.sdk.zip

####################################################
############ XULRUNNER-RUNTIME
####################################################
xulrunner-runtime.tar.bz2:
	$(DOWNLOADER) xulrunner-runtime.tar.bz2 $(XULRUNNERRUNTIMEURL)

if IS_WIN
xulrunner: xulrunner-win.zip
	test -d xulrunner || unzip -o xulrunner-win.zip
else
xulrunner: xulrunner-runtime.tar.bz2
	test -d xulrunner || tar -xf xulrunner-runtime.tar.bz2
endif

#### Deprecated, before XR14, Mozilla was providing a .dmg instead of a tar.bz2
#xulrunner-14.0.1.en-US.mac-pkg.dmg:
#	$(DOWNLOADER) xulrunner-14.0.1.en-US.mac-pkg.dmg $(DEP_MIRROR)/xulrunner-14.0.1.en-US.mac-pkg.dmg
#
#xr_target/xulrunner-14.0.1.en-US.mac.pkg: xulrunner-14.0.1.en-US.mac-pkg.dmg
#	mkdir -p xr_{mount,target}
#	hdiutil detach ./xr_mount -quiet -force || /usr/bin/true
#	hdiutil attach xulrunner-14.0.1.en-US.mac-pkg.dmg -noautoopen -quiet  -mountpoint ./xr_mount
#	cp -r ./xr_mount/xulrunner-14.0.1.en-US.mac.pkg ./xr_target/
#	hdiutil detach ./xr_mount -quiet -force || /usr/bin/true
#
#xr_target/xulrunner-14.0.1.en-US.mac/XUL.framework: xr_target/xulrunner-14.0.1.en-US.mac.pkg
#	./tools/unpkg.py ./xr_target/xulrunner-14.0.1.en-US.mac.pkg

xulrunner-14.0.1.en-US.mac.tar.bz2:
	$(DOWNLOADER) xulrunner-14.0.1.en-US.mac.tar.bz2 $(DEP_MIRROR)/xulrunner-14.0.1.en-US.mac.tar.bz2

xr_target/xulrunner-14.0.1.en-US.mac/XUL.framework: xulrunner-14.0.1.en-US.mac.tar.bz2
	mkdir -p xr_target/xulrunner-14.0.1.en-US.mac/
	tar -xvjf xulrunner-14.0.1.en-US.mac.tar.bz2 -C xr_target/xulrunner-14.0.1.en-US.mac/

# Windows
xulrunner-win.zip:
	$(DOWNLOADER) xulrunner-win.zip $(DEP_MIRROR)/xulrunner-14.0.1.en-US.win32.zip

####################################################
############ ZLIB
####################################################

zlib.tar.gz:
	$(DOWNLOADER) zlib.tar.gz $(DEP_MIRROR)/zlib-1.2.3.tar.gz

zlib-1.2.3: zlib.tar.gz
	test -d zlib-1.2.3 || tar -xf zlib.tar.gz

# Linux
zlib-1.2.3/static/lib/libz.a: zlib-1.2.3
	test ! -f zlib-1.2.3/static/lib/libz.a && cd zlib-1.2.3 && mkdir -p static && CC="$(COMPC)" CXX="$(COMPCXX)" CFLAGS=" -fPIC " ./configure --prefix=$(DEP_PATH)/zlib-1.2.3/static && make clean && make && make install || true

zlib-1.2.3/shared/lib/libz.so: zlib-1.2.3 zlib-1.2.3/static/lib/libz.a
	test ! -f zlib-1.2.3/shared/lib/libz.so && cd zlib-1.2.3 && mkdir -p shared && CC="$(COMPC)" CXX="$(COMPCXX)" CFLAGS=" -fPIC " ./configure --shared --prefix=$(DEP_PATH)/zlib-1.2.3/shared && make clean && make && make install || true

# OSX
zlib-1.2.3/shared/lib/libz.dylib: zlib-1.2.3 zlib-1.2.3/static/lib/libz.a
	test ! -f zlib-1.2.3/shared/lib/libz.dylib && cd zlib-1.2.3 && mkdir -p shared && CC="$(COMPC)" CXX="$(COMPCXX)" CFLAGS=" -fPIC  " ./configure --shared --prefix=$(DEP_PATH)/zlib-1.2.3/shared && make clean && make && make install && install_name_tool -id libz.dylib shared/lib/libz.dylib || true

# Windows
zlib-1.2.3/zlib.lib: zlib-1.2.3
	test ! -f zlib-1.2.3/zlib.lib && cd zlib-1.2.3 && cp win32/Makefile.msc . && sed -e "s/\\-MD/\\-MT/" Makefile.msc > Makefile.msc.custom && export MAKEFLAGS="" && nmake.exe -f Makefile.msc.custom || true

####################################################
############ XAPIAN
####################################################

xapian-core.tar.gz:
	$(DOWNLOADER) xapian-core.tar.gz $(DEP_MIRROR)/xapian-core-1.2.3.tar.gz

xapian-core-1.2.3: xapian-core.tar.gz
	test -d xapian-core-1.2.3 || tar -xf xapian-core.tar.gz

# Linux
xapian-core-1.2.3/build/lib/libxapian.so: xapian-core-1.2.3
	test ! -f xapian-core-1.2.3/build/lib/libxapian.so && cd xapian-core-1.2.3 mkdir -p build && EXTERN_PATH=`pwd` CPPFLAGS="-I${CURRENT_PATH}/src/dependencies/zlib-1.2.3/" CXXFLAGS=" -fPIC -L${CURRENT_PATH}/src/dependencies/zlib-1.2.3" ./configure --enable-shared --enable-static --disable-sse --prefix=$(DEP_PATH)/xapian-core-1.2.3/build && make clean && make clean && make && make install || true

# OSX Join
xapian-core-1.2.3/build/lib/libxapian.dylib xapian-core-1.2.3/build/bin/xapian-compact: xapian-core-1.2.3/build-i386/lib/libxapian.dylib xapian-core-1.2.3/build-x86_64/lib/libxapian.dylib xapian-core-1.2.3/build-i386/bin/xapian-compact xapian-core-1.2.3/build-x86_64/bin/xapian-compact
	test ! -f xapian-core-1.2.3/build/lib/libxapian.dylib && mkdir -p xapian-core-1.2.3/build/{lib,bin} && cd xapian-core-1.2.3/build/lib && cp -r ../../build-i386/include ../ && lipo ../../build-x86_64/lib/libxapian.dylib ../../build-i386/lib/libxapian.dylib -create -output libxapian.dylib && lipo ../../build-x86_64/lib/libxapian.a ../../build-i386/lib/libxapian.a -create -output libxapian.a && cd ../bin && lipo ../../build-x86_64/bin/xapian-compact ../../build-i386/bin/xapian-compact -create -output xapian-compact && cd ../lib && install_name_tool -id libxapian.dylib libxapian.dylib || true

# OSX i386
xapian-core-1.2.3/build-i386/lib/libxapian.dylib xapian-core-1.2.3/build-i386/bin/xapian-compact: xapian-core-1.2.3
	test ! -f xapian-core-1.2.3/build-i386/lib/libxapian.dylib && cd xapian-core-1.2.3 && mkdir -p build-i386 && EXTERN_PATH=`pwd` CC="gcc -arch i386" CXX="g++ -arch i386" CPPFLAGS="-I${CURRENT_PATH}/src/dependencies/zlib-1.2.3/" CXXFLAGS=" -fPIC  -L${CURRENT_PATH}/src/dependencies/zlib-1.2.3" ./configure --enable-shared --enable-static --prefix=$(DEP_PATH)/xapian-core-1.2.3/build-i386 && make clean && make && make install && install_name_tool -id libxapian.dylib build-i386/lib/libxapian.dylib || true

# OSX x86_64
xapian-core-1.2.3/build-x86_64/lib/libxapian.dylib xapian-core-1.2.3/build-x86_64/bin/xapian-compact: xapian-core-1.2.3
	test ! -f xapian-core-1.2.3/build-x86_64/lib/libxapian.dylib && cd xapian-core-1.2.3 && mkdir -p build-x86_64 && EXTERN_PATH=`pwd` CC="gcc -arch x86_64" CXX="g++ -arch x86_64" CPPFLAGS="-I${CURRENT_PATH}/src/dependencies/zlib-1.2.3/" CXXFLAGS=" -fPIC  -L${CURRENT_PATH}/src/dependencies/zlib-1.2.3" ./configure --enable-shared --enable-static --prefix=$(DEP_PATH)/xapian-core-1.2.3/build-x86_64 && make clean && make && make install && install_name_tool -id libxapian.dylib build-x86_64/lib/libxapian.dylib || true

# Windows
xapian-win32.zip:
	$(DOWNLOADER) xapian-win32.zip $(DEP_MIRROR)/xapian-1.2.3-win32.zip

xapian-core-1.2.3/win32: xapian-win32.zip
	test -d xapian-core-1.2.3/win32 || unzip -o xapian-win32.zip
	test -d win32 && mv win32 ./xapian-core-1.2.3/

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

# This files gathers ICU related data. It's a custom one generated
# with http://apps.icu-project.org/datacustom/ICUData49.html. It
# contains Break iterators, Collators and Transliterators.
icudt49l.dat:
	$(DOWNLOADER) icudt49l.dat $(DEP_MIRROR)/icudt49l.dat

icu4c-4_4_2-src.tgz:
	$(DOWNLOADER) icu4c-4_4_2-src.tgz $(DEP_MIRROR)/icu4c-4_4_2-src.tgz

icu4c-49_1_1-src.tgz: icudt49l.dat
	$(DOWNLOADER) icu4c-49_1_1-src.tgz $(DEP_MIRROR)/icu4c-49_1_1-src.tgz

if IS_OLD_ICU
icu: icu4c-4_4_2-src.tgz
	test -d icu || tar xf icu4c-4_4_2-src.tgz
else
icu: icu4c-49_1_1-src.tgz
	test -d icu || tar xf icu4c-49_1_1-src.tgz
	cp icudt49l.dat icu/source/data/in/icudt49l.dat
endif

# Linux
icu/source/build/lib/libicudata.so icu/source/lib/libicuuc.so icu/source/build/lib/libicui18n.so: icu
	test ! -f icu/source/build/lib/libicudata.so && cd icu/source && mkdir -p build && CFLAGS=" -fPIC " ./runConfigureICU Linux --prefix=$(DEP_PATH)/icu/source/build --disable-samples --disable-tests --disable-extras --enable-static --disable-dyload && make clean && make && make install || true

# OSX FAT join
icu/source/build/lib/libicudata.dylib icu/source/build/lib/libicuuc.dylib icu/source/build/lib/libicui18n.dylib: icu/source/build-x86_64/lib/libicudata.dylib icu/source/build-x86_64/lib/libicuuc.dylib icu/source/build-x86_64/lib/libicui18n.dylib icu/source/build-i386/lib/libicudata.dylib icu/source/build-i386/lib/libicuuc.dylib icu/source/build-i386/lib/libicui18n.dylib
	test ! -f icu/source/build/lib/libicudata.dylib && mkdir -p icu/source/build/{bin,lib} && cd icu/source/build/lib && lipo ../../build-x86_64/lib/libicudata.dylib ../../build-i386/lib/libicudata.dylib -create -output libicudata.dylib && lipo ../../build-x86_64/lib/libicuuc.dylib ../../build-i386/lib/libicuuc.dylib -create -output libicuuc.dylib && lipo ../../build-x86_64/lib/libicui18n.dylib ../../build-i386/lib/libicui18n.dylib -create -output libicui18n.dylib && lipo ../../build-x86_64/lib/libicudata.a ../../build-i386/lib/libicudata.a -create -output libicudata.a && lipo ../../build-x86_64/lib/libicuuc.a ../../build-i386/lib/libicuuc.a -create -output libicuuc.a && lipo ../../build-x86_64/lib/libicui18n.a ../../build-i386/lib/libicui18n.a -create -output libicui18n.a && cp -r ../../build-i386/include ../  && install_name_tool -id libicudata.dylib libicudata.dylib && install_name_tool -id libicuuc.dylib libicuuc.dylib && install_name_tool -id libicui18n.dylib libicui18n.dylib || true

# OSX i386
icu/source/build-i386/lib/libicudata.dylib icu/source/build-i386/lib/libicuuc.dylib icu/source/build-i386/lib/libicui18n.dylib: icu
	test ! -f icu/source/build-i386/lib/libicudata.dylib && cd icu/source && mkdir -p build-i386 && CFLAGS=" -fPIC  " ./runConfigureICU MacOSX --prefix=${DEP_PATH}/icu/source/build-i386 --with-library-bits=32 --disable-samples --disable-tests --disable-extras --enable-static --disable-dyload && make clean && make && make install && install_name_tool -id libicudata.dylib build-i386/lib/libicudata.dylib && install_name_tool -id libicuuc.dylib build-i386/lib/libicuuc.dylib && install_name_tool -id libicui18n.dylib build-i386/lib/libicui18n.dylib || true

# OSX x86_64
icu/source/build-x86_64/lib/libicudata.dylib icu/source/build-x86_64/lib/libicuuc.dylib icu/source/build-x86_64/lib/libicui18n.dylib: icu
	test ! -f icu/source/build-x86_64/lib/libicudata.dylib && cd icu/source && mkdir -p build-x86_64 && CFLAGS=" -fPIC  " ./runConfigureICU MacOSX --prefix=${DEP_PATH}/icu/source/build-x86_64 --with-library-bits=64 --disable-samples --disable-tests --disable-extras --enable-static --disable-dyload && make clean && make && make install && install_name_tool -id libicudata.dylib build-x86_64/lib/libicudata.dylib && install_name_tool -id libicuuc.dylib build-x86_64/lib/libicuuc.dylib && install_name_tool -id libicui18n.dylib build-x86_64/lib/libicui18n.dylib || true

icu.zip:
	$(DOWNLOADER) icu.zip $(DEP_MIRROR)/icu4c-49_1_1-Win32-msvc10.zip

icu/lib/icuio.lib icu/lib/icudata.lib icu/lib/icuuc.lib icu/lib/icui18n.lib: icu.zip
	test ! -f icu/lib/icuio.lib && unzip -o icu.zip || true

####################################################
############ MICROHTTPD
####################################################

libmicrohttpd-0.9.19.tar.gz:
	$(DOWNLOADER) libmicrohttpd-0.9.19.tar.gz $(DEP_MIRROR)/libmicrohttpd-0.9.19.tar.gz

libmicrohttpd-0.9.19: libmicrohttpd-0.9.19.tar.gz
	test -d libmicrohttpd-0.9.19 || tar xf libmicrohttpd-0.9.19.tar.gz

libmicrohttpd-0.9.19/build/lib/libmicrohttpd.so: libmicrohttpd-0.9.19
	test ! -f libmicrohttpd-0.9.19/build/lib/libmicrohttpd.so && cd libmicrohttpd-0.9.19 && mkdir -p build && CC="$(COMPC)" CXX="$(COMPCXX)" CFLAGS=" -fPIC " ./configure --enable-shared --enable-static --disable-https --without-libgcrypt --without-libcurl --prefix=$(DEP_PATH)/libmicrohttpd-0.9.19/build  && make clean && make && make install || true

# OSX Join
libmicrohttpd-0.9.19/build/lib/libmicrohttpd.dylib: libmicrohttpd-0.9.19/build-i386/lib/libmicrohttpd.dylib libmicrohttpd-0.9.19/build-x86_64/lib/libmicrohttpd.dylib
	test ! -f libmicrohttpd-0.9.19/build/lib/libmicrohttpd.dylib && mkdir -p libmicrohttpd-0.9.19/build/lib && cd libmicrohttpd-0.9.19/build/lib && lipo ../../build-x86_64/lib/libmicrohttpd.dylib ../../build-i386/lib/libmicrohttpd.dylib -create -output libmicrohttpd.dylib && lipo ../../build-x86_64/lib/libmicrohttpd.a ../../build-i386/lib/libmicrohttpd.a -create -output libmicrohttpd.a && cp -r ../../src/include ../  && install_name_tool -id libmicrohttpd.dylib libmicrohttpd.dylib || true

# OSX i386
libmicrohttpd-0.9.19/build-i386/lib/libmicrohttpd.dylib: libmicrohttpd-0.9.19
	test ! -f libmicrohttpd-0.9.19/build-i386/lib/libmicrohttpd.dylib && cd libmicrohttpd-0.9.19 && mkdir -p build-i386 && CC="gcc -arch i386" CXX="g++ -arch i386" CFLAGS=" -fPIC  " ./configure --enable-shared --enable-static --prefix=$(DEP_PATH)/libmicrohttpd-0.9.19/build-i386 && make clean && make && make install && install_name_tool -id libmicrohttpd.dylib build-i386/lib/libmicrohttpd.dylib || true

# OSX x86_64
libmicrohttpd-0.9.19/build-x86_64/lib/libmicrohttpd.dylib: libmicrohttpd-0.9.19
	test ! -f libmicrohttpd-0.9.19/build-x86_64/lib/libmicrohttpd.dylib && cd libmicrohttpd-0.9.19 && mkdir -p build-x86_64 && CC="gcc -arch x86_64" CXX="g++ -arch x86_64" CFLAGS=" -fPIC  " ./configure --enable-shared --enable-static --prefix=$(DEP_PATH)/libmicrohttpd-0.9.19/build-x86_64 && make clean && make && make install && install_name_tool -id libmicrohttpd.dylib build-x86_64/lib/libmicrohttpd.dylib || true

# Windows
libmicrohttpd-0.9.17+libiconv-w32.zip:
	$(DOWNLOADER) libmicrohttpd-w32.zip $(DEP_MIRROR)/libmicrohttpd-0.9.17+libiconv-w32.zip

libmicrohttpd/lib/libmicrohttpd.dll.a: libmicrohttpd-0.9.17+libiconv-w32.zip
	test ! -f libmicrohttpd/lib/libmicrohttpd.dll.a && mkdir libmicrohttpd; unzip -o -d libmicrohttpd libmicrohttpd-w32.zip || true

####################################################
############ LZMA
####################################################

xz.tar.bz2:
	$(DOWNLOADER) xz.tar.bz2 $(DEP_MIRROR)/xz-5.0.4.tar.bz2

xz: xz.tar.bz2
	test -d xz || tar -xf xz.tar.bz2
	test -d xz-5.0.4 && mv xz-5.0.4 xz

xz/build/lib/liblzma.so: xz
	test ! -f xz/build/lib/liblzma.so && cd xz && mkdir -p build && CC="$(COMPC)" CXX="$(COMPCXX)" CFLAGS=" -fPIC " ./configure --disable-assembler --enable-shared --enable-static --prefix=$(DEP_PATH)/xz/build && make clean && make && make install || true

# OSX Join
xz/build/lib/liblzma.dylib: xz/build-i386/lib/liblzma.dylib xz/build-x86_64/lib/liblzma.dylib
	test ! -f xz/build/lib/liblzma.dylib && mkdir -p xz/build/lib && cd xz/build/lib && lipo ../../build-x86_64/lib/liblzma.dylib ../../build-i386/lib/liblzma.dylib -create -output liblzma.dylib && lipo ../../build-x86_64/lib/liblzma.a ../../build-i386/lib/liblzma.a -create -output liblzma.a  && install_name_tool -id liblzma.dylib liblzma.dylib || true

# OSX i386
xz/build-i386/lib/liblzma.dylib: xz
	test ! -f xz/build-i386/lib/liblzma.dylib && cd xz && mkdir -p build-i386 && CC="gcc -arch i386" CXX="g++ -arch i386" CFLAGS=" -fPIC  " ./configure --disable-assembler --enable-shared --enable-static --prefix=$(DEP_PATH)/xz/build-i386 && make clean && make && make install && install_name_tool -id liblzma.dylib build-i386/lib/liblzma.dylib || true

# OSX x86_64
xz/build-x86_64/lib/liblzma.dylib: xz
	test ! -f xz/build-x86_64/lib/liblzma.dylib && cd xz && mkdir -p build-x86_64 && CC="gcc -arch x86_64" CXX="g++ -arch x86_64" CFLAGS=" -fPIC  " ./configure --disable-assembler --enable-shared --enable-static --prefix=$(DEP_PATH)/xz/build-x86_64 && make clean && make && make install && install_name_tool -id liblzma.dylib build-x86_64/lib/liblzma.dylib || true

# Windows
xz-5.0.4-windows.zip:
	$(DOWNLOADER) xz-5.0.4-windows.zip $(DEP_MIRROR)/xz-5.0.4-windows.zip

xz-win/bin_i486/liblzma.lib: xz-5.0.4-windows.zip
	test ! -f xz-win/bin_i486/liblzma.lib && mkdir -p xz-win ; unzip -o -d xz-win xz-5.0.4-windows.zip ; cd xz-win/bin_i486 ; cp -v ../doc/liblzma.def . ; lib /def:liblzma.def /out:liblzma.lib /machine:ix86 || true

####################################################
############ ARIA2 (downloaded)
####################################################

aria2c:
	$(DOWNLOADER) aria2c $(DEP_MIRROR)/aria2c.$(ARCH)
	chmod +x aria2c

# OSX
aria2c-1.14.2-universal:
	$(DOWNLOADER) aria2c-1.14.2-universal $(DEP_MIRROR)/aria2c-1.14.2-universal && chmod +x aria2c-1.14.2-universal

# Windows
aria2c.exe:
	$(DOWNLOADER) aria2c.exe $(DEP_MIRROR)/aria2c.exe

####################################################
############ CLUCENE
####################################################

clucene-core-0.9.21b.tar.bz2:
	$(DOWNLOADER) clucene-core-0.9.21b.tar.bz2 $(DEP_MIRROR)/clucene-core-0.9.21b.tar.bz2

clucene-core-0.9.21b: clucene-core-0.9.21b.tar.bz2
	test -d clucene-core-0.9.21b || tar xf clucene-core-0.9.21b.tar.bz2

clucene-core-0.9.21b/build/lib/libclucene.so: clucene-core-0.9.21b
	test ! -f clucene-core-0.9.21b/build/lib/libclucene.so && cd clucene-core-0.9.21b && mkdir -p build && CC="$(COMPC)" CXX="$(COMPCXX)" CXXFLAGS=" -fPIC " ./configure --enable-shared --enable-static --prefix=$(DEP_PATH)/clucene-core-0.9.21b/build && make clean && make && make install || true

# OSX Join
clucene-core-0.9.21b/build/lib/libclucene.dylib: clucene-core-0.9.21b/build-i386/lib/libclucene.dylib clucene-core-0.9.21b/build-x86_64/lib/libclucene.dylib
	test ! -f clucene-core-0.9.21b/build/lib/libclucene.dylib && mkdir -p clucene-core-0.9.21b/build/lib && cd clucene-core-0.9.21b/build/lib && lipo ../../build-x86_64/lib/libclucene.dylib ../../build-i386/lib/libclucene.dylib -create -output libclucene.dylib && lipo ../../build-x86_64/lib/libclucene.a ../../build-i386/lib/libclucene.a -create -output libclucene.a && install_name_tool -id libclucene.dylib libclucene.dylib || true

# OSX i386
clucene-core-0.9.21b/build-i386/lib/libclucene.dylib: clucene-core-0.9.21b
	test ! -f clucene-core-0.9.21b/build-i386/lib/libclucene.dylib && cd clucene-core-0.9.21b && mkdir -p build-i386 && CC="gcc -arch i386" CXX="g++ -arch i386" CFLAGS=" -fPIC  " ./configure --enable-shared --enable-static --prefix=$(DEP_PATH)/clucene-core-0.9.21b/build-i386 && make clean && make && make install && install_name_tool -id libclucene.dylib build-i386/lib/libclucene.dylib || true

# OSX x86_64
clucene-core-0.9.21b/build-x86_64/lib/libclucene.dylib: clucene-core-0.9.21b
	test ! -f clucene-core-0.9.21b/build-x86_64/lib/libclucene.dylib && cd clucene-core-0.9.21b && mkdir -p build-x86_64 && CC="gcc -arch x86_64" CXX="g++ -arch x86_64" CFLAGS=" -fPIC  " ./configure --enable-shared --enable-static --prefix=$(DEP_PATH)/clucene-core-0.9.21b/build-x86_64 && make clean && make && make install && install_name_tool -id libclucene.dylib build-x86_64/lib/libclucene.dylib || true

####################################################
############ UUID
####################################################

e2fsprogs-1.42.tar.gz:
	$(DOWNLOADER) e2fsprogs-1.42.tar.gz $(DEP_MIRROR)/e2fsprogs-1.42.tar.gz

e2fsprogs-1.42: e2fsprogs-1.42.tar.gz
	test -d e2fsprogs-1.42 || tar xf e2fsprogs-1.42.tar.gz

e2fsprogs-1.42/lib/libuuid.a: e2fsprogs-1.42
	test ! -f e2fsprogs-1.42/lib/libuuid.a && mkdir -p e2fsprogs-1.42/build && cd e2fsprogs-1.42/ && CC="$(COMPC)" CXX="$(COMPCXX)" CXXFLAGS=" -fPIC " ./configure --enable-libuuid --prefix=$(DEP_PATH)/e2fsprogs-1.42/build && make clean && make && make install || true

####################################################
############ PUGIXML
####################################################

pugixml-1.2.tar.gz:
	$(DOWNLOADER) pugixml-1.2.tar.gz $(DEP_MIRROR)/pugixml-1.2.tar.gz

pugixml-1.2: pugixml-1.2.tar.gz
	test -d pugixml-1.2 || mkdir pugixml-1.2; tar xf pugixml-1.2.tar.gz -C pugixml-1.2

pugixml-1.2/libpugixml.a: pugixml-1.2
if IS_OSX
	test ! -f pugixml-1.2/libpugixml.a && cd pugixml-1.2 && rm -f *.o *.a && $(COMPCXX) -fPIC -c src/pugixml.cpp -o libpugixml.o && libtool -static -o libpugixml.a libpugixml.o || true
else
	test ! -f pugixml-1.2/libpugixml.a && cd pugixml-1.2 && rm -f *.o *.a && $(COMPCXX) -fPIC -c src/pugixml.cpp -o libpugixml.o && ar rvs libpugixml.a libpugixml.o || true
endif

pugixml-1.2/libpugixml.dylib: pugixml-1.2
	test ! -f pugixml-1.2/libpugixml.dylib && cd pugixml-1.2 && rm -f *.o && $(COMPCXX) -fPIC -c src/pugixml.cpp -o libpugixml.o && $(COMPCXX) -shared -o libpugixml.dylib libpugixml.o || true

pugixml-1.2/libpugixml.so: pugixml-1.2
	test ! -f pugixml-1.2/libpugixml.so && cd pugixml-1.2 && rm -f *.o *.so && $(COMPCXX) -fPIC -c src/pugixml.cpp -o libpugixml.o && $(COMPCXX) -shared -o libpugixml.so libpugixml.o || true

pugixml-1.2/src/pugixml.lib: pugixml-1.2
	test ! -f pugixml-1.2/src/pugixml.lib && cd pugixml-1.2/src && rm -f vc90* *.o pugixml.lib && cl.exe -O2 -Oi -I"./"  -D"WIN32" -FD -EHsc -MT -Gy -nologo -c -Zi -TP *.cpp && link.exe -lib -NOLOGO -NODEFAULTLIB:"MSVCRT" -MACHINE:X86 -OUT:pugixml.lib *.obj || true


####################################################
############ CTPP2
####################################################

ctpp2-2.8.3.tar.gz:
	$(DOWNLOADER) ctpp2-2.8.3.tar.gz $(DEP_MIRROR)/ctpp2-2.8.3.tar.gz

ctpp2-2.8.3: ctpp2-2.8.3.tar.gz
	test -d ctpp2-2.8.3 || ! tar xf ctpp2-2.8.3.tar.gz || patch -p2 ctpp2-2.8.3/include/CTPP2SourceLoader.hpp patches/CTPP2SourceLoader.hpp.patch || true

# OSX & Linux
ctpp2-2.8.3/build/complete/lib/libctpp2.${SHARED_EXT} ctpp2-2.8.3/build/complete/lib/libctpp2-st.a: ctpp2-2.8.3
	test ! -f 2-2.8.3/build/complete/lib/libctpp2.${SHARED_EXT} && rm -rf ctpp2-2.8.3/build && mkdir -p ctpp2-2.8.3/build && cd ctpp2-2.8.3/build && CC="$(COMPC)" CXX="$(COMPCXX)" CXXFLAGS="-fPIC -D_FILE_OFFSET_BITS=64 -D_LARGEFILE64_SOURCE" cmake -DCMAKE_INSTALL_PREFIX=./complete .. && make && make install || true

# Windows
ctpp2-2.8.3/src/ctpp2.lib: ctpp2-2.8.3
	test ! -f ctpp2-2.8.3/src/ctpp2.lib && cd ctpp2-2.8.3/src && rm -f vc90* && cp ../../patches/CTPP2SysHeaders.h ../include/ && cl.exe -O2 -Oi -I"../include"  -I"../include/functions" -D"WIN32" -FD -EHsc -MT -Gy -nologo -c -Zi -TP *.cpp functions/*.cpp || true
	test ! -f ctpp2-2.8.3/src/ctpp2.lib && cd ctpp2-2.8.3/src && link.exe -lib -NOLOGO -NODEFAULTLIB:"MSVCRT" -MACHINE:X86 -OUT:ctpp2.lib *.obj || true

####################################################
############ ARGTABLE
####################################################

argtable2-13.tar.gz:
	$(DOWNLOADER) argtable2-13.tar.gz $(DEP_MIRROR)/argtable2-13.tar.gz

argtable2-13: argtable2-13.tar.gz
	test -d argtable2-13 || tar xf argtable2-13.tar.gz

argtable2-13/src/argtable2.lib: argtable2-13
	test ! -f argtable2-13/src/argtable2.lib && cd argtable2-13/src ; nmake.exe -f Makefile.nmake || true

####################################################
############ PTHREAD
####################################################

pthread-win32.zip:
	$(DOWNLOADER) pthread-win32.zip $(DEP_MIRROR)/pthread-win32.zip

pthread-win32/lib/pthreadVC2.lib: pthread-win32.zip
	test -d pthread-win32 || unzip -o -d pthread-win32 pthread-win32.zip

####################################################
############ MS Visual C Runtime
####################################################

msvc100.zip:
	$(DOWNLOADER) msvc100.zip $(DEP_MIRROR)/msvc100.zip

msvc90.zip:
	$(DOWNLOADER) msvc90.zip $(DEP_MIRROR)/msvc90.zip

msvc100/msvcr100.dll msvc100/msvcp100.dll: msvc100.zip
	mkdir -p msvc100 && unzip -o -d msvc100 msvc100.zip

msvc90/msvcr90.dll msvcp90.dll msvcm90.dll Microsoft.VC90.CRT.manifest: msvc90.zip
	mkdir -p msvc90 && unzip -o -d msvc90 msvc90.zip

####################################################
############ ANDROID-NDK
####################################################
android-ndk-r8e.tar.bz2:
	$(DOWNLOADER) android-ndk-r8e.tar.bz2 $(ANDROIDNDKURL)

android-ndk-r8e: android-ndk-r8e.tar.bz2
	test -d android-ndk-r8e || tar xf android-ndk-r8e.tar.bz2

####################################################
############ ANDROID-SDK
####################################################
android-sdk.zip:
	$(DOWNLOADER) android-sdk.zip $(ANDROIDSDKURL)

android-sdk/sdk: android-sdk.zip
	test -d android-sdk || unzip -o -d android-sdk android-sdk.zip
	test -d android-sdk/sdk || mv android-sdk/*/* android-sdk/

android-14.tar.bz2:
	$(DOWNLOADER) android-14.tar.bz2 $(DEP_MIRROR)/android-14.tar.bz2

android-sdk/sdk/platforms/android-14: android-sdk/sdk android-14.tar.bz2
	test -d android-sdk/sdk/platforms/android-14 || tar xf android-14.tar.bz2
	test -d android-14 && mv android-14 android-sdk/sdk/platforms/ || true

android-deps: android-ndk-r8e android-sdk/sdk/platforms/android-14 xz icu zimlib-1.1 zimlib-1.1/build/lib/libzim.so
	true

####################################################
############ ZIMLIB
####################################################
zimlib-1.1.tar.gz:
	$(DOWNLOADER) zimlib-1.1.tar.gz $(DEP_MIRROR)/zimlib-1.1.tar.gz

# zimlib-1.1: zimlib-1.1.tar.gz
# 	tar xf zimlib-1.1.tar.gz

zimlib-master.zip:
	$(DOWNLOADER) zimlib-master.zip --no-check-certificate https://github.com/kiwix/openzim/archive/master.zip

zimlib-1.1: zimlib-master.zip
	unzip -o zimlib-master.zip && mv openzim-master/zimlib zimlib-1.1 && cd zimlib-1.1 && touch Makefile.in && ./autogen.sh || true

# OSX i386
zimlib-1.1/build-i386/lib/libzim.dylib zimlib-1.1/build-i386/lib/libzim.a: zimlib-1.1 xz/build/lib/liblzma.dylib
	test ! -f zimlib-1.1/build-i386/lib/libzim.dylib && cd zimlib-1.1 && mkdir -p build-i386 && LDFLAGS=" -L$(DEP_PATH)/xz/build/lib/ " CC="gcc -arch i386" CXX="g++ -arch i386" CFLAGS="-I$(DEP_PATH)/xz/build/include" CXXFLAGS=" -D_FILE_OFFSET_BITS=64 -D_LARGEFILE64_SOURCE -I$(DEP_PATH)/xz/build/include" LDFLAGS="-L$(DEP_PATH)/xz/build/lib" ./configure --enable-shared --disable-dependency-tracking --with-pic --prefix=$(DEP_PATH)/zimlib-1.1/build-i386 --enable-static --disable-libtool-lock && make clean && make && make install && install_name_tool -id libzim.dylib build-i386/lib/libzim.dylib || true

# OSX x86_64
zimlib-1.1/build-x86_64/lib/libzim.dylib zimlib-1.1/build-x86_64/lib/libzim.a: zimlib-1.1 xz/build/lib/liblzma.dylib
	test ! -f zimlib-1.1/build-x86_64/lib/libzim.dylib && cd zimlib-1.1 && mkdir -p build-x86_64 && LDFLAGS=" -L$(DEP_PATH)/xz/build/lib/ " CC="gcc -arch x86_64" CXX="g++ -arch x86_64" CFLAGS="-I$(DEP_PATH)/xz/build/include" CXXFLAGS=" -D_FILE_OFFSET_BITS=64 -D_LARGEFILE64_SOURCE -I$(DEP_PATH)/xz/build/include" LDFLAGS="-L$(DEP_PATH)/xz/build/lib" ./configure --enable-shared --disable-dependency-tracking --with-pic --prefix=$(DEP_PATH)/zimlib-1.1/build-x86_64 --enable-static --disable-libtool-lock && make clean && make && make install && install_name_tool -id libzim.dylib build-x86_64/lib/libzim.dylib || true

# OSX Join
zimlib-1.1/build/lib/libzim.dylib zimlib-1.1/build/lib/libzim.a: zimlib-1.1/build-i386/lib/libzim.dylib zimlib-1.1/build-x86_64/lib/libzim.dylib zimlib-1.1/build-i386/lib/libzim.a zimlib-1.1/build-x86_64/lib/libzim.a
	test ! -f zimlib-1.1/build/lib/libzim.dylib && mkdir -p zimlib-1.1/build/lib && cd zimlib-1.1/build/lib && lipo ../../build-x86_64/lib/libzim.dylib ../../build-i386/lib/libzim.dylib -create -output libzim.dylib && lipo ../../build-x86_64/lib/libzim.a ../../build-i386/lib/libzim.a -create -output libzim.a && install_name_tool -id libzim.dylib libzim.dylib || true

# Linux
zimlib-1.1/build/lib/libzim.so: zimlib-1.1 xz/build/lib/liblzma.so
	test ! -f zimlib-1.1/build/lib/libzim.so && cd zimlib-1.1 && mkdir -p build && CC="$(COMPC)" CXX="$(COMPCXX)" CFLAGS="-I$(DEP_PATH)/xz/build/include" CXXFLAGS=" -D_FILE_OFFSET_BITS=64 -D_LARGEFILE64_SOURCE -I$(DEP_PATH)/xz/build/include" LDFLAGS="-L$(DEP_PATH)/xz/build/lib" ./configure --enable-shared --with-pic --prefix=$(DEP_PATH)/zimlib-1.1/build --enable-static --disable-libtool-lock && make clean && echo "#undef HAVE_STAT64" >> src/config.h && echo "#undef HAVE_OPEN64" >> src/config.h && make && make install || true

# Win32
zimlib-1.1/src/config.h: zimlib-1.1
	test ! -f zimlib-1.1/src/config.h && cp patches/zimlib_config.h zimlib-1.1/src/config.h && cd zimlib-1.1 || true
# && patch -p2 < ../patches/zimlib-win32-headers-instead-of-unix.patch

zimlib-1.1/src/zim.lib: zimlib-1.1 zimlib-1.1/src/config.h xz-win/bin_i486/liblzma.lib zlib-1.2.3/zlib.lib
	test ! -f zimlib-1.1/src/zim.lib && cd zimlib-1.1/src && cp ../../patches/Makefile.zimlib.msvc Makefile.msvc && make -f Makefile.msvc || true

####################################################
############ CLEANUP (ALL)
####################################################


CLEANFILES=

DISTCLEANFILES= xulrunner-sdk.tar.bz2 \
	xulrunner-14.0.1.en-US.mac-i386.sdk.tar.bz2 \
	xulrunner-14.0.1.en-US.mac-x86_64.sdk.tar.bz2 \
	xulrunner-runtime.tar.bz2 \
	xulrunner-14.0.1.en-US.mac-pkg.dmg \
	xulrunner-14.0.1.en-US.mac.tar.bz2 \
	xulrunner-win.zip \
	zlib.tar.gz \
	xapian-core.tar.gz \
	xapian-win32.zip \
	icu4c-4_4_2-src.tgz \
	icu4c-49_1_1-Win32-msvc10.zip \
	icu4c-49_1_1-src.tgz \
	icu.zip \
	pugixml*.tar.gz \
	libmicrohttpd-0.9.19.tar.gz \
	xz.tar.bz2 \
	xz-5.0.4-windows.zip \
	aria2c \
	aria2c-1.14.2-universal \
	aria2c.exe \
	clucene-core-0.9.21b.tar.bz2 \
	e2fsprogs-1.42.tar.gz \
	argtable2-13.tar.gz \
	pthread-win32.zip \
	android-ndk-r8e.tar.bz2 \
	android-sdk.zip \
	android-14.tar.bz2 \
	zimlib-1.1.tar.gz

clean-local:
	-rm -rf zlib-1.2.3
	-rm -rf xapian-core-1.2.3
	-rm -rf icu
	-rm -rf pugixml-1.2
	-rm -rf libmicrohttpd-0.9.19
	-rm -rf xz
	-rm -rf xz-5.0.4
	-rm -rf xz-win
	-rm -rf aria2-1.14.2
	-rm -rf clucene-core-0.9.21b
	-rm -rf e2fsprogs-1.42
	-rm -rf argtable2-13
	-rm -rf pthread-win32
	-rm -rf zimlib-1.1
	-rm -rf aria2c-1.14.2-universal
	-rm -rf XUL.framework

distclean-local:
	-rm -rf xulrunner-sdk-i386
	-rm -rf xulrunner-sdk-x86_64
	-rm -rf universal-sdk
	-rm -rf xulrunner-sdk
	-rm -rf xulrunner
	-rm -rf xr_target
	-rm -rf android-ndk-mac
	-rm -rf android-ndk-linux
	-rm -rf android-ndk-r8e
	-rm -rf android-sdk
	-rm -rf android-14

# list of targets is built in configure.ac
all-local: deps