
# list of targets is built in configure.ac
deps: ${DEP_LIST}

if IS_LINUX
GECKOSDKURL=http://download.kiwix.org/dev/xulrunner-11.0.en-US.linux-$(ARCH).sdk.tar.bz2
else
GECKOSDKURL=reg
endif

####################################################
############ GECKO-SDK
####################################################
xulrunner-sdk.tar.bz2:
	wget -c $(GECKOSDKURL) -O xulrunner-sdk.tar.bz2
	

xulrunner-sdk: xulrunner-sdk.tar.bz2
	if test ! -d xulrunner-sdk; then tar -xf xulrunner-sdk.tar.bz2 ; fi;


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
	cd xz ; patch -p0 < ../patches/xz-4.999.9beta-sysctl-darwin.patch ; patch -p0 < ../patches/xz-4.999.9beta-lzma-versioninfo.patch
else
	mv xz-5.0.3 xz
endif
endif

xz/src/liblzma/.libs/liblzma.a: xz/
if IS_OSX
	lzma_conf_extra="--with-libiconv-prefix=/opt/local --with-libintl-prefix=/opt/local --disable-assembler"
	cd xz; export CFLAGS=" -fPIC " ; ./configure $(lzma_conf_extra); make
else
	cd xz; CFLAGS=" -fPIC " ./configure --disable-assembler; make
endif

####################################################
############ ICU
####################################################

icu4c-4_8_1_1-src.tgz:
	wget -c -O icu4c-4_8_1_1-src.tgz http://download.kiwix.org/dev/icu4c-4_8_1_1-src.tgz

icu/: icu4c-4_8_1_1-src.tgz
	tar xf icu4c-4_8_1_1-src.tgz

icu/source/lib/libicuio.a icu/source/lib/libicudata.a icu/source/lib/libicuuc.a icu/source/lib/libicui18n.a: icu/
	cd icu/source; CFLAGS=" -fPIC " ./configure --enable-static --disable-shared ; make

####################################################
############ XAPIAN
####################################################

xapian-core.tar.gz:
	wget -c -O xapian-core.tar.gz http://download.kiwix.org/dev/xapian-core-1.2.3.tar.gz

xapian-core-1.2.3: xapian-core.tar.gz
	tar -xf xapian-core.tar.gz

xapian-core-1.2.3/.libs/libxapian.a: xapian-core-1.2.3/
	cd xapian-core-1.2.3 ; EXTERN_PATH=`pwd` CPPFLAGS="-I${CURRENT_PATH}/src/dependences/zlib-1.2.3/" CXXFLAGS=" -fPIC -L${CURRENT_PATH}/src/dependences/zlib-1.2.3" ./configure --enable-static --disable-shared; make

####################################################
############ CLUCENE
####################################################

clucene-core-0.9.21b.tar.bz2:
	wget -c -O clucene-core-0.9.21b.tar.bz2 http://download.kiwix.org/dev/clucene-core-0.9.21b.tar.bz2

clucene-core-0.9.21b: clucene-core-0.9.21b.tar.bz2
	tar xf clucene-core-0.9.21b.tar.bz2

clucene-core-0.9.21b/src/.libs/libclucene.a: clucene-core-0.9.21b/
	cd clucene-core-0.9.21b ; CXXFLAGS=" -fPIC " ./configure --enable-static --disable-shared ; make

####################################################
############ CLEANUP (ALL)
####################################################
clean:
	rm -rf xapian-core-1.2.3
	rm -rf zlib-1.2.3
	rm -rf xz
	rm -rf aria2-1.14.1

# distclean
distclean:
	rm -rf xapian-core.tar.gz xapian-win32.zip xapian-core-1.2.3 win32
	rm -rf xz.tar.bz2 xz-4.999.9beta xz-5.0.3
	rm -rf xulrunner-sdk-linux.tar.bz2
	rm -rf xulrunner-sdk-win.zip xulrunner-sdk
	rm -rf xulrunner-win.zip xulrunner
	rm -rf xulrunner-source.tar.bz2
	rm -rf icu icu.zip

all: deps