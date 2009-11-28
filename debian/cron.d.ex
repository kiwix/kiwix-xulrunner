#
# Regular cron jobs for the kiwix package
#
0 4	* * *	root	[ -x /usr/bin/kiwix_maintenance ] && /usr/bin/kiwix_maintenance
