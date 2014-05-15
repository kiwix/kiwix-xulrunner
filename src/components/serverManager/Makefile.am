pkglib_LTLIBRARIES=libServerManager.la
pkglibdir=$(libdir)/kiwix/components
AUTOMAKE_OPTIONS=subdir-objects

xptdir=$(libdir)/kiwix/components
xpt_DATA=serverManager.xpt

AM_CPPFLAGS=-I$(top_srcdir)/src/common
libServerManager_la_SOURCES= \
	serverManager.cpp \
	../../common/kiwix/library.cpp \
	../../common/kiwix/manager.cpp \
	../../common/kiwix/reader.cpp \
	../../common/base64.cpp \
	../../common/pathTools.cpp \
	../../common/componentTools.cpp \
	../../common/regexTools.cpp \
	../../common/stringTools.cpp \
	../../common/networkTools.cpp \
	IServerManager.h \
	../../common/kiwix/library.h \
	../../common/kiwix/manager.h \
	../../common/kiwix/reader.h \
	../../common/base64.h \
	../../common/pathTools.h \
	../../common/componentTools.h \
	../../common/stringTools.h \
	../../common/regexTools.h \
	../../common/networkTools.h
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

if IS_OSX
# libServerManager_la_CXXFLAGS+= -stdlib=libstdc++
# libServerManager_la_LDFLAGS+= -static-libgcc -static-libstdc++
endif
