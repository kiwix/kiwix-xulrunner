pkglib_LTLIBRARIES=libZimCluceneIndexer.la
xptdir=$(libdir)/kiwix/components
pkglibdir=$(libdir)/kiwix/components
xpt_DATA=zimCluceneIndexer.xpt
AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/zimlib/include
libZimCluceneIndexer_la_SOURCES= \
	zimCluceneIndexer.cpp \
	$(top_srcdir)/src/common/kiwix/xapian/myhtmlparse.cc \
	$(top_srcdir)/src/common/kiwix/xapian/htmlparse.cc \
	$(top_srcdir)/src/common/unaccent.cpp \
	$(top_srcdir)/src/common/kiwix/indexer.cpp \
	$(top_srcdir)/src/common/kiwix/cluceneIndexer.cpp \
	IZimCluceneIndexer.h \
	$(top_srcdir)/src/common/kiwix/xapian/myhtmlparse.h \
	$(top_srcdir)/src/common/kiwix/xapian/namedentities.h \
	$(top_srcdir)/src/common/kiwix/xapian/htmlparse.h \
	$(top_srcdir)/src/common/unaccent.h \
	$(top_srcdir)/src/common/kiwix/indexer.h \
	$(top_srcdir)/src/common/kiwix/cluceneIndexer.h
libZimCluceneIndexer_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBXAPIAN_CFLAGS) $(LIBCLUCENE_CFLAGS) $(LIBICU_CFLAGS) $(LIBZIM_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I$(top_srcdir)/src/common/
libZimCluceneIndexer_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_LDFLAGS) $(LIBCLUCENE_LDFLAGS) $(LIBICU_LDFLAGS) $(LIBZIM_LDFLAGS) $(XPCOM_LDFLAGS)
libZimCluceneIndexer_la_LIBADD=$(top_builddir)/src/zimlib/src/libzim.la
EXTRA_DIST=IZimCluceneIndexer.idl
BUILT_SOURCES=zimCluceneIndexer.xpt IZimCluceneIndexer.h
CLEANFILES=zimCluceneIndexer.xpt IZimCluceneIndexer.h *.lib *.obj *.dll

zimCluceneIndexer.xpt:
	$(XPIDL) -m typelib -o zimCluceneIndexer -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimCluceneIndexer/IZimCluceneIndexer.idl

IZimCluceneIndexer.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimCluceneIndexer/IZimCluceneIndexer.idl
