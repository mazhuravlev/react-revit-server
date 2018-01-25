export function mean(arg) {
    return arg.reduce((a, c) => a + c, 0) / arg.length;
}