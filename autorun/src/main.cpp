#include <QApplication>
#include <QString>
#include "appimpl.h"

int main(int argc, char ** argv)
{
    QApplication app( argc, argv );
    QString args;
    QString lang = "en";

    for (int i = 1; i < argc; i++) {
        //the argument value
        args = QString(QApplication::arguments().at(i));

        if (args.length()==9)
        {
            if (args.mid(0,7) == "--lang=")
            {
                //If lang have a value like "--lang=en"
                lang = args.mid(7,9);
            }
        }
    }
    //Declare main window
    AppImpl win;
    //Set language for the interface
    win.lang=lang;
    //Translate interface
    win.retranslateUi();
    //Show main window
    win.show();    
    app.connect( &app, SIGNAL( lastWindowClosed() ), &app, SLOT( quit() ) );
    return app.exec();
}
