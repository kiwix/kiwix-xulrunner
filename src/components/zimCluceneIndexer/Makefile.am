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
if IS_STATIC
libZimCluceneIndexer_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBCLUCENE_STATIC_LDFLAGS) $(LIBXAPIAN_STATIC_LDFLAGS) $(LIBICU_STATIC_LDFLAGS) $(LIBZIMSELF_STATIC_LDFLAGS) $(LIBLZMA_STATIC_LDFLAGS) $(XPCOM_LDFLAGS)
else
libZimCluceneIndexer_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_LDFLAGS) $(LIBCLUCENE_LDFLAGS) $(LIBICU_LDFLAGS) $(LIBZIM_LDFLAGS) $(XPCOM_LDFLAGS)
libZimCluceneIndexer_la_LIBADD=$(top_builddir)/src/zimlib/src/libzim.la
endif
EXTRA_DIST=IZimCluceneIndexer.idl
BUILT_SOURCES=zimCluceneIndexer.xpt IZimCluceneIndexer.h
CLEANFILES=zimCluceneIndexer.xpt IZimCluceneIndexer.h *.lib *.obj *.dll *.in *.h *.xpt

zimCluceneIndexer.xpt:
if XPIDL
	$(XPIDL) -m typelib -o zimCluceneIndexer -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimCluceneIndexer/IZimCluceneIndexer.idl
else
	$(TYPELIB_PY) --cachedir=/tmp -o zimCluceneIndexer -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimCluceneIndexer/IZimCluceneIndexer.idl
endif

IZimCluceneIndexer.h:
if XPIDL
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimCluceneIndexer/IZimCluceneIndexer.idl
else
	$(HEADER_PY) --cachedir=/tmp -o IZimCluceneIndexer.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimCluceneIndexer/IZimCluceneIndexer.idl
endif