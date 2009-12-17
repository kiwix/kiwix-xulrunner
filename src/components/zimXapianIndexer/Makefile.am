lib_LTLIBRARIES=libZimXapianIndexer.la
libZimXapianIndexer_la_SOURCES= \
	zimXapianIndexer.cpp \
	xapian/htmlparse.cc \
	xapian/myhtmlparse.cc \
	../../common/unaccent.cpp
include_HEADERS= \
	IZimXapianIndexer.h \
	xapian/myhtmlparse.h \
	xapian/namedentities.h \
	xapian/htmlparse.h \
	../../common/unaccent.h
libZimXapianIndexer_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBXAPIAN_CFLAGS) $(LIBUNAC_CFLAGS) $(LIBZIM_CFLAGS) $(XPCOM_CFLAGS) -I../../common/
libZimXapianIndexer_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_LDFLAGS) $(LIBUNAC_LDFLAGS) $(LIBZIM_LDFLAGS) $(XPCOM_LDFLAGS)
libZimXapianIndexer_la_LIBADD=../../zimlib/src/.libs/libzim.a
EXTRA_DIST=IZimXapianIndexer.idl
BUILT_SOURCES=IZimXapianIndexer.xpt IZimXapianIndexer.h
CLEANFILES=IZimXapianIndexer.xpt IZimXapianIndexer.h

IZimXapianIndexer.xpt:
	$(XPIDL) -m typelib -I $(GECKO_IDL_PATH) IZimXapianIndexer.idl

IZimXapianIndexer.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) IZimXapianIndexer.idl
