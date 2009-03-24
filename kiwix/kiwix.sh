#!/bin/sh

# Take a look to the current directory
XULRUNNER=`find ./ -executable -type f -name xulrunner`

# If no xulrunner, get the path of the xulrunner install of the system
if [ !"$XULRUNNER" ]
then
    XULRUNNER=`whereis xulrunner | cut -d" " -f2`
fi

# If no result print a message
if [ ! "$XULRUNNER" ] || [ ! -f "$XULRUNNER" ]
then
    echo "'xulrunner' is not installed, you have to install it to use Kiwix."
    exit;
fi

# Otherwise, launch Kiwix
exec $XULRUNNER application.ini $1
