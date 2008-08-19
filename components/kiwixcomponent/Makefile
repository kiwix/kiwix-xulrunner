CXX = c++
CPPFLAGS           = -fno-rtti -fno-exceptions -shared -D_POSIX_ -O3
DEFINES            = -D_POSIX_

HAVE_XUL_CONFIG    := $(shell pkg-config libxul && echo "ok")

ifeq ($(HAVE_XUL_CONFIG),ok)
GECKO_SDK_PATH     := $(shell pkg-config --variable=sdkdir libxul)
GECKO_XPIDL        := $(shell if test -e "${GECKO_SDK_PATH}/xpidl" ; then echo "${GECKO_SDK_PATH}/xpidl" ; else echo "${GECKO_SDK_PATH}/bin/xpidl" ; fi)
GECKO_IDL_INCLUDES := -I $(shell pkg-config --variable=idldir libxul)/$(shell pkg-config --variable=includetype libxul)
GECKO_INCLUDES     := $(shell pkg-config --cflags libxul)
GECKO_LDFLAGS      := $(shell pkg-config --libs libxul)
else
GECKO_SDK_PATH     = ../../gecko_sdk/1.8
GECKO_XPIDL        = $(GECKO_SDK_PATH)/bin/xpidl
GECKO_DEFINES      = -DXPCOM_BUILD -DXPCOM_GLUE -DMOZILLA_STRICT_API
GECKO_IDL_INCLUDES = -I $(GECKO_SDK_PATH)/idl
GECKO_INCLUDES     = -I $(GECKO_SDK_PATH)/include
GECKO_LDFLAGS      = -L $(GECKO_SDK_PATH)/lib -lxpcomglue -lnspr4 -lplds4 -lembed_base_s
endif

all: IWikiComponent.so IWikiComponent.xpt

IWikiComponent.h: IWikiComponent.idl
	$(GECKO_XPIDL) -m header $(GECKO_IDL_INCLUDES) IWikiComponent.idl

IWikiComponent.xpt: IWikiComponent.idl
	$(GECKO_XPIDL) -m typelib $(GECKO_IDL_INCLUDES) IWikiComponent.idl

IWikiComponent.so: wikicomponent.cpp IWikiComponent.h xengine.o xlist.o xindex.o
	$(CXX) -o IWikiComponent.so $(GECKO_DEFINES) $(GECKO_INCLUDES) \
		$(CPPFLAGS) $(CXXFLAGS) wikicomponent.cpp xengine.o xlist.o xindex.o \
		$(GECKO_LDFLAGS)
	chmod +x IWikiComponent.so

clean:
	rm -f *.o *.xpt *.so test

xindex.o: index.cpp index.h list.h common.h
	$(CXX) index.cpp -c -o xindex.o -DXPCOM_BUILD $(GECKO_INCLUDES) $(CPPFLAGS)

xlist.o: list.cpp list.h common.h
	$(CXX) list.cpp -c -o xlist.o -DXPCOM_BUILD $(GECKO_INCLUDES)  $(CPPFLAGS)

xengine.o: engine.cpp list.h index.h common.h
	$(CXX) engine.cpp -c -o xengine.o -DXPCOM_BUILD $(GECKO_INCLUDES)  $(CPPFLAGS)

index.o: index.cpp index.h list.h common.h
	$(CXX) index.cpp -c -o index.o $(DEFINES)

list.o:	list.cpp list.h common.h
	$(CXX) list.cpp -c -o list.o $(DEFINES)

engine.o: engine.cpp list.h index.h common.h
	$(CXX) engine.cpp -c -o engine.o $(DEFINES)
