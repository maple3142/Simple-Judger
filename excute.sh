#!/bin/bash
#excute a program in EasySandbox
echo $esb
LD_PRELOAD=$esb $1
