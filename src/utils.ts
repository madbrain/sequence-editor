
export interface Defer<T> {
    resolve: (T) => void;
    reject: () => void;
    promise: Promise<T>;
}

export function defer<T>(): Defer<T> {
    const deferred: any = {};
    const promise = new Promise<T>((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject  = reject;
    });
    deferred.promise = promise;
    return deferred;
}

export function makeMap<T>(l: Array<T>, idGetter: (T) => string): { [key: string]: T } {
    const result = {};
    l.forEach(e => {
        result[idGetter(e)] = e;
    });
    return result;
}