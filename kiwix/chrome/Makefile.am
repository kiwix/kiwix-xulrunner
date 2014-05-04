chromedir=$(DESTDIR)$(pkgdatadir)/chrome
chrome_DATA=

locale.jar:
	zip -9 -r locale.jar locale/

content.jar:
	zip -9 -r content.jar content/

skin.jar:
	zip -9 -r skin.jar skin/

install-exec-hook: locale.jar content.jar skin.jar
	-mkdir -p $(chromedir)
	-cp chrome.manifest.prod $(chromedir)/chrome.manifest
	-mv locale.jar $(chromedir)
	-mv content.jar $(chromedir)
	-mv skin.jar $(chromedir)
	-cp -rf icons $(chromedir)
	-cp -rf modules $(chromedir)
	-ln -s -f ../../share/kiwix/chrome $(DESTDIR)$(pkglibdir)/chrome

jar: locale.jar content.jar skin.jar

uninstall-hook:
	-rm $(DESTDIR)$(pkglibdir)/chrome

chrome.manifest:
if JAR_CONTENT
	-cp chrome.manifest.prod chrome.manifest
else
	-cp chrome.manifest.dev chrome.manifest
endif

if JAR_CONTENT
all: jar chrome.manifest
else
all: chrome.manifest
endif

CLEANFILES=locale.jar content.jar skin.jar chrome.manifest