const DEBUG = {

    enabled: false,

    modules: {
        GRID: false,
		SCROLL: false,
        DISPLAY: false,
        ON: false,
		FILEINFO: false,
        FILEMULTISELECTION: false,
        CALLBACK: false,
		DATAS: false,
		UPLOAD: false,
		EXPLORE: false,
		SCROLLBAR: true
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