#!/bin/sh

blue=[1m[4m
bold=[1m
reset=[0m
echo $blue 
echo
echo \ \ \ \ \ Kiwix 0.5 - Linux installer\ \ \ \ \ 
echo $reset

if [ -f /media/cdrom/xulrunner-linux/xulrunner ]; then
 cdpath=/media/cdrom
elif [ -f /mnt/cdrom/xulrunner-linux/xulrunner ]; then
 cdpath=/mnt/cdrom
elif [ -f /mnt/dvd/xulrunner-linux/xulrunner ]; then
 cdpath=/mnt/dvd
elif [ -f /media/dvd/xulrunner-linux/xulrunner ]; then
 cdpath=/media/dvd
else
 echo Please enter the path to your dvd [/media/cdrom] :
 read cdpath
 if [ -z cdpath ]; then
  cdpath=/media/cdrom
 fi
fi

if [ ! -f $cdpath/xulrunner-linux/xulrunner ]; then
  echo Error : I cannot find the dvd
  echo \<press any key to exit\>
  read dummy
  exit 1
else 
  echo Ok, found your dvd at $bold$cdpath$reset
fi

choice=3
while [ $choice != 1 -a $choice != 2 ]; do
 echo Please select an option :
 echo  1 - Copy the whole dvd on your hard disk : about 700 Mo \(then you don\'t need the dvd\)
 echo  2 - Copy the minimum files needed : about 26 Mo \(then you have to insert the dvd each time you start wikipedia\)
 echo Your choice : 
 read choice
done

dest=$HOME/kiwix-0.5
if [ ! -d $dest ]; then
 mkdir $dest
else
 echo Directory $bold$dest$reset already exists !
 echo Are you sure you want to delete all it\'s content ? [y/N]
 read ans
 if [ $ans = 'y' ]; then
   rm -R $dest
   mkdir $dest
 else
   exit 0
 fi
fi
cp -R $cdpath/xulrunner-linux $dest
cp $cdpath/application.ini $dest
cp -R $cdpath/chrome $dest
cp -R $cdpath/components $dest
cp -R $cdpath/defaults $dest
cp $cdpath/kiwix.sh $dest
cp $cdpath/wiki.png $dest
if [ $choice -eq 1 ]; then
 if [ -d $dest/html ]; then
   rm $dest/html
 fi
 cp -R $cdpath/html $dest
 chmod -R +w $dest/html
fi
if [ $choice -eq 2 ]; then
 ln -s $cdpath/html $dest/html
fi
chmod -R +w $dest

echo Kiwix is now installed in $bold$dest$reset
if [ -d $HOME/Desktop ]; then
 echo '[Desktop Entry]' > $HOME/Desktop/kiwix.desktop
 echo 'Encoding=UTF-8' >> $HOME/Desktop/kiwix.desktop
 echo 'Version=0.5' >> $HOME/Desktop/kiwix.desktop
 echo 'Type=Application' >> $HOME/Desktop/kiwix.desktop
 echo 'Name=Kiwix' >> $HOME/Desktop/kiwix.desktop
 echo 'Comment=Wikipedia, the free encyclopedia' >> $HOME/Desktop/kiwix.desktop
 echo "Exec=$HOME/kiwix-0.5/xulrunner-linux/xulrunner $HOME/kiwix-0.5/application.ini" >> $HOME/Desktop/kiwix.desktop
 echo "Icon=$HOME/kiwix-0.5/wiki.png" >> $HOME/Desktop/kiwix.desktop
 echo 'Categories=GNOME;GTK;Application;Accesories' >> $HOME/Desktop/kiwix.desktop
 echo ----- I have placed a shortcut on your desktop -----
fi
 echo ----- To launch kiwix : $bold~/kiwix-0.5/kiwix.sh$reset ------
echo \<press any key to exit\>
read dummy
