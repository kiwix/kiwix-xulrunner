lib_LTLIBRARIES=libZimXapianIndexer.la
libZimXapianIndexer_la_SOURCES= \
	zimXapianIndexer.cpp \
	../../common/kiwix/xapian/myhtmlparse.cc \
	../../common/kiwix/xapian/htmlparse.cc \
	../../common/unaccent.cpp \
	../../common/kiwix/indexer.cpp \
	../../common/kiwix/xapianIndexer.cpp 
include_HEADERS= \
	IZimXapianIndexer.h \
	../../common/kiwix/xapian/myhtmlparse.h \
	../../common/kiwix/xapian/namedentities.h \
	../../common/kiwix/xapian/htmlparse.h \
	../../common/unaccent.h \
	../../common/kiwix/indexer.h \
	../../common/kiwix/xapianIndexer.h
libZimXapianIndexer_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBXAPIAN_CFLAGS) $(LIBICU_CFLAGS) $(LIBZIM_CFLAGS) $(XPCOM_CFLAGS) -I../../common/
if IS_OSX
libZimXapianIndexer_la_CXXFLAGS += -I/opt/local/include 
libZimXapianIndexer_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_STATIC_LDFLAGS) $(LIBICU_STATIC_LDFLAGS) $(LIBZIM_STATIC_LDFLAGS) $(XPCOM_LDFLAGS)
else
libZimXapianIndexer_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_LDFLAGS) $(LIBICU_LDFLAGS) $(LIBZIM_LDFLAGS) $(XPCOM_LDFLAGS)
endif
libZimXapianIndexer_la_LIBADD=../../zimlib/src/libzim.la
EXTRA_DIST=IZimXapianIndexer.idl
BUILT_SOURCES=IZimXapianIndexer.xpt IZimXapianIndexer.h
CLEANFILES=IZimXapianIndexer.xpt IZimXapianIndexer.h *.lib *.obj *.dll

IZimXapianIndexer.xpt:
	$(XPIDL) -m typelib -I $(GECKO_IDL_PATH) IZimXapianIndexer.idl

IZimXapianIndexer.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) IZimXapianIndexer.idl
