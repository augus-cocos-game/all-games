import { GameLogic } from '../gameLogic';
import { HU, INVALID_INDEX, WeaveItem, MASK_COLOR, MASK_VALUE, WIK, RED_INDEX, hasRule, AnalyzeItem, MAX_WEAVE, MAX_COUNT, KindItem, MAX_INDEX } from './define';

export class GameLogic1001001 extends GameLogic {

    rules: number[] = [];

    private magicIndex: number[] = [INVALID_INDEX, INVALID_INDEX];

    hunIndex: number = INVALID_INDEX;

    cardLibrary: number[] = [
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,                   // 万子
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,                   // 万子
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,                   // 万子
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,                   // 万子
        0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,                   // 索子
        0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,                   // 索子
        0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,                   // 索子
        0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,                   // 索子
        0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29,                   // 同子
        0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29,                   // 同子
        0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29,                   // 同子
        0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29,                   // 同子
        0x35, 0x35, 0x35, 0x35, 0x35, 0x35, 0x35, 0x35,                         // 字牌
        0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,			                    // 番子
        0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,			                    // 番子
        0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,			                    // 番子
        0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,			                    // 番子
    ];

    private extraCardIndex: number[] = [];

    // private testInfo: TestInfo;
    constructor() {
        super();
        this.extraCardIndex.push(this.switchToCardIndex(0x31));
        this.extraCardIndex.push(this.switchToCardIndex(0x32));
        this.extraCardIndex.push(this.switchToCardIndex(0x33));
        this.extraCardIndex.push(this.switchToCardIndex(0x34));
        this.extraCardIndex.push(this.switchToCardIndex(0x36));
        this.extraCardIndex.push(this.switchToCardIndex(0x37));

        // this.testInfo = new TestInfo(this);
    }

    public setRules(rules: number[]) {
        this.rules = rules;
    }

    private _hasRule(rule: number) {
        return hasRule(this.rules, rule);
    }

    public getColor(cardData: number) {
        return (cardData & MASK_COLOR) >> 4;
    }

    public getValue(cardData: number) {
        return (cardData & MASK_VALUE);
    }

    // 返回 max~min 中的随机整数 不包括max 包括min
    public getRandomValue(max: number, min?: number): number {
        if (min === undefined) {
            min = 0;
        }
        return Math.floor(Math.random() * (max - min)) + min;
    }

    public shuffle(end: number): number[] {
        let cards: number[] = [];
        let cardLibrary = this.cardLibrary.slice(0, end);
        while (cardLibrary.length !== 0) {
            let pos = this.getRandomValue(cardLibrary.length);
            cards.push(cardLibrary.splice(pos, 1)[0]);
        }
        return cards;
    }

    public selectMagic(cardData: number) {
        this.magicIndex[0] = this.switchToCardIndex(cardData);
        this.extraCardIndex.push(this.magicIndex[0]);
    }

    public switchToCardIndex(cardData: number): number;
    public switchToCardIndex(cardData: number[], cardIndex: number[]): void;
    public switchToCardIndex(cardData: number | number[], cardIndex?: number[]) {
        if (!Array.isArray(cardData)) {
            return (this.getColor(cardData) * 9 + this.getValue(cardData) - 1);
        }
        if (Array.isArray(cardData) && cardIndex) {
            cardData.forEach(card => {
                cardIndex[this.switchToCardIndex(card)]++;
            });
        }
    }

    public switchToCardData(cardIndex: number[]): number[];
    public switchToCardData(cardIndex: number): number;
    public switchToCardData(cardIndex: number | number[]) {
        if (Array.isArray(cardIndex)) {
            let fn = (idx: number) => {
                if (cardIndex[idx] > 0) {
                    for (let j = 0; j < cardIndex[idx]; j++) {
                        cards.push(this.switchToCardData(idx));
                    }
                }
            }
            let cards: number[] = [];
            for (let i = 0; i < cardIndex.length; i++) {
                if (i == this.hunIndex) continue;
                fn(i);
            }
            fn(this.hunIndex);
            return cards;
        } else {
            if (cardIndex < 27) {
                return ((cardIndex / 9) << 4) | (cardIndex % 9 + 1);
            } else {
                return (0x30 | (cardIndex - 27 + 1));
            }
        }
    }

    public getCardCnt(cardIndex: number[]): number {
        let cnt = 0;
        cardIndex.forEach(cardcnt => cnt += cardcnt);
        return cnt;
    }

