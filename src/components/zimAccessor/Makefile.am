pkglib_LTLIBRARIES=libZimAccessor.la
xptdir = $(DESTDIR)/$(libdir)/kiwix/components
pkglibdir = $(DESTDIR)/$(libdir)/kiwix/components
xpt_DATA = zimAccessor.xpt
 AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/zimlib/include
libZimAccessor_la_SOURCES= \
	zimAccessor.cpp \
	../../common/kiwix/reader.cpp 
include_HEADERS= \
	IZimAccessor.h \
	../../common/kiwix/reader.h
libZimAccessor_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBZIM_CFLAGS) $(XPCOM_CFLAGS)  -I../../common/
if IS_OSX
libZimAccessor_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBZIM_STATIC_LDFLAGS) $(XPCOM_LDFLAGS)
else
libZimAccessor_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBZIM_LDFLAGS) $(XPCOM_LDFLAGS)
endif
libZimAccessor_la_LIBADD=../../zimlib/src/libzim.la
EXTRA_DIST=IZimAccessor.idl
BUILT_SOURCES=zimAccessor.xpt IZimAccessor.h
CLEANFILES=zimAccessor.xpt IZimAccessor.h *.lib *.obj *.dll

zimAccessor.xpt:
	$(XPIDL) -m typelib -o zimAccessor -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor.idl

IZimAccessor.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimAccessor/IZimAccessor.idl