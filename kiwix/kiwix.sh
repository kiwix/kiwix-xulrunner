#!/bin/sh

# Get the path of the xulrunner install of the system
XULRUNNER=`whereis xulrunner | cut -d" " -f2`

# If no xulrunner installed, take a look to the current directory
if [ ! "$XULRUNNER" ]
then
    XULRUNNER=`find ./ -name xulrunner`
fi

# Ff no result print a message
if [ ! "$XULRUNNER" ] || [ ! -f "$XULRUNNER" ]
then
    echo "'xulrunner' is not installed, you have to install it to use Kiwix."
    exit;
fi

# Otherwise, launch Kiwix
exec $XULRUNNER application.ini
