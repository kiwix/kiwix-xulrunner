bin_PROGRAMS=kiwix-index
AM_CPPFLAGS=-I$(top_srcdir)/src/common
kiwix_index_SOURCES= \
	kiwix-index.cpp \
	../common/kiwix/xapian/myhtmlparse.cc \
	../common/kiwix/xapian/htmlparse.cc \
	../common/stringTools.cpp \
	../common/resourceTools.cpp \
	../common/pathTools.cpp \
	../common/kiwix/indexer.cpp \
	../common/kiwix/reader.cpp \
	../common/kiwix/ctpp2/CTPP2VMStringLoader.cpp \
	../common/kiwix/xapianIndexer.cpp \
	../common/kiwix/xapian/myhtmlparse.h \
	../common/kiwix/xapian/namedentities.h \
	../common/kiwix/xapian/htmlparse.h \
	../common/stringTools.h \
	../common/resourceTools.h \
	../common/pathTools.h \
	../common/kiwix/ctpp2/CTPP2VMStringLoader.hpp \
	../common/kiwix/indexer.h \
	../common/kiwix/reader.h \
	../common/kiwix/xapianIndexer.h
kiwix_index_CXXFLAGS=$(LIBZIM_CFLAGS) $(LIBCTPP2_CFLAGS) $(XAPIAN_CFLAGS) $(ICU_CFLAGS) $(LZMA_CFLAGS) $(ZLIB_CFLAGS) -I../common/

kiwix_index_LDFLAGS=$(CHECK_LDFLAGS)

if STATIC_BINS
kiwix_index_LDFLAGS+= $(XAPIAN_STATIC_LDFLAGS) $(LIBCTPP2_STATIC_LDFLAGS) $(ICU_STATIC_LDFLAGS) $(LIBZIM_STATIC_LDFLAGS) $(LZMA_STATIC_LDFLAGS) $(ZLIB_STATIC_LDFLAGS) $(UUID_STATIC_LDFLAGS) $(STATIC_LIBM_ARCHIVE) $(STATIC_LIBSTDCPP_ARCHIVE) $(STATIC_LIBDL_ARCHIVE) $(STATIC_LIBGCC_ARCHIVE) $(STATIC_LIBPTHREAD_ARCHIVE) --static
else
kiwix_index_LDFLAGS+= $(XAPIAN_LDFLAGS) $(ICU_LDFLAGS) $(LIBCTPP2_LDFLAGS) $(LIBZIM_LDFLAGS) $(LZMA_LDFLAGS) $(ZLIB_LDFLAGS) -lpthread $(UUID_LDFLAGS) -ldl
endif

if IS_OSX
kiwix_index_LDFLAGS+= /opt/local/lib/libiconv.a /opt/local/lib/libintl.a -framework IOKit -framework CoreFoundation
endif
