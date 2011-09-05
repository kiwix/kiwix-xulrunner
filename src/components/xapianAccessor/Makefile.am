pkglib_LTLIBRARIES=libXapianAccessor.la
pkglibdir = $(libdir)/kiwix/components

xptdir = ${libdir}/kiwix/components/
xpt_DATA = xapianAccessor.xpt

AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/ctpp2/include
libXapianAccessor_la_SOURCES= \
	xapianAccessor.cpp \
	$(top_srcdir)/src/common/splitString.cpp \
	$(top_srcdir)/src/common/unaccent.cpp \
	$(top_srcdir)/src/common/kiwix/searcher.cpp \
	$(top_srcdir)/src/common/kiwix/xapianSearcher.cpp
include_HEADERS= \
	$(top_srcdir)/src/common/splitString.h \
	$(top_srcdir)/src/common/unaccent.h \
	$(top_srcdir)/src/common/kiwix/searcher.h \
	$(top_srcdir)/src/common/kiwix/xapianSearcher.h
libXapianAccessor_la_CXXFLAGS=$(LIBCTPP2_CFLAGS) $(LIBXUL_CFLAGS) $(LIBXAPIAN_CFLAGS) $(LIBICU_CFLAGS) $(XPCOM_CFLAGS) -I/$(top_srcdir)/src/common/ -D GECKO_VERSION=$(GECKO_VERSION)
if IS_OSX
libXapianAccessor_la_CXXFLAGS += -I/opt/local/include 
libXapianAccessor_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_STATIC_LDFLAGS) $(LIBCTPP2_STATIC_LDFLAGS) $(LIBICU_STATIC_LDFLAGS) $(XPCOM_LDFLAGS)
else
libXapianAccessor_la_LDFLAGS=$(LIBCTPP2_LDFLAGS) $(LIBXUL_LDFLAGS) $(LIBXAPIAN_LDFLAGS) $(LIBICU_LDFLAGS) $(XPCOM_LDFLAGS) 
libXapianAccessor_la_LIBADD=$(top_builddir)/src/ctpp2/src/libctpp2.la
endif
EXTRA_DIST=IXapianAccessor.idl
BUILT_SOURCES=xapianAccessor.xpt IXapianAccessor.h
CLEANFILES=xapianAccessor.xpt IXapianAccessor.h *.lib *.obj *.dll

xapianAccessor.xpt: 
	$(XPIDL_PATH) -m typelib -o xapianAccessor -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/xapianAccessor/IXapianAccessor.idl

IXapianAccessor.h:
	$(XPIDL_PATH) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/xapianAccessor/IXapianAccessor.idl
