.SUFFIXES:
ifeq ($(strip $(DEVKITXENON)),)
$(error DEVKITXENON is not set. Install/configure the Free60 libXenon toolchain first.)
endif
include $(DEVKITXENON)/rules
TARGET := xboxblocks_game
BUILD := build
SOURCES := source
INCLUDES :=
CFLAGS := -O2 -Wall -Wextra -ffunction-sections -fdata-sections $(MACHDEP) $(INCLUDE)
LDFLAGS := -g $(MACHDEP) -Wl,--gc-sections
LIBS := -lxenon -lm
ifneq ($(BUILD),$(notdir $(CURDIR)))
export OUTPUT := $(CURDIR)/$(TARGET)
export VPATH := $(CURDIR)/$(SOURCES)
export DEPSDIR := $(CURDIR)/$(BUILD)
CFILES := $(notdir $(wildcard $(SOURCES)/*.c))
export OFILES := $(CFILES:.c=.o)
export INCLUDE := $(foreach dir,$(INCLUDES),-I$(CURDIR)/$(dir)) -I$(CURDIR)/$(BUILD) -I$(LIBXENON_INC)
export LIBPATHS := $(foreach dir,$(LIBDIRS),-L$(dir)/lib) -L$(LIBXENON_LIB)
.PHONY: all $(BUILD) clean
all: $(BUILD)
$(BUILD):
	@mkdir -p $@
	@$(MAKE) --no-print-directory -C $@ -f $(CURDIR)/Makefile
clean:
	@rm -rf $(BUILD) $(TARGET).elf $(TARGET).elf32
else
.PHONY: all
all: $(OUTPUT).elf32
$(OUTPUT).elf32: $(OUTPUT).elf
	@cp $< $@
$(OUTPUT).elf: $(OFILES)
	@$(LD) $(LDFLAGS) $(OFILES) $(LIBPATHS) $(LIBS) -o $@
%.o: %.c
	@mkdir -p $(DEPSDIR)
	@$(CC) -MMD -MP -MF $(DEPSDIR)/$*.d $(CFLAGS) -c $< -o $@
-include $(OFILES:.o=.d)
endif
