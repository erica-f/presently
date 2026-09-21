export function confirmExistence<T>(check: T) {
    if (check === undefined) {
        throw new Error('Undefined');
    }
    return check;
}