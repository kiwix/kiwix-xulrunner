pkglib_LTLIBRARIES=libZimXapianIndexer.la
xptdir=$(libdir)/kiwix/components
pkglibdir=$(libdir)/kiwix/components
xpt_DATA=zimXapianIndexer.xpt
AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/zimlib/include
libZimXapianIndexer_la_SOURCES= \
	zimXapianIndexer.cpp \
	$(top_srcdir)/src/common/kiwix/xapian/myhtmlparse.cc \
	$(top_srcdir)/src/common/kiwix/xapian/htmlparse.cc \
	$(top_srcdir)/src/common/unaccent.cpp \
	$(top_srcdir)/src/common/kiwix/indexer.cpp \
	$(top_srcdir)/src/common/kiwix/xapianIndexer.cpp \
	IZimXapianIndexer.h \
	$(top_srcdir)/src/common/kiwix/xapian/myhtmlparse.h \
	$(top_srcdir)/src/common/kiwix/xapian/namedentities.h \
	$(top_srcdir)/src/common/kiwix/xapian/htmlparse.h \
	$(top_srcdir)/src/common/unaccent.h \
	$(top_srcdir)/src/common/kiwix/indexer.h \
	$(top_srcdir)/src/common/kiwix/xapianIndexer.h
libZimXapianIndexer_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBXAPIAN_CFLAGS) $(LIBICU_CFLAGS) $(LIBZIM_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I$(top_srcdir)/src/common/
if IS_OSX
libZimXapianIndexer_la_CXXFLAGS += -I/opt/local/include
libZimXapianIndexer_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_STATIC_LDFLAGS) $(LIBICU_STATIC_LDFLAGS) $(LIBZIM_STATIC_LDFLAGS) $(LIBZIMSELF_STATIC_LDFLAGS) $(XPCOM_LDFLAGS) 
else
libZimXapianIndexer_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_LDFLAGS) $(LIBICU_LDFLAGS) $(LIBZIM_LDFLAGS) $(XPCOM_LDFLAGS) 
libZimXapianIndexer_la_LIBADD=$(top_builddir)/src/zimlib/src/libzim.la
endif
EXTRA_DIST=IZimXapianIndexer.idl
BUILT_SOURCES=zimXapianIndexer.xpt IZimXapianIndexer.h
CLEANFILES=zimXapianIndexer.xpt IZimXapianIndexer.h *.lib *.obj *.dll

zimXapianIndexer.xpt:
	$(XPIDL) -m typelib -o zimXapianIndexer -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimXapianIndexer/IZimXapianIndexer.idl

IZimXapianIndexer.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/zimXapianIndexer/IZimXapianIndexer.idl
