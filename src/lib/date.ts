export function timestampToString(timestamp: string): string {
    const d = new Date(parseInt(timestamp));
    return d.getUTCFullYear()+'-'
        + pad(d.getUTCMonth()+1)+'-'
        + pad(d.getUTCDate());
}

export function stringToTimestamp(date: string): string {
    const d = new Date(date);
    return d.getTime().toString();
}

function pad(n: number) {
    return n<10 ? '0'+n : n;
}
