lib_LTLIBRARIES=libXapianAccessor.la
libXapianAccessor_la_SOURCES= \
	xapianAccessor.cpp \
	../../common/splitString.cpp \
	../../common/unaccent.cpp \
	../../common/kiwix/searcher.cpp \
	../../common/kiwix/xapianSearcher.cpp
include_HEADERS= \
	../../common/splitString.h \
	../../common/unaccent.h \
	../../common/kiwix/searcher.h \
	../../common/kiwix/xapianSearcher.h
libXapianAccessor_la_CXXFLAGS=$(LIBCTPP2_CFLAGS) $(LIBXUL_CFLAGS) $(LIBXAPIAN_CFLAGS) $(LIBICU_CFLAGS) $(XPCOM_CFLAGS) -I../../common/ 
if IS_OSX
libXapianAccessor_la_CXXFLAGS += -I/opt/local/include 
libXapianAccessor_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_STATIC_LDFLAGS) $(LIBICU_STATIC_LDFLAGS) $(XPCOM_LDFLAGS)
else
libXapianAccessor_la_LDFLAGS=$(LIBCTPP2_LDFLAGS) $(LIBXUL_LDFLAGS) $(LIBXAPIAN_LDFLAGS) $(LIBICU_LDFLAGS) $(XPCOM_LDFLAGS)
endif
libXapianAccessor_la_LIBADD=../../ctpp2/src/.libs/libctpp2.a
EXTRA_DIST=IXapianAccessor.idl
BUILT_SOURCES=IXapianAccessor.xpt IXapianAccessor.h
CLEANFILES=IXapianAccessor.xpt IXapianAccessor.h *.lib *.obj *.dll

IXapianAccessor.xpt: 
	$(XPIDL) -m typelib -I $(GECKO_IDL_PATH) IXapianAccessor.idl

IXapianAccessor.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) IXapianAccessor.idl
