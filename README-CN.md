[![MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/cryptape/microscope)
[![CITAHub](https://img.shields.io/badge/made%20for-CITAHub-blue.svg)](https://www.citahub.com/)

[English](./README.md) | 简体中文

# 概述

Microscope提供了一个易于使用的用户界面来查询所有CITA链上信息,可通过在元数据面板中切换目标链。

# 关于 Microscope

Microscope一个区块链浏览器，用[React](https://reactjs.org/)构建，用于查询CITA链。 它支持搜索区块，交易，帐户信息和调用智能合约方法。 它还可以与[ReBirth](https://github.com/cryptape/re-birth)一起使用，实现指定组合条件的区块交易列表查询，分析CITA的工作状态等高级功能。


## 功能特性

- [x] **开源开发**:  Welcome广大开发者PR及贡献.
- [x] **多链切换**:  支持在线CITA链间切换
- [x] **智能合约支持**: 提供友好界面调用智能合约方法.
- [x] **用户自定义**: 支持页面展示信息的开关配置.
- [x] **渐进增强**: 可以独立运行, 也可以跟ReBirth项目协作实现更强大的功能[ReBirth](https://github.com/cryptape/re-birth).
- [x] **国际化**: 支持i18n, 默认带中文/Englisgh.

## 开始

- [开发](#开发)

- [用户手册](#用户手册)

# 开发

1.  下载仓库

```shell
git clone https://github.com/cryptape/microscope/
```

2.  安装依赖

```bash
yarn install
```

3.  构建dll

```shell
yarn run dll
```

4.  添加配置

```shell
cp ./.env.example ./.env
```

set env variables in `./.env`

```
PUBLIC=  # public content server address
CHAIN_SERVERS= # default appchain addresses
APP_NAME= # explorer name
DEBUG_ACCOUNTS= # built-in debug account's private key, e.g. 0xaeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee,0xaeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeea
```

> 注意: 我们静态资源所在CDN 在 `https://cdn.cryptape.com/`, 图标图片添加 `PUBLIC=https://cdn.cryptape.com/` 到 `.env`.

5.  开发调试

```shell
yarn start
```

6.  构建

```shell
yarn run build:prod
```

## 使用Docker

首先，需要安装docker并且知道如何使用

1. 下载

```shell
git clone https://github.com/cryptape/microscope/
```

2. 添加配置

```shell
cp ./.env.example ./.env
```

设置环境变量 `./.env`

```
PUBLIC=  # public content server address
CHAIN_SERVERS= # default appchain addresses
APP_NAME= # explorer name
DEBUG_ACCOUNTS= # built-in debug account's private key, e.g. 0xaeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee,0xaeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeea
```

> 注意: 我们静态资源所在CDN 在 `https://cdn.cryptape.com/`, 图标图片添加 `PUBLIC=https://cdn.cryptape.com/` 到 `.env`.

修改 nginx 配置  `./nginx.conf.example`

4. 启用 Docker Compose. 这一步可能很耗时.

```shell
yarn docker:init
```

如果成功，你会在如下地址看到Microscope [0.0.0.0:8089](0.0.0.0:8089).

下一次运行, 使用:

```shell
yarn docker:start
```

来重新加载.

# 用户手册

## 链设置

如果您是第一次访问，则会弹出侧面板，要求您设置要侦听查询的CITA地址

## Microscope上的数据信息

主要功能包括  **首页信息**, **区块信息**, **交易信息**, **账户信息**, **账户信息**, **配置页面**, 基本都可以通过导航栏访问

### 首页信息

首页展现 `最新的 10 个区块` 及 `最新的 10 笔交易`.

### 区块信息

> 注意: 该功能只能配合 [ReBirth](https://github.com/cryptape/re-birth)使用, 针对CITA的缓存服务器.

**区块页面** 展示区块列表, 表格项可在 **配置页面** 配置是否显示

过滤功能可通过 **高级选择器**, 可用参数包括 `numberFrom`, `numberTo`, `transactionFrom`, `transactionTo`.

`numberFrom` 和 `numberTo` 设定块高范围.

`transactionFrom` 和 `transactionTo` 设定区块所收录的交易数目.

区块详情可以点击表格链接查看


### 交易信息

> 注意: 该功能只能配合 [ReBirth](https://github.com/cryptape/re-birth)使用, 针对CITA的缓存服务器.

**交易页面** 展现交易列表, 表格项可在 **配置页面** 配置是否显示

过滤功能可通过 **高级选择器**, 可用参数包括 `from`, `to`.

`from` 和 `to` 设定 `transaction.from` and `transaction.to`.

交易详情可以点击 `hash` 链接查看

区块详情可以点击 `height` 链接查看

账户详情可以点击 `from` 和 `to` 链接查看

data 详情可在 `Hex` 查看，并且若合约上链同时上传 ABI 文件，还可将 ABI 文件解析成可读文本，从而可在
`Parameters` 查看一些简要信息。

### 统计

> 注意: 该功能只能配合 [ReBirth](https://github.com/cryptape/re-birth)使用, 针对CITA的缓存服务器.

**统计页面** 展现各类图表, 可在 **配置页面** 配置是否显示

当前, **统计页面** 包含 `出块间隔`, `区块交易数`, `区块Quota使用`, `交易Quota使用`, `提案/验证节点` 图表统计.

### 账户信息

**账户页面** 展示 **余额** and **交易记录**, 如果是合约账户, 则可以看到 abi 面板.

## 其他Widgets

### Header面板

重要功能在标题右侧显示，它们是 **链名**， **TPS**，**搜索**，**语言**，所有这些都有自己的面板。


### 元数据面板

点击 **链名** 可以调出 **元数据面板**

 **元数据面板** 用于查询当前链的元数据信息，或者通过数据新链的IP信息切换到新链.

### 统计面板


**统计面板** 用于统计当前链的活跃状态.

### 搜索面板

On click of **Search** the **Search Panel** will be called out.

**搜索面板** 用于检索区块, 交易, 账户信息详情 通过输入hash或者数值.

### 语言

当前, 更多语言('zh', 'en', 'jp', 'ko', 'de', 'it', 'fr') 可以在语言菜单设置

## 其他

> 通知: 区块详情可以通过访问  `localhost/#/block/:blockHash` 和  `localhost/#/height/:blockNumber`

> 交易详情可以访问  `localhost/#/transaction/:transactionHash`

> 账户详情可访问  `localhost/#/account/:accountAddress`
