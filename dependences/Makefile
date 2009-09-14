all: download compile

download:
	wget -c http://www.gzip.org/zlib/zlib-1.2.3.tar.gz
	if [ ! -d zlib-1.2.3 ]; then tar -xvzf zlib-1.2.3.tar.gz ; fi
	wget -c http://www.bzip.org/1.0.5/bzip2-1.0.5.tar.gz
	if [ ! -d bzip2-1.0.5 ]; then tar -xvzf bzip2-1.0.5.tar.gz ; fi
	wget -c	http://oligarchy.co.uk/xapian/1.0.15/xapian-core-1.0.15.tar.gz
	if [ ! -d xapian-core-1.0.15 ]; then tar -xvzf xapian-core-1.0.15.tar.gz ; fi
	if [ -d zimlib ]; then cd zimlib ; svn update ; cd .. ; else \
	svn co http://svn.openzim.org/svnroot/trunk/zimlib zimlib ; fi
	wget -c	http://ftp.de.debian.org/debian/pool/main/u/unac/unac_1.8.0.orig.tar.gz
	if [ ! -d unac-1.8.0.orig ]; then tar -xvzf unac_1.8.0.orig.tar.gz ; fi
	wget -c	ftp://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/1.9.0.7/sdk/xulrunner-1.9.0.7.en-US.linux-i686.sdk.tar.bz2
	if [ ! -d xulrunner ]; then tar -xvjf xulrunner*.tar.bz2 ; fi
	if [ -d cxxtools ]; then cd cxxtools ; svn update ; cd .. ; else \
	svn co https://cxxtools.svn.sourceforge.net/svnroot/cxxtools/trunk/cxxtools cxxtools ; fi

compile:
	cd bzip2-1.0.5 ; sed -i "s/CFLAGS=/CFLAGS=-fPIC /" Makefile ; make ; make Makefile-libbz2_so ; cd ..
	cd zlib-1.2.3 ; export CFLAGS=" -fPIC " ; ./configure --shared ; make ; ./configure ; make ; cd ..
	export EXTERN_PATH=`pwd` ; cd xapian-core-1.0.15 ; export CPPFLAGS="-I$$EXTERN_PATH/zlib-1.2.3/" ; export CXXFLAGS=" -fPIC -L$$EXTERN_PATH/zlib-1.2.3/" ; ./configure ; make ; cd ..
	cd cxxtools ; ./autogen.sh ; ./autogen.sh ; export CXXFLAGS=" -fPIC " ; ./configure ; make ; cd src ; ar cr libcxxtools.a *.o ; ranlib libcxxtools.a ; mv libcxxtools.a .libs ; cd ../..
	export EXTERN_PATH=`pwd` ; export CXXFLAGS=" -fPIC " ; export CPPFLAGS="-I$$EXTERN_PATH/bzip2-1.0.5/ -I$$EXTERN_PATH/zlib-1.2.3/ -I$$EXTERN_PATH/cxxtools/include/" ; export LDFLAGS="-L$$EXTERN_PATH/zlib-1.2.3/ -L$$EXTERN_PATH/bzip2-1.0.5/ -L$$EXTERN_PATH/cxxtools/src/unit/.libs/ -L$$EXTERN_PATH/cxxtools/src/.libs/" ; echo $$LDFLAGS ; echo $$CPPFLAGS ; cd zimlib ; ./autogen.sh ; ./autogen.sh ; ./configure --with-reader=no --with-writer=no ; make ; cd ..
	cd unac-1.8.0.orig ; mv builder.in builder ; sed -i -e 's/@UNICODE_VERSION@/4\.0\.0/' builder ; perl ./builder -source -database=UnicodeData-4.0.0.txt ; gcc -DUNAC_VERSION="42" -fPIC -c unac.c ; ar cr libunac.a unac.o ; ranlib libunac.a ; cd ..

clean:
	rm -rf zlib* bzip* unac* cxxtools zimlib xapian* *~ *.tmp xulrunner*
