lib_LTLIBRARIES=libZimIndexer.la
libZimIndexer_la_SOURCES= \
	zimIndexer.cpp \
	../../common/kiwix/xapian/myhtmlparse.cc \
	../../common/kiwix/xapian/htmlparse.cc \
	../../common/unaccent.cpp \
	../../common/kiwix/indexer.cpp 
include_HEADERS= \
	IZimIndexer.h \
	../../common/kiwix/xapian/myhtmlparse.h \
	../../common/kiwix/xapian/namedentities.h \
	../../common/kiwix/xapian/htmlparse.h \
	../../common/unaccent.h \
	../../common/kiwix/indexer.h
libZimXapianIndexer_la_CXXFLAGS=$(LIBXUL_CFLAGS) ${LIBCLUCENE_CFLAGS} $(LIBXAPIAN_CFLAGS) $(LIBICU_CFLAGS) $(LIBZIM_CFLAGS) $(XPCOM_CFLAGS) -I../../common/
libZimXapianIndexer_la_LDFLAGS=$(LIBXUL_LDFLAGS) ${LIBCLUCENE_LDFLAGS} $(LIBXAPIAN_LDFLAGS) $(LIBICU_LDFLAGS) $(LIBZIM_LDFLAGS) $(XPCOM_LDFLAGS)
libZimXapianIndexer_la_LIBADD=../../zimlib/src/.libs/libzim.a
EXTRA_DIST=IZimIndexer.idl
BUILT_SOURCES=IZimIndexer.xpt IZimIndexer.h
CLEANFILES=IZimIndexer.xpt IZimIndexer.h *.lib *.obj *.dll

IZimXapianIndexer.xpt:
	$(XPIDL) -m typelib -I $(GECKO_IDL_PATH) IZimXapianIndexer.idl

IZimXapianIndexer.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) IZimXapianIndexer.idl
