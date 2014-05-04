pkglib_LTLIBRARIES=libContentManager.la
pkglibdir=$(libdir)/kiwix/components
AUTOMAKE_OPTIONS=subdir-objects

xptdir=$(libdir)/kiwix/components
xpt_DATA=contentManager.xpt

AM_CPPFLAGS=-I$(top_srcdir)/src/common
libContentManager_la_SOURCES= \
	contentManager.cpp \
	../../common/kiwix/library.cpp \
	../../common/kiwix/manager.cpp \
	../../common/kiwix/reader.cpp \
	../../common/base64.cpp \
	../../common/pathTools.cpp \
	../../common/componentTools.cpp \
	../../common/regexTools.cpp \
	../../common/stringTools.cpp \
	IContentManager.h \
	../../common/kiwix/library.h \
	../../common/kiwix/manager.h \
	../../common/kiwix/reader.h \
	../../common/base64.h \
	../../common/pathTools.h \
	../../common/componentTools.h \
	../../common/stringTools.h \
	../../common/regexTools.h
libContentManager_la_CXXFLAGS=$(LIBZIM_CFLAGS) $(LIBXUL_CFLAGS) $(LZMA_CFLAGS) $(ICU_CFLAGS) $(LIBPUGIXML_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I$(top_srcdir)/src/common/

libContentManager_la_LDFLAGS=$(LIBZIM_LDFLAGS) $(LIBXUL_LDLAGS) $(LIBXUL_LDFLAGS) $(LZMA_LDFLAGS) $(ICU_LDFLAGS) $(LIBPUGIXML_LDFLAGS) $(XPCOM_LDFLAGS)

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
