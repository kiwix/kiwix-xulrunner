#!/bin/sh

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
wget http://releases.mozilla.org/pub/mozilla.org/xulrunner/releases/1.9.0.11/runtimes/xulrunner-1.9.0.11.en-US.linux-i686.tar.bz2
tar -xvjf xulrunner-1.9.0.11.en-US.linux-i686.tar.bz2
mv ./xulrunner/ ./kiwix/

# Download the firefox en copy the locales JAR
rm firefox-3.5rc1.tar.bz2
wget -c http://releases.mozilla.org/pub/mozilla.org/firefox/releases/latest-3.5/linux-i686/it/firefox-3.5rc1.tar.bz2
rm -rf ./firefox
tar -xvjf firefox-3.5rc1.tar.bz2
cp ./firefox/chrome/it.* ./kiwix/xulrunner/chrome/

rm firefox-3.5rc1.tar.bz2
wget -c http://releases.mozilla.org/pub/mozilla.org/firefox/releases/latest-3.5/linux-i686/fr/firefox-3.5rc1.tar.bz2
rm -rf ./firefox
tar -xvjf firefox-3.5rc1.tar.bz2
cp ./firefox/chrome/fr.* ./kiwix/xulrunner/chrome/

rm firefox-3.5rc1.tar.bz2
wget -c http://releases.mozilla.org/pub/mozilla.org/firefox/releases/latest-3.5/linux-i686/es-ES/firefox-3.5rc1.tar.bz2
rm -rf ./firefox
tar -xvjf firefox-3.5rc1.tar.bz2
cp ./firefox/chrome/es-ES.* ./kiwix/xulrunner/chrome/

rm firefox-3.5rc1.tar.bz2
wget -c http://releases.mozilla.org/pub/mozilla.org/firefox/releases/latest-3.5/linux-i686/de/firefox-3.5rc1.tar.bz2
rm -rf ./firefox
tar -xvjf firefox-3.5rc1.tar.bz2
cp ./firefox/chrome/de.* ./kiwix/xulrunner/chrome/

# Tar & clean
rm kiwix.tar.bz2
tar -cvjf kiwix.tar.bz2 ./kiwix
rm -rf ./firefox*
rm -rf ./xulrunner*
rm -rf ./moulinkiwix*
rm -rf ./kiwix/
