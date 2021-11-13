// cssfn:
import type {
    Dictionary,
}                           from '@cssfn/types'       // cssfn's types
import type {
    Cust,
}                           from '@cssfn/css-types'   // ts defs support for cssfn



// general types:
export type ReadonlyRefs <TProps extends {}> = { readonly [key in keyof TProps]: Cust.Ref  }
export type ReadonlyDecls<TProps extends {}> = { readonly [key in keyof TProps]: Cust.Decl }
export interface CssVarOptions {
    /**
     * The prefix name of the generated css vars.
     */
    prefix? : string
}
export interface CssVarSettings extends CssVarOptions {
    /**
     * The prefix name of the generated css vars.
     */
    prefix  : string
}
export type CssVar<TProps extends {}> = readonly [ReadonlyRefs<TProps>, ReadonlyDecls<TProps>, CssVarSettings]



// defaults:
const _defaultPrefix = 'fn';



// global proxy's handlers:
const unusedObj = {};
const settingsHandler: ProxyHandler<CssVarSettings> = {
    set : (settings, propName: string, newValue: any): boolean => {
        if (!(propName in settings)) return false; // the requested prop does not exist



        // apply the default value (if any):
        newValue = newValue ?? ((): any => {
            switch (propName) {
                case 'prefix' : return _defaultPrefix;
                default       : return newValue;
            } // switch
        })();
        
        
        
        // compare `oldValue` & `newValue`:
        const oldValue = (settings as any)[propName];
        if (oldValue === newValue) return true; // success but no change => no need to update



        // apply changes & update:
        (settings as any)[propName] = newValue;
        return true; // notify the operation was completed successfully
    },
};
const setReadonlyHandler = (obj: any, propName: string, newValue: any): boolean => {
    throw new Error(`Setter \`${propName}\` is not supported.`);
}



/**
 * Declares & retrieves *css variables* (css custom properties).
 */
const createCssVar = <TProps extends {}>(options?: CssVarOptions): CssVar<TProps> => {
    // settings:
    const settings: CssVarSettings = {
        ...options,

        prefix  : (options?.prefix ?? _defaultPrefix),
    };



    
    // data generates:

    /**
     * Gets the *declaration name* of the specified `propName`, eg: `--my-favColor`.
     * @param propName The prop name to retrieve.
     * @returns A `Cust.Decl` represents the declaration name of the specified `propName`.
     */
    const decl = (propName: string): Cust.Decl => {
        return settings.prefix ? `--${settings.prefix}-${propName}` : `--${propName}`; // add double dash with prefix `--prefix-` or double dash without prefix `--`
    }

    /**
     * Gets the *value* (reference) of the specified `propName`, not the *direct* value, eg: `var(--my-favColor)`.
     * @param propName The prop name to retrieve.
     * @returns A `Cust.Ref` represents the expression for retrieving the value of the specified `propName`.
     */
    const ref = (propName: string): Cust.Ref => {
        return `var(${decl(propName)})`;
    }



    return [
        // data proxies:
        new Proxy<Dictionary<Cust.Ref>>(unusedObj, {
            get : (_unusedObj, propName: string) => ref(propName),
            set : setReadonlyHandler,
        }) as ReadonlyRefs<TProps>,
        new Proxy<Dictionary<Cust.Decl>>(unusedObj, {
            get : (_unusedObj, propName: string) => decl(propName),
            set : setReadonlyHandler,
        }) as ReadonlyDecls<TProps>,

        
        
        // settings:
        new Proxy<CssVarSettings>(settings, settingsHandler),
    ];
}
export { createCssVar, createCssVar as default }



// utilities:
export const fallbacks = (first: Cust.Ref, ...next: Cust.Ref[]): Cust.Ref => {
    if (!next || !next.length) return first;



    const refs = [first, ...next];
    let totalClosingCount = 0;
    return (
        refs
        .map((ref, index) => {
            const closingCount = (ref.match(/\)+$/)?.[0]?.length ?? 0);
            totalClosingCount += closingCount;

            return (
                ref.substr(0, ref.length - closingCount)
                +
                ((index < (refs.length - 1)) ? ',' : '') // add a comma except the last one
            );
        })
        .join('')
        +
        (new Array(/*arrayLength: */totalClosingCount)).fill(')').join('')
    ) as Cust.Ref;
}
