#!/bin/bash

# Usage: ./sign_osx_build kiwix-regular.dmg kiwix-signed.dmg certificate

TARGET_DMG="kiwix-0.9.dmg"
TARGET_MNT="mnt_sign"
DEST_DMG="kiwix-0.9s.dmg"
CERTIFICATE_DEV="Developer ID Application: Renaud Gaudin (S3QKTMRU8F)"
CERTIFICATE="3rd Party Mac Developer Application: Renaud Gaudin (S3QKTMRU8F)"
INSTALLER_CERTIFICATE="3rd Party Mac Developer Installer: Renaud Gaudin (S3QKTMRU8F)"

if [ "$1" != "" ]
then
    TARGET_DMG=$1
fi

if [ "$2" != "" ]
then
    DEST_DMG=$2
fi

if [ "$3" != "" ]
then
    CERTIFICATE=$3
fi

echo "Signing Kiwix.app from ${TARGET_DMG} to ${DEST_DMG} with ${CERTIFICATE}"

# create placeholders
rm -rf ${TARGET_MNT}
mkdir -p ${TARGET_MNT}/{ro,rw}

# mount build
echo "Attaching ${TARGET_DMG} to ${TARGET_MNT}/ro"
hdiutil attach ${TARGET_DMG} -noautoopen -quiet -mountpoint ${TARGET_MNT}/ro

# create destination volume
echo "Mounting template into ${TARGET_MNT}/rw"
bunzip2 -kf src/macosx/kiwix_template.dmg.bz2
hdiutil attach src/macosx/kiwix_template.dmg -noautoopen -quiet -mountpoint ${TARGET_MNT}/rw

# copy Kiwix.app
rm -rf ${TARGET_MNT}/rw/Kiwix.app
echo "Copying Kiwix.app from ${TARGET_MNT}/ro to ${TARGET_MNT}/rw"
rsync -av --copy-unsafe-links ${TARGET_MNT}/ro/Kiwix.app ${TARGET_MNT}/rw/

# detach read-only
echo "Detaching ${TARGET_MNT}/ro"
hdiutil detach ${TARGET_MNT}/ro -quiet -force

# sign Kiwix.app
echo "Signing the build"
codesign --entitlements src/macosx/kiwix.entitlements -d -f --all-architectures --deep -vvv -s "${CERTIFICATE}" ${TARGET_MNT}/rw/Kiwix.app/Contents/MacOS/crashreporter.app
codesign --entitlements src/macosx/kiwix.entitlements -d -f --all-architectures --deep -vvv -s "${CERTIFICATE}" ${TARGET_MNT}/rw/Kiwix.app/Contents/MacOS/plugin-container.app
codesign --entitlements src/macosx/kiwix.entitlements -d -f --all-architectures --deep -vvv -s "${CERTIFICATE}" ${TARGET_MNT}/rw/Kiwix.app/Contents/MacOS/updater.app
codesign --entitlements src/macosx/kiwix.entitlements -d -f --all-architectures --deep -vvv -s "${CERTIFICATE}" ${TARGET_MNT}/rw/Kiwix.app

productbuild --quiet --component ${TARGET_MNT}/rw/Kiwix.app /Applications --sign "${INSTALLER_CERTIFICATE}" Kiwix.pkg

# detach rw
echo "Detaching the new volume"
hdiutil detach ${TARGET_MNT}/rw -quiet -force

# preparing dmg
echo "Converting volume into a dmg at ${DEST_DMG}"
rm -rf ${DEST_DMG}
hdiutil convert src/macosx/kiwix_template.dmg -quiet -format UDZO -imagekey zlib-level=9 -o ${DEST_DMG}
rm -f src/macosx/kiwix_template.dmg

echo "All Done."
ls -lh ${DEST_DMG}
