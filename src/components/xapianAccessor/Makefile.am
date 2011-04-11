pkglib_LTLIBRARIES=libXapianAccessor.la
xptdir = ${DESTDIR}/${libdir}/kiwix/components/
pkglibdir = $(DESTDIR)/$(libdir)/kiwix/components
xpt_DATA = xapianAccessor.xpt
AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/ctpp2/include
libXapianAccessor_la_SOURCES= \
	xapianAccessor.cpp \
	../../common/splitString.cpp \
	../../common/unaccent.cpp \
	../../common/kiwix/searcher.cpp \
	../../common/kiwix/xapianSearcher.cpp
include_HEADERS= \
	../../common/splitString.h \
	../../common/unaccent.h \
	../../common/kiwix/searcher.h \
	../../common/kiwix/xapianSearcher.h
libXapianAccessor_la_CXXFLAGS=$(LIBCTPP2_CFLAGS) $(LIBXUL_CFLAGS) $(LIBXAPIAN_CFLAGS) $(LIBICU_CFLAGS) $(XPCOM_CFLAGS) -I../../common/ -D GECKO_VERSION=$(GECKO_VERSION)
if IS_OSX
libXapianAccessor_la_CXXFLAGS += -I/opt/local/include 
libXapianAccessor_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_STATIC_LDFLAGS) $(LIBICU_STATIC_LDFLAGS) $(XPCOM_LDFLAGS)
else
libXapianAccessor_la_LDFLAGS=$(LIBCTPP2_LDFLAGS) $(LIBXUL_LDFLAGS) $(LIBXAPIAN_LDFLAGS) $(LIBICU_LDFLAGS) $(XPCOM_LDFLAGS)
endif
libXapianAccessor_la_LIBADD=../../ctpp2/src/libctpp2.la
EXTRA_DIST=IXapianAccessor.idl
BUILT_SOURCES=xapianAccessor.xpt IXapianAccessor.h
CLEANFILES=xapianAccessor.xpt IXapianAccessor.h *.lib *.obj *.dll

xapianAccessor.xpt: 
	$(XPIDL) -m typelib -o xapianAccessor -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/xapianAccessor/IXapianAccessor.idl

IXapianAccessor.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/xapianAccessor/IXapianAccessor.idl
