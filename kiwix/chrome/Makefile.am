chromedir=$(pkgdatadir)/chrome
chrome_DATA=

locale.jar:
	${JAR} cf locale.jar locale/

content.jar:
	${JAR} cf content.jar content/

skin.jar:
	${JAR} cf skin.jar skin/

install-data-hook: locale.jar content.jar skin.jar
	-cp chrome.manifest.prod ${DESTDIR}/$(chromedir)/chrome.manifest
	-mv locale.jar ${DESTDIR}/$(chromedir)
	-mv content.jar ${DESTDIR}/$(chromedir)
	-mv skin.jar ${DESTDIR}/$(chromedir)
	-cp -rf icons ${DESTDIR}/$(chromedir)
	-cp -rf modules ${DESTDIR}/$(chromedir)
	-ln -s -f $(chromedir) ${DESTDIR}/$(pkglibdir)/chrome
	-ln -s -f $(pkgdatadir)/static ${DESTDIR}/$(chromedir)/static

uninstall-hook:
	-rm ${DESTDIR}/${pkglibdir}/chrome