    public getRandCard() {
        return this.cardLibrary[this.getRandomValue(this.cardLibrary.length)];
    }

    public addWeave2Index(weaveItem: WeaveItem[], cardIndex: number[]): void {
        weaveItem.forEach(item => {
            item.cardData.forEach(card => {
                cardIndex[this.switchToCardIndex(card)]++;
            })
        });
    }

    public analyzeEatCard(cardIndex: number[], curCard: number): number {
        let idx = this.switchToCardIndex(curCard);
        // 如果是字牌不能吃
        if (idx > 26) return WIK.NULL;
        let res = WIK.NULL;

        let cardIdx = cardIndex.slice(0);
        cardIdx[idx]++;
        let isExit = (start: number) => {
            for (let i = start; i < start + 3; i++) {
                if (this.isMagicIndex(i)) return false;
                if (this.hunIndex == i) return false;
                if (cardIdx[i] == 0) return false;
            }
            return true;
        };
        // 左吃
        if ((idx % 9) < 7) {
            if (isExit(idx)) res |= WIK.LEFT;
        }
        // 右吃
        if ((idx % 9) > 1) {
            if (isExit(idx - 2)) res |= WIK.RIGHT;
        }
        // 中吃
        if (0 < (idx % 9) && (idx % 9) < 8) {
            if (isExit(idx - 1)) res |= WIK.CENTER;
        }
        return res;
    }

    public analyzePengCard(cardIndex: number[], curCard: number): boolean {
        let idx = this.switchToCardIndex(curCard);
        if (this.isMagicIndex(idx)) return false;
        if (this.hunIndex == idx) return false;
        return cardIndex[idx] >= 2;
    }

    public analyzeGangCard(cardIndex: number[], curCard: number): number[][];
    public analyzeGangCard(cardIndex: number[], weaveItem: WeaveItem[]): number[][];
    public analyzeGangCard(cardIndex: number[], weaveItem: WeaveItem[] | number): number[][] {
        let res: number[][] = [];
        let curCard: number = 0;
        if (typeof weaveItem === "number") {
            curCard = weaveItem;
            weaveItem = [];
        }
        if (!curCard) {
            if (weaveItem) {
                // 补杠
                weaveItem.forEach(item => {
                    if (item.weaveKind == WIK.PENG) {
                        let idx = this.switchToCardIndex(item.centerCard);
                        if (cardIndex[idx] > 0) {
                            res.push([item.centerCard]);
                        }
                    }
                });
            }
            // 暗杠
            for (let ii in cardIndex) {
                let i = parseInt(ii);
                if (this.hunIndex == i) continue;
                if (this.isMagicIndex(i)) continue;
                if (cardIndex[i] >= 4) {
                    let card = this.switchToCardData(i);
                    res.push([0, 0, 0, card]);
                }
            }
        } else {
            // 明杠
            for (let ii in cardIndex) {
                let i = parseInt(ii);
                if (this.hunIndex == i) continue;
                if (this.isMagicIndex(i)) continue;
                if (cardIndex[i] >= 3) {
                    let card = this.switchToCardData(i);
                    if (card == curCard) {
                        res.push([card, card, card, card]);
                    }
                }
            }
        }
        return res;
    }

    // 打哪张上听
    public analyzeTingCard(cardIndex: number[], weaveItem: WeaveItem[]): number[] {
        let res: number[] = [];

        // // 未开门
        // if (!this.isOpen(weaveItem)) return res;
        // // 有混必打：胡牌时手牌中不可以有混牌
        // if (this.hasRule(GAME_RULE.MAGIC_OUT) && this.getMagicCnt(cardIndex) > 0) return res;

        let cnt = this.getCardCnt(cardIndex);
        if (((cnt - 2) % 3) != 0) {
            console.warn('isTingCard error' + cnt);
            return res;
        }
        let cards = cardIndex.slice(0);
        for (let ii in cards) {
            let i = parseInt(ii);
            if (cards[i] > 0) {
                // 混牌可跳过
                if (this.isMagicIndex(i)) continue;
                cards[i]--;
                // 没有当前牌,如果能吃别的牌胡,就算上听
                if (this.analyzeHuCard(cards, weaveItem, true).length > 0) {
                    // 没有这张牌就能胡
                    res.push(this.switchToCardData(i));
                }
                cards[i]++;
            }
        }
        return res;
    }

