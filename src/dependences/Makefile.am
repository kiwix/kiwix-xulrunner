# download
zlib.tar.gz:
	wget -c http://download.kiwix.org/dev/zlib-1.2.3.tar.gz -O zlib.tar.gz
	tar -xvzf zlib.tar.gz

bzip2.tar.gz:
	wget -c http://download.kiwix.org/dev/bzip2-1.0.5.tar.gz -O bzip2.tar.gz
	tar -xvzf bzip2.tar.gz

xapian-core.tar.gz:
	wget -c http://download.kiwix.org/dev/xapian-core-1.0.19.tar.gz -O xapian-core.tar.gz
	tar -xvzf xapian-core.tar.gz

xapian-win32.zip:
	wget -c http://download.kiwix.org/dev/xapian-1.0.19-win32.zip -O xapian-win32.zip
	unzip xapian-win32.zip
	mv win32 ./xapian-core-1.0.19/

icu.zip:
	wget -c http://download.kiwix.org/dev/icu4c-4_4-Win32-msvc9.zip -O icu.zip
	unzip icu.zip

xulrunner-sdk-linux.tar.bz2:
	wget -c http://download.kiwix.org/dev/xulrunner-1.9.1.4.en-US.linux-i686.sdk.tar.bz2 -O xulrunner-sdk-linux.tar.bz2
	tar -xvjf xulrunner-sdk-linux.tar.bz2

xulrunner-sdk-win.zip:
	wget -c http://download.kiwix.org/dev/xulrunner-1.9.2.en-US.win32.sdk.zip -O xulrunner-sdk-win.zip
	unzip xulrunner-sdk-win.zip

xulrunner-win.zip:
	wget -c http://download.kiwix.org/dev/xulrunner-1.9.2.en-US.win32.zip -O xulrunner-win.zip
	unzip xulrunner-win.zip

xulrunner-source.tar.bz2:
	wget -c http://download.kiwix.org/dev/xulrunner-1.9.2.source.tar.bz2 -O xulrunner-source.tar.bz2
	tar -xvjf xulrunner-source.tar.bz2

xz.tar.bz2:
	wget -c http://download.kiwix.org/dev/xz-4.999.9beta.tar.bz2 -O xz.tar.bz2
	tar -xvjf xz.tar.bz2

# compile
bzip2-1.0.5/libbz2.a: bzip2.tar.gz
	cd bzip2-1.0.5 ; sed -i "s/CFLAGS=/CFLAGS=-fPIC /" Makefile ; make ; make Makefile-libbz2_so

bzip2-1.0.5/libbz2.lib: bzip2.tar.gz
	cd bzip2-1.0.5 ; sed -e "s/\\-MD/\\-MT/" makefile.msc > makefile.msc.custom ; export MAKEFLAGS=; nmake.exe -f makefile.msc.custom

zlib-1.2.3/libz.a: zlib.tar.gz
	cd zlib-1.2.3 ; export CFLAGS=" -fPIC " ; ./configure ; make ; ./configure ; make	

zlib-1.2.3/zlib.lib: zlib.tar.gz
	cd zlib-1.2.3 ; cp ./win32/Makefile.msc ./ ; sed -e "s/\\-MD/\\-MT/" Makefile.msc > Makefile.msc.custom ; export MAKEFLAGS=; nmake.exe -f Makefile.msc.custom

xapian-core-1.0.19/.libs/libxapian.a: xapian-core.tar.gz 
	cd xapian-core-1.0.19 ; export EXTERN_PATH=`pwd` ; export CPPFLAGS="-I${CURRENT_PATH}/src/dependences/zlib-1.2.3/" ; export CXXFLAGS=" -fPIC -L${CURRENT_PATH}/src/dependences/zlib-1.2.3" ; ./configure ; make

xapian-core-1.0.19/win32/Release/libs/libunicode.lib: xapian-core.tar.gz xapian-win32.zip
	cd xapian-core-1.0.19/win32; sed -e "s/\\-MD/\\-MT/" config.mak > config.mak.bis
	cd xapian-core-1.0.19/win32; sed -e "s/C\\:\\\gnu\\\zlib123-dll/C\\:\\\mozilla\\-build\\\moulinkiwix\\\src\\\dependences\\\zlib\\-1\\.2\\.3/" config.mak.bis > config.mak
	cd xapian-core-1.0.19/win32; sed -e "s/zdll\\.lib/zlib\\.lib/" config.mak > config.mak.bis
	cd xapian-core-1.0.19/win32; sed -e "s/.ZLIB_DIR.\\\include/(ZLIB_DIR)/" config.mak.bis > config.mak
	cd xapian-core-1.0.19/win32; sed -e "s/.ZLIB_DIR.\\\lib/(ZLIB_DIR)/" config.mak > config.mak.bis
	cd xapian-core-1.0.19/win32; cp config.mak.bis config.mak
	cd xapian-core-1.0.19/win32; sed "/harness/{x;p;x;}" Makefile > Makefile.bis
	cd xapian-core-1.0.19/win32; sed "s/^.*harness.*$$/42:/" Makefile.bis > Makefile
	cd xapian-core-1.0.19/win32; export MAKEFLAGS=; nmake.exe -f Makefile

mozilla-1.9.1/dist/bin/xulrunner: xulrunner-source.tar.bz2
	cp .mozconfig mozilla-1.9.1/ ; make -f client.mk build ; make package

xz-4.999.9beta/src/liblzma/.libs/liblzma.a: xz.tar.bz2
	cd xz-4.999.9beta ; export CFLAGS=" -fPIC " ; ./configure ; make 

xz-4.999.9beta/windows/liblzma.lib: xz.tar.bz2
	cd xz-4.999.9beta/windows ; make liblzma
	cd xz-4.999.9beta/windows ; lib /def:liblzma.def /out:liblzma.lib /machine:ix86

all: bzip2-1.0.5/libbz2.a zlib-1.2.3/libz.a xapian-core-1.0.19/.libs/libxapian.a xz-4.999.9beta/src/liblzma/.libs/liblzma.a mozilla-1.9.1/dist/bin/xulrunner
	

win: bzip2-1.0.5/libbz2.lib zlib-1.2.3/zlib.lib xapian-core-1.0.19/win32/Release/libs/libunicode.lib icu.zip xz-4.999.9beta/windows/liblzma.lib xulrunner-sdk-win.zip xulrunner-win.zip
	

# clean
clean:
	rm -rf bzip2-1.0.5/libbz2.a bzip2-1.0.5/libbz2.lib
	rm -rf zlib-1.2.3/libz.a zlib-1.2.3/libz.lib
	rm -rf xapian-core-1.0.19/.libs/libxapian.a xapian-core-1.0.19/win32/Release/libs/libunicode.lib
	rm -rf xz-4.999.9beta/src/liblzma/.libs/liblzma.a  xz-4.999.9beta/windows/liblzma.lib

# distclean
distclean:
	rm -rf zlib.tar.gz bzip2-1.0.5
	rm -rf bzip2.tar.gz zlib-1.2.3
	rm -rf xapian-core.tar.gz xapian-win32.zip xapian-core-1.0.19
	rm -rf xz.tar.bz2 xz-4.999.9beta
	rm -rf xulrunner-sdk-linux.tar.bz2
	rm -rf xulrunner-sdk-win.zip xulrunner-sdk
	rm -rf xulrunner-win.zip xulrunner
	rm -rf xulrunner-source.tar.bz2
	rm -rf icu icu.zip