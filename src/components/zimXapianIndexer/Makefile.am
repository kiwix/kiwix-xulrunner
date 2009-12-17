lib_LTLIBRARIES=libZimXapianIndexer.la
libZimXapianIndexer_la_SOURCES= \
	zimXapianIndexer.cpp \
	../../common/kiwix/xapian/myhtmlparse.cc \
	../../common/kiwix/xapian/htmlparse.cc \
	../../common/unaccent.cpp \
	../../common/kiwix/indexer.cpp 
include_HEADERS= \
	IZimXapianIndexer.h \
	../../common/kiwix/xapian/myhtmlparse.h \
	../../common/kiwix/xapian/namedentities.h \
	../../common/kiwix/xapian/htmlparse.h \
	../../common/unaccent.h \
	../../common/kiwix/indexer.h
libZimXapianIndexer_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBXAPIAN_CFLAGS) $(LIBUNAC_CFLAGS) $(LIBZIM_CFLAGS) $(XPCOM_CFLAGS) -I../../common/
libZimXapianIndexer_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_LDFLAGS) $(LIBUNAC_LDFLAGS) $(LIBZIM_LDFLAGS) $(XPCOM_LDFLAGS)
libZimXapianIndexer_la_LIBADD=../../zimlib/src/.libs/libzim.a
EXTRA_DIST=IZimXapianIndexer.idl
BUILT_SOURCES=IZimXapianIndexer.xpt IZimXapianIndexer.h
CLEANFILES=IZimXapianIndexer.xpt IZimXapianIndexer.h

IZimXapianIndexer.xpt:
	$(XPIDL) -m typelib -I $(GECKO_IDL_PATH) IZimXapianIndexer.idl

IZimXapianIndexer.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) IZimXapianIndexer.idl
