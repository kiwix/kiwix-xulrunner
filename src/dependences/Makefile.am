# download
zlib.tar.gz:
	wget -c http://download.kiwix.org/dev/zlib-1.2.3.tar.gz -O zlib.tar.gz
	tar -xvzf zlib.tar.gz

bzip2.tar.gz:
	wget -c http://download.kiwix.org/dev/bzip2-1.0.5.tar.gz -O bzip2.tar.gz
	tar -xvzf bzip2.tar.gz

xapian-core.tar.gz:
	wget -c http://download.kiwix.org/dev/xapian-core-1.0.16.tar.gz -O xapian-core.tar.gz
	tar -xvzf xapian-core.tar.gz

unac.tar.bz2:
	wget -c http://download.kiwix.org/dev/unac-1.7.0.tar.bz2 -O unac.tar.bz2
	tar -xvjf unac.tar.bz2

xulrunner-sdk.tar.bz2:
	wget -c http://download.kiwix.org/dev/xulrunner-1.9.1.4.en-US.linux-i686.sdk.tar.bz2 -O xulrunner-sdk.tar.bz2
	tar -xvjf xulrunner-sdk.tar.bz2

xulrunner-source.tar.bz2:
	wget -c http://download.kiwix.org/dev/xulrunner-1.9.1.7.source.tar.bz2 -O xulrunner-source.tar.bz2
	tar -xvjf xulrunner-source.tar.bz2

xz.tar.bz2:
	wget -c http://download.kiwix.org/dev/xz-4.999.9beta.tar.bz2 xz.tar.bz2
	tar -xvjf xz.tar.bz2

# compile
bzip2-1.0.5/libbz2.a: bzip2.tar.gz
	cd bzip2-1.0.5 ; sed -i "s/CFLAGS=/CFLAGS=-fPIC /" Makefile ; make ; make Makefile-libbz2_so

bzip2-1.0.5/libbz2.lib: bzip2.tar.gz
	cd bzip2-1.0.5 ; touch toto ; sed -e "s/\\-MD/\\-MT/" makefile.msc > makefile.msc.custom ; export MAKEFLAGS=; nmake.exe -f makefile.msc.custom

zlib-1.2.3/libz.a: zlib.tar.gz
	cd zlib-1.2.3 ; export CFLAGS=" -fPIC " ; ./configure ; make ; ./configure ; make	

xapian-core-1.0.16/.libs/libxapian.a: xapian-core.tar.gz
	cd xapian-core-1.0.16 ; export EXTERN_PATH=`pwd` ; export CPPFLAGS="-I${CURRENT_PATH}/src/dependences/zlib-1.2.3/" ; export CXXFLAGS=" -fPIC -L${CURRENT_PATH}/src/dependences/zlib-1.2.3" ; ./configure ; make

unac-1.7.0/libunac.a: unac.tar.bz2
	cd unac-1.7.0 ; gcc -DUNAC_VERSION="\"42\"" -fPIC -c unac.c ; ar cr libunac.a unac.o ; ranlib libunac.a

mozilla-1.9.1/dist/bin/xulrunner: xulrunner-source.tar.bz2
	cp .mozconfig mozilla-1.9.1/ ; make -f client.mk build ; make package

xz-4.999.9beta/src/liblzma/.libs/liblzma.a: xz.tar.bz2
	cd xz-4.999.9beta ; export CFLAGS=" -fPIC " ; ./configure ; make 

all-posix: bzip2-1.0.5/libbz2.a zlib-1.2.3/libz.a xapian-core-1.0.16/.libs/libxapian.a unac-1.7.0/libunac.a xz-4.999.9beta/src/liblzma/.libs/liblzma.a mozilla-1.9.1/dist/bin/xulrunner
	

all-win: bzip2-1.0.5/libbz2.lib
	

all: ${ALL_RULE}

# clean
clean:
	rm -rf bzip2-1.0.5/libbz2.a bzip2-1.0.5/libbz2.lib
	rm -rf zlib-1.2.3/libz.a
	rm -rf xapian-core-1.0.16/.libs/libxapian.a
	rm -rf unac-1.7.0/libunac.a
	rm -rf mozilla-1.9.1/dist/bin/xulrunner
	rm -rf xz-4.999.9beta/src/liblzma/.libs/liblzma.a

# distclean
distclean:
	rm -rf zlib.tar.gz
	rm -rf bzip2.tar.gz
	rm -rf xapian-core.tar.gz
	rm -rf unac.tar.bz2
	rm -rf xulrunner-sdk.tar.bz2
	rm -rf xulrunner-source.tar.bz2
	rm -rf z.tar.bz2