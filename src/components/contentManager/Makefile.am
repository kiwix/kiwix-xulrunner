pkglib_LTLIBRARIES=libContentManager.la
xptdir = $(DESTDIR)/$(libdir)/kiwix/components
pkglibdir = $(DESTDIR)/$(libdir)/kiwix/components
xpt_DATA = contentManager.xpt
AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/zimlib/include -I$(top_srcdir)/src/pugixml
libContentManager_la_SOURCES= \
	contentManager.cpp \
	../../common/kiwix/library.cpp \
	../../common/kiwix/manager.cpp \
	../../common/kiwix/reader.cpp \
	../../common/base64.cpp
include_HEADERS= \
	IContentManager.h \
	../../common/kiwix/library.h \
	../../common/kiwix/manager.h \
	../../common/kiwix/reader.h \
	../../pugixml/pugixml.hpp \
	../../common/base64.h
libContentManager_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBZIM_CFLAGS) -L/4141 $(LIBPUGIXML_CFLAGS) -L/4242 $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I../../common/
if IS_OSX
libContentManager_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBZIM_STATIC_LDFLAGS) $(LIBZIMSELF_STATIC_LDFLAGS) $(XPCOM_LDFLAGS)
else
libContentManager_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBZIM_LDFLAGS) $(LIBPUGIXML_LDFLAGS) $(XPCOM_LDFLAGS)
libContentManager_la_LIBADD=../../zimlib/src/libzim.la ../../pugixml/libpugixml.la
endif
EXTRA_DIST=IContentManager.idl
BUILT_SOURCES=contentManager.xpt IContentManager.h
CLEANFILES=contentManager.xpt IContentManager.h *.lib *.obj *.dll

contentManager.xpt:
	$(XPIDL) -m typelib -o contentManager -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/contentManager/IContentManager.idl

IContentManager.h:
	$(XPIDL) -m header -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/contentManager/IContentManager.idl