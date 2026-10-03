#ifndef XBOXBLOCKS_RUNTIME_H
#define XBOXBLOCKS_RUNTIME_H

#include <stdio.h>
#include <string.h>
#include <xenos/xenos.h>
#include <xb360/xb360.h>

static inline void xb_init(void) {
    xenos_init(VIDEO_MODE_AUTO);
    printf("\nXbox 360 Blockly runtime\n");
    printf("Xenos ID: %04X\n", (unsigned)xenon_get_XenosID());
    printf("CPU PVR: %08X\n", (unsigned)xenon_get_CPU_PVR());
    printf("RAM: %u MB\n", (unsigned)(xenon_get_ram_size() / (1024 * 1024)));
}

static inline void xb_clear(void) {
    printf("[XB] clear screen\n");
}

static inline void xb_draw_rect(int x, int y, int w, int h) {
    printf("[XB] rect %d %d %d %d\n", x, y, w, h);
}

static inline void xb_set_bg(int r, int g, int b) {
    printf("[XB] background rgb(%d,%d,%d)\n", r, g, b);
}

static inline int xb_button_pressed(const char *button) {
    (void)button;
    return 0;
}

static inline void xb_vibrate(int percent) {
    (void)percent;
}

static inline void xb_wait_ms(int ms) {
    volatile unsigned long n;
    if (ms <= 0) return;
    n = (unsigned long)ms * 5000UL;
    while (n--) {}
}

static inline unsigned int xb_console_info(const char *info) {
    if (!strcmp(info, "CPU")) return xenon_get_CPU_PVR();
    if (!strcmp(info, "GPU")) return xenon_get_XenosID();
    if (!strcmp(info, "MOTHERBOARD")) return (unsigned) xenon_get_console_type();
    if (!strcmp(info, "DVE")) return xenon_get_DVE();
    if (!strcmp(info, "PCI_REV")) return xenon_get_PCIBridgeRevisionID();
    if (!strcmp(info, "RAM")) return xenon_get_ram_size();
    return 0;
}

/* Returns a console serial without exposing CPU/DVD keys. */
static inline const char *xb_console_serial(void) {
    static char serial[13];
    unsigned char raw[12];
    int i;
    memset(serial, 0, sizeof(serial));
    memset(raw, 0, sizeof(raw));
    if (kv_get_cserial(raw) != 0) return "unavailable";
    for (i = 0; i < 12; ++i) {
        serial[i] = (raw[i] >= 32 && raw[i] <= 126) ? (char)raw[i] : '?';
    }
    serial[12] = '\0';
    return serial;
}

#endif
