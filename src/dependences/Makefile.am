# download
zlib.tar.gz:
	wget -c http://download.kiwix.org/dev/zlib-1.2.3.tar.gz -O zlib.tar.gz
	tar -xf zlib.tar.gz

zlib-1.2.3: zlib.tar.gz
	tar -xf zlib.tar.gz

xapian-core.tar.gz:
	wget -c http://download.kiwix.org/dev/xapian-core-1.2.3.tar.gz -O xapian-core.tar.gz

xapian-core-1.2.3: xapian-core.tar.gz
	tar -xf xapian-core.tar.gz

xapian-win32.zip:
	wget -c http://download.kiwix.org/dev/xapian-1.2.3-win32.zip -O xapian-win32.zip
	unzip xapian-win32.zip
	mv win32 ./xapian-core-1.2.3/

icu.zip:
	wget -c http://download.kiwix.org/dev/icu4c-4_4-Win32-msvc9.zip -O icu.zip
	unzip icu.zip

xulrunner-sdk.tar.bz2:
if IS_OSX
	wget -c http://download.kiwix.org/dev/xulrunner-1.9.2.13.en-US.mac-i386.sdk.tar.bz2 -O xulrunner-sdk.tar.bz2
else
	wget -c http://download.kiwix.org/dev/xulrunner-1.9.2.13.en-US.linux-i686.sdk.tar.bz2 -O xulrunner-sdk.tar.bz2
endif
	tar -xf xulrunner-sdk.tar.bz2
if IS_OSX
	cd xulrunner-sdk/sdk/lib ; ln -s XUL libxul.dylib
endif

xulrunner-sdk-win.zip:
	wget -c http://download.kiwix.org/dev/xulrunner-1.9.2.en-US.win32.sdk.zip -O xulrunner-sdk-win.zip
	unzip xulrunner-sdk-win.zip

xulrunner-win.zip:
	wget -c http://download.kiwix.org/dev/xulrunner-1.9.2.en-US.win32.zip -O xulrunner-win.zip
	unzip xulrunner-win.zip

xulrunner.dmg:
	wget -c http://download.kiwix.org/dev/xulrunner-1.9.2.13.en-US.mac-pkg.dmg -O xulrunner.dmg
	hdiutil attach xulrunner.dmg
	echo "Installing XulRunner Framework. Please provide admin password to installer"
	sudo installer -pkg /Volumes/XULRunner/xulrunner-1.9.2.13.en-US.mac.pkg -target /
	hdiutil detach /Volumes/XULRunner/

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

# compile
zlib-1.2.3/libz.a: zlib-1.2.3
	cd zlib-1.2.3 ; export CFLAGS=" -fPIC " ; ./configure ; make ; ./configure ; make	

zlib-1.2.3/zlib.lib: zlib-1.2.3
	cd zlib-1.2.3 ; cp ./win32/Makefile.msc ./ ; sed -e "s/\\-MD/\\-MT/" Makefile.msc > Makefile.msc.custom ; export MAKEFLAGS=; nmake.exe -f Makefile.msc.custom

xapian-core-1.2.3/.libs/libxapian.a: xapian-core-1.2.3
	cd xapian-core-1.2.3 ; export EXTERN_PATH=`pwd` ; export CPPFLAGS="-I${CURRENT_PATH}/src/dependences/zlib-1.2.3/" ; export CXXFLAGS=" -fPIC -L${CURRENT_PATH}/src/dependences/zlib-1.2.3" ; ./configure --enable-static ; make

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

xulrunner-sdk/bin/xulrunner: xulrunner-sdk.tar.bz2
	echo "xulrunner SDK present."

aria2-1.10.9.dmg:
	wget -c http://garr.dl.sourceforge.net/project/aria2/stable/aria2-1.10.9/aria2%201.10.9%20Mac%20OS%20X%20Snow%20Leopard.dmg -O aria2-1.10.9.dmg

aria2.pkg: aria2-1.10.9.dmg
	mkdir -p ./aria_dmg
	hdiutil attach aria2-1.10.9.dmg -noautoopen -quiet -mountpoint ./aria_dmg
	cp ./aria_dmg/aria2.pkg aria2.pkg
	hdiutil detach ./aria_dmg

aria2/bin/aria2c: aria2.pkg
	${CURRENT_PATH}/../maintenance_tools/unpkg.py aria2.pkg

aria2-1.12.1.tar.bz2:
	wget -c http://garr.dl.sourceforge.net/project/aria2/stable/aria2-1.12.1/aria2-1.12.1.tar.bz2 -O aria2-1.12.1.tar.bz2
	tar xf aria2-1.12.1.tar.bz2

aria2-1.12.1/src/aria2c: aria2-1.12.1.tar.bz2
	cd aria2-1.12.1 ; export ZLIB_LIBS=/usr/lib/i386-linux-gnu/libz.a ; export SQLITE3_LIBS=/usr/lib/i386-linux-gnu/libsqlite3.a ; LIBCARES_LIBS=/usr/lib/libcares.a
	./configure --with-libcares --with-libz --with-sqlite3 ; make

xz/src/liblzma/.libs/liblzma.a: xz
if IS_OSX
	lzma_conf_extra="--with-libiconv-prefix=/opt/local --with-libintl-prefix=/opt/local --disable-assembler"
	cd xz; export CFLAGS=" -fPIC " ; ./configure $(lzma_conf_extra); make
else
	cd xz; ./configure ; make
endif

xz/windows/liblzma.lib: xz
	cd xz/windows ; make liblzma
	cd xz/windows ; lib /def:liblzma.def /out:liblzma.lib /machine:ix86	

linux: zlib-1.2.3/libz.a xapian-core-1.2.3/.libs/libxapian.a xz/src/liblzma/.libs/liblzma.a xulrunner-sdk/bin/xulrunner

mac: linux xulrunner.dmg aria2/bin/aria2c

if IS_OSX
all: linux mac
else
all: linux
endif

win: zlib-1.2.3/zlib.lib xapian-core-1.2.3/win32/Release/libs/libunicode.lib icu.zip xz/windows/liblzma.lib xulrunner-sdk-win.zip xulrunner-win.zip

# clean
clean:
	rm -rf xapian-core-1.2.3
	rm -rf zlib-1.2.3
	rm -rf xz

# distclean
distclean:
	rm -rf xapian-core.tar.gz xapian-win32.zip xapian-core-1.2.3 win32
	rm -rf xz.tar.bz2 xz-4.999.9beta xz-5.0.3
	rm -rf xulrunner-sdk-linux.tar.bz2
	rm -rf xulrunner-sdk-win.zip xulrunner-sdk
	rm -rf xulrunner-win.zip xulrunner
	rm -rf xulrunner-source.tar.bz2
	rm -rf icu icu.zip
