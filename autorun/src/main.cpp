#include <QApplication>
#include "appimpl.h"

int main(int argc, char ** argv)
{
	QApplication app( argc, argv );
	AppImpl win;
	win.show(); 
	app.connect( &app, SIGNAL( lastWindowClosed() ), &app, SLOT( quit() ) );
	return app.exec();
}
