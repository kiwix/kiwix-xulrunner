lib_LTLIBRARIES=libCluceneAccessor.la
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
BUILT_SOURCES=ICluceneAccessor.xpt ICluceneAccessor.h
CLEANFILES=ICluceneAccessor.xpt ICluceneAccessor.h *.lib *.obj *.dll

ICluceneAccessor.xpt: 
	$(XPIDL) -m typelib -I $(GECKO_IDL_PATH) ICluceneAccessor.idl

ICluceneAccessor.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) ICluceneAccessor.idl
