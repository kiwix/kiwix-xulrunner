#ifndef APPIMPL_H
#define APPIMPL_H
//
#include "ui_app.h"
//
class AppImpl : public QDialog, public Ui::App
{
Q_OBJECT
public:
	AppImpl( QWidget * parent = 0, Qt::WFlags f = 0 );
public slots:
	void launch();
	void install();
	void clean();
	void quit();
private slots:
};
#endif




