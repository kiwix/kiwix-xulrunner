#ifndef UI_SOURCE_H
#define UI_SOURCE_H

#include <QtCore/QVariant>
#include <QtGui/QAction>
#include <QtGui/QApplication>
#include <QtGui/QButtonGroup>
#include <QtGui/QDialog>
#include <QtGui/QHeaderView>
#include <QtGui/QLabel>
#include <QtGui/QPushButton>

QT_BEGIN_NAMESPACE

class Ui_App
{
public:
    QLabel *label_logo;
    QPushButton *pushButton_run;
    QPushButton *pushButton_install;
    QPushButton *pushButton_quit;
    QLabel *message2;
    QLabel *message1;

    void setupUi(QDialog *App)
    {
        if (App->objectName().isEmpty())
            App->setObjectName(QString::fromUtf8("App"));
        App->resize(296, 301);
        QIcon icon;
        icon.addFile(QString::fromUtf8(":/resource1/autorun.ico"), QSize(), QIcon::Normal, QIcon::Off);
        App->setWindowIcon(icon);
        App->setLayoutDirection(Qt::LeftToRight);
        App->setModal(true);

        label_logo = new QLabel(App);
        label_logo->setObjectName(QString::fromUtf8("label_logo"));
        label_logo->setGeometry(QRect(0, 0, 300, 200));
        label_logo->setPixmap(QPixmap(QString::fromUtf8(":/resource1/board_kiwix.png")));
        label_logo->setScaledContents(false);

        pushButton_run = new QPushButton(App);
        pushButton_run->setObjectName(QString::fromUtf8("pushButton_run"));
        pushButton_run->setGeometry(QRect(0, 210, 291, 27));
        pushButton_run->setLayoutDirection(Qt::LeftToRight);

        pushButton_install = new QPushButton(App);
        pushButton_install->setObjectName(QString::fromUtf8("pushButton_install"));
        pushButton_install->setGeometry(QRect(0, 240, 291, 27));
        pushButton_install->setLayoutDirection(Qt::LeftToRight);

        pushButton_quit = new QPushButton(App);
        pushButton_quit->setObjectName(QString::fromUtf8("pushButton_quit"));
        pushButton_quit->setGeometry(QRect(0, 270, 291, 27));
        pushButton_quit->setLayoutDirection(Qt::LeftToRight);

        message2 = new QLabel(App);
        message2->setObjectName(QString::fromUtf8("message2"));
        message2->setGeometry(QRect(10, 160, 291, 20));        
        QFont font;
        font.setPointSize(14);
        message2->setFont(font);
        message2->setAlignment(Qt::AlignCenter);

        message1 = new QLabel(App);
        message1->setObjectName(QString::fromUtf8("message1"));
        message1->setGeometry(QRect(0, 30, 291, 20));
        QFont font1;
        font1.setPointSize(11);
        message1->setFont(font1);
        message1->setAlignment(Qt::AlignRight|Qt::AlignTrailing|Qt::AlignVCenter);

        QMetaObject::connectSlotsByName(App);
    } // setupUi
};

namespace Ui {
    class App: public Ui_App {};
} // namespace Ui

QT_END_NAMESPACE

#endif // UI_SOURCE_H
