#!/bin/sh
LIBRARY=$1;
LDD=`which ldd`

# Check if the file is a dynamic library
$LDD $LIBRARY > /dev/null
IS_LIBRARY=$?
if [ ! "$IS_LIBRARY" -eq "0" ]
then
    echo "$LIBRARY is not a dynamic library."
    exit
fi


# Try to find run-mozilla.sh localy
if [ -e ../../kiwix/xulrunner/run-mozilla.sh ]
then
RUN_MOZILLA=../../kiwix/xulrunner/run-mozilla.sh;
else
RUN_MOZILLA=`find /usr/lib/xulrunner* -name run-mozilla.sh`;
fi

# Check if dependences are missing

$RUN_MOZILLA $LDD -r $LIBRARY | grep unresolved;