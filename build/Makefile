all : kiwix

clean : clean_kiwix clean_moulin

clean_kiwix :
	rm -rf ./kiwix/*

clean_moulin :
	rm -rf ./moulin/*

kiwix : kiwix_chrome kiwix_components

kiwix_chrome :
	cp -r ../kiwix/* kiwix/

kiwix_components :
	rm -rf ./kiwix/components
	mkdir ./kiwix/components
	cp ../components/kiwixcomponent/IWikiComponent.xpt ./kiwix/components/
	for i in `find kiwix -name ".svn"` ; do rm -rf $$i ; done
	cp ../components/kiwixcomponent/IWikiComponent.so ./kiwix/components/
	for i in `find moulin -name ".svn"` ; do rm -rf $$i ; done