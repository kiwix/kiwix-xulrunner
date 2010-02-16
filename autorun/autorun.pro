TEMPLATE = app
TARGET = 
DEPENDPATH += . build src ui
INCLUDEPATH += .
CONFIG += static

# Input
HEADERS += src/appimpl.h src/logo.h
FORMS += ui/app.ui ui/source.ui
SOURCES += src/appimpl.cpp src/main.cpp
RESOURCES += src/autorun.qrc
RC_FILE = src/autorun.rc