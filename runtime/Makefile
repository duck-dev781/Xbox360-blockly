ifeq ($(strip $(DEVKITXENON)),)
$(error DEVKITXENON is not set)
endif
include $(DEVKITXENON)/rules
TARGET:=xboxblocks_game
BUILD:=build
SOURCES:=source
CFLAGS=-O2 -Wall $(MACHDEP) $(INCLUDE)
LDFLAGS=-g $(MACHDEP) -Wl,--gc-sections
LIBS:=-lxenon -lm
INCLUDES:=
ifneq ($(BUILD),$(notdir $(CURDIR)))
export OUTPUT:=$(CURDIR)/$(TARGET)
export VPATH:=$(CURDIR)/$(SOURCES)
export DEPSDIR:=$(CURDIR)/$(BUILD)
CFILES:=$(notdir $(wildcard $(SOURCES)/*.c))
export OFILES:=$(CFILES:.c=.o)
export INCLUDE:=$(foreach dir,$(INCLUDES),-I$(CURDIR)/$(dir)) -I$(CURDIR)/$(BUILD) -I$(LIBXENON_INC)
export LIBPATHS:=$(foreach dir,$(LIBDIRS),-L$(dir)/lib) -L$(LIBXENON_LIB)
.PHONY: $(BUILD) clean
$(BUILD):
	@mkdir -p $@
	@make --no-print-directory -C $(BUILD) -f $(CURDIR)/Makefile
clean:
	@rm -rf $(BUILD) $(OUTPUT).elf $(OUTPUT).elf32
else
DEPENDS:=$(OFILES:.o=.d)
$(OUTPUT).elf32: $(OUTPUT).elf
$(OUTPUT).elf: $(OFILES)
-include $(DEPENDS)
endif
