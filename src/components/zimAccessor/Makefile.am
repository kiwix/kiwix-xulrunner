AUTOMAKE_OPTIONS=subdir-objects
pkglib_LTLIBRARIES=libZimAccessor.la
xptdir=$(libdir)/kiwix/components
pkglibdir=$(libdir)/kiwix/components
xpt_DATA=zimAccessor.xpt
AM_CPPFLAGS=-I$(top_srcdir)/src/common
libZimAccessor_la_SOURCES= \
	IZimAccessor.h \
	zimAccessor.cpp \
	../../common/kiwix/reader.h \
	../../common/kiwix/reader.cpp \
	../../common/pathTools.h \
	../../common/pathTools.cpp \
	../../common/stringTools.h \
	../../common/stringTools.cpp \
	../../common/componentTools.h \
	../../common/componentTools.cpp
libZimAccessor_la_CXXFLAGS=$(LIBZIM_CFLAGS) $(LIBXUL_CFLAGS) $(LZMA_CFLAGS) $(ICU_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I../../common/

libZimAccessor_la_LDFLAGS=$(LIBZIM_LDFLAGS) $(LIBXUL_LDFLAGS) $(ICU_LDFLAGS) $(LZMA_LDFLAGS) $(XPCOM_LDFLAGS) -stdlib=libstdc++
# libZimAccessor_la_PKG_CXXFLAGS= -stdlib=libstdc++

EXTRA_DIST=*.idl
BUILT_SOURCES=zimAccessor.xpt IZimAccessor.h
CLEANFILES=zimAccessor.xpt IZimAccessor.h *.lib *.obj *.dll *.xpt *.h

zimAccessor.xpt:
if HAVE_XPIDL
	$(XPIDL) -m typelib -o zimAccessor -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor_gecko_old_int_type.idl
else
if GECKO_OLD_INT_TYPE
	$(TYPELIB_PY) --cachedir=/tmp -o zimAccessor.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor_gecko_old_int_type.idl
else
	$(TYPELIB_PY) --cachedir=/tmp -o zimAccessor.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor.idl
endif
endif

IZimAccessor.h:
if HAVE_XPIDL
	$(XPIDL) -m header -o IZimAccessor -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor_gecko_old_int_type.idl
else
if GECKO_OLD_INT_TYPE
	$(HEADER_PY) --cachedir=/tmp -o IZimAccessor.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor_gecko_old_int_type.idl
else
	$(HEADER_PY) --cachedir=/tmp -o IZimAccessor.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor.idl
endif
endif

if IS_OSX
libZimAccessor_la_CXXFLAGS+= -I$(LIBICONV_CFLAGS) -stdlib=libstdc++
endif
