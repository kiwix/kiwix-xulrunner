all: download compile

download:
	wget.exe -c http://www.gzip.org/zlib/zlib123-dll.zip
	if [ ! -d zlib123-dll ] ; then unzip.exe zlib123-dll.zip -d zlib123-dll ; fi
	wget.exe -c http://www.flax.co.uk/xapian/1014/win32.zip -O xapian-1.0.14-win32.zip
	if [ ! -d xapian-1.0.14-win32 ] ; then unzip.exe xapian-1.0.14-win32.zip -d xapian-1.0.14-win32 ; fi
	wget.exe -c http://oligarchy.co.uk/xapian/1.0.14/xapian-core-1.0.14.tar.gz -O xapian-core-1.0.14.tar.gz
	if [ ! -d xapian-core-1.0.14 ] ; then tar -xvzf xapian-core-1.0.14.tar.gz ; fi
	wget.exe -c "http://releases.mozilla.org/pub/mozilla.org/xulrunner/releases/1.9.0.12/sdk/xulrunner-1.9.0.12.en-US.win32.sdk.zip" 
	unzip.exe xulrunner-1.9.0.12.en-US.win32.sdk.zip
compile:
	mv ./xapian-1.0.14-win32/win32 xapian-core-1.0.14/
	cd xapian-core-1.0.14/win32 ; nmake
clean:
	rm -rf zlib* bzip* unac* cxxtools zimlib xapian* *~ *.tmp xulrunner*
