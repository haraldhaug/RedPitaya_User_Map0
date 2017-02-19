
The files in this repository may be used for red pitaya development:
Change the FPGA code and try to exchange data between RedPitaya software and FPGA
This document describes changes to both the fpga code and to the red pitaya api.
This repositiory inludes the affected sources.

summary: 
This readme describes how I have used memory map "0" successfully!
There is a second readme that describes an unsuccessfull implementation of memory map "6".

System environment:
- PC with Linux Mint 18
- Red Pitaya STEMlab 125-10 

Background:
installed Xilinx Vivado 2016-4 on the PC
cloned the RedPitaya git repository to both the PC and to the RedPitaya
the RedPitaya is on my local LAN by ethernet switch
connect to the red pitaya by ssh: ssh root@rp-XXXXXX
where XXXXXX is the unique 6 digit ID of the RedPPitaya - you might also use IP address
edit text files on the RedPitaya: I use editor "nano" - I do not like "vi"
it is possible to copy text from the PC to the RedPitaya "nano" editor by right click on the terminal.
using scp for copying files to the RedPitaya will only work if you have write access to the destination
for write access connect by "ssh" and then type "rw" --- see also the redpitaya documentation on the web

FPGA code change:
-----------------
on the PC:
go to folder RedPitaya/fpga/prj  ---- the folder from the cloned git repository
copy the subfolder "v0.94" to a new folder, e.g. "rp_fpga_usr"
change file "rtl/red_pitaya_hk.v" 
- operate the LEDs at variable speed - controlled by the software
- blink patterns represented by a 1-character hex value - controlled by software
- manually on/off 1 LED controlled by software 
clear the “RedPitaya/fpga/prj/rp_fpga_usr/out” folder, if there is already a folder with any files
go to folder RedPitaya/fpga
open a terminal
call:
. /opt/Xilinx/Vivado/2016.4/settings64.sh
call:
make PRJ=rp_fpga_usr
--> this will take several minutes
--> I always get a fault message at the end --> important is that you get the *.bit file in the output folder
go to output folder RedPitaya/fpga/prj/rp_fpga_usr/out (still on the PC)
rename the "red_pitaya.bit" to e.g. rp_fpga_usr.bit 
--> i.e give a unique name to that bit file 
--> the name needs to be unique in @rp-XXXXXX:/opt/redpitaya/fpga/
copy the file to the RedPitaya:
scp rp_fpga_usr.bit  root@rp-XXXXXX:/opt/redpitaya/fpga/rp_fpga_usr.bit
--> you will not see any reaction on the LEDs, the new code has not yet been loaded to the FPGA


API library change:
-------------------
2 options: 
- compile the API on the PC - I did not do that
- compile the API on the RedPitaya -- you need to have cloned the RedPitaya git repository 
compilers are already available

assuming your git repository is on the /root/RedPitaya
changed the "housekeeping.h" file in the api/rpbase/scr folder
- add new uint32_t values to the control structure
I have changed the existing rp.c file
- added new interface functions
rp_usr_SetPattern(uint32_t newval)
rp_usr_SetPeriodTime(uint32_t newval)
I have added the same interface functions to api/include/redpitaya/rp.h
copy all 3 files to the RedPitaya
scp rp.c  root@rp-XXXXXX:/root/RedPitaya/api/rpbase/src/rp.c
now compile the api on the red pitaya
connect by ssh
cd /root/RedPitaya
make api
cd /opt/redpitaya/lib
cp /root/RedPitaya/build/lib/librp.so ./librp.so
----------------------------------------------------------------
ISSUE: do NOT copy the /root/RedPitaya/api/include/redpitaya/rp.h to the /opt/...
-----------------------------------------------------------------
the /opt/redpitaya/include/redpitaya/rp.h includes additional data structure compared to the 
/root/RedPitaya/api/include/redpitaya/rp.h
go to /opt/redpitaya/include/redpitaya
nano rp.h
manually add the 2 interface functions prototypes
rp_usr_SetPattern(uint32_t newval)
rp_usr_SetPeriodTime(uint32_t newval)

Example C-software
--------------------
I have reused one of the existing example c-files provided with the red pitaya git repository
go to the PC start a terminal
copy my example application to the red pitaya:
scp rp_usr.c  root@rp-XXXXXX:/root/RedPitaya/Examples/C/rp_usr.c
connect to the red pitaya by ssh
cd /root/RedPitaya/Examples/C
load the *.bit file to the fpga: 
cat /opt/redpitaya/fpga/rp_fpga_usr.bit > /dev/xdevcfg
--> the LED 0..3 should start blinking!
compile the example software:
make rp_usr
execute the example software (include library path, see redpitaya documentation):
LD_LIBRARY_PATH=/opt/redpitaya/lib ./rp_usr
you should see a reaction on the LEDs

web interface
-------------
my web interface is based on the 2.led example
the web interface shall
- provide a button that toggles led[7]
- provide a text input for a string represending a one character hex value --- the blink pattern for 4 LEDs 3..0
- provide a range input that shall adjust the blinking speed
copy my example web interface directory to the red pitaya
make sure that the fpga.conf file contains the correct name of the *.bit file.
compile the src/main.cpp file according to the red pitaya documentation
Please consider that the text input does not do an check on the input data. It is supposed to put there a hex value. If you put anything else then you might get surprising results.


