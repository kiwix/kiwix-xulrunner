pkglib_LTLIBRARIES=libContentManager.la
pkglibdir=$(libdir)/kiwix/components

xptdir=$(libdir)/kiwix/components
xpt_DATA=contentManager.xpt

AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/zimlib/include -I$(top_srcdir)/src/pugixml
libContentManager_la_SOURCES= \
	contentManager.cpp \
	$(top_srcdir)/src/common/kiwix/library.cpp \
	$(top_srcdir)/src/common/kiwix/manager.cpp \
	$(top_srcdir)/src/common/kiwix/reader.cpp \
	$(top_srcdir)/src/common/base64.cpp \
	$(top_srcdir)/src/common/pathTools.cpp \
	$(top_srcdir)/src/common/componentTools.cpp \
	$(top_srcdir)/src/common/regexTools.cpp \
	$(top_srcdir)/src/common/stringTools.cpp \
	IContentManager.h \
	$(top_srcdir)/src/common/kiwix/library.h \
	$(top_srcdir)/src/common/kiwix/manager.h \
	$(top_srcdir)/src/common/kiwix/reader.h \
	$(top_srcdir)/src/pugixml/pugixml.hpp \
	$(top_srcdir)/src/common/base64.h \
	$(top_srcdir)/src/common/pathTools.h \
	$(top_srcdir)/src/common/componentTools.h \
	$(top_srcdir)/src/common/stringTools.h \
	$(top_srcdir)/src/common/regexTools.h
libContentManager_la_CXXFLAGS=$(LIBXUL_CFLAGS) $(ZIMLIB_CFLAGS) $(LZMA_CFLAGS) $(ICU_CFLAGS) $(PUGIXML_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I$(top_srcdir)/src/common/

libContentManager_la_LDFLAGS=$(LIBXUL_LDFLAGS) $(ZIMLIB_LDFLAGS) $(LZMA_LDFLAGS) $(ICU_LDFLAGS) $(PUGIXML_LDFLAGS) $(XPCOM_LDFLAGS)
libContentManager_la_LIBADD=$(top_builddir)/src/zimlib/src/libzim.la $(top_builddir)/src/pugixml/libpugixml.la

EXTRA_DIST=IContentManager.idl IContentManager_gecko_old_bool_type.idl
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
libContentManager_la_CXXFLAGS+= -mmacosx-version-min=10.5 -isysroot /Developer/SDKs/MacOSX10.5.sdk
endif
