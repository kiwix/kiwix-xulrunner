pkglib_LTLIBRARIES=libXapianAccessor.la
pkglibdir = $(libdir)/kiwix/components
AUTOMAKE_OPTIONS=subdir-objects

xptdir = $(libdir)/kiwix/components/
xpt_DATA = xapianAccessor.xpt

AM_CPPFLAGS=-I$(top_srcdir)/src/common
libXapianAccessor_la_SOURCES= \
	xapianAccessor.cpp \
	../../common/stringTools.cpp \
	../../common/pathTools.cpp \
	../../common/resourceTools.cpp \
	../../common/kiwix/ctpp2/CTPP2VMStringLoader.cpp \
	../../common/kiwix/searcher.cpp \
	../../common/kiwix/xapianSearcher.cpp \
	../../common/stringTools.h \
	../../common/pathTools.h \
	../../common/resourceTools.h \
	../../common/kiwix/ctpp2/CTPP2VMStringLoader.hpp \
	../../common/kiwix/searcher.h \
	../../common/kiwix/xapianSearcher.h
libXapianAccessor_la_CXXFLAGS=$(LIBCTPP2_CFLAGS) $(LIBXUL_CFLAGS) $(XAPIAN_CFLAGS) $(ICU_CFLAGS) $(XPCOM_CFLAGS) -I/$(top_srcdir)/src/common/ -D GECKO_VERSION=$(GECKO_VERSION)

libXapianAccessor_la_LDFLAGS=$(LIBCTPP2_LDFLAGS) $(LIBXUL_LDFLAGS) $(XAPIAN_LDFLAGS) $(ICU_LDFLAGS) $(XPCOM_LDFLAGS)

EXTRA_DIST=*.idl
BUILT_SOURCES=xapianAccessor.xpt IXapianAccessor.h
CLEANFILES=xapianAccessor.xpt IXapianAccessor.h *.lib *.obj *.dll *.h *.xpt

xapianAccessor.xpt:
if HAVE_XPIDL
	$(XPIDL) -m typelib -o xapianAccessor -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/xapianAccessor/IXapianAccessor_gecko_old_int_type.idl
else
if GECKO_OLD_INT_TYPE
	$(TYPELIB_PY) --cachedir=/tmp -o xapianAccessor.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/xapianAccessor/IXapianAccessor_gecko_old_int_type.idl
else
	$(TYPELIB_PY) --cachedir=/tmp -o xapianAccessor.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/xapianAccessor/IXapianAccessor.idl
endif
endif

IXapianAccessor.h:
if HAVE_XPIDL
	$(XPIDL) -m header -o IXapianAccessor -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/xapianAccessor/IXapianAccessor_gecko_old_int_type.idl
else
if GECKO_OLD_INT_TYPE
	$(HEADER_PY) --cachedir=/tmp -o IXapianAccessor.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/xapianAccessor/IXapianAccessor_gecko_old_int_type.idl
else
	$(HEADER_PY) --cachedir=/tmp -o IXapianAccessor.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/xapianAccessor/IXapianAccessor.idl
endif
endif

if IS_OSX
libXapianAccessor_la_CXXFLAGS+= -stdlib=libstdc++
endif
