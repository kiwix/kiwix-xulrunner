pkglib_LTLIBRARIES=libCluceneAccessor.la
xptdir = $(DESTDIR)/$(libdir)/kiwix/components
pkglibdir = $(DESTDIR)/$(libdir)/kiwix/components
xpt_DATA = cluceneAccessor.xpt
AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/ctpp2/include
libCluceneAccessor_la_SOURCES= \
	cluceneAccessor.cpp \
	../../common/splitString.cpp \
	../../common/unaccent.cpp \
	../../common/kiwix/searcher.cpp \
	../../common/kiwix/cluceneSearcher.cpp
include_HEADERS= \
	../../common/splitString.h \
	../../common/unaccent.h \
	../../common/kiwix/searcher.h \
	../../common/kiwix/cluceneSearcher.cpp
libCluceneAccessor_la_CXXFLAGS=$(LIBCTPP2_CFLAGS) $(LIBXUL_CFLAGS) $(LIBCLUCENE_CFLAGS) $(LIBICU_CFLAGS) $(XPCOM_CFLAGS) -I../../common/
libCluceneAccessor_la_LDFLAGS=$(LIBCTPP2_LDFLAGS) $(LIBXUL_LDFLAGS) $(LIBCLUCENE_LDFLAGS) $(LIBICU_LDFLAGS) $(XPCOM_LDFLAGS)
libCluceneAccessor_la_LIBADD=../../ctpp2/src/libctpp2.la
EXTRA_DIST=ICluceneAccessor.idl
BUILT_SOURCES=cluceneAccessor.xpt ICluceneAccessor.h
CLEANFILES=cluceneAccessor.xpt ICluceneAccessor.h *.lib *.obj *.dll

cluceneAccessor.xpt: 
	$(XPIDL) -m typelib -o cluceneAccessor -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/cluceneAccessor/ICluceneAccessor.idl

ICluceneAccessor.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/cluceneAccessor/ICluceneAccessor.idl
