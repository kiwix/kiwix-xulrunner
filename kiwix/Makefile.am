SUBDIRS = chrome defaults components
EXTRA_DIST = kiwix kiwix-compact application.ini
bin_SCRIPTS=kiwix kiwix-compact
inidir = $(libdir)/kiwix
ini_DATA = application.ini
uninstall-hook:
	rm -rf $(libdir)/kiwix
