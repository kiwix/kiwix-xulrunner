if IS_OSX
SUBDIRS = ${DEPENDENCES} \
	zimlib \
	ctpp2 \
	pugixml \
	components \
	manager \
	dependences \
	ctype
else
SUBDIRS = ${DEPENDENCES} \
	zimlib \
	ctpp2 \
	pugixml \
	components \
	server \
	manager \
	ctype
if IS_STATIC
else
SUBDIRS += indexer \
	installer \
	searcher \
	reader
endif
endif
