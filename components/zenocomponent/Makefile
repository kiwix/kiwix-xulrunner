CXX = c++
CPPFLAGS           = -fno-rtti -fno-exceptions -shared -D_POSIX_ -O3
DEFINES            = -D_POSIX_

HAVE_XUL_CONFIG    := $(shell pkg-config libxul && echo "ok")

ifeq ($(HAVE_XUL_CONFIG),ok)
GECKO_SDK_PATH     := $(shell pkg-config --variable=sdkdir libxul)
GECKO_IDL_INCLUDES := -I $(shell pkg-config --variable=idldir libxul)/$(shell pkg-config --variable=includetype libxul)
GECKO_INCLUDES     := $(shell pkg-config --cflags libxul)
GECKO_LDFLAGS      := $(shell pkg-config --libs libxul)
else
GECKO_SDK_PATH     = ../../gecko_sdk/1.8
GECKO_DEFINES      = -DXPCOM_BUILD -DXPCOM_GLUE -DMOZILLA_STRICT_API
GECKO_IDL_INCLUDES = -I $(GECKO_SDK_PATH)/idl
GECKO_INCLUDES     = -I $(GECKO_SDK_PATH)/include
GECKO_LDFLAGS      = -L $(GECKO_SDK_PATH)/lib -lxpcomglue -lnspr4 -lplds4 -lembed_base_s -lz
endif

all: IZeno.so IZeno.xpt

IZeno.h: IZeno.idl
	$(GECKO_SDK_PATH)/bin/xpidl -m header $(GECKO_IDL_INCLUDES) IZeno.idl

IZeno.xpt: IZeno.idl
	$(GECKO_SDK_PATH)/bin/xpidl -m typelib $(GECKO_IDL_INCLUDES) IZeno.idl

IZeno.so: zenocomponent.cpp IZeno.h
	$(CXX) -o IZeno.so $(GECKO_DEFINES) $(GECKO_INCLUDES) \
		$(CPPFLAGS) $(CXXFLAGS) zenocomponent.cpp /usr/local/lib/libzeno.a /usr/local/lib/libcxxtools.a \
		$(GECKO_LDFLAGS)
	chmod +x IZeno.so

clean:
	rm -f *.o *.xpt *.so test
