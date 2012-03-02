#!/bin/bash

#Usage: build-kiwix-release.sh [static]
#
#   Generates a bundle version of Kiwix. Default with shared linked libraries.
#
#   You should run it from outside the moulinkiwix directory.
#
#   --static      creates a portable version of Kiwix
#   --regular   creates a normal (shared links) version of Kiwix
#   --help      displays this help message
#

VERSION="0.9x"
if [ "$2" ]
then
VERSION=$2
fi

if [ "$1" = "--static" ]
then
STATIC=1
elif [ "$1" = "--help" ]
then
head -n 12 $0 |grep -e '^#' |grep -v '^#!'|cut -c 2-
exit
else
STATIC=0
fi

if [ $STATIC -gt 0 ]
then
echo "Building a static (portable) version of Kiwix"
confopt=" --without-dependences"
else
echo "Building a regular (linked) version of Kiwix"
confopt=""
fi

function getFirefoxLocalization {
    echo "Downloading Firefox for language code $CODE"
    CODE=$1
    #rm ff_$CODE-3.6.22.tar.bz2
    if [ -f ff_$CODE-3.6.27.tar.bz2 ] ; then
        echo "ff_$CODE-3.6.27.tar.bz2 exist."
    else
        wget -c http://download.kiwix.org/dev/mozilla.org/firefox/releases/3.6.27/linux-i686/$CODE/firefox-3.6.27.tar.bz2 -O ff_$CODE-3.6.27.tar.bz2
    fi
    rm -rf ./firefox
    tar xf ff_$CODE-3.6.27.tar.bz2
    cp ./firefox/chrome/$CODE.* ./kiwix/xulrunner/chrome/
}

bname=$(dirname $(readlink -f $0))

# make sure we're not in moulinkiwix folder
# as we want to copy that folder 
if [ "$bname" = `pwd` ]
then
echo "/!\ WARNING: You seem to be running this script from within the \
moulinkiwix directory.
You must run it from another location; preferably its parent directory ("$(dirname $(pwd))")"
exit
fi

# Create and move to a staging directory
mkdir -p tmp
cd tmp

# Download code
echo "Grabbing Kiwix source code"
rm -rf moulinkiwix
if [ -d "../moulinkiwix" ]
then
rsync -ar ../moulinkiwix .
else
svn co https://kiwix.svn.sourceforge.net/svnroot/kiwix/moulinkiwix moulinkiwix
fi

# Prepares Makefiles
echo "Prepares Kiwix compilation"
cd ./moulinkiwix
if [ -f Makefile ]; then make clean; fi
./autogen.sh && ./configure $confopt
cd -

# Compile dependences
echo "Build Kiwix dependences"
cd ./moulinkiwix/src/dependences
make clean
make
cd -

# Relaunch configure with deps
cd ./moulinkiwix
./configure $confopt
cd -

# Compile components
echo "Build Kiwix components"
cd ./moulinkiwix
make
cd -

# Copy the kiwix directory
echo "Files clean up"
rm -rf ./kiwix
cp -r -L ./moulinkiwix/kiwix ./kiwix

# Remove svn/repo stuff
find ./kiwix -name '.svn' -exec rm -rf {} \;
find ./kiwix -name '*.inised' -exec rm -rf {} \;
find ./kiwix -name 'Makefile' -delete
find ./kiwix -name 'Makefile.in' -delete
find ./kiwix -name 'Makefile.am' -delete

# Replace logger
mv ./kiwix/chrome/content/main/js/logger_rlz.js ./kiwix/chrome/content/main/js/logger.js

# Download and copy xulrunner
echo "Grabbing XulRunner runtime"
if [ -f xulrunner-runtime.tar.bz2 ]
then
echo "  already present"
else
wget -c http://download.kiwix.org/dev/xulrunner-1.9.2.13.en-US.linux-i686.sdk.tar.bz2 -O xulrunner-runtime.tar.bz2
fi
tar xf xulrunner-runtime.tar.bz2
chmod +x ./xulrunner/xulrunner ./xulrunner/xulrunner-bin
mv ./xulrunner/ ./kiwix/

# Additional dynlib symlinks
cd ./kiwix/xulrunner
cp -v libplc4.so libplc4.so.0d
cp -v libnspr4.so libnspr4.so.0d
cp -v libplds4.so libplds4.so.0d
cd -

# Create the kiwix binary
mv ./kiwix/xulrunner/xulrunner-stub ./kiwix/kiwix

# Use last version (at least 1.14.0) version of aria2c (staticaly compiled for x86_32)
wget -c http://download.kiwix.org/dev/aria2c -O ./kiwix/aria2c
#cp -v ./moulinkiwix/src/dependences/aria2-1.12.1/src/aria2c ./kiwix/

# Download the firefox en copy the locales JAR
getFirefoxLocalization de
getFirefoxLocalization it
getFirefoxLocalization fr
getFirefoxLocalization es-ES
getFirefoxLocalization ar
getFirefoxLocalization he
getFirefoxLocalization fa
getFirefoxLocalization zh-CN

# xapian-compact
mkdir ./kiwix/bin
cp moulinkiwix/src/dependences/xapian*/bin/.libs/xapian-compact ./kiwix/bin

#strip the binaries
for BINARY in `find src/ -executable -type f | grep -v ".sh" | grep -v ".py" | grep -v sugar`
do
    strip $BINARY
done

# Tar & clean
echo "Clean Up"
aname="kiwix"
if [ $STATIC -gt 0 ]
then
aname="$aname-static"
fi
aname="$aname-$VERSION.tar.bz2"
rm $aname
tar -cvjf $aname ./kiwix
rm -rf ./firefox/
cd ..
ls -lh ./tmp/$aname
echo "All done. Your archive is ready in `readlink -f ./tmp/$aname`"
