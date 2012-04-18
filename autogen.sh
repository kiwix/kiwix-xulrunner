#! /bin/sh

# create symlink to configure.ac
CONF_ALT=""
if [ "$1" != "" ] ; then
    CONF_ALT=$1
fi

if [ "$CONF_ALT" = "" ]
then
    CONF_ALT="orig"
fi

# overwrite existing configuration
CUR=`pwd`
if [ "${CONF_ALT}" = "alt" -o "${CONF_ALT}" = "orig" ]; then
    ln -sf "configure_${CONF_ALT}.ac" configure.ac
    ln -sf "${CUR}/Makefile.am.${CONF_ALT}" $CUR/Makefile.am
    ln -sf "${CUR}/src/Makefile.am.${CONF_ALT}" $CUR/src/Makefile.am
    ln -sf "${CUR}/static/Makefile.am.${CONF_ALT}" $CUR/static/Makefile.am
    ln -sf "${CUR}/etc/Makefile.am.${CONF_ALT}" $CUR/etc/Makefile.am
    ln -sf "${CUR}/desktop/Makefile.am.${CONF_ALT}" $CUR/desktop/Makefile.am
    ln -sf "${CUR}/kiwix/components/Makefile.am.${CONF_ALT}" $CUR/kiwix/components/Makefile.am
    ln -sf "${CUR}/kiwix/defaults/Makefile.am.${CONF_ALT}" $CUR/kiwix/defaults/Makefile.am
    ln -sf "${CUR}/kiwix/chrome/Makefile.am.${CONF_ALT}" $CUR/kiwix/chrome/Makefile.am
    ln -sf "${CUR}/kiwix/Makefile.am.${CONF_ALT}" $CUR/kiwix/Makefile.am
    ln -sf "${CUR}/src/installer/Makefile.am.${CONF_ALT}" $CUR/src/installer/Makefile.am
    ln -sf "${CUR}/src/zimlib/src/Makefile.am.${CONF_ALT}" $CUR/src/zimlib/src/Makefile.am
    ln -sf "${CUR}/src/zimlib/Makefile.am.${CONF_ALT}" $CUR/src/zimlib/Makefile.am
    ln -sf "${CUR}/src/server/Makefile.am.${CONF_ALT}" $CUR/src/server/Makefile.am
    ln -sf "${CUR}/src/indexer/Makefile.am.${CONF_ALT}" $CUR/src/indexer/Makefile.am
    ln -sf "${CUR}/src/components/contentManager/Makefile.am.${CONF_ALT}" $CUR/src/components/contentManager/Makefile.am
    ln -sf "${CUR}/src/components/serverManager/Makefile.am.${CONF_ALT}" $CUR/src/components/serverManager/Makefile.am
    ln -sf "${CUR}/src/components/zimXapianIndexer/Makefile.am.${CONF_ALT}" $CUR/src/components/zimXapianIndexer/Makefile.am
    ln -sf "${CUR}/src/components/zimCluceneIndexer/Makefile.am.${CONF_ALT}" $CUR/src/components/zimCluceneIndexer/Makefile.am
    ln -sf "${CUR}/src/components/cluceneAccessor/Makefile.am.${CONF_ALT}" $CUR/src/components/cluceneAccessor/Makefile.am
    ln -sf "${CUR}/src/components/zimAccessor/Makefile.am.${CONF_ALT}" $CUR/src/components/zimAccessor/Makefile.am
    ln -sf "${CUR}/src/components/xapianAccessor/Makefile.am.${CONF_ALT}" $CUR/src/components/xapianAccessor/Makefile.am
    ln -sf "${CUR}/src/components/Makefile.am.${CONF_ALT}" $CUR/src/components/Makefile.am
    ln -sf "${CUR}/src/ctype/Makefile.am.${CONF_ALT}" $CUR/src/ctype/Makefile.am
    ln -sf "${CUR}/src/ctype/zimAccessor/Makefile.am.${CONF_ALT}" $CUR/src/ctype/zimAccessor/Makefile.am
    ln -sf "${CUR}/src/searcher/Makefile.am.${CONF_ALT}" $CUR/src/searcher/Makefile.am
    ln -sf "${CUR}/src/reader/Makefile.am.${CONF_ALT}" $CUR/src/reader/Makefile.am
    ln -sf "${CUR}/src/manager/Makefile.am.${CONF_ALT}" $CUR/src/manager/Makefile.am
    ln -sf "${CUR}/src/ctpp2/src/Makefile.am.${CONF_ALT}" $CUR/src/ctpp2/src/Makefile.am
    ln -sf "${CUR}/src/ctpp2/Makefile.am.${CONF_ALT}" $CUR/src/ctpp2/Makefile.am
    ln -sf "${CUR}/src/pugixml/Makefile.am.${CONF_ALT}" $CUR/src/pugixml/Makefile.am
fi

ls -lh configure.ac

# Generate the aclocal.m4 file for automake, based on configure.in
aclocal

# Regenerate the files autoconf / automake
libtoolize --force --automake

# Remove old cache files
rm -f config.cache
rm -f config.log

# Generate the configure script based on configure.in
autoconf

# Generate the Makefile.in
automake -a --foreign
