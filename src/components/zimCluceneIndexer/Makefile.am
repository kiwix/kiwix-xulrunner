lib_LTLIBRARIES=libZimCluceneIndexer.la
libZimCluceneIndexer_la_SOURCES= \
	zimCluceneIndexer.cpp \
	../../common/kiwix/xapian/myhtmlparse.cc \
	../../common/kiwix/xapian/htmlparse.cc \
	../../common/unaccent.cpp \
	../../common/kiwix/indexer.cpp \
	../../common/kiwix/cluceneIndexer.cpp 
include_HEADERS= \
	IZimCluceneIndexer.h \
	../../common/kiwix/xapian/myhtmlparse.h \
	../../common/kiwix/xapian/namedentities.h \
	../../common/kiwix/xapian/htmlparse.h \
	../../common/unaccent.h \
	../../common/kiwix/indexer.h
	../../common/kiwix/cluceneIndexer.h
libZimCluceneIndexer_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBXAPIAN_CFLAGS) $(LIBCLUCENE_CFLAGS) $(LIBICU_CFLAGS) $(LIBZIM_CFLAGS) $(XPCOM_CFLAGS) -I../../common/
libZimCluceneIndexer_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_LDFLAGS) $(LIBCLUCENE_LDFLAGS) $(LIBICU_LDFLAGS) $(LIBZIM_LDFLAGS) $(XPCOM_LDFLAGS)
libZimCluceneIndexer_la_LIBADD=../../zimlib/src/libzim.la
EXTRA_DIST=IZimCluceneIndexer.idl
BUILT_SOURCES=IZimCluceneIndexer.xpt IZimCluceneIndexer.h
CLEANFILES=IZimCluceneIndexer.xpt IZimCluceneIndexer.h *.lib *.obj *.dll

IZimCluceneIndexer.xpt:
	$(XPIDL) -m typelib -I $(GECKO_IDL_PATH) IZimCluceneIndexer.idl

IZimCluceneIndexer.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) IZimCluceneIndexer.idl
