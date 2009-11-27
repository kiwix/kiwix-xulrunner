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
