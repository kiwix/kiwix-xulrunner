#include <windows.h>
#include <QMessageBox>
#include <sys\stat.h>
#include "appimpl.h"

//SLOT and SIGNAL allocation
AppImpl::AppImpl( QWidget * parent, Qt::WFlags f) 
	: QDialog(parent, f)
{
	setupUi(this);
        connect( pushButton_run, SIGNAL( clicked() ),
                 this, SLOT( launch() ) );
        connect( pushButton_install, SIGNAL( clicked() ),
                 this, SLOT( install() ) );
	//connect( pushButton_clean, SIGNAL( clicked() ), this, SLOT( clean() ) );
        connect( pushButton_quit, SIGNAL( clicked() ),
                 this, SLOT( quit() ) );
}
//Verify if the file exist
bool AppImpl::filexist(const char *filename)
{
    struct stat info;
    int ret = -1;

    ret = stat(filename, &info);

    if(ret == 0)
      return true;
    else
      return false;
}
//Show a error message
void AppImpl::msgerror(int coderror)
{
    char *msg;
    switch(coderror)
    {

    case 001: msg = "Error 001. File not found, ensure that the kiwix application file is in the current directory.";
    break;

    }
    QMessageBox::critical(0,"Error",   msg);
}
//Run a button opcion
void AppImpl::runapp(const char *filename,int windowsmodal)
{
    if (this->filexist(filename))
    {
        WinExec(filename, windowsmodal);
        this->close();
    }
    else
    {
        this->msgerror(001);
    }
}
//Launch kiwix
void AppImpl::launch()
{
    runapp("kiwix.exe", SW_SHOWMAXIMIZED);
}
//Run the kiwix install on hard disk
void AppImpl::install()
{
    runapp("kiwix-setup.exe", SW_SHOWNORMAL);
}
//
void AppImpl::clean()
{
    runapp("kiwix-clean.exe", SW_SHOWNORMAL);
}
//Exit autorun
void AppImpl::quit()
{
	this->close();
}
