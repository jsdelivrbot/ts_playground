
import 'isomorphic-fetch';

export type CoinType =
    'BTC' |
    'BCH' |
    'LTC' |
    'ETH' |
    'ETC' |
    'DASH' |
    'XRP' |
    'QTUM' |
    'EOS' |
    'ZEC' |
    'XMR' |
    'ALL';

export const COINS: CoinType[] = [
    'BTC',
    'BCH',
    'LTC',
    'ETH',
    'ETC',
    'DASH',
    'XRP',
    'QTUM',
    'EOS',
    'ZEC',
    'XMR',
];

export type OrderType = 'BUY' | 'SELL';

export type CurrencyType = 'KRW' | 'USD';

export function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    return fetch(url, options)
        // .then((response) => {
        //     console.log(response);
        //     return response;
        // })
        .then((response) => response.text())
        .then(JSON.parse);
}

export function formatMoney(n, c?, d?, t?) {
    c = isNaN(c = Math.abs(c)) ? 2 : c;
    d = d === undefined ? '.' : d;
    t = t === undefined ? ',' : t;
    let s = n < 0 ? '-' : '',
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
        j;
    j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - parseInt(i)).toFixed(c).slice(2) : '');
}

export function parseMoney(str: string) {
    const ret = parseInt(str.replace(/\D/g, ''));
    // console.log('parseMoney', str, ret);
    return ret;
}

export function returnRatio(buy: number, sell: number) {
    return (sell - buy) / buy;
}

export function ratio(from: number, to: number) {
    return (from - to) / from;
}

export function queryToStr(query) {
    let ret = [];
    for (const key in query) {
        const value = query[key];
        const type = typeof value;
        if (type === 'string' || type === 'number') {
            ret.push(key + '=' + encodeURIComponent(query[key]));
        } else if (value instanceof Array) {
            value.forEach((v) => ret.push(key + '=' + encodeURIComponent(v)));
        }
    }
    return ret.join('&');
}

export interface TickerItem {
    date?: number;
    open: number;
    close: number;
    low: number;
    hight: number;
    qty: number;
}

export type TickerItemMap = {
    [coin in CoinType]: TickerItem;
};

export interface TransactionItem {
    date: number;
    order: OrderType;
    coin: CoinType;
    unit: number;
    qty: number;
    charge: number;
}

export function getExpense(item: TransactionItem) {
    return item.unit * item.qty * (1 + item.charge);
}

export function getIncome(item: TransactionItem) {
    return item.unit * item.qty * (1 - item.charge);
}

export interface OrderItem {
    id: OrderItem.ID;
    date: number;
    order: OrderType;
    coin: CoinType;
    unit: number;
    qty: number;
}

export namespace OrderItem {
    export type ID = string;
}
