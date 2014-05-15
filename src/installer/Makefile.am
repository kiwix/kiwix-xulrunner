bin_PROGRAMS=kiwix-install
AM_CPPFLAGS=-I$(top_srcdir)/src/common
AUTOMAKE_OPTIONS=subdir-objects
kiwix_install_SOURCES= \
	kiwix-install.cpp \
	../common/kiwix/xapian/myhtmlparse.cc \
	../common/kiwix/xapian/htmlparse.cc \
	../common/kiwix/xapianIndexer.cpp \
	../common/stringTools.cpp \
	../common/otherTools.cpp \
	../common/base64.cpp \
	../common/kiwix/indexer.cpp \
	../common/kiwix/reader.cpp \
	../common/kiwix/library.cpp \
	../common/kiwix/manager.cpp \
	../common/regexTools.cpp \
	../common/pathTools.cpp \
	../common/resourceTools.cpp \
	../common/kiwix/xapian/myhtmlparse.h \
	../common/kiwix/xapian/namedentities.h \
	../common/kiwix/xapian/htmlparse.h \
	../common/kiwix/xapianIndexer.h \
	../common/stringTools.h \
	../common/otherTools.h \
	../common/base64.h \
	../common/kiwix/indexer.h \
	../common/kiwix/reader.h \
	../common/kiwix/library.h \
	../common/kiwix/manager.h \
	../common/regexTools.h \
	../common/pathTools.h \
	../common/resourceTools.h
kiwix_install_CXXFLAGS=$(LIBZIM_CFLAGS) $(XAPIAN_CFLAGS) $(ICU_CFLAGS) $(LZMA_CFLAGS) $(ZLIB_CLAGS) $(LIBPUGIXML_CFLAGS) $(UUID_CFLAGS) -I../common/

kiwix_install_LDFLAGS=$(CHECK_LDFLAGS)

if STATIC_BINS
kiwix_install_LDFLAGS+= $(XAPIAN_STATIC_LDFLAGS) $(ICU_STATIC_LDFLAGS) $(UUID_STATIC_LDFLAGS) $(LIBZIM_STATIC_LDFLAGS) $(LIBPUGIXML_STATIC_LDFLAGS) $(LZMA_STATIC_LDFLAGS) $(ZLIB_STATIC_LDFLAGS) $(STATIC_LIBM_ARCHIVE) $(STATIC_LIBSTDCPP_ARCHIVE) $(STATIC_LIBDL_ARCHIVE) $(STATIC_LIBGCC_ARCHIVE) $(STATIC_LIBPTHREAD_ARCHIVE) --static
else
kiwix_install_LDFLAGS+= $(XAPIAN_LDFLAGS) $(ICU_LDFLAGS) $(UUID_LDFLAGS) $(LIBZIM_LDFLAGS) $(LIBPUGIXML_LDFLAGS) $(LZMA_LDFLAGS) $(ZLIB_LDFLAGS) -ldl -lpthread
endif

if IS_OSX
# kiwix_install_CXXFLAGS+= -stdlib=libstdc++
# kiwix_install_LDFLAGS+= -static-libgcc -static-libstdc++
endif
