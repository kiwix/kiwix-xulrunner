#! /bin/sh
# Regenerate the files autoconf / automake
rm -f config.cache
rm -f config.log
aclocal
autoconf

