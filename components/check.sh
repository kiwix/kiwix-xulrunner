#!/bin/sh

RUN_MOZILLA=`find /usr/lib/xulrunner* -name run-mozilla.sh`;
LIBRARY=$1;
$RUN_MOZILLA `which ldd` -r $LIBRARY | grep unresolved;