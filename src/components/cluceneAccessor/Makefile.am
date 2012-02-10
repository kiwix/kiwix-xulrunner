pkglib_LTLIBRARIES=libCluceneAccessor.la
xptdir=$(libdir)/kiwix/components
pkglibdir=$(libdir)/kiwix/components
xpt_DATA=cluceneAccessor.xpt
AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/ctpp2/include
libCluceneAccessor_la_SOURCES= \
	cluceneAccessor.cpp \
	$(top_srcdir)/src/common/splitString.cpp \
	$(top_srcdir)/src/common/unaccent.cpp \
	$(top_srcdir)/src/common/kiwix/searcher.cpp \
	$(top_srcdir)/src/common/kiwix/cluceneSearcher.cpp \
	$(top_srcdir)/src/common/splitString.h \
	$(top_srcdir)/src/common/unaccent.h \
	$(top_srcdir)/src/common/kiwix/searcher.h 
libCluceneAccessor_la_CXXFLAGS=$(LIBCTPP2_CFLAGS) $(LIBXUL_CFLAGS) $(LIBCLUCENE_CFLAGS) $(LIBICU_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I$(top_srcdir)/src/common/
if IS_STATIC
libCluceneAccessor_la_LDFLAGS=$(LIBCTPP2_STATIC_LDFLAGS) $(LIBXUL_LDFLAGS) $(LIBCLUCENE_STATIC_LDFLAGS) $(LIBICU_STATIC_LDFLAGS) $(XPCOM_LDFLAGS)
else
libCluceneAccessor_la_LDFLAGS=$(LIBCTPP2_LDFLAGS) $(LIBXUL_LDFLAGS) $(LIBCLUCENE_LDFLAGS) $(LIBICU_LDFLAGS) $(XPCOM_LDFLAGS)
libCluceneAccessor_la_LIBADD=$(top_builddir)/src/ctpp2/src/libctpp2.la
endif
EXTRA_DIST=ICluceneAccessor.idl
BUILT_SOURCES=cluceneAccessor.xpt ICluceneAccessor.h
CLEANFILES=cluceneAccessor.xpt ICluceneAccessor.h *.lib *.obj *.dll *.xpt *.h

cluceneAccessor.xpt: 
if XPIDL
	$(XPIDL) -m typelib -o cluceneAccessor -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/cluceneAccessor/ICluceneAccessor.idl
else
	$(TYPELIB_PY) --cachedir=/tmp -o cluceneAccessor.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/cluceneAccessor/ICluceneAccessor.idl
endif

ICluceneAccessor.h:
if XPIDL
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/cluceneAccessor/ICluceneAccessor.idl
else
	$(HEADER_PY) --cachedir=/tmp -o ICluceneAccessor.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/cluceneAccessor/ICluceneAccessor.idl
endif