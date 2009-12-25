SUBDIRS=src
EXTRA_DIST= \
	kiwix \
	desktop \
	debian \
	CHANGELOG
BUILT_SOURCES= \
	./kiwix/components/xapianAccessor.so \
	./kiwix/components/xapianAccessor.xpt \
	./kiwix/components/zimAccessor.so \
	./kiwix/components/zimAccessor.xpt \
	./kiwix/components/zimXapianIndexer.so \
	./kiwix/components/zimXapianIndexer.xpt
CLEANFILES= \
	./kiwix/components/xapianAccessor.so \
	./kiwix/components/xapianAccessor.xpt \
	./kiwix/components/zimAccessor.so \
	./kiwix/components/zimAccessor.xpt \
	./kiwix/components/zimXapianIndexer.so \
	./kiwix/components/zimXapianIndexer.xpt

dist-hook:
	rm -rf `find . -name "*.svn" -o -name "*.dat" -o -name "*~" -o -name "*#"`

install:
	if [ ! -d ${DESTDIR}/${prefix}/share/pixmaps/ ] ; then mkdir ${DESTDIR}/${prefix}/share/pixmaps/ ; fi
	cp desktop/kiwix.png ${DESTDIR}/${prefix}/share/pixmaps/
	if [ ! -d ${DESTDIR}/${prefix}/share/applications/ ] ; then mkdir ${DESTDIR}/${prefix}/share/applications/ ; fi
	cp desktop/kiwix.desktop ${DESTDIR}/${prefix}/share/applications/
	cp -r -v -L ./kiwix ${DESTDIR}/${prefix}/lib/
	ln -f -s ${DESTDIR}/${prefix}/lib/kiwix/kiwix.sh ${DESTDIR}/${prefix}/bin/kiwix
	ln -f -s ${DESTDIR}/${prefix}/lib/kiwix/kiwix-compact.sh ${DESTDIR}/${prefix}/bin/kiwix-compact
	cp src/components/zimAccessor/.libs/libZimAccessor.so ${DESTDIR}/${prefix}/lib/kiwix/components/zimAccessor.so
	cp src/components/zimAccessor/IZimAccessor.xpt ${DESTDIR}/${prefix}/lib/kiwix/components/zimAccessor.xpt
	cp src/components/xapianAccessor/.libs/libXapianAccessor.so ${DESTDIR}/${prefix}/lib/kiwix/components/xapianAccessor.so
	cp src/components/xapianAccessor/IXapianAccessor.xpt ${DESTDIR}/${prefix}/lib/kiwix/components/xapianAccessor.xpt
	cp src/components/zimXapianIndexer/.libs/libZimXapianIndexer.so ${DESTDIR}/${prefix}/lib/kiwix/components/zimXapianIndexer.so
	cp src/components/zimXapianIndexer/IZimXapianIndexer.xpt ${DESTDIR}/${prefix}/lib/kiwix/components/zimXapianIndexer.xpt
	cp src/indexer/kiwix-index ${DESTDIR}/${prefix}/bin/kiwix-index

uninstall:
	rm ${DESTDIR}/${prefix}/bin/kiwix-index
	rm ${DESTDIR}/${prefix}/share/pixmaps/kiwix.png
	rm ${DESTDIR}/${prefix}/share/applications/kiwix.desktop
	rm -rf ${DESTDIR}/${prefix}/lib/kiwix
	unlink ${DESTDIR}/${prefix}/bin/kiwix
	unlink ${DESTDIR}/${prefix}/bin/kiwix-compact

./kiwix/components/xapianAccessor.so:
	ln -f -s ../../src/components/xapianAccessor/.libs/libXapianAccessor.so ./kiwix/components/xapianAccessor.so

./kiwix/components/xapianAccessor.xpt:
	ln -f -s ../../src/components/xapianAccessor/IXapianAccessor.xpt ./kiwix/components/xapianAccessor.xpt

./kiwix/components/zimAccessor.so:
	ln -f -s ../../src/components/zimAccessor/.libs/libZimAccessor.so ./kiwix/components/zimAccessor.so

./kiwix/components/zimAccessor.xpt:
	ln -f -s ../../src/components/zimAccessor/IZimAccessor.xpt ./kiwix/components/zimAccessor.xpt

./kiwix/components/zimXapianIndexer.so:
	ln -f -s ../../src/components/zimXapianIndexer/.libs/libZimXapianIndexer.so  ./kiwix/components/zimXapianIndexer.so

./kiwix/components/zimXapianIndexer.xpt:
	ln -f -s ../../src/components/zimXapianIndexer/IZimXapianIndexer.xpt ./kiwix/components/zimXapianIndexer.xpt

bin-dist: ${DEPENDENCELESS_RULES}
	

configure-without-dependences:
	echo "You have to run configure with the '--without-dependences' argument."

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
	cd src/dependences/unac-1.7.0 ; gcc -DUNAC_VERSION="42" -fPIC -c unac.c ; ar cr libunac.a unac.o ; ranlib libunac.a

deb:
	dpkg-buildpackage -rfakeroot
