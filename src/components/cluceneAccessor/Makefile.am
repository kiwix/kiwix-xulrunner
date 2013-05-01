pkglib_LTLIBRARIES=libCluceneAccessor.la
pkglibdir=$(libdir)/kiwix/components

xptdir=$(libdir)/kiwix/components
xpt_DATA=cluceneAccessor.xpt

AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/ctpp2/include
libCluceneAccessor_la_SOURCES= \
	cluceneAccessor.cpp \
	$(top_srcdir)/src/common/stringTools.cpp \
	$(top_srcdir)/src/common/resourceTools.cpp \
	$(top_srcdir)/src/common/pathTools.cpp \
	$(top_srcdir)/src/common/kiwix/searcher.cpp \
	$(top_srcdir)/src/common/kiwix/cluceneSearcher.cpp \
	$(top_srcdir)/src/common/stringTools.h \
	$(top_srcdir)/src/common/resourceTools.h \
	$(top_srcdir)/src/common/pathTools.h \
	$(top_srcdir)/src/common/kiwix/searcher.h
libCluceneAccessor_la_CXXFLAGS=$(CTPP2_CFLAGS) $(LIBXUL_CFLAGS) $(CLUCENE_CFLAGS) $(ICU_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I$(top_srcdir)/src/common/

libCluceneAccessor_la_LDFLAGS=$(CTPP2_LDFLAGS) $(LIBXUL_LDFLAGS) $(CLUCENE_LDFLAGS) $(ICU_LDFLAGS) $(XPCOM_LDFLAGS)
libCluceneAccessor_la_LIBADD=$(top_builddir)/src/ctpp2/src/libctpp2.la

EXTRA_DIST=*.idl
BUILT_SOURCES=cluceneAccessor.xpt ICluceneAccessor.h
CLEANFILES=cluceneAccessor.xpt ICluceneAccessor.h *.lib *.obj *.dll *.xpt *.h

cluceneAccessor.xpt:
if HAVE_XPIDL
	$(XPIDL) -m typelib -o cluceneAccessor -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/cluceneAccessor/ICluceneAccessor.idl
else
if GECKO_OLD_INT_TYPE
	$(TYPELIB_PY) --cachedir=/tmp -o cluceneAccessor.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/cluceneAccessor/ICluceneAccessor_gecko_old_int_type.idl
else
	$(TYPELIB_PY) --cachedir=/tmp -o cluceneAccessor.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/cluceneAccessor/ICluceneAccessor.idl
endif
endif

ICluceneAccessor.h:
if HAVE_XPIDL
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/cluceneAccessor/ICluceneAccessor.idl
else
if GECKO_OLD_INT_TYPE
	$(HEADER_PY) --cachedir=/tmp -o ICluceneAccessor.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/cluceneAccessor/ICluceneAccessor_gecko_old_int_type.idl
else
	$(HEADER_PY) --cachedir=/tmp -o ICluceneAccessor.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/cluceneAccessor/ICluceneAccessor.idl
endif
endif
