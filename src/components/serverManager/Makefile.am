pkglib_LTLIBRARIES=libServerManager.la
pkglibdir=$(libdir)/kiwix/components
AUTOMAKE_OPTIONS=subdir-objects

xptdir=$(libdir)/kiwix/components
xpt_DATA=serverManager.xpt

AM_CPPFLAGS=-I$(top_srcdir)/src/common
libServerManager_la_SOURCES= \
	serverManager.cpp \
	$(top_srcdir)/src/common/kiwix/library.cpp \
	$(top_srcdir)/src/common/kiwix/manager.cpp \
	$(top_srcdir)/src/common/kiwix/reader.cpp \
	$(top_srcdir)/src/common/base64.cpp \
	$(top_srcdir)/src/common/pathTools.cpp \
	$(top_srcdir)/src/common/componentTools.cpp \
	$(top_srcdir)/src/common/regexTools.cpp \
	$(top_srcdir)/src/common/stringTools.cpp \
	$(top_srcdir)/src/common/networkTools.cpp \
	IServerManager.h \
	$(top_srcdir)/src/common/kiwix/library.h \
	$(top_srcdir)/src/common/kiwix/manager.h \
	$(top_srcdir)/src/common/kiwix/reader.h \
	$(top_srcdir)/src/common/base64.h \
	$(top_srcdir)/src/common/pathTools.h \
	$(top_srcdir)/src/common/componentTools.h \
	$(top_srcdir)/src/common/stringTools.h \
	$(top_srcdir)/src/common/regexTools.h \
	$(top_srcdir)/src/common/networkTools.h
libServerManager_la_CXXFLAGS=$(LIBZIM_CFLAGS) $(LIBXUL_CFLAGS) $(ZIMLIB_CFLAGS) $(LZMA_CFLAGS) $(ICU_CFLAGS) $(LIBPUGIXML_CFLAGS) $(XPCOM_CFLAGS) -D GECKO_VERSION=$(GECKO_VERSION) -I$(top_srcdir)/src/common/

libServerManager_la_LDFLAGS=$(LIBZIM_LDFLAGS) $(LIBXUL_LDFLAGS) $(ZIMLIB_LDFLAGS) $(LZMA_LDFLAGS) $(ICU_LDFLAGS) $(LIBPUGIXML_LDFLAGS) $(XPCOM_LDFLAGS)

EXTRA_DIST=*.idl
BUILT_SOURCES=serverManager.xpt IServerManager.h
CLEANFILES=serverManager.xpt IServerManager.h *.lib *.obj *.dll *.h *.xpt

serverManager.xpt:
if HAVE_XPIDL
	$(XPIDL) -m typelib -o serverManager -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/serverManager/IServerManager.idl
else
	$(TYPELIB_PY) --cachedir=/tmp -o serverManager.xpt -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/serverManager/IServerManager.idl
endif

IServerManager.h:
if HAVE_XPIDL
	$(XPIDL) -m header -o IServerManager -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/serverManager/IServerManager.idl
else
	$(HEADER_PY) --cachedir=/tmp -o IServerManager.h -I $(GECKO_IDL_PATH) $(top_srcdir)/src/components/serverManager/IServerManager.idl
endif
