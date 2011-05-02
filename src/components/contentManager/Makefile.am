pkglib_LTLIBRARIES=libContentManager.la
xptdir = $(DESTDIR)/$(libdir)/kiwix/components
pkglibdir = $(DESTDIR)/$(libdir)/kiwix/components
xpt_DATA = contentManager.xpt
 AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/zimlib/include
libContentManager_la_SOURCES= \
	contentManager.cpp \
	../../common/kiwix/reader.cpp 
include_HEADERS= \
	IContentManager.h \
	../../common/kiwix/reader.h
libContentManager_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBZIM_CFLAGS) $(XPCOM_CFLAGS)  -I../../common/
if IS_OSX
libContentManager_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBZIM_STATIC_LDFLAGS) $(LIBZIMSELF_STATIC_LDFLAGS) $(XPCOM_LDFLAGS)
else
libContentManager_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBZIM_LDFLAGS) $(XPCOM_LDFLAGS)
libContentManager_la_LIBADD=../../zimlib/src/libzim.la
endif
EXTRA_DIST=IContentManager.idl
BUILT_SOURCES=contentManager.xpt IContentManager.h
CLEANFILES=contentManager.xpt IContentManager.h *.lib *.obj *.dll

contentManager.xpt:
	$(XPIDL) -m typelib -o contentManager -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/contentManager/IContentManager.idl

IContentManager.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/contentManager/IContentManager.idl