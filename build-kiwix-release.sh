#!/bin/bash

function getFirefoxLocalization {
    CODE=$1
    rm firefox-3.5.tar.bz2
    wget -c http://releases.mozilla.org/pub/mozilla.org/firefox/releases/3.5/linux-i686/$CODE/firefox-3.5.tar.bz2
    rm -rf ./firefox
    tar -xvjf firefox-3.5.tar.bz2
    cp ./firefox/chrome/$CODE.* ./kiwix/xulrunner/chrome/

} 

# Go the the /tmp directory
cd /tmp

# Download code
svn co https://kiwix.svn.sourceforge.net/svnroot/kiwix/moulinkiwix moulinkiwix

# Get and compile the dependences
cd ./moulinkiwix/dependences
make

# Compile the components
cd ../components
cd zimAccessor ; ./autogen.sh ; ./configure ; make clean all
cd ../xapianAccessor ; ./autogen.sh ; ./configure ; make clean all
cd ../zimXapianIndexer ; ./autogen.sh ; ./configure ; make clean all

# Copy the kiwix directory
cd /tmp
rm -rf ./kiwix
cp -r -L /tmp/moulinkiwix/kiwix ./kiwix

# Remove svn stuff
for i in `find ./kiwix -name ".svn"` ; do rm -rf $i ; done

# Replace logger
mv ./kiwix/chrome/content/main/js/logger_rlz.js ./kiwix/chrome/content/main/js/logger.js

# Download and copy xulrunner
wget http://releases.mozilla.org/pub/mozilla.org/xulrunner/releases/1.9.0.13/runtimes/xulrunner-1.9.0.13.en-US.linux-i686.tar.bz2
tar -xvjf xulrunner-1.9.0.13.en-US.linux-i686.tar.bz2
mv ./xulrunner/ ./kiwix/

# Additional dynlib symlinks
cd ./xulrunner
ln -s libplc4.so libplc4.so.0d 
ln -s libnspr4.so libnspr4.so.0d  
ln -s libplds4.so libplds4.so.0d 
cd ..

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
cp moulinkiwix/dependences/xapian*/bin/xapian-compact ./kiwix/bin

# Tar & clean
rm kiwix.tar.bz2
tar -cvjf kiwix.tar.bz2 ./kiwix
rm -rf ./firefox*
rm -rf ./xulrunner*
rm -rf ./moulinkiwix*
rm -rf ./kiwix/
