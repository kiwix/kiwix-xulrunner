bin_PROGRAMS=kiwix-serve
kiwix_serve_SOURCES= \
	kiwix-serve.cpp \
	../common/kiwix/reader.cpp \
	../common/kiwix/searcher.cpp \
	../common/kiwix/xapianSearcher.cpp \
	../common/kiwix/cluceneSearcher.cpp \
	../common/unaccent.cpp \
	../common/splitString.cpp 
include_HEADERS= \
	../common/kiwix/reader.h \
	../common/kiwix/searcher.h \
	../common/kiwix/searcher.h \
	../common/kiwix/xapianSearcher.h \
	../common/kiwix/cluceneSearcher.h \
	../common/unaccent.h \
	../common/splitString.cpp 
kiwix_serve_CXXFLAGS=${LIBMICROHTTPD_CFLAGS} $(LIBCTPP2_CFLAGS) $(LIBCLUCENE_CFLAGS) $(LIBXAPIAN_CFLAGS) $(LIBICU_CFLAGS) $(LIBZIM_CFLAGS) -I../common/
kiwix_serve_LDFLAGS=${LIBMICROHTTPD_LDFLAGS} $(LIBCTPP2_LDLAGS) $(LIBCLUCENE_LDFLAGS) $(LIBXAPIAN_LDFLAGS) $(LIBICU_LDFLAGS) $(LIBZIM_LDFLAGS)
kiwix_serve_LDADD=../zimlib/src/.libs/libzim.a ../ctpp2/src/.libs/libctpp2.a
