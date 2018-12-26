![alt text](https://raw.githubusercontent.com/Micky1979/Clover-Configurator-Pro/master/pict/CCP.png)


# Clover Configurator Pro [Download here](https://github.com/Micky1979/Clover-Configurator-Pro/blob/master/Updates/CCP_v2.0.0.zip?raw=true)

A full configurator for [Clover V2](https://sourceforge.net/p/cloverefiboot/code/HEAD/tree) bootloader.
Made with latest Swift 5, has its own parser (each entry will remains sorted as you leave it before closing the file).
All the code comes from me,  with the only exception of the handy Sparkle.framenwork to keep the app up-to date (and off course Clover), so that giving credit is pretty easy unlike my competitors that have the bad habit of silently include third party software in their application w/o mention them (use class-dump and take a look).
Run in macOS 10.11 +

p.s. (I use "competitors" word here to underline what I think my "competitors" think of me, but this app doesn't even have a donate button)

Why this name? Ok, "Clover" is an opensource bootloader,
whould say also that my name is among the Clover's credit (at boot time push the info button) because I wrote the MatchOS set of functions (and other minor things here and there in the build system), unlike my competitors.
"Configurator" is a common word,
"Pro" stand for "Professional" since this is a real Plist Editor like Xcode has or any other commercial app.... but this is totally free!

Seem strange anyway? Take a look  [here](http://www.insanelymac.com/forum/topic/322443-clover-configurator-loves-ares/).
...it seems that all this is continued, copying a lot of my ideas (also descriptions about any ha ha.. just they was in Pandora's Box):
Hey, but me too I'm able to copy LoL!  So now.. copy  this if you can!
(consider that [PXSourceList](https://github.com/Perspx/PXSourceList) is now 4 years old and cannot be used to write a plist editor.
Forgot that you should also give credit to the following (used class-dump):
[Alamofire](https://github.com/Alamofire/Alamofire),
[CNSplitView](https://github.com/phranck/CNSplitView),
[NoodleKit](https://github.com/MrNoodle/NoodleKit),
[DockProgressBar](https://github.com/hokein/DockProgressBar),
[NSTextView+JSDExtensions](https://github.com/dvanarkel/Clyde/blob/master/NSTextView%2BJSDExtensions.h),

I forgot something? where are their Copyright notice?? some infrigment? Ok understood, same story!
)



## Author
Micky1979

## Other
**Special thanks to the [Sparkle project](https://sparkle-project.org) that keeps Clover Configurator Pro.app up-to-date .**

**App icon by Mirone.**

## What is?
**Clover Configurator Pro is a professional Plist editor and is totally free!
True, but what if you don't want all the Clover facilities to show up? go to the Preferences and mark as active the following:
![alt text](https://raw.githubusercontent.com/Micky1979/Clover-Configurator-Pro/master/pict/beplisteditoronly.png)**

**from now on, Clover Configurator Pro is only a Plist Editor!**

## Editing the config.plist
Clover Configurator Pro can automatically load the config.plist used to boot the OS automatically, just ensure this option is enabled in the Preferences:
![alt text](https://raw.githubusercontent.com/Micky1979/Clover-Configurator-Pro/master/pict/trytoloadconfig.png)

What if you want to load another one? Simple, open the "Clover Manager" under the "View" menu:
![alt text](https://raw.githubusercontent.com/Micky1979/Clover-Configurator-Pro/master/pict/selectConfig.png)

right click on the desired disk and choose one (boot partition is green colored on dark appearance, red otherwise). The partition must be mounted.
Or if the file is elsewhere just drag it to the applications icon, or right clik on the file you want to open.

How to edit something for Clover? Well, that is the easy part, just right click with the mouse over any entry of the config.plist:

![alt text](https://raw.githubusercontent.com/Micky1979/Clover-Configurator-Pro/master/pict/editexitingSMBIOS1.png)
![alt text](https://raw.githubusercontent.com/Micky1979/Clover-Configurator-Pro/master/pict/editexitingSMBIOS2.png)

if a key does not yet exist or your is a new empty document just right click on the root
![alt text](https://raw.githubusercontent.com/Micky1979/Clover-Configurator-Pro/master/pict/rightclickroot.png)

## Installing Clover
Depending on what's on your Preferences, you have two way:

**1 - Download a precompiled binaries (default).**

**2 - Use Clover source code by specifying the path to the src folder (~/src by default) and mark as active the relative option in the Preferences.**

Open the "Clover Manager" under the "View" menu:

![alt text](https://raw.githubusercontent.com/Micky1979/Clover-Configurator-Pro/master/pict/CloverInstaller1.png)

![alt text](https://raw.githubusercontent.com/Micky1979/Clover-Configurator-Pro/master/pict/CloverInstaller2.png)

## Clover is out of date?
Clover Configurator Pro keeps Build_Clover.command always up to date and you can use it to download and build
always the latest Clover revision available. To do that take a look at the "Build_Clover" menu.
Mind that Xcode must be installed and its clt selected.

## Wants some info about your disks or partitions?
**The Clover Manager is expandable:**

![alt text](https://raw.githubusercontent.com/Micky1979/Clover-Configurator-Pro/master/pict/CloverManagerExpanded.png)

**all the info you wants are there. You can also apply filters for slices (partitions), mounted or ESPs if you have more than one.**

## Additions
Under the view menu you will find confortable having a text to data encoder/decoder, a hex to base64 encoder/decoder
The boot-log viewer and the NVRAM editor
The NVRAM editor is cool and can help you editing or understand your NVRAM in a clear way.

## Clover Configurator Pro has a Dark appearance?
Did not like it? Go to the Preferences and disable "Start in dark mode. Applied on next run.", restart the app, and everything will be different:

![alt text](https://raw.githubusercontent.com/Micky1979/Clover-Configurator-Pro/master/pict/vibrantLight.png)


## How to translate
**Clover Configurator Pro is multi language :
actually Italian and English are available at 100%, Portoguese is at 90% (thanks to Mirone),
but you can translate it easily by making a copy of Base.strings into your locale identifier suggested directly by Clover Configurator Pro in the upper right corner of the Preferences:**
![alt text](https://raw.githubusercontent.com/Micky1979/Clover-Configurator-Pro/master/pict/localeid.png)

**You can find localization files at this dedicated  repository [here](https://github.com/Micky1979/CCP-Locale-Bundle),**
**Fork it edit the file, or as I said make a new one naming it as CCP suggested you.
Open a pull request at the [CCP-Locale-Bundle](https://github.com/Micky1979/CCP-Locale-Bundle)  repository with the translated file, so that We can keep track of changes**

## TODO
**adding more functionalities after a good debugging.**

## Troubleshooting
**For any possible bug open an issue here on github, I'll be happy to solve it**

