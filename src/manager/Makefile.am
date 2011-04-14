bin_PROGRAMS=kiwix-manage
AM_CPPFLAGS=-I$(top_srcdir)/src/common -I$(top_srcdir)/src/zimlib/include -I$(top_srcdir)/src/pugixml
kiwix_manage_SOURCES= \
	kiwix-manage.cpp 
include_HEADERS= 
kiwix_manage_CXXFLAGS=$(LIBZIM_CFLAGS) -I../common/
kiwix_manage_LDFLAGS=$(LIBZIM_LDFLAGS)
kiwix_manage_LDADD=../zimlib/src/.libs/libzim.a
