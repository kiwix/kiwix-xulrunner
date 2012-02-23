#! /bin/sh

# create symlink to configure.ac
CONF_ALT=""
if [ "$1" != "" ] ; then
    CONF_ALT=$1
fi

# overwrite existing configuration
if [ "${CONF_ALT}" = "alt" -o  "${CONF_ALT}" = "orig" ]; then
    ln -sf "configure_${CONF_ALT}.ac" configure.ac

fi

# if no configure, create default
if [ ! -f configure.ac ]; then
    ln -s configure_orig.ac configure.ac
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
