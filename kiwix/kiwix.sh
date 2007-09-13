#!/bin/sh

if [ -f /usr/bin/xulrunner ]
then
    XULRUNNER_BIN=/usr/bin/xulrunner
fi

if [ -f xulrunner-linux/xulrunner ]
then
    XULRUNNER_BIN=xulrunner-linux/xulrunner
fi

exec $XULRUNNER_BIN application.ini
