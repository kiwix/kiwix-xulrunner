#!/bin/bash

# Original binary
BINARY_ORG=$0
if [ ! ${BINARY_ORG:0:1} = "/" ]
then
   BINARY_ORG=`pwd`/$BINARY_ORG
fi

# Binary
BINARY=$BINARY_ORG
while [ `readlink $BINARY` ]
do
    BINARY=`readlink $BINARY`
done

# Binary dir
if [ ${BINARY:0:1} = "/" ]
then
    BINARY_DIR=`dirname $BINARY`
else
    BINARY_DIR=`dirname $BINARY_ORG`/`dirname $BINARY`
    BINARY_DIR=`cd $BINARY_DIR ; pwd` 
fi

# Take a look to the current directory
if [ -d "$BINARY_DIR/xulrunner" ]
then
    XULRUNNER=`find $BINARY_DIR/xulrunner -type f -name xulrunner`
fi

# Try to update $LD_LIBRARY_PATH
for DIR in `find $BINARY_DIR -type d -name xulrunner`; do
    export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$DIR;
done

# Add /usr/local/lib to $LD_LIBRARY_PATH as it seems no always be the case per default
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib

# If no xulrunner, get the path of the xulrunner install of the system
if [ ! "$XULRUNNER" ]
then
    XULRUNNER=`whereis xulrunner | cut -d" " -f2`
fi

# If no symlink "xulrunner" try to find the binary itself
if [ ! "$XULRUNNER" ] || [ ! -f "$XULRUNNER" ] || [ ! -x "$XULRUNNER" ] || [ ! -r "$XULRUNNER" ]
then
    XULRUNNER=`whereis xulrunner-1.9.2 | cut -d" " -f2`
fi

# If no result print a message
if [ ! "$XULRUNNER" ] || [ ! -f "$XULRUNNER" ] || [ ! -x "$XULRUNNER" ] || [ ! -r "$XULRUNNER" ]
then
    echo "'xulrunner' is not installed, you have to install it to use Kiwix."
    exit;
fi

# Set the custom plugins directory
export MOZ_PLUGIN_PATH=/usr/lib

# Otherwise, launch Kiwix
$XULRUNNER $BINARY_DIR/application.ini $1 $2 $3 $4 $5 $6 $7 $8 $9 $10
