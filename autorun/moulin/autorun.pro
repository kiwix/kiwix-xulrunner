TEMPLATE = app
TARGET = 
DEPENDPATH += . build src ui
INCLUDEPATH += .

# Input
HEADERS += src/appimpl.h src/logo.h
FORMS += ui/app.ui ui/source.ui
SOURCES += src/appimpl.cpp src/main.cpp
RESOURCES += src/autorun.qrc
