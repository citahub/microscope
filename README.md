[![MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/cryptape/microscope)
[![AppChain](https://img.shields.io/badge/made%20for-Nervos%20AppChain-blue.svg)](https://appchain.nervos.org/)

# Overview

Microscope provides an easy-to-use user interface to inspect every cell of every AppChain. Yes, every AppChain, due to the ability to switch target chain in Metadata Panel of the Microscope.

# About Microscope

Microscope is a blockchain explorer built with [React](https://reactjs.org/) for inspecting any AppChain. It supports searching block, transaction, account and invoking call method of smart contract. It also can work with [ReBirth](https://github.com/cryptape/re-birth) to display a list of blocks and transactions on specified conditions, or even analyzes AppChain working status.

## Features

- [x] **Open Source Development**: This project is welcome anyone to use and PR.
- [x] **Multi-Chain Switch**: This project supports switch between any AppChain.
- [x] **Smart Contract Support**: This project provides a user friendly interface to call methods of smart contracts.
- [x] **User Customized**: This project supports a config page to specify which value should be displayed.
- [x] **Progressive**: This project is under progressive development, which means it can work independently, and is able to work with [ReBirth](https://github.com/cryptape/re-birth), another project for AppChain.
- [x] **Internationalized**: This project supports i18n, default to 中文 and Englisgh.

## Getting Started

- [Development](#development)

- [Usage](#usage)

# Development

1.  clone the repo

```shell
git clone https://github.com/cryptape/Microscope/
```

2.  Install Dependencies

```bash
yarn install
```

3.  Build DLL Packages

```shell
yarn run dll
```

4.  Add Config

```shell
cp ./.env.example ./.env
```

set env variables in `./.env`

```
PUBLIC=  # public content server address
CHAIN_SERVERS= # default appchain addresses
APP_NAME= # explorer name
```

> NOTICE: Our CDN for static assets is available at `https://cdn.cryptape.com/`, namely icons and images can be added by setting `PUBLIC=https://cdn.cryptape.com/` on `.env`.

5.  Developing

```shell
yarn start
```

6.  Building

```shell
yarn run build:prod
```

# Usage

## Set appchain

If you visit the explorer first time, the side panel will pop up to set appchain address you want to listen to.

## Data in Microscope

The main sections consists of **homepage**, **block**, **transaction**, **account**, **statistics**, **config**, and most of them can be accessed via navigation bar.

### Homepage

Homeage includes `Latest 10 Blocks` and `Latest 10 Transactions`

### Block

> NOTICE: This page only works with [ReBirth](https://github.com/cryptape/re-birth), the server caching appchain.

**Block Page** show list of blocks, the table items can be specified in **Config Page**

Filters can be set in **Advanced Selector**, available params are `numberFrom`, `numberTo`, `transactionFrom`, `transactionTo`.

`numberFrom` and `numberTo` limit the range of block number.

`transactionFrom` and `transactionTo` limit the range of transaction count in one block.

Block Detail can be inspected via table link.

### Transaction

> NOTICE: This page only works with [ReBirth](https://github.com/cryptape/re-birth), the server caching appchain.

**Transaction Page** show list of transaction, the table items can be specified in **Config Page**

Filters can be set in **Advanced Selector**, available params are `from`, `to`.

`from` and `to` limit `transaction.from` and `transaction.to`.

Transaction Detail can be inspected via `hash`.

Block Detail can be inspected via `height`.

Account Detail can be inspected via `from` and `to`.

### Statisitcs

> NOTICE: Partial diagrams works with [ReBirth](https://github.com/cryptape/ReBirth), the server caching appchain.

**Statistics Page** show list of diagrams, the displaying items can be specified in **Config Page**

For now, **Statistics Page** includes `Interval/Block`, `Transactions/Block`, `Gas Used/Block`, `Gas Used/Transaction`, `Proposals/Validator` diagrams.

### Account

**Account Page** displays its **balance** and **transaction records**, and if the account is an contract, the abi panel will also be available.

## Other Widgets

### Header

Important Functionalities are shown as badges in the right of header, they are **Chain Name**, **TPS**, **Search**, **Languages**, all of them has their own panel.

### Metadata Panel

On click of **Chain Name** the **Metapata Panel** will be called out.

The **Metadata Panel** is used to check metadata of active chain, or inspect and switch to other chain by entering IP in the search field.

### Statistics Panel

> NOTICE: this panel is hidden by default, corresponding code is at `src/containers/Header/index.tsx`

On click of **TPS** the **Statistics Panel** will be called out.

The **Statistics Panel** is used to inspect current status of active chain.

### Search Panel

On click of **Search** the **Search Panel** will be called out.

The **Search Panel** is used to inspect block, transaction and account's detail by searching hash or number.

### Languages

For now, some languages('zh', 'en', 'jp', 'ko', 'de', 'it', 'fr') can be set by language menu.

## Others

> NOTICE: Block Detail can be visited `localhost/#/block/:blockHash` and `localhost/#/height/:blockNumber`

> Transaction Detail can be visited `localhost/#/transaction/:transactionHash`

> Account Detail can be visited `localhost/#/account/:accountAddress`
