pkglib_LTLIBRARIES=libZimAccessor.la
xptdir=$(libdir)/kiwix/components
pkglibdir=$(libdir)/kiwix/components
xpt_DATA=zimAccessor.xpt
AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/zimlib/include
libZimAccessor_la_SOURCES= \
	zimAccessor.cpp \
	$(top_srcdir)/src/common/kiwix/reader.cpp \
	IZimAccessor.h \
	$(top_srcdir)/src/common/kiwix/reader.h \
	$(top_srcdir)/src/common/pathTools.h \
	$(top_srcdir)/src/common/pathTools.cpp \
	$(top_srcdir)/src/common/stringTools.h \
	$(top_srcdir)/src/common/stringTools.cpp \
	$(top_srcdir)/src/common/componentTools.h \
	$(top_srcdir)/src/common/componentTools.cpp
libZimAccessor_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LZMA_CFLAGS) $(ICU_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I../../common/

libZimAccessor_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(ZIMLIB_LDFLAGS) $(ICU_LDFLAGS) $(LZMA_LDFLAGS) $(XPCOM_LDFLAGS)
libZimAccessor_la_LIBADD=$(top_builddir)/src/zimlib/src/libzim.la

# if STATIC_BINS
# libZimAccessor_la_LDFLAGS+= $(STATIC_LIBM_ARCHIVE) $(STATIC_LIBSTDCPP_ARCHIVE) $(STATIC_LIBDL_ARCHIVE) $(STATIC_LIBGCC_ARCHIVE) $(STATIC_LIBPTHREAD_ARCHIVE)
# endif

EXTRA_DIST=*.idl
BUILT_SOURCES=zimAccessor.xpt IZimAccessor.h
CLEANFILES=zimAccessor.xpt IZimAccessor.h *.lib *.obj *.dll *.xpt *.h

zimAccessor.xpt:
if HAVE_XPIDL
	$(XPIDL) -m typelib -o zimAccessor -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor.idl
else
if GECKO_OLD_INT_TYPE
	$(TYPELIB_PY) --cachedir=/tmp -o zimAccessor.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor_gecko_old_int_type.idl
else
	$(TYPELIB_PY) --cachedir=/tmp -o zimAccessor.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor.idl
endif
endif

IZimAccessor.h:
if HAVE_XPIDL
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor.idl
else
if GECKO_OLD_INT_TYPE
	$(HEADER_PY) --cachedir=/tmp -o IZimAccessor.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor_gecko_old_int_type.idl
else
	$(HEADER_PY) --cachedir=/tmp -o IZimAccessor.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor.idl
endif
endif

if IS_OSX
libZimAccessor_la_CXXFLAGS+= -mmacosx-version-min=10.5 -isysroot /Developer/SDKs/MacOSX10.5.sdk
endif