    // 胡哪张牌
    // isBreak 如果只是判断有没有要胡的牌 isBreak = true 如果要获取能胡哪些牌isBreak = false
    public analyzeHuCard(cardIndex: number[], weaveItem: WeaveItem[], isBreak?: boolean): number[] {
        let res: number[] = [];
        let cnt = this.getCardCnt(cardIndex);
        if ((cnt - 1) % 3 != 0) {
            console.warn('analyzeHuCard error ' + cnt);
            return res;
        }
        for (let i = 0; i < cardIndex.length; i++) {
            if (this.isExtraCardIndex(i)) continue; // 东南西北发白混
            let card = this.switchToCardData(i);
            if (HU.NULL != this.analyzeHu(cardIndex, weaveItem, card)) {
                res.push(card);
                if (isBreak) break;
            }
        }
        return res;
    }

    public analyzeHu(cardIndex: number[], weaveItem: WeaveItem[], currentCard: number, countReallyDis: number = 1): number {
        let huKind = HU.NULL;
        if (currentCard == 0) {
            console.warn('analyzeHu error currentCard is 0');
            return huKind;
        }
        // // 未开门
        // if (!this.isOpen(weaveItem)) return HU.NULL;

        // 把当前要吃的牌加入到牌序中
        let cardIdx = cardIndex.slice(0);

        cardIdx[this.switchToCardIndex(currentCard)]++;

        // 有混必打
        let magicCnt = this.getMagicCnt(cardIdx);
        /// 胡牌时手牌中不可以有混牌
        // if (this._hasRule(RULE.MAGIC_OUT) && (magicCnt > 0)) return HU.NULL;

        let allCardIdx = cardIdx.slice(0);
        this.addWeave2Index(weaveItem, allCardIdx);

        // 缺幺九
        // if (!GameLogic.check19(allCardIdx)) return HU.NULL;
        // 缺门
        if (this.checkLostColor(allCardIdx)) return HU.NULL;

        if (weaveItem.length == 0) {
            // 十三烂
            // if (this.is13Lan(allCardIdx)) {
            //   huKind |= (this.fontCnt(allCardIdx) == 7 ? HU.LAN_13_7 : HU.LAN_13);
            // }
            // 七对
            if (this.is7Dui(allCardIdx)) {
                let cnt4 = this.get4Cnt(allCardIdx);

                // let double_seven = [HU.QI_DUI, HU.HAO_QI, HU.HAO_QI_2, HU.HAO_QI_3]
                let double_seven = [HU.QI_DUI, HU.HAO_QI, HU.HAO_QI, HU.HAO_QI]
                huKind |= double_seven[cnt4];

            }
        }


        if (allCardIdx[RED_INDEX] == 4) {
            /// only 4 red
            // if (this._hasRule(RULE.RED_4_WIN)) {
            //     huKind |= HU.RED_4
            // }
            /// 四红中起手胡
            // if (this._hasRule(RULE.RED_4_WIN_START) && !countReallyDis) {
            //     huKind |= HU.RED_4_START
            // }
            return huKind;
        }

        let res = this.analyzeCard(cardIdx, weaveItem);
        if (res.length == 0 && huKind == HU.NULL) return huKind;

        // // 胡牌中没有三张相同的牌
        // if (!GameLogic.checkPeng(res)) return HU.NULL;

        // if (this.isPiao(res)) huKind |= HU.PIAO;
        // else if (this.isJiaHu(res, currentCard)) huKind |= HU.CHUN_JIA;
        // else if (GameLogic.isDuiDao(res, currentCard)) huKind |= HU.DUI_DAO;

        if (this.getMagicCnt(cardIndex)) {
            if (this.colorCnt(allCardIdx) == 1) huKind |= HU.QING_YI_SE
        } else {
            if (this.colorCnt(allCardIdx) == 1 && this.fontCnt(allCardIdx) == 0) huKind |= HU.QING_YI_SE
        }


        // if (this.getMagicCnt(cardIndex)) {
        //     /// 带混一条龙 必须分析所有
        //     for (let i in res) {
        //         let tempData: number[] = []
        //         tempData.push(res[i].cardEye)
        //         for (let j = 0; j < res[i].cardData.length; j++) {
        //             tempData = tempData.concat(res[i].cardData[j])
        //         }
        //         let indexTemp = [];
        //         for (let idx = 0; idx < MAX_INDEX; idx++) {
        //             indexTemp[idx] = 0;
        //         }
        //         this.switchToCardIndex(tempData, indexTemp);
        //         if (this.isOneDragon(indexTemp)) {
        //             huKind |= HU.ONE_DRAGON
        //         }
        //     }
        // } else {
        //     if (this.isOneDragon(allCardIdx)) {
        //         huKind |= HU.ONE_DRAGON
        //     }
        // }


        // if (this.colorCnt(allCardIdx) == 0) huKind |= HU.ZI_YI_SE;

        if (huKind == HU.NULL) huKind |= HU.PI;

        // if (this.getCardCnt(cardIdx) == 2) huKind |= HU.BA_1;
        // if (this.isDuMen(allCardIdx, currentCard)) huKind |= HU.DU_MEN;
        // if (magicCnt == 0) huKind |= HU.NOT_MAGIC;

        // if (this.isQuanQiuRen(weaveItem)) huKind |= HU.QUAN_QIU_REN;

        return huKind;
    }

