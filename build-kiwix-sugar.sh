#!/bin/bash

#Usage: build-kiwix-sugar.sh path/to/kiwix-static.tar.gz [VERSION]
#
#   Generates an XO bundle version of Kiwix for Sugar.
#
#   VERSION     a numeric build number value
#   --help      displays this help message
#

# path to kiwix static archive is first arg
ARCHIVE=""
if [ "$1" ]
then
ARCHIVE=$1
else
head -n 9 $0 |grep -e '^#' |grep -v '^#!'|cut -c 2-
exit
fi

# version is sugar build version of the .xo file
VERSION=""
if [ "$2" ]
then
VERSION=$2
fi

# move to a safe place
rm -rf /tmp/Kiwix.activity
mkdir -p /tmp/Kiwix.activity

# extract kiwix-static
tar -xf $ARCHIVE -C /tmp/Kiwix.activity --strip-components=2

# copy sugar-specific files
cp -rv src/sugar/lib src/sugar/activity src/sugar/setup.py /tmp/Kiwix.activity/
cp -rv src/sugar/bin/* /tmp/Kiwix.activity/bin/

# if version specified, mark it in the info manifest
if [ "$VERSION" ]
then
sed -i -e "s/^activity_version = 1$/activity_version = $VERSION/" /tmp/Kiwix.activity/activity/activity.info
else
VERSION=`cat src/sugar/activity/activity.info |grep activity_version | cut -d " " -f3`
fi

# change default skin to sugar
sed -i -e "s/^pref(\"general.skins.selectedSkin\", \"default\");$/pref(\"general.skins.selectedSkin\", \"sugar\");/" /tmp/Kiwix.activity/defaults/preferences/preferences.js
sed -i -e "s/^resource defaultskin skin\/default\/$/resource defaultskin skin\/sugar\//" /tmp/Kiwix.activity/chrome/chrome.manifest
sed -i -e "s/^pref(\"kiwix.downloadRemoteCatalogs\", undefined);$/pref(\"kiwix.downloadRemoteCatalogs\", false);/" /tmp/Kiwix.activity/defaults/preferences/preferences.js

# build .xo (write the manifest and zip the package)
cd /tmp/Kiwix.activity
rm ./aria2c
find ./ -type f -o -type l | sed 's,^./,,g' | grep -v MANIFEST > MANIFEST
cd ..
zip -r Kiwix-$VERSION.xo Kiwix.activity
mv Kiwix-$VERSION.xo ./Kiwix.activity
cd Kiwix.activity
cd -

echo "All done. Your archive is ready in `readlink -f /tmp/Kiwix.activity/*.xo`"
