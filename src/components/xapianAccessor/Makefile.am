lib_LTLIBRARIES=libXapianAccessor.la
libXapianAccessor_la_SOURCES= \
	xapianAccessor.cpp \
	splitString.cpp \
	../../common/unaccent.cpp
include_HEADERS= \
	splitString.h \
	../../common/unaccent.h
libXapianAccessor_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBXAPIAN_CFLAGS) $(LIBUNAC_CFLAGS) $(XPCOM_CFLAGS) -I../../common/
libXapianAccessor_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_LDFLAGS) $(LIBUNAC_LDFLAGS) $(XPCOM_LDFLAGS)
EXTRA_DIST=IXapianAccessor.idl
BUILT_SOURCES=IXapianAccessor.xpt IXapianAccessor.h
CLEANFILES=IXapianAccessor.xpt IXapianAccessor.h

IXapianAccessor.xpt: 
	$(XPIDL) -m typelib -I $(GECKO_IDL_PATH) IXapianAccessor.idl

IXapianAccessor.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) IXapianAccessor.idl
