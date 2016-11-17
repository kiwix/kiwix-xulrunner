bin_PROGRAMS=kiwix-read
AM_CPPFLAGS=-I$(top_srcdir)/src/common
AUTOMAKE_OPTIONS=subdir-objects
kiwix_read_SOURCES= kiwix-read.cpp
kiwix_read_CXXFLAGS=$(KIWIXLIB_CFLAGS) $(LIBZIM_CFLAGS) $(LZMA_CFLAGS)  $(ICU_CFLAGS) -I../common/

kiwix_read_LDFLAGS=$(CHECK_LDFLAGS)

if STATIC_BINS
kiwix_read_LDFLAGS+= $(KIWIXLIB_STATIC_LIBS) $(LIBZIM_STATIC_LDFLAGS) $(LZMA_STATIC_LDFLAGS) $(ICU_STATIC_LDFLAGS) $(STATIC_LIBM_ARCHIVE) $(STATIC_LIBSTDCPP_ARCHIVE) $(STATIC_LIBPTHREAD_ARCHIVE) --static
else
kiwix_read_LDFLAGS+= $(KIWIXLIB_LIBS) $(LIBZIM_LDFLAGS) $(ICU_LDFLAGS) $(LZMA_LDFLAGS) -lpthread
endif

if IS_OSX
# kiwix_read_LDFLAGS+= -static-libgcc -static-libstdc++
# kiwix_read_CXXFLAGS+= -stdlib=libstdc++
endif

if HAVE_UPX
all-am: all
	upx -9 $(bin_PROGRAMS)
endif
