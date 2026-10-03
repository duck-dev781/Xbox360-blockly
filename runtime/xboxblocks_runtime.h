#ifndef XBOXBLOCKS_RUNTIME_H
#define XBOXBLOCKS_RUNTIME_H
#include <stdio.h>
#include <string.h>
#include <xenos/xenos.h>
#include <console/console.h>
static inline void xb_init(void){xenos_init(VIDEO_MODE_AUTO);console_init();printf("Xbox 360 Blockly\n");}
static inline void xb_clear(void){printf("[XB] clear\n");}
static inline void xb_draw_rect(int x,int y,int w,int h){printf("[XB] rect %d %d %d %d\n",x,y,w,h);}
static inline void xb_set_bg(int r,int g,int b){printf("[XB] bg %d %d %d\n",r,g,b);}
static inline int xb_button_pressed(const char*b){(void)b;return 0;}
static inline void xb_vibrate(int v){(void)v;}
static inline void xb_wait_ms(int ms){volatile unsigned long n=(unsigned long)ms*5000UL;while(n--);}
static inline int xb_console_info(const char*i){if(!strcmp(i,"MOTHERBOARD"))return xenon_get_console_type();return 0;}
#endif