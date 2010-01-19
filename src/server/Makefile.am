bin_PROGRAMS=kiwix-serve
kiwix_serve_SOURCES= \
	kiwix-serve.cpp 
include_HEADERS= 
kiwix_serve_CXXFLAGS=${LIBMICROHTTPD_CFLAGS} $(LIBXAPIAN_CFLAGS) $(LIBUNAC_CFLAGS) $(LIBZIM_CFLAGS) -I../common/ -std=c++0x
kiwix_serve_LDFLAGS=${LIBMICROHTTPD_LDFLAGS} $(LIBXAPIAN_LDFLAGS) $(LIBUNAC_LDFLAGS) $(LIBZIM_LDFLAGS)
kiwix_serve_LDADD=../zimlib/src/.libs/libzim.a
