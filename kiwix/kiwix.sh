#!/bin/bash

# Initialisation
BINARY=$0
BINARY_DIR=`dirname $BINARY`

# Binary
while [ `readlink $BINARY` ]
do
    BINARY=`readlink $BINARY`
done

if [ ! ${BINARY:0:1} = "/" ]
then
    BINARY_DIR=$BINARY_DIR/`dirname $BINARY`
    BINARY_DIR=`cd $BINARY_DIR ; pwd` 
    BINARY=$BINARY_DIR/`basename $BINARY`
fi

# Take a look to the current directory
if [ -d "$BINARY_DIR/xulrunner" ]
then
    XULRUNNER=`find $BINARY_DIR/xulrunner -type f -name xulrunner`
fi

echo  $BINARY_DIR

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

# If no result print a message
if [ ! "$XULRUNNER" ] || [ ! -f "$XULRUNNER" ]
then
    echo "'xulrunner' is not installed, you have to install it to use Kiwix."
    exit;
fi

# set the default locale if necessary
if [ ! -d ~/.www.kiwix.org ]
then
    
    LOCALE="-UILocale "`echo $LANG | sed "s/[_|\.].*//"`
fi

# Otherwise, launch Kiwix
exec $XULRUNNER $BINARY_DIR/application.ini $1 $LOCALE
