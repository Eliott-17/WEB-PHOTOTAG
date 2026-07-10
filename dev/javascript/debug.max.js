const DEBUG = {

    enabled: true,

    modules: {
        GRID: true,
        DISPLAY: true,
        ON: true,
		FILEINFO: true,
        FILEMULTISELECTION: true,
        CALLBACK: true
    },

    log(module, ...args) {

        if (!this.enabled) return;
        if (!this.modules[module]) return;

        console.log(`[${module}]`, ...args);

    },

    warn(module, ...args) {

        if (!this.enabled) return;
        if (!this.modules[module]) return;

        console.warn(`[${module}]`, ...args);

    },

    error(module, ...args) {

        if (!this.enabled) return;

        console.error(`[${module}]`, ...args);

    }

};