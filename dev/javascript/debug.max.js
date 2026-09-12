const DEBUG = {

    enabled: false,

    modules: {
        GRID: true,
		SCROLL: false,
        DISPLAY: false,
        ON: false,
		FILEINFO: true,
        FILEMULTISELECTION: true,
        CALLBACK: true,
		GRID_DATAS: false,
		UPLOAD: true,
		EXPLORE: true,
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

window.DEBUG_enable = function()
{
    DEBUG.enabled = true;
};

window.DEBUG_disable = function()
{
    DEBUG.enabled = false;
};