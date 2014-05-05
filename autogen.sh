#! /bin/sh

# Generate the aclocal.m4 file for automake, based on configure.in
aclocal

# Regenerate the files autoconf / automake
if [ "`(uname -s) 2>/dev/null`" = "Darwin" ]
then
    glibtoolize --force
else
    libtoolize --force --automake
fi

# Remove old cache files
rm -f config.cache
rm -f config.log

# Generate the configure script based on configure.in
if [ "`(uname -s) 2>/dev/null`" = "Darwin" ]
then
    autoconf213 || autoconf
else
    autoconf
fi

# Generate the Makefile.in
automake -a --foreign

CONF_DEB=""

if [ "$1" != "" -a "$1" != "alt" -a "$1" != "orig" ]
    then
    CONF_DEB=$1
elif [ "$2" != "" ]
    then
    CONF_DEB=$2
fi

if [ "$CONF_DEB" = "" ]
then
    exit
fi

# preparing deb recipe
cd debian
for f in `find . -name "*.${CONF_DEB}"`
do
    bname=`echo "$f" |awk '{split($0,a,"."); print a[2]}' | awk '{split($0,a,"/"); print a[2]}'`
    ln -sf ${bname}.${CONF_DEB} ${bname}
done