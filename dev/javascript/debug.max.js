const DEBUG = {

    enabled: false,

    modules: {
		INIT: true,
        GRID: true,
		SCROLL: false,
        DISPLAY: true,
        ON: true,
		FILEINFO: false,
        FILEMULTISELECTION: false,
        CALLBACK: true,
		DATAS: true,
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