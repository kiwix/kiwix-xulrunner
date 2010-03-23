lib_LTLIBRARIES=libZimAccessor.la
libZimAccessor_la_SOURCES= \
	zimAccessor.cpp \
	../../common/kiwix/reader.cpp 
include_HEADERS= \
	IZimAccessor.h \
	../../common/kiwix/reader.h
libZimAccessor_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBZIM_CFLAGS) $(XPCOM_CFLAGS)  -I../../common/
libZimAccessor_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBZIM_LDFLAGS) $(XPCOM_LDFLAGS)
libZimAccessor_la_LIBADD=../../zimlib/src/.libs/libzim.a
EXTRA_DIST=IZimAccessor.idl
BUILT_SOURCES=IZimAccessor.xpt IZimAccessor.h
CLEANFILES=IZimAccessor.xpt IZimAccessor.h *.lib *.obj *.dll

IZimAccessor.xpt:
	$(XPIDL) -m typelib -I $(GECKO_IDL_PATH) IZimAccessor.idl

IZimAccessor.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) IZimAccessor.idl
