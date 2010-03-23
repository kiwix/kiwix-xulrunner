AM_CPPFLAGS=-I$(top_builddir)/src/zimlib/include

lib_LTLIBRARIES = libzim.la

libzim_la_SOURCES = \
	article.cpp \
	articlesearch.cpp \
	bunzip2stream.cpp \
	bzip2.cpp \
	bzip2stream.cpp \
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
	unlzmastream.cpp

include_HEADERS = \
	ptrstream.h \
	log.h \
	envvalue.h

libzim_la_CXXFLAGS=${LIBZ_CFLAGS} ${LIBBZ2_CFLAGS} ${LIBLZMA_CFLAGS} -fPIC
libzim_la_LDFLAGS=${LIBZ_LDFLAGS} ${LIBBZ2_LDFLAGS} ${LIBLZMA_LDFLAGS}

CLEANFILES=*.obj *.lib *.dll