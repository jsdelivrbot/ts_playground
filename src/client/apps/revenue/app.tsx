
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);
import * as React from 'react';
import * as ReactDom from 'react-dom';
// import {HashRouter} from 'react-router-dom';
import {CoinType, returnRatio} from './common';
import {getExpense, getIncome} from './transation';
import {getTicker, TickerResp, saveTransactions, getTransactionItems, initTickerWS, WSTicker} from './bithumb';
import {GridTransaction, TransactionRowItem} from './gridtrans';
import {GridRevenue, RevenueRowItem} from './gridrevenue';

import './style.scss';

const QTY_PRECISION_HELPER = 100000000;

(async function () {


    // const bithumbBTC = await getUserTransactions();
    // localStorage.setItem('bithumb_transactions', JSON.stringify(bithumbBTC));

    // const bithumbBTC = JSON.parse(localStorage.getItem('bithumb_transactions')) as UserTransaction[];

    // const transactions = bithumbBTC
    //     .filter(t => t.search === '1' || t.search === '2')
    //     .map(t => {
    //         const ret: TransactionItem = {
    //             date: parseInt(t.transfer_date) / 1000,
    //             order: t.search === '1' ? 'BUY' : 'SELL',
    //             type: 'BTC',
    //             unit: parseInt(t.btc1krw),
    //             qty: Math.abs(parseFloat(t.units.slice(2))),
    //             charge: 0,
    //         };
    //         return ret;
    //     })
    //     .sort((a, b) => b.date - a.date);

    const transactions = getTransactionItems();
    // const transactions = getData();
    console.log(transactions);

    const transactionRowItems: TransactionRowItem[] = [];

    interface SumTotal {
        qty: number;
        expenses: number;
        accExpenses: number;
        incomes: number;
    }

    const sums: {[type in CoinType]?: SumTotal} = {};
    const prevAvgUnit = 0;
    transactions.forEach(function(t, i) {
        let price = 0;
        let ret = 0;
        let retRatio = 0;

        if (!sums[t.type]) {
            sums[t.type] = {
                qty: 0,
                expenses: 0,
                accExpenses: 0,
                incomes: 0,
            };
        }
        const sum = sums[t.type];
        // const prevTotal = prevAvgUnit * (sum.expensesQty - sum.incomesQty);
        if (t.order === 'BUY') {
            price = getExpense(t);
            sum.qty = Math.round(sum.qty * QTY_PRECISION_HELPER + t.qty * QTY_PRECISION_HELPER) / QTY_PRECISION_HELPER;
            sum.expenses += price;
            sum.accExpenses += price;
        } else if (t.order === 'SELL') {
            price = getIncome(t);
            const accExpense = (sum.accExpenses / sum.qty) * t.qty;
            sum.accExpenses -= accExpense;
            sum.qty = Math.round(sum.qty * QTY_PRECISION_HELPER - t.qty * QTY_PRECISION_HELPER) / QTY_PRECISION_HELPER;
            sum.incomes += price;
            ret = price - accExpense;
            retRatio = (ret) / accExpense;
        }

        // const avgUnit = sum.expenses / (sum.expensesQty - sum.incomesQty);
        transactionRowItems.push({
            ...t,
            price,
            accQty: sum.qty,
            accExpenses: sum.accExpenses,
            return: ret,
            returnRatio: retRatio,
        });

    });

    const types = Array.from(new Set(transactions.map(d => d.type)));

    console.log('types', types);

    interface TickerItem {
        type: CoinType;
        ticker: TickerResp;
    }

    class Component extends React.Component<{}, {
        filter: string;
        tickerItems: TickerItem[];
        tickerId: number;
        wsTicker: WSTicker;
    }> {

        constructor(props) {
            super(props);
            this.state = {
                filter: 'ALL',
                tickerItems: [],
                tickerId: null,
                wsTicker: null,
            };
        }

        render() {
            const {
                filter,
                tickerItems,
                tickerId,
                wsTicker,
            } = this.state;
            const revenueItems: RevenueRowItem[] = [];
            let sum_sell_price = 0;
            let sum_buy_price = 0;
            let sumReturn = 0;

            if (wsTicker) {
                console.log(wsTicker.data);
                types.forEach(type => {
                    const ticker = wsTicker.data[type];
                    if (!ticker) {
                        console.error(type, 'has no ticker');
                        return;
                    }
                    const sum = sums[type];
                    const currentUnit = parseInt(ticker.closing_price);
                    const qty = sum.qty;
                    const sell_price = currentUnit * qty * (1 - 0.00075);
                    const buy_price = sum.accExpenses;
                    const ret = sell_price - buy_price;
                    sum_sell_price += sell_price;
                    sum_buy_price += buy_price;
                    sumReturn += ret;
                    revenueItems.push({
                        type: type,
                        currentUnit,
                        avgUnit: sum.accExpenses / qty,
                        qty: qty,
                        return: ret,
                        ratio: returnRatio(buy_price, sell_price),
                    });
                });
            }

            // tickerItems.forEach((item) => {
            //     const sum = sums[item.type];
            //     const currentUnit = parseInt(item.ticker.data.closing_price);
            //     const qty = sum.qty;
            //     const sell_price = currentUnit * qty * (1 - 0.00075);
            //     const buy_price = sum.accExpenses;
            //     const ret = sell_price - buy_price;
            //     sum_sell_price += sell_price;
            //     sum_buy_price += buy_price;
            //     sumReturn += ret;
            //     revenueItems.push({
            //         type: item.type,
            //         currentUnit,
            //         avgUnit: sum.accExpenses / qty,
            //         qty: qty,
            //         return: ret,
            //         ratio: returnRatio(buy_price, sell_price),
            //     });
            // });
            revenueItems.push({
                type: 'ALL',
                currentUnit: 0,
                avgUnit: 0,
                qty: 0,
                return: sumReturn,
                ratio: returnRatio(sum_buy_price, sum_sell_price),
            });
            console.log(revenueItems);
            return (
                <div>
                    <div className='ticker-control'>
                        <button onClick={() => {
                            if (tickerId) {
                                this.stopTikcer();
                            } else {
                                this.getTicker(true);
                            }
                        }}>{tickerId ? 'Stop' : 'Auto'}</button>
                    </div>
                    <GridRevenue
                        getter={(index) => revenueItems[index]}
                        count={revenueItems.length}
                    />
                    <GridTransaction
                        transactions={transactionRowItems.filter(item => filter === 'ALL' || item.type === filter)}
                    />
                    <div className='controls'>
                        <button onClick={() => saveTransactions()}>Update</button>
                        <select className='right' name='' id='' value={filter} onChange={(e) => this.setState({filter: e.target.value})}>
                            <option value='ALL'>ALL</option>
                            {types.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            );
        }

        private getTicker(cont = false) {
            const tickerId = getTicker(types, cont, (tickers) => {
                const tickerItems = types.map((type, i) => ({type, ticker: tickers[i]}));
                this.setState({tickerItems});
            });
            this.setState({tickerId});
        }

        private stopTikcer() {
            clearInterval(this.state.tickerId);
            this.setState({tickerId: null});
        }

        async componentDidMount() {
            // this.getTicker();
            initTickerWS((wsTicker) => this.setState({wsTicker}));
        }
    }

    ReactDom.render(<Component/>, document.getElementById('react-app'));

}());