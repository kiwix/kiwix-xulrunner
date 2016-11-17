pkglib_LTLIBRARIES=libContentManager.la
pkglibdir=$(libdir)/kiwix/components
AUTOMAKE_OPTIONS=subdir-objects

xptdir=$(libdir)/kiwix/components
xpt_DATA=contentManager.xpt

AM_CPPFLAGS=-I$(top_srcdir)/src/common
libContentManager_la_SOURCES= \
	contentManager.cpp
	../../common/componentTools.cpp
	IContentManager.h \
	../../common/componentTools.h

libContentManager_la_CXXFLAGS=$(KIWIXLIB_CFLAGS) $(LIBZIM_CFLAGS) $(LIBXUL_CFLAGS) $(LZMA_CFLAGS) $(ICU_CFLAGS) $(LIBPUGIXML_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I$(top_srcdir)/src/common/

libContentManager_la_LDFLAGS=$(KIWIXLIB_LIBS) $(LIBZIM_LDFLAGS) $(LIBXUL_LDLAGS) $(LIBXUL_LDFLAGS) $(LZMA_LDFLAGS) $(ICU_LDFLAGS) $(LIBPUGIXML_LDFLAGS) $(XPCOM_LDFLAGS)

EXTRA_DIST=*.idl
BUILT_SOURCES=contentManager.xpt IContentManager.h
CLEANFILES=contentManager.xpt IContentManager.h *.lib *.obj *.dll *.h *.xpt

contentManager.xpt:
if HAVE_XPIDL
	$(XPIDL) -m typelib -o contentManager -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/contentManager/IContentManager_gecko_old_bool_type.idl
else
if GECKO_OLD_BOOL_TYPE
	$(TYPELIB_PY) --cachedir=/tmp -o contentManager.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/contentManager/IContentManager_gecko_old_bool_type.idl
else
if GECKO_OLD_INT_TYPE
	$(TYPELIB_PY) --cachedir=/tmp -o contentManager.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/contentManager/IContentManager_gecko_old_int_type.idl
else
	$(TYPELIB_PY) --cachedir=/tmp -o contentManager.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/contentManager/IContentManager.idl
endif
endif
endif

IContentManager.h:
if HAVE_XPIDL
	$(XPIDL) -m header -o IContentManager -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/contentManager/IContentManager_gecko_old_bool_type.idl
else
if GECKO_OLD_BOOL_TYPE
	$(HEADER_PY) --cachedir=/tmp -o IContentManager.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/contentManager/IContentManager_gecko_old_bool_type.idl
else
if GECKO_OLD_INT_TYPE
	$(HEADER_PY) --cachedir=/tmp -o IContentManager.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/contentManager/IContentManager_gecko_old_int_type.idl
else
	$(HEADER_PY) --cachedir=/tmp -o IContentManager.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/contentManager/IContentManager.idl
endif
endif
endif

if IS_OSX
# libContentManager_la_CXXFLAGS+= -stdlib=libstdc++
# libContentManager_la_LDFLAGS+= -static-libgcc -static-libstdc++
endif
