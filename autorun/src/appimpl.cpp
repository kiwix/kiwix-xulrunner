#include <windows.h>
#include <QMessageBox>
#include <QString>
#include <sys\stat.h>
#include <QFile>
#include <QtXml>
#include "appimpl.h"

//SLOT and SIGNAL allocation
AppImpl::AppImpl( QWidget * parent, Qt::WFlags f) 
        : QDialog(parent, f)
{

	setupUi(this);        
        //Hide help button on windows title bar
        this->setWindowFlags(windowFlags() & ~Qt::WindowContextHelpButtonHint);

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
    QString msg = "Unknow Error";
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
    runapp("..\\kiwix\\kiwix.exe", SW_SHOWMAXIMIZED);
}
//Run the kiwix install on hard disk
void AppImpl::install()
{
    runapp("..\\install\\kiwix-install.exe", SW_SHOWNORMAL);
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
//Translate ui
void AppImpl::retranslateUi()
{
    QMap<QString, QString> ui_element = this->parseXML();
    //Label:launcher
    this->setWindowTitle(QApplication::translate("App", ui_element["windowTitle"].toUtf8().data(), 0, QApplication::UnicodeUTF8));
    this->label_logo->setText(QString());
    //Label:Launch from here
    this->pushButton_run->setText(QApplication::translate("App", ui_element["run"].toUtf8().data(), 0, QApplication::UnicodeUTF8));
    //Label:Install to your Hard Drive
    this->pushButton_install->setText(QApplication::translate("App", ui_element["install"].toUtf8().data(), 0, QApplication::UnicodeUTF8));
    //Label:Quit this menu
    this->pushButton_quit->setText(QApplication::translate("App", ui_element["quit"].toUtf8().data(), 0, QApplication::UnicodeUTF8));
    //Label:Wikipedia anywhere
    this->message2->setText(QApplication::translate("App", "Wikipedia anywhere", 0, QApplication::UnicodeUTF8));
    //Label:Multimedia offline reader
    this->message1->setText(QApplication::translate("App", "Multimedia offline reader", 0, QApplication::UnicodeUTF8));
} // retranslateUi

QMap<QString, QString> AppImpl::parseXML() {
    /* We'll parse the xml */
    QFile* file = new QFile("ui\\"+this->lang + ".xml");

    /* QDomDocument takes any QIODevice. as well as QString buffer*/
    QDomDocument doc("mylangdocument");

    doc.setContent(file);

    //Get the root element
    QDomElement docElem = doc.documentElement();

    // you could check the root tag name here if it matters
    QString rootTag = docElem.tagName();

    // get the node's interested in, this time only caring about lang
    QDomNodeList nodeList = docElem.elementsByTagName("lang");

    QMap<QString, QString> ui_element;

    // get the current one as QDomElement
    QDomElement el = nodeList.at(0).toElement();

    ui_element["code"] = el.attribute("code"); // get and set the attribute ID

    //get all data for the element, by looping through all child elements
    QDomNode uiEntries = el.firstChild();

    while(!uiEntries.isNull()) {
            QDomElement uiData = uiEntries.toElement();
            QString tagNam = uiData.tagName();

            if(tagNam == "layoutDirection") { /* We've found layoutDirection label. */
                            ui_element["layoutDirection"] = uiData.text();
            }else if(tagNam == "windowTitle") { /* We've found windowTitle label. */
                            ui_element["windowTitle"] = uiData.text();
            }else if(tagNam == "run") { /* We've found run label. */
                            ui_element["run"] = uiData.text();
            }else if(tagNam == "install") { /* We've found install label. */
                            ui_element["install"] = uiData.text();
            }else if(tagNam == "quit") { /* We've found quit label. */
                ui_element["quit"] = uiData.text();
            }

            uiEntries = uiEntries.nextSibling();
    }
    return ui_element;
}
