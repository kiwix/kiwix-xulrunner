SUBDIRS=chrome defaults components

add_SCRIPTS=kiwix-compact
adddir=$(bindir)

inidir=$(pkglibdir)
ini_DATA=application.ini chrome.manifest

launcherdir=$(pkglibdir)

install-exec-hook:
	-ln -s -f $(DESTDIR)$(launcherdir)/kiwix-launcher $(bindir)/kiwix

uninstall-hook:
	-rm $(DESTDIR)$(bindir)/kiwix