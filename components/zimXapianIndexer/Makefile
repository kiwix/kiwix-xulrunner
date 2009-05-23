CXX                = g++
CPPFLAGS           =  -I../../dependences/zimlib/include/  -I../../dependences/cxxtools/include/ -I../../dependences/xapian-core-1.0.11/include/ -I../../dependences/unac-1.8.0.orig/ -fno-rtti -shared -D_POSIX_ -O3 -fPIC
CXXFLAGS           = -g -O2 -fPIC
LDFLAGS            =  -L../../dependences/zimlib/src/.libs/ -L../../dependences/cxxtools/src/.libs/ -L../../dependences/zlib-1.2.3/ -L../../dependences/bzip2-1.0.5/ -L../../dependences/xapian-core-1.0.11/.libs/ -L../../dependences/unac-1.8.0.orig

GECKO_DEFINES      = 
GECKO_IDL_INCLUDES = -I /usr/share/idl/xulrunner-1.9.0.10/stable
GECKO_INCLUDES     = -fshort-wchar -I/usr/include/xulrunner-1.9.0.10/stable -I/usr/include/nspr  
GECKO_LDFLAGS      = -L/usr/lib/xulrunner-devel-1.9.0.10/lib -lxpcomglue_s -lxul -lxpcom -lplds4 -lplc4 -lnspr4 -lpthread -ldl  
XPIDL              = /usr/lib/xulrunner-devel-1.9.0.10/bin/xpidl

all: zimXapianIndexer.so zimXapianIndexer.xpt

IZimXapianIndexer.h: IZimXapianIndexer.idl
	$(XPIDL) -m header $(GECKO_IDL_INCLUDES) IZimXapianIndexer.idl

zimXapianIndexer.xpt: IZimXapianIndexer.idl
	$(XPIDL) -m typelib $(GECKO_IDL_INCLUDES) IZimXapianIndexer.idl
	mv IZimXapianIndexer.xpt zimXapianIndexer.xpt

zimXapianIndexer.so: zimXapianIndexer.cpp IZimXapianIndexer.h
	$(CXX) -o zimXapianIndexer.so $(GECKO_DEFINES) $(GECKO_INCLUDES) \
		$(CPPFLAGS) $(CXXFLAGS) zimXapianIndexer.cpp xapian/htmlparse.cc xapian/myhtmlparse.cc  -Wl,-Bstatic -lzim -lz -lbz2 -lcxxtools -Wl,-Bdynamic   -Wl,-Bstatic -lxapian -lunac -Wl,-Bdynamic  -Wl,-Bstatic -lzim -lz -lbz2 -lcxxtools -Wl,-Bdynamic   \
		$(LDFLAGS) $(GECKO_LDFLAGS)
	chmod +x zimXapianIndexer.so

clean:
	rm -f *.o *~ *.xpt *.so
