lib_LTLIBRARIES=libXapianAccessor.la
libXapianAccessor_la_SOURCES= \
	xapianAccessor.cpp \
	../../common/splitString.cpp \
	../../common/unaccent.cpp \
	../../common/kiwix/searcher.cpp 
include_HEADERS= \
	../../common/splitString.h \
	../../common/unaccent.h \
	../../common/kiwix/searcher.h	
libXapianAccessor_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBXAPIAN_CFLAGS) $(LIBUNAC_CFLAGS) $(XPCOM_CFLAGS) -I../../common/
libXapianAccessor_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_LDFLAGS) $(LIBUNAC_LDFLAGS) $(XPCOM_LDFLAGS)
EXTRA_DIST=IXapianAccessor.idl
BUILT_SOURCES=IXapianAccessor.xpt IXapianAccessor.h
CLEANFILES=IXapianAccessor.xpt IXapianAccessor.h

IXapianAccessor.xpt: 
	$(XPIDL) -m typelib -I $(GECKO_IDL_PATH) IXapianAccessor.idl

IXapianAccessor.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) IXapianAccessor.idl
