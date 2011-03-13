AM_CPPFLAGS=-I$(top_builddir)/src/zimlib/include

lib_LTLIBRARIES = libzim.la

libzim_la_SOURCES = \
	article.cpp \
	articlesearch.cpp \
	cluster.cpp \
	deflatestream.cpp \
	dirent.cpp \
	file.cpp \
	fileheader.cpp \
	fileimpl.cpp \
	indexarticle.cpp \
	inflatestream.cpp \
	ptrstream.cpp \
	search.cpp \
	template.cpp \
	unicode.cpp \
	uuid.cpp \
	zintstream.cpp \
	envvalue.cpp \
	lzmastream.cpp \
	unlzmastream.cpp \
	fstream.cpp \
	md5.cpp \
	md5stream.cpp

include_HEADERS = \
	ptrstream.h \
	log.h \
	envvalue.h \
	md5stream.h \
	md5.h

libzim_la_CXXFLAGS=${LIBZ_CFLAGS} ${LIBLZMA_CFLAGS} -fPIC -D_FILE_OFFSET_BITS=64 -D_LARGEFILE64_SOURCE
libzim_la_LDFLAGS=${LIBZ_LDFLAGS} ${LIBLZMA_LDFLAGS}

CLEANFILES=*.obj *.lib *.dll