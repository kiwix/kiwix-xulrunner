bin_PROGRAMS=kiwix-manage
AM_CPPFLAGS=-I$(top_srcdir)/src/common
AUTOMAKE_OPTIONS=subdir-objects
kiwix_manage_SOURCES= \
	kiwix-manage.cpp \
	../common/kiwix/manager.cpp \
	../common/kiwix/library.cpp \
	../common/kiwix/reader.cpp \
	../common/base64.cpp \
	../common/regexTools.cpp \
	../common/stringTools.cpp \
	../common/pathTools.cpp \
	../common/kiwix/manager.h \
	../common/kiwix/library.h \
	../common/kiwix/reader.h \
	../common/base64.h \
	../common/regexTools.h \
	../common/stringTools.h \
	../common/pathTools.h
kiwix_manage_CXXFLAGS=$(LIBZIM_CFLAGS) $(ICU_CFLAGS) $(LZMA_CFLAGS) $(LIBPUGIXML_CFLAGS) -I../common/

kiwix_manage_LDFLAGS= $(CHECK_LDFLAGS)

if STATIC_BINS
kiwix_manage_LDFLAGS+= $(CHECK_LDFLAGS) $(LIBZIM_STATIC_LDFLAGS) $(ICU_STATIC_LDFLAGS) $(LIBPUGIXML_STATIC_LDFLAGS) $(LZMA_STATIC_LDFLAGS) $(STATIC_LIBM_ARCHIVE) $(STATIC_LIBSTDCPP_ARCHIVE) $(STATIC_LIBDL_ARCHIVE) $(STATIC_LIBGCC_ARCHIVE) $(STATIC_LIBPTHREAD_ARCHIVE) --static
else
kiwix_manage_LDFLAGS+= $(LIBZIM_LDFLAGS) $(ICU_LDFLAGS) $(LIBPUGIXML_LDFLAGS) $(LZMA_LDFLAGS)
endif

if IS_OSX
kiwix_manage_CXXFLAGS+= -std=c++11 -stdlib=libc++
# kiwix_manage_LDFLAGS+= -static-libgcc -static-libstdc++
# kiwix_manage_LDFLAGS+= -static-libstdc++
endif

if HAVE_UPX
all-am: all
	upx -9 $(bin_PROGRAMS)
endif
