bin_PROGRAMS=kiwix-serve
kiwix_serve_SOURCES= \
	kiwix-serve.cpp \
	../common/kiwix/reader.cpp \
	../common/kiwix/searcher.cpp \
	../common/unaccent.cpp \
	../common/splitString.cpp 
include_HEADERS= \
	../common/kiwix/reader.h \
	../common/kiwix/searcher.h \
	../common/unaccent.h \
	../common/splitString.cpp 
kiwix_serve_CXXFLAGS=${LIBMICROHTTPD_CFLAGS} $(LIBXAPIAN_CFLAGS) $(LIBUNAC_CFLAGS) $(LIBZIM_CFLAGS) -I../common/
kiwix_serve_LDFLAGS=${LIBMICROHTTPD_LDFLAGS} $(LIBXAPIAN_LDFLAGS) $(LIBUNAC_LDFLAGS) $(LIBZIM_LDFLAGS)
kiwix_serve_LDADD=../zimlib/src/.libs/libzim.a
