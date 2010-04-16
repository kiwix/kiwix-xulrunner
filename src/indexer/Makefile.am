bin_PROGRAMS=kiwix-index
kiwix_index_SOURCES= \
	kiwix-index.cpp \
	../common/kiwix/xapian/myhtmlparse.cc \
	../common/kiwix/xapian/htmlparse.cc \
	../common/unaccent.cpp \
	../common/kiwix/indexer.cpp 
include_HEADERS= \
	../common/kiwix/xapian/myhtmlparse.h \
	../common/kiwix/xapian/namedentities.h \
	../common/kiwix/xapian/htmlparse.h \
	../common/unaccent.h \
	../common/kiwix/indexer.h
kiwix_index_CXXFLAGS=$(LIBXAPIAN_CFLAGS) $(LIBICU_CFLAGS) $(LIBZIM_CFLAGS) -I../common/
kiwix_index_LDFLAGS=$(LIBXAPIAN_LDFLAGS) $(LIBICU_LDFLAGS) $(LIBZIM_LDFLAGS)
kiwix_index_LDADD=../zimlib/src/.libs/libzim.a
