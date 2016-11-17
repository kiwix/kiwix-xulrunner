pkglib_LTLIBRARIES=libZimXapianIndexer.la
pkglibdir=$(libdir)/kiwix/components
AUTOMAKE_OPTIONS=subdir-objects

xptdir=$(libdir)/kiwix/components
xpt_DATA=zimXapianIndexer.xpt

AM_CPPFLAGS=-I$(top_srcdir)/src/common
libZimXapianIndexer_la_SOURCES= \
	zimXapianIndexer.cpp \
	../../common/componentTools.cpp \
	IZimXapianIndexer.h \
	../../common/componentTools.h 

libZimXapianIndexer_la_CXXFLAGS=$(KIWIXLIB_CFLAGS) $(LIBZIM_CFLAGS) $(LIBXUL_CFLAGS) $(XAPIAN_CFLAGS) $(ICU_CFLAGS) $(ZIMLIB_CFLAGS) $(LZMA_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I$(top_srcdir)/src/common/

libZimXapianIndexer_la_LDFLAGS=$(KIWIXLIB_LIBS) $(LIBZIM_LDFLAGS) $(LIBXUL_LDFLAGS) $(XAPIAN_LDFLAGS) $(ICU_LDFLAGS) $(ZIMLIB_LDFLAGS) $(LZMA_LDFLAGS) $(XPCOM_LDFLAGS)

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

if IS_OSX
# libZimXapianIndexer_la_CXXFLAGS+= -stdlib=libstdc++
# libZimXapianIndexer_la_LDFLAGS+= -static-libgcc -static-libstdc++
endif
