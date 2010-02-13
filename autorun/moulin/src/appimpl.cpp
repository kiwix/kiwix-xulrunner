#include <windows.h>
#include "appimpl.h"

//
AppImpl::AppImpl( QWidget * parent, Qt::WFlags f) 
	: QDialog(parent, f)
{
	setupUi(this);
	connect( pushButton_run, SIGNAL( clicked() ), this, SLOT( launch() ) );
	connect( pushButton_install, SIGNAL( clicked() ), this, SLOT( install() ) );
	//connect( pushButton_clean, SIGNAL( clicked() ), this, SLOT( clean() ) );
	connect( pushButton_quit, SIGNAL( clicked() ), this, SLOT( quit() ) );
}
//
void AppImpl::launch()
{
	WinExec("..\\moulin\\moulin.exe", SW_SHOWMAXIMIZED);
	this->close();
}

void AppImpl::install()
{
	WinExec("..\\installer\\moulin-setup.exe", SW_SHOWNORMAL);
	this->close();
}

void AppImpl::clean()
{
	WinExec("..\\installer\\moulin-clean.exe", SW_SHOWNORMAL);
	this->close();
}

void AppImpl::quit()
{
	this->close();
}
