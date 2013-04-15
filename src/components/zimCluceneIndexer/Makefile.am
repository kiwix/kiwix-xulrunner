pkglib_LTLIBRARIES=libZimCluceneIndexer.la
xptdir=$(libdir)/kiwix/components
pkglibdir=$(libdir)/kiwix/components
xpt_DATA=zimCluceneIndexer.xpt
AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/zimlib/include
libZimCluceneIndexer_la_SOURCES= \
	zimCluceneIndexer.cpp \
	$(top_srcdir)/src/common/kiwix/xapian/myhtmlparse.cc \
	$(top_srcdir)/src/common/kiwix/xapian/htmlparse.cc \
	$(top_srcdir)/src/common/stringTools.cpp \
	$(top_srcdir)/src/common/componentTools.cpp \
	$(top_srcdir)/src/common/kiwix/indexer.cpp \
	$(top_srcdir)/src/common/kiwix/reader.cpp \
	$(top_srcdir)/src/common/kiwix/cluceneIndexer.cpp \
	IZimCluceneIndexer.h \
	$(top_srcdir)/src/common/kiwix/xapian/myhtmlparse.h \
	$(top_srcdir)/src/common/kiwix/xapian/namedentities.h \
	$(top_srcdir)/src/common/kiwix/xapian/htmlparse.h \
	$(top_srcdir)/src/common/stringTools.h \
	$(top_srcdir)/src/common/componentTools.h \
	$(top_srcdir)/src/common/kiwix/indexer.h \
	$(top_srcdir)/src/common/kiwix/reader.h \
	$(top_srcdir)/src/common/kiwix/cluceneIndexer.h
libZimCluceneIndexer_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(XAPIAN_CFLAGS) $(CLUCENE_CFLAGS) $(ICU_CFLAGS) $(ZIMLIB_CFLAGS) $(LZMA_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I$(top_srcdir)/src/common/

libZimCluceneIndexer_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(XAPIAN_LDFLAGS) $(CLUCENE_LDFLAGS) $(ICU_LDFLAGS) $(ZIMLIB_LDFLAGS) $(LZMA_LDFLAGS) $(XPCOM_LDFLAGS)
libZimCluceneIndexer_la_LIBADD=$(top_builddir)/src/zimlib/src/libzim.la

EXTRA_DIST=IZimCluceneIndexer.idl
BUILT_SOURCES=zimCluceneIndexer.xpt IZimCluceneIndexer.h
CLEANFILES=zimCluceneIndexer.xpt IZimCluceneIndexer.h *.lib *.obj *.dll *.h *.xpt

zimCluceneIndexer.xpt:
if HAVE_XPIDL
	$(XPIDL) -m typelib -o zimCluceneIndexer -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimCluceneIndexer/IZimCluceneIndexer.idl
else
if GECKO_OLD_INT_TYPE
	$(TYPELIB_PY) --cachedir=/tmp -o zimCluceneIndexer.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimCluceneIndexer/IZimCluceneIndexer_gecko_old_int_type.idl
else
	$(TYPELIB_PY) --cachedir=/tmp -o zimCluceneIndexer.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimCluceneIndexer/IZimCluceneIndexer.idl
endif
endif

IZimCluceneIndexer.h:
if HAVE_XPIDL
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimCluceneIndexer/IZimCluceneIndexer.idl
else
if GECKO_OLD_INT_TYPE
	$(HEADER_PY) --cachedir=/tmp -o IZimCluceneIndexer.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimCluceneIndexer/IZimCluceneIndexer_gecko_old_int_type.idl
else
	$(HEADER_PY) --cachedir=/tmp -o IZimCluceneIndexer.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimCluceneIndexer/IZimCluceneIndexer.idl
endif
endif

if IS_OSX
libZimCluceneIndexer_la_CXXFLAGS+= -mmacosx-version-min=10.5 -isysroot /Developer/SDKs/MacOSX10.5.sdk
endif
