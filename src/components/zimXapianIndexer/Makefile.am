pkglib_LTLIBRARIES=libZimXapianIndexer.la
pkglibdir=$(libdir)/kiwix/components

xptdir=$(libdir)/kiwix/components
xpt_DATA=zimXapianIndexer.xpt

AM_CPPFLAGS=-I$(top_srcdir)/src/common
libZimXapianIndexer_la_SOURCES= \
	zimXapianIndexer.cpp \
	$(top_srcdir)/src/common/kiwix/xapian/myhtmlparse.cc \
	$(top_srcdir)/src/common/kiwix/xapian/htmlparse.cc \
	$(top_srcdir)/src/common/stringTools.cpp \
	$(top_srcdir)/src/common/componentTools.cpp \
	$(top_srcdir)/src/common/resourceTools.cpp \
	$(top_srcdir)/src/common/pathTools.cpp \
	$(top_srcdir)/src/common/kiwix/indexer.cpp \
	$(top_srcdir)/src/common/kiwix/reader.cpp \
	$(top_srcdir)/src/common/kiwix/xapianIndexer.cpp \
	IZimXapianIndexer.h \
	$(top_srcdir)/src/common/kiwix/xapian/myhtmlparse.h \
	$(top_srcdir)/src/common/kiwix/xapian/namedentities.h \
	$(top_srcdir)/src/common/kiwix/xapian/htmlparse.h \
	$(top_srcdir)/src/common/stringTools.h \
	$(top_srcdir)/src/common/componentTools.h \
	$(top_srcdir)/src/common/resourceTools.h \
	$(top_srcdir)/src/common/pathTools.h \
	$(top_srcdir)/src/common/kiwix/indexer.h \
	$(top_srcdir)/src/common/kiwix/reader.h \
	$(top_srcdir)/src/common/kiwix/xapianIndexer.h
libZimXapianIndexer_la_CXXFLAGS=$(LIBZIM_CFLAGS) $(LIBXUL_CFLAGS) $(XAPIAN_CFLAGS) $(ICU_CFLAGS) $(ZIMLIB_CFLAGS) $(LZMA_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I$(top_srcdir)/src/common/

libZimXapianIndexer_la_LDFLAGS=$(LIBZIM_LDFLAGS) $(LIBXUL_LDFLAGS) $(XAPIAN_LDFLAGS) $(ICU_LDFLAGS) $(ZIMLIB_LDFLAGS) $(LZMA_LDFLAGS) $(XPCOM_LDFLAGS)

EXTRA_DIST=*.idl
BUILT_SOURCES=zimXapianIndexer.xpt IZimXapianIndexer.h
CLEANFILES=zimXapianIndexer.xpt IZimXapianIndexer.h *.lib *.obj *.dll *.h *.xpt

zimXapianIndexer.xpt:
if HAVE_XPIDL
	$(XPIDL) -m typelib -o zimXapianIndexer -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimXapianIndexer/IZimXapianIndexer_gecko_old_int_type.idl
else
if GECKO_OLD_INT_TYPE
	$(TYPELIB_PY) --cachedir=/tmp -o zimXapianIndexer.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimXapianIndexer/IZimXapianIndexer_gecko_old_int_type.idl
else
	$(TYPELIB_PY) --cachedir=/tmp -o zimXapianIndexer.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimXapianIndexer/IZimXapianIndexer.idl
endif
endif

IZimXapianIndexer.h:
if HAVE_XPIDL
	$(XPIDL) -m header -o IZimXapianIndexer -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimXapianIndexer/IZimXapianIndexer_gecko_old_int_type.idl
else
if GECKO_OLD_INT_TYPE
	$(HEADER_PY) --cachedir=/tmp -o IZimXapianIndexer.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimXapianIndexer/IZimXapianIndexer_gecko_old_int_type.idl
else
	$(HEADER_PY) --cachedir=/tmp -o IZimXapianIndexer.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimXapianIndexer/IZimXapianIndexer.idl
endif
endif
