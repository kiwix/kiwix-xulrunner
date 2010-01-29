src/dependences/zlib.tar.gz:
	wget -c http://download.kiwix.org/dev/zlib-1.2.3.tar.gz -O src/dependences/zlib.tar.gz
	cd src/dependences ; tar -xvzf zlib.tar.gz

src/dependences/bzip2.tar.gz:
	wget -c http://download.kiwix.org/dev/bzip2-1.0.5.tar.gz -O src/dependences/bzip2.tar.gz
	cd src/dependences ; tar -xvzf bzip2.tar.gz

src/dependences/xapian-core.tar.gz:
	wget -c http://download.kiwix.org/dev/xapian-core-1.0.16.tar.gz -O src/dependences/xapian-core.tar.gz
	cd src/dependences ; tar -xvzf xapian-core.tar.gz

src/dependences/unac.tar.bz2:
	wget -c http://download.kiwix.org/dev/unac-1.7.0.tar.bz2 -O src/dependences/unac.tar.bz2
	cd src/dependences ; tar -xvjf unac.tar.bz2

src/dependences/xulrunner-sdk.tar.bz2:
	wget -c http://download.kiwix.org/dev/xulrunner-1.9.1.4.en-US.linux-i686.sdk.tar.bz2 -O src/dependences/xulrunner-sdk.tar.bz2
	cd src/dependences ; tar -xvjf xulrunner-sdk.tar.bz2

download-dependences: src/dependences/zlib.tar.gz src/dependences/bzip2.tar.gz src/dependences/xapian-core.tar.gz src/dependences/unac.tar.bz2 src/dependences/xulrunner-sdk.tar.bz2
	

compile-dependences: download-dependences
	cd src/dependences/bzip2-1.0.5 ; sed -i "s/CFLAGS=/CFLAGS=-fPIC /" Makefile ; make ; make Makefile-libbz2_so
	cd src/dependences/zlib-1.2.3 ; export CFLAGS=" -fPIC " ; ./configure ; make ; ./configure ; make
	cd src/dependences/ ; export EXTERN_PATH=`pwd` ; cd xapian-core-1.0.16 ; export CPPFLAGS="-I$$EXTERN_PATH/zlib-1.2.3/" ; export CXXFLAGS=" -fPIC -L$$EXTERN_PATH/zlib-1.2.3" ; ./configure ; make
	cd src/dependences/unac-1.7.0 ; gcc -DUNAC_VERSION="\"42\"" -fPIC -c unac.c ; ar cr libunac.a unac.o ; ranlib libunac.a
