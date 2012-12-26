AM_CPPFLAGS=

noinst_LTLIBRARIES = libpugixml.la

libpugixml_la_SOURCES = \
	pugixml.cpp \
	pugixml.hpp \
	pugiconfig.hpp

libpugixml_la_CXXFLAGS=-fPIC -D_FILE_OFFSET_BITS=64 -D_LARGEFILE64_SOURCE
libpugixml_la_LDFLAGS=$(CHECK_LDFLAGS)

if IS_OSX
libpugixml_la_CXXFLAGS+= -mmacosx-version-min=10.5 -isysroot /Developer/SDKs/MacOSX10.5.sdk
endif

CLEANFILES=*.obj *.lib *.dll