    private is13Lan(cardIndex: number[]): boolean {
        if (this.colorCnt(cardIndex) != 3) return false;
        if (this.fontCnt(cardIndex) < 4) return false;
        for (let cnt of cardIndex) {
            if (cnt > 0 && cnt != 1) return false;
        }
        for (let i = 0; i < 27; i++) {
            if (i % 9 == 7) {
                if (cardIndex[i] > 0 && cardIndex[i + 1] > 0) return false;
            }
            if (i % 9 > 6) continue;
            if (cardIndex[i] > 0 && (cardIndex[i + 1] > 0 || cardIndex[i + 2] > 0)) return false;
        }
        return true;
    }

    private is7Dui(cardIndex: number[]): boolean {
        let countMagic = this.getMagicCnt(cardIndex)
        let countNoExistIndex = 0
        if (countMagic) {
            for (let i = 0; i < RED_INDEX; i++) {
                if (cardIndex[i] == 1 || cardIndex[i] == 3) countNoExistIndex++
            }
            return countNoExistIndex <= countMagic;
        }

        for (let cnt of cardIndex) {
            if (cnt > 0 && cnt != 2 && cnt != 4) return false;
        }
        return true;
    }

    private get4Cnt(cardIndex: number[]): number {
        let cnt4 = 0
        for (let cnt of cardIndex) {
            if (cnt == 4) cnt4++;
        }
        return cnt4;
    }

    private isQuanQiuRen(weaveItem: WeaveItem[]): boolean {
        if (weaveItem.length != 4) return false;
        for (let item of weaveItem) {
            if (item.weaveKind == WIK.GANG && item.public == false) return false;
        }
        return true;
    }


    public isOpen(weaveItem: WeaveItem[]): boolean {
        if (!(!!weaveItem) || weaveItem.length <= 0) {
            return false;
        }

        for (let item of weaveItem) {
            if (item.public) return true;
        }
        return false;
    }

    // 缺门 // 去掉混
    private checkLostColor(cardIndexI: number[]): boolean {
        let cnt = this.colorCnt(cardIndexI);
        if (cnt == 1) return false; // 清一色例外
        if (cnt > 2) return false;
        if (cardIndexI[RED_INDEX] > 0) return false; // 红中可顶替一门

        return true;
    }

    private check19(cardIndexI: number[]): boolean {
        let cardIndex = this.removeMagic(cardIndexI);
        let yaoIndex = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];
        for (let idx of yaoIndex) {
            if (cardIndex[idx] > 0) return true;
        }
        return false;
    }

    // 检查是否有暗刻或者碰
    private static checkPeng(res: AnalyzeItem[]): boolean {
        for (let item of res) {
            for (let kind of item.weaveKind) {
                if (kind == WIK.PENG || kind == WIK.GANG) return true;
            }
        }
        return false;
    }

    private checkPengByWeave(weaveItem: WeaveItem[]): boolean { // 检查推到的牌中是否有暗刻或者碰
        for (let item of weaveItem) {
            if (WIK.PENG == item.weaveKind || WIK.GANG == item.weaveKind) return true;
        }

        return false;
    }

    private colorCnt(cardIndexI: number[]): number {
        let cardIndex = this.removeMagic(cardIndexI);

        let cardData = this.switchToCardData(cardIndex);
        let color = [0, 0, 0];
        cardData.forEach(card => {
            let idx = this.getColor(card);
            if (idx < 3) {
                color[idx] = 1;
            }
        });
        return color[0] + color[1] + color[2];
    }

    private fontCnt(cardIndex: number[]): number {
        let fntCnt = 0;
        cardIndex.slice(27).forEach(cnt => {
            if (cnt > 0) fntCnt++
        });
        return fntCnt;
    }

    private static isPiao(results: AnalyzeItem[]): boolean {
        for (let res of results) {
            let isPiao = true;
            for (let kind of res.weaveKind) {
                if (kind != WIK.PENG && kind != WIK.GANG) {
                    isPiao = false;
                    break;
                }
            }
            if (isPiao) return true;
        }
        return false;
    }

    private isJiaHu(results: AnalyzeItem[], curCard: number): boolean { // 夹 (3 7 算边夹) 夹的目的就是计算只能胡一张牌
        for (let res of results) {
            for (let i = 0; i < MAX_WEAVE; i++) {
                if (res.weaveKind[i] != WIK.LEFT) continue;

                if (curCard == res.cardData[i][1]) { // 中间牌
                    return true;
                }
                //12胡3 || 89胡7时
                let curValue = this.getValue(curCard);
                if ((3 == curValue && curCard == res.cardData[i][2]) || (7 == curValue && curCard == res.cardData[i][0])) {
                    return true;
                }
            }
        }

        return false;
    }

    //2:纯夹 1:摆夹 0:啥也不是
    private isChunJiaOrBaiJia(results: AnalyzeItem[], curCard: number): number {
        for (let res of results) {
            let card = 0;
            for (let i = 0; i < MAX_WEAVE; i++) {
                let condition37 = (this.getValue(curCard) == 3 && curCard == res.cardData[i][2]) ||
                    (this.getValue(curCard) == 7 && curCard == res.cardData[i][0])
                if (res.weaveKind[i] == WIK.LEFT && res.public[i] == false) {
                    if (curCard == res.cardData[i][1]) {
                        card = res.cardData[i][1];
                        break
                    }
                    if (condition37) {
                        card = res.cardData[i][1];
                        break;
                    }
                }
            }
            if (card) {
                if (res.cardEye == card) return 1;
                for (let i = 0; i < MAX_WEAVE; i++) {
                    if (res.weaveKind[i] == WIK.PENG && res.centerCard[i] == card && res.public[i]) return 1;
                }
                return 2;
            }
        }
        return 0;
    }

    private static isDuiDao(results: AnalyzeItem[], curCard: number): boolean {
        for (let res of results) {
            for (let i = 0; i < MAX_WEAVE; i++) {
                if (res.weaveKind[i] == WIK.PENG && res.centerCard[i] == curCard) return true;
            }
        }
        return false;
    }

    private isDuMen(cardIndex: number[], curCard: number): boolean {
        let color = this.colorCnt(cardIndex);
        let cards = cardIndex.slice(0);
        let curIdx = this.switchToCardIndex(curCard);
        if (cards[curIdx] == 2) {
            cards[curIdx] -= 2;
            return (color - this.colorCnt(cards)) == 1;
        }
        return false;
    }

    private isOneDragon(weaveItem: WeaveItem[]): boolean {
        let part: boolean[][] = [
            [false, false, false],
            [false, false, false],
            [false, false, false]]

        for (let i = 0; i < weaveItem.length; i++) {
            if (!(weaveItem[i].weaveKind & (WIK.LEFT | WIK.CENTER | WIK.RIGHT))) continue
            let centreCard: number = 0
            switch (weaveItem[i].weaveKind) {
                case WIK.LEFT:
                    centreCard = weaveItem[i].cardData[0]
                    break
                case WIK.CENTER:
                    centreCard = weaveItem[i].cardData[1]
                    break
                case WIK.RIGHT:
                    centreCard = weaveItem[i].cardData[2]
                    break
                default:
                    console.error('you must not in here')
                    break
            }

            // ASSERT(IsValidCard(cbCenterCard))
            // if (!IsValidCard(cbCenterCard))
            //     break

            let colorCard: number = centreCard >> 4
            let valueCard: number = centreCard & MASK_VALUE

            if (colorCard == 3) break

            if (weaveItem[i].weaveKind & WIK.LEFT) {
                if (valueCard == 0x01)
                    part[colorCard][0] = true;
                else if (valueCard == 0x04)
                    part[colorCard][1] = true;
                else if (valueCard == 0x07)
                    part[colorCard][2] = true;
            } else if (weaveItem[i].weaveKind & WIK.CENTER) {
                if (valueCard == 0x02)
                    part[colorCard][0] = true;
                else if (valueCard == 0x05)
                    part[colorCard][1] = true;
                else if (valueCard == 0x08)
                    part[colorCard][2] = true;
            } else if (weaveItem[i].weaveKind & WIK.RIGHT) {
                if (valueCard == 0x03)
                    part[colorCard][0] = true;
                else if (valueCard == 0x06)
                    part[colorCard][1] = true;
                else if (valueCard == 0x09)
                    part[colorCard][2] = true;
            }
        }

        //检查是否存在含有三个部分的花色
        let Found: boolean[] = [true, true, true]
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (!part[i][j]) {
                    Found[i] = false
                    break
                }
            }
        }

        //任一花色存在 即为一条龙
        return (Found[0] || Found[1] || Found[2])
    }

    // 获取胡牌的组合
    // all 是否需要获取到胡牌组合, false 就只返回一种胡牌组合为节省运算, true 返回所有组合
    // *需要补牌后调用,否者手把一会异常
    // cardIndex 相同牌值的牌有多张时,INDEX相同,数量+1
    public analyzeCard(cardIndex: number[], weaveItem: WeaveItem[], all?: boolean): AnalyzeItem[] {
        let result: AnalyzeItem[] = [];
        // 手牌数量
        let cardCnt = this.getCardCnt(cardIndex);
        if ((cardCnt - 2) % 3 != 0 || cardCnt < 2 || cardCnt > MAX_COUNT) {
            console.warn('analyzeCard error ' + cardCnt);
            console.trace();
            console.assert(false);
            return result;
        }
        // 手牌中会牌数量
        let magicCnt = this.getMagicCnt(cardIndex);

        // 手牌中全是会 这里不做处理请在上层处理
        if (cardCnt == magicCnt) {
            console.warn('analyzeCard error 剩余手牌全是会');
            return result;
        }

        // 将weaveItem放入结果集中
        let pushWeaveItem = (res: AnalyzeItem) => {
            if (!res.cardData) res.cardData = [];
            if (!res.centerCard) res.centerCard = [];
            if (!res.weaveKind) res.weaveKind = [];
            if (!res.public) res.public = [];
            for (let i in weaveItem) {
                res.cardData.unshift(weaveItem[i].cardData);
                res.centerCard.unshift(weaveItem[i].centerCard);
                res.weaveKind.unshift(weaveItem[i].weaveKind);
                res.public.unshift(true);
            }
        }

        if (cardCnt == 2) {
            for (let i in cardIndex) {
                // 如果手中两张牌相同或者一张会牌一张非会牌则胡牌
                if (cardIndex[i] == 2 || (cardIndex[i] == 1 && magicCnt == 1)) {
                    let res = <AnalyzeItem>{
                        cardEye: this.switchToCardData(parseInt(i)),
                        magicEye: magicCnt > 0,
                    };
                    pushWeaveItem(res);
                    result.push(res);
                    return result;
                }
            }
            return result;
        }

        // 返回碰kindItem
        let pengKind = (cnt: number, idx: number): KindItem => {
            let index: number[];
            if (cnt > 2) index = [idx, idx, idx];
            else if (cnt > 1) index = [idx, idx];
            else index = [idx];
            return {
                weaveKind: WIK.PENG,
                centerCard: this.switchToCardData(idx),
                cardIndex: index,
                magicCnt: 3 - index.length
            } as KindItem;
        }

        // 将所有暗刻牌和连牌组合可能找出 放入kinds中
        let kinds: KindItem[] = [];
        let lessKindCnt = (cardCnt - 2) / 3;
        for (let i = 0; i < MAX_INDEX; i++) {
            if (this.isMagicIndex(i)) continue;
            // 暗刻判断
            if (cardIndex[i] >= 3 || ((cardIndex[i] + magicCnt >= 3) && cardIndex[i] > 0)) {
                // 获取所有碰牌组合
                // eg. 如果牌有4张, 极端情况 会有 一组3张, 2两组2张, 4组一张, 分别需要癞子0张, 1张, 2张
                // 只需计算极端情况, 即可得最多组合情况, 即能获取到全部组合
                for (let j = 1; j <= (cardIndex[i] > 3 ? 3 : cardIndex[i]); j++) {
                    let tempCard = cardIndex[i], tempMagic = magicCnt;
                    if (cardIndex[i] < j) break;
                    while (tempCard >= j && j + tempMagic >= 3) {
                        kinds.push(pengKind(j, i));
                        tempCard -= j;
                        tempMagic -= (3 - j);
                        // 这两个值应该永远不为负数
                        console.assert(tempCard >= 0 && tempMagic >= 0);
                    }
                }
            }
            // 连牌判断
            // 3 * 9 - 2 = 25
            // 不处理字牌, 不处理, 8,9(万/筒/条)
            if (i < 25 && (i % 9) < 7) {
                let index = [cardIndex[i], cardIndex[i + 1], cardIndex[i + 2]];
                let cnt = index[0] + index[1] + index[2];
                if (cnt == 0) continue;
                if (cnt + magicCnt < 3) continue;
                let kindCnt = 0;
                index.forEach(c => {
                    if (c > 0) kindCnt++
                });
                // 如果不需要获取全部牌型, 如果只有一种牌可以组成碰类型, 跳过
                if (kindCnt == 1 && !all) continue;
                // 如果会牌大于两张, 计算最多
                // 如果为123, 则可以为1XX, 2XX, 3XX
                if (magicCnt >= 2 && kindCnt >= 1 && all) {
                    for (let j = 0; j < index.length; j++) {
                        let tempCard = index[j];
                        let tempMagic = magicCnt;
                        while (tempCard > 0 && tempMagic >= 2) {
                            kinds.push({
                                weaveKind: WIK.LEFT,
                                centerCard: this.switchToCardData(i),
                                cardIndex: [i + j],
                                magicCnt: 2
                            });
                            tempCard--;
                            tempMagic -= 2;
                        }
                    }
                }
                // 如果会牌大于一张, 计算最多
                // 如果为123, 则可以为12X, 1X3, XX3
                if (magicCnt >= 1 && kindCnt >= 2) {
                    for (let j = 0; j < index.length; j++) {
                        let index0 = (j + 1) % index.length,
                            index1 = (j + 2) % index.length;
                        let other0 = index[index0],
                            other1 = index[index1];
                        let tempMagic = magicCnt;
                        while (other0 > 0 && other1 > 0 && tempMagic >= 1) {
                            kinds.push({
                                weaveKind: WIK.LEFT,
                                centerCard: this.switchToCardData(i),
                                cardIndex: [i + index0, i + index1], // 注意顺序不是由小到大
                                magicCnt: 1
                            });
                            other0--;
                            other1--;
                            tempMagic--;
                        }
                    }
                }
                if (kindCnt == 3) {
                    // 如果为123, 则123
                    let tempIndex = index.slice(0);
                    while (tempIndex[0] > 0 && tempIndex[1] > 0 && tempIndex[2] > 0) {
                        kinds.push({
                            weaveKind: WIK.LEFT,
                            centerCard: this.switchToCardData(i),
                            cardIndex: [i, i + 1, i + 2], // 注意顺序不是由小到大
                            magicCnt: 0
                        });
                        tempIndex[0]--;
                        tempIndex[1]--;
                        tempIndex[2]--;
                    }
                }
            }
        }
        if (lessKindCnt > kinds.length) return result;

        // callback排列组合的, callback 返回值可以跳出循环, 神代码, 我是没看懂, 有大神看懂了给我讲讲,
        // eg setIndex(2, 3, call) call([0,1]) call([0,2]) call([1,2])
        let setIndex = (subCnt: number, allCnt: number, callback: (res: number[]) => boolean) => {
            let index: number[] = [];
            for (let i = 0; i < subCnt; i++) {
                index.push(i);
            }
            do {
                if (callback(index)) break;
                //设置索引
                if (index[subCnt - 1] == (allCnt - 1)) {
                    let i = subCnt - 1;
                    for (; i > 0; i--) {
                        if ((index[i - 1] + 1) != index[i]) {
                            let newIndex = index[i - 1];
                            for (let j = (i - 1); j < subCnt; j++)
                                index[j] = newIndex + j - i + 2;
                            break;
                        }
                    }
                    if (i == 0)
                        break;
                } else
                    index[subCnt - 1]++;
            } while (true);
        }

        // 找出和当前手牌一致的组合
        setIndex(lessKindCnt, kinds.length, (index: number[]) => {
            let tempMagicCnt = 0; //除了将牌, 使用的会牌数量
            index.forEach(idx => {
                tempMagicCnt += kinds[idx].magicCnt;
            });
            // 会牌校验 会牌使用多了, 会牌剩余大于一张
            if (tempMagicCnt > magicCnt || magicCnt - tempMagicCnt >= 2) return false;

            let tempCardIdx = cardIndex.slice(0);
            // 剔除非癞子牌
            for (let idx of index) {
                for (let idxCard of kinds[idx].cardIndex) {
                    if (tempCardIdx[idxCard] == 0) return false;
                    else tempCardIdx[idxCard]--;
                }
            }

            if (this.getCardCnt(tempCardIdx) - tempMagicCnt != 2) return false;
            let leftMagicCnt = this.getMagicCnt(tempCardIdx) - tempMagicCnt;
            for (let ii in tempCardIdx) {
                let i = parseInt(ii);
                if (this.isMagicIndex(i)) continue;
                if (tempCardIdx[i] == 2 || (tempCardIdx[i] == 1 && leftMagicCnt == 1)) {
                    let res = {
                        cardEye: this.switchToCardData(i),
                        magicEye: tempCardIdx[i] == 1,
                        weaveKind: [],
                        centerCard: [],
                        cardData: [],
                        public: [],
                    } as AnalyzeItem
                    index.forEach(idx => {
                        let resIndex = res.centerCard.length;
                        kinds[idx].cardIndex.forEach(idx => {
                            if (!res.cardData[resIndex]) res.cardData[resIndex] = [];
                            res.cardData[resIndex][res.cardData[resIndex].length] = this.switchToCardData(idx);
                        });
                        res.centerCard[resIndex] = kinds[idx].centerCard;
                        res.weaveKind[resIndex] = kinds[idx].weaveKind;
                        res.public[resIndex] = false;
                    });
                    result.push(res);
                    return !all;
                }
            }
            return false;
        })

        // 如果要返回全部类型, 要去重, 如果centerCard与weaveKind都一致, 则认为一致
        // 因为kinds里面的是根据centerCard由小到大排列的, 因此不需要排序, 直接判断即可
        if (all) {
            for (let i = 0; i < result.length - 1; i++) {
                for (let j = i + 1; j < result.length; j++) {
                    if (result[i].centerCard.toString() === result[j].centerCard.toString() &&
                        result[i].weaveKind.toString() === result[j].weaveKind.toString()) {
                        result.splice(j, 1);
                        j--;
                    }
                }
            }
        }

        result.forEach(res => pushWeaveItem(res));

        return result;
    }

    public getWeaveCard(weaveKind: number, centerCard: number): number[] {
        switch (weaveKind) {
            case WIK.LEFT:
                return [centerCard, centerCard + 1, centerCard + 2];
            case WIK.CENTER:
                return [centerCard - 1, centerCard, centerCard + 1];
            case WIK.RIGHT:
                return [centerCard - 2, centerCard - 1, centerCard];
            case WIK.PENG:
                return [centerCard, centerCard, centerCard];
            case WIK.GANG:
                return [centerCard, centerCard, centerCard, centerCard];
            default: {
                console.warn('getWeaveCard error ' + weaveKind);
                return [];
            }
        }
    }

    public getMagicData(): number {
        let data: number = 0;
        this.magicIndex.forEach(value => {
            if (value == INVALID_INDEX) return;
            data = this.switchToCardData(value);
            return true;
        })
        return data;
    }

    public getMagicCnt(cardIndex: number[]) {
        let cnt = 0;
        this.magicIndex.forEach(value => {
            if (value == INVALID_INDEX) return;
            if (cardIndex[value] > 0) {
                cnt += cardIndex[value];
            }
        })
        return cnt;
    }

    public isMagicIndex(idx: number): boolean {
        for (let index of this.magicIndex) {
            if (index == INVALID_INDEX) continue;
            if (index == idx) return true;
        }
        return false;
    }

    public isExtraCardIndex(index: number): boolean {
        for (let value of this.extraCardIndex) {
            if (index == value) return true;
        }
        return false;
    }

    private removeMagic(cardIndex: number[]): number[] {
        let temp = cardIndex.slice(0);
        this.magicIndex.forEach(element => {
            temp[element] = 0;
        });
        return temp;
    }

}