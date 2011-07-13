SUBDIRS=chrome defaults components

add_SCRIPTS=kiwix-compact
adddir=$(bindir)/

inidir=$(libdir)/kiwix
ini_DATA=application.ini

launcher_SCRIPTS=kiwix
launcherdir=$(libdir)/kiwix

install-exec-hook:
	-ln -s -f $(launcherdir)/kiwix $(bindir)/kiwix

uninstall-hook:
	-rm $(bindir)/kiwix