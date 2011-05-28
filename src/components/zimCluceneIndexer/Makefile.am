pkglib_LTLIBRARIES=libZimCluceneIndexer.la
xptdir = $(DESTDIR)/$(libdir)/kiwix/components
pkglibdir = $(DESTDIR)/$(libdir)/kiwix/components
xpt_DATA = zimCluceneIndexer.xpt
AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/zimlib/include
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
libZimCluceneIndexer_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBXAPIAN_CFLAGS) $(LIBCLUCENE_CFLAGS) $(LIBICU_CFLAGS) $(LIBZIM_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I../../common/
libZimCluceneIndexer_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_LDFLAGS) $(LIBCLUCENE_LDFLAGS) $(LIBICU_LDFLAGS) $(LIBZIM_LDFLAGS) $(XPCOM_LDFLAGS)
libZimCluceneIndexer_la_LIBADD=../../zimlib/src/libzim.la
EXTRA_DIST=IZimCluceneIndexer.idl
BUILT_SOURCES=zimCluceneIndexer.xpt IZimCluceneIndexer.h
CLEANFILES=zimCluceneIndexer.xpt IZimCluceneIndexer.h *.lib *.obj *.dll

zimCluceneIndexer.xpt:
	$(XPIDL) -m typelib -o zimCluceneIndexer -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimCluceneIndexer/IZimCluceneIndexer.idl

IZimCluceneIndexer.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimCluceneIndexer/IZimCluceneIndexer.idl
