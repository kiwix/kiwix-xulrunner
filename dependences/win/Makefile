all: download compile

download:
	wget.exe -c http://www.gzip.org/zlib/zlib123-dll.zip
	if [ ! -d zlib123-dll ]; then unzip.exe zlib123-dll.zip -d zlib123-dll ; fi
	wget.exe -c http://www.flax.co.uk/xapian/1013/win32.zip -O xapian-1.0.13-win32.zip
	if [ ! -d xapian-1.0.13-win32 ]; then unzip.exe xapian-1.0.13-win32.zip -d xapian-1.0.13-win32 ; fi

compile:
	

clean:
	rm -rf win
