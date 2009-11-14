bin_PROGRAMS=zimXapianIndexer.so
zimXapianIndexer_so_SOURCES=zimXapianIndexer.cpp xapian/htmlparse.cc xapian/myhtmlparse.cc ../../common/unaccent.cpp
zimXapianIndexer_so_CXXFLAGS=$(LIBXUL_CFLAGS) $(LIBXAPIAN_CFLAGS) $(LIBUNAC_CFLAGS) $(LIBZIM_CFLAGS) $(XPCOM_CFLAGS) -I../../common/
zimXapianIndexer_so_LDFLAGS=$(LIBXUL_LDFLAGS) $(LIBXAPIAN_LDFLAGS) $(LIBUNAC_LDFLAGS) $(LIBZIM_LDFLAGS) $(XPCOM_LDFLAGS)
zimXapianIndexer_so_LDADD=../../zimlib/src/.libs/libzim.a