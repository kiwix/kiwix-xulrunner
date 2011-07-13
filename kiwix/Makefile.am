SUBDIRS=chrome defaults components

add_SCRIPTS=kiwix-compact
adddir=$(bindir)/

inidir=$(pkglibdir)
ini_DATA=application.ini

launcherdir=$(pkglibdir)
launcher_SCRIPTS=kiwix

install-exec-hook:
	-ln -s -f ${DESTDIR}/$(launcherdir)/kiwix ${DESTDIR}/$(bindir)/kiwix

uninstall-hook:
	-rm ${DESTDIR}/$(bindir)/kiwix