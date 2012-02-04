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
	$(top_srcdir)/src/common/componentTools.h \
	$(top_srcdir)/src/common/componentTools.cpp
libZimAccessor_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBZIM_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I../../common/
if IS_STATIC
libZimAccessor_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBZIM_STATIC_LDFLAGS) $(LIBZIMSELF_STATIC_LDFLAGS) $(LIBLZMA_STATIC_LDFLAGS) $(XPCOM_LDFLAGS)
else
libZimAccessor_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBZIM_LDFLAGS) $(XPCOM_LDFLAGS)
libZimAccessor_la_LIBADD=$(top_builddir)/src/zimlib/src/libzim.la
endif
if IS_OSX
libZimAccessor_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBZIM_STATIC_LDFLAGS) $(LIBZIMSELF_STATIC_LDFLAGS) $(XPCOM_LDFLAGS)
endif
EXTRA_DIST=IZimAccessor.idl
BUILT_SOURCES=zimAccessor.xpt IZimAccessor.h
CLEANFILES=zimAccessor.xpt IZimAccessor.h *.lib *.obj *.dll *.in *.xpt *.h

zimAccessor.xpt:
if XPIDL
	$(XPIDL) -m typelib -o zimAccessor -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor.idl
else
	$(TYPELIB_PY) --cachedir=/tmp -o zimAccessor.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor.idl
endif

IZimAccessor.h:
if XPIDL
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor.idl
else
	$(HEADER_PY) --cachedir=/tmp -o IZimAccessor.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor.idl
endif