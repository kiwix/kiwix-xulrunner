noinst_PROGRAMS=kiwix-launcher

AM_CPPFLAGS=-I$(top_srcdir)/src/common

kiwix_launcher_SOURCES= kiwix-launcher.cpp ../common/pathTools.cpp
include_HEADERS= ../common/pathTools.h

kiwix_launcher_CXXFLAGS= -I../common/
kiwix_launcher_LDFLAGS=$(CHECK_LDFLAGS)

if STATIC_BINS
kiwix_launcher_LDFLAGS+= $(STATIC_LIBM_ARCHIVE) $(STATIC_LIBSTDCPP_ARCHIVE) $(STATIC_LIBDL_ARCHIVE) $(STATIC_LIBGCC_ARCHIVE) $(STATIC_LIBPTHREAD_ARCHIVE) --static
endif

if IS_OSX
kiwix_launcher_LDFLAGS+= -isysroot /Developer/SDKs/MacOSX10.5.sdk -mmacosx-version-min=10.5
endif