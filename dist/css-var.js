"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fallbacks = exports.default = exports.createCssVar = exports.config = void 0;
// configs:
exports.config = {
    defaultPrefix: '',
    defaultMinify: true,
};
// global proxy's handlers:
const unusedObj = {};
const settingsHandler = {
    set: (settings, propName, newValue) => {
        if (!(propName in settings))
            return false; // the requested prop does not exist
        // apply the default value (if any):
        newValue = newValue ?? (() => {
            switch (propName) {
                case 'prefix': return exports.config.defaultPrefix;
                case 'minify': return exports.config.defaultMinify;
                default: return newValue;
            } // switch
        })();
        // compare `oldValue` & `newValue`:
        const oldValue = settings[propName];
        if (oldValue === newValue)
            return true; // success but no change => no need to update
        // apply changes & update:
        settings[propName] = newValue;
        return true; // notify the operation was completed successfully
    },
};
const setReadonlyHandler = (obj, propName, newValue) => {
    throw new Error(`Setter \`${propName}\` is not supported.`);
};
let globalIdCounter = 0;
/**
 * Declares & retrieves *css variables* (css custom properties).
 */
const createCssVar = (options) => {
    // settings:
    const settings = {
        ...options,
        prefix: (options?.prefix ?? exports.config.defaultPrefix),
        minify: (options?.minify ?? exports.config.defaultMinify),
    };
    // data generates:
    const idMap = {};
    /**
     * Gets the *declaration name* of the specified `propName`, eg: `--my-favColor`.
     * @param propName The prop name to retrieve.
     * @returns A `Cust.Decl` represents the declaration name of the specified `propName`.
     */
    const decl = (propName) => {
        let id = idMap[propName];
        if (id === undefined) {
            idMap[propName] = id = (++globalIdCounter);
        } // if
        const name = settings.minify ? 'v' : `${propName}-`;
        return settings.prefix ? `--${settings.prefix}-${name}${id}` : `--${name}${id}`; // add double dash with prefix `--prefix-` or double dash without prefix `--`
    };
    /**
     * Gets the *value* (reference) of the specified `propName`, not the *direct* value, eg: `var(--my-favColor)`.
     * @param propName The prop name to retrieve.
     * @returns A `Cust.Ref` represents the expression for retrieving the value of the specified `propName`.
     */
    const ref = (propName) => {
        return `var(${decl(propName)})`;
    };
    return [
        // data proxies:
        new Proxy(unusedObj, {
            get: (_unusedObj, propName) => ref(propName),
            set: setReadonlyHandler,
        }),
        new Proxy(unusedObj, {
            get: (_unusedObj, propName) => decl(propName),
            set: setReadonlyHandler,
        }),
        // settings:
        new Proxy(settings, settingsHandler),
    ];
};
exports.createCssVar = createCssVar;
exports.default = createCssVar;
// utilities:
const fallbacks = (first, ...next) => {
    if (!next || !next.length)
        return first;
    const refs = [first, ...next];
    let totalClosingCount = 0;
    return (refs
        .map((ref, index) => {
        const closingCount = (ref.match(/\)+$/)?.[0]?.length ?? 0);
        totalClosingCount += closingCount;
        return (ref.substr(0, ref.length - closingCount)
            +
                ((index < (refs.length - 1)) ? ',' : '') // add a comma except the last one
        );
    })
        .join('')
        +
            (new Array(/*arrayLength: */ totalClosingCount)).fill(')').join(''));
};
exports.fallbacks = fallbacks;
