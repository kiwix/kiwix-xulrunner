chromedir=$(pkgdatadir)/chrome
chrome_DATA=

locale.jar:
	${JAR} cf locale.jar locale/

content.jar:
	${JAR} cf content.jar content/

skin.jar:
	${JAR} cf skin.jar skin/

install-data-hook: locale.jar content.jar skin.jar
	-cp chrome.manifest.prod $(chromedir)/chrome.manifest
	-mv locale.jar $(chromedir)
	-mv content.jar $(chromedir)
	-mv skin.jar $(chromedir)
	-cp -rf icons $(chromedir)
	-cp -rf modules $(chromedir)
	-ln -s -f $(chromedir) $(pkglibdir)/chrome
	-ln -s -f $(pkgdatadir)/static $(chromedir)/static

uninstall-hook:
	-rm ${pkglibdir}/chrome
