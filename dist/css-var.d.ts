import type { Cust } from '@cssfn/css-types';
export declare type ReadonlyRefs<TProps extends {}> = {
    readonly [key in keyof TProps]: Cust.Ref;
};
export declare type ReadonlyDecls<TProps extends {}> = {
    readonly [key in keyof TProps]: Cust.Decl;
};
export interface CssVarOptions {
    /**
     * The prefix name of the generated css vars.
     */
    prefix?: string;
}
export interface CssVarSettings extends CssVarOptions {
    /**
     * The prefix name of the generated css vars.
     */
    prefix: string;
}
export declare type CssVar<TProps extends {}> = readonly [ReadonlyRefs<TProps>, ReadonlyDecls<TProps>, CssVarSettings];
/**
 * Declares & retrieves *css variables* (css custom properties).
 */
declare const createCssVar: <TProps extends {}>(options?: CssVarOptions | undefined) => CssVar<TProps>;
export { createCssVar, createCssVar as default };
export declare const fallbacks: (first: Cust.Ref, ...next: Cust.Ref[]) => Cust.Ref;
