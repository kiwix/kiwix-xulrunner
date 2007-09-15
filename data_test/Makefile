all: index_kiwix

clean: clean_kiwix

clean_kiwix:
	rm -rf ./kiwix/*map
	rm -rf ./kiwix/*index

index_kiwix: 
	../indexer/kiwix/src/kiwixnormalizer ./kiwix/ 
