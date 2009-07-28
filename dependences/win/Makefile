all: download compile

download:
	if [ ! -f zlib123-dll.zip ] ; then wget.exe -c http://www.gzip.org/zlib/zlib123-dll.zip ; fi
	if [ ! -d zlib123-dll ] ; then unzip.exe zlib123-dll.zip -d zlib123-dll ; fi
	if [ ! -f xapian-1.0.14-win32.zip ] ; then wget.exe http://www.flax.co.uk/xapian/1014/win32.zip -O xapian-1.0.14-win32.zip ; fi
	if [ ! -d xapian-1.0.14-win32 ] ; then unzip.exe xapian-1.0.14-win32.zip -d xapian-1.0.14-win32 ; fi
	if [ ! -f xapian-core-1.0.14.tar.gz ] ; then wget.exe http://oligarchy.co.uk/xapian/1.0.14/xapian-core-1.0.14.tar.gz -O xapian-core-1.0.14.tar.gz ; fi
	if [ ! -d xapian-core-1.0.14 ] ; then tar -xvzf xapian-core-1.0.14.tar.gz ; fi
	if [ ! -f xulrunner-1.9.0.12.en-US.win32.sdk.zip ] ; then wget.exe http://releases.mozilla.org/pub/mozilla.org/xulrunner/releases/1.9.0.12/sdk/xulrunner-1.9.0.12.en-US.win32.sdk.zip ; fi
	if [ ! -d xulrunner-sdk ] ; then unzip.exe xulrunner-1.9.0.12.en-US.win32.sdk.zip ; fi
	if [ ! -d packages ] ; then svn co http://svn.greenstone.org/indexers/trunk/packages/ ; fi

compile:
	if [ ! -d xapian-core-1.0.14/win32 ] ; then mv ./xapian-1.0.14-win32/win32 xapian-core-1.0.14/ ; fi
	cd xapian-core-1.0.14/win32 ; nmake

clean:
	rm -rf zlib* bzip* unac* cxxtools zimlib xapian* *~ *.tmp xulrunner*
