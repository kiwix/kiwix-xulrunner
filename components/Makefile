SUBDIRS           ?= kiwixcomponent
SUBDIR_TARGETS    ?= $(SUBDIRS)
RECURSIVE_TARGETS ?= all clean

# add recursion to dependencies
$(RECURSIVE_TARGETS): % : %_recursive

# run make $@ in all subdirs
$(RECURSIVE_TARGETS:=_recursive):
	@for dir in $(SUBDIRS); do \
	  $(MAKE) -C $$dir $(subst _recursive,,$@) || exit 1; \
	done

# shortcut for "make -C <dir>"
ifdef SUBDIR_TARGETS
$(SUBDIR_TARGETS):
	@$(MAKE) -C $@
endif

.PHONY: $(RECURSIVE_TARGETS:=_recursive) $(SUBDIR_TARGETS)
