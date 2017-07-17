#!/bin/bash
#excute a program in EasySandbox
esb=$(echo "./esb/EasySandbox.so" | xargs realpath)
LD_PRELOAD=$esb $1
