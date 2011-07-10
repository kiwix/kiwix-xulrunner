pkglib_LTLIBRARIES=libZimAccessor.la
xptdir=$(libdir)/kiwix/components
pkglibdir=$(libdir)/kiwix/components
xpt_DATA=zimAccessor.xpt
AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/zimlib/include
libZimAccessor_la_SOURCES= \
	zimAccessor.cpp \
	$(top_srcdir)/src/common/kiwix/reader.cpp \
	IZimAccessor.h \
	$(top_srcdir)/src/common/kiwix/reader.h
libZimAccessor_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBZIM_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I../../common/
if IS_OSX
libZimAccessor_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBZIM_STATIC_LDFLAGS) $(LIBZIMSELF_STATIC_LDFLAGS) $(XPCOM_LDFLAGS)
else
libZimAccessor_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBZIM_LDFLAGS) $(XPCOM_LDFLAGS)
libZimAccessor_la_LIBADD=$(top_builddir)/src/zimlib/src/libzim.la
endif
EXTRA_DIST=IZimAccessor.idl
BUILT_SOURCES=zimAccessor.xpt IZimAccessor.h
CLEANFILES=zimAccessor.xpt IZimAccessor.h *.lib *.obj *.dll

zimAccessor.xpt:
	$(XPIDL) -m typelib -o zimAccessor -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor.idl

IZimAccessor.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor.idl