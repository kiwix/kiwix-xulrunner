SUBDIRS           ?= components indexer build
SUBDIR_TARGETS    ?= $(SUBDIRS)
RECURSIVE_TARGETS ?= all clean

# add recursion to dependencies
$(RECURSIVE_TARGETS): % : %_recursive

# run make $@ in all subdirs
$(RECURSIVE_TARGETS:=_recursive):
	@for dir in $(SUBDIRS); do \
	  $(MAKE) -C $$dir $(subst _recursive,,$@) || exit 1; \
	done

