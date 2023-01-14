enum HEX {
    HEX_0 = 0x00000001,
    HEX_1 = 0x00000002,
    HEX_2 = 0x00000004,
    HEX_3 = 0x00000008,
    HEX_4 = 0x00000010,
    HEX_5 = 0x00000020,
    HEX_6 = 0x00000040,
    HEX_7 = 0x00000080,
    HEX_8 = 0x00000100,
    HEX_9 = 0x00000200,
    HEX_10 = 0x00000400,
    HEX_11 = 0x00000800,
    HEX_12 = 0x00001000,
    HEX_13 = 0x00002000,
    HEX_14 = 0x00004000,
    HEX_15 = 0x00008000,
    HEX_16 = 0x00010000,
    HEX_17 = 0x00020000,
    HEX_18 = 0x00040000,
    HEX_19 = 0x00080000,
    HEX_20 = 0x00100000,
    HEX_21 = 0x00200000,
    HEX_22 = 0x00400000,
    HEX_23 = 0x00800000,
    HEX_24 = 0x01000000,
    HEX_25 = 0x02000000,
    HEX_26 = 0x04000000,
    HEX_27 = 0x08000000,
    HEX_28 = 0x10000000,
    HEX_29 = 0x20000000,
    HEX_30 = 0x40000000,
    HEX_31 = 0x80000000,
}

// 
export enum RULE {
    DEFINE = 0,
}

export function hasRule(gameRules: number[], rule: RULE): boolean {
    return (gameRules[Math.floor(rule / 32)] & (Math.pow(2, (rule % 32)))) != 0;
}

const MAHJONG_GLOSSARY = {
    READY_HAND: '(听牌)',
    HEAVENLY_HAND: '(天糊)',
    SHORT_HAND: '(小相公)',
    LONG_HAND: '(大相公)',
    GREAT_WINDS: '(大四喜)',
    GREAT_DRAGONS: '(大三元)',
    ALL_KONGS: '(十八羅漢)',
    ALL_HONOR_TILES: '(字一色)',
    THIRTEEN_ORPHANS: '(十三幺)',
    NINE_GATES_HAND: '(九蓮宝燈)',
    SELF_TRIPLETS: '(四暗刻)',
    ALL_IN_TRIPLETS: '(對對糊)',
    MIXED_ONE_SUIT: '(混一色)',
    ALL_ONE_SUIT: '(清一色)',
    COMMON_HAND: '(平糊)',
    SMALL_DRAGONS: '(小三元)',
    SMALL_WINDS: '(小四喜)',
}

export interface WeaveItem {
    weaveKind: number;
    centerCard: number;
    public: boolean;
    provider: number;
    cardData: number[];
    // 特殊 当开门时暗杠需要给其他人看到
    show: boolean;
}

// 动作掩码
export const WIK = {
    NULL: 0,
    LEFT: HEX.HEX_0,
    CENTER: HEX.HEX_1,
    RIGHT: HEX.HEX_2,
    PENG: HEX.HEX_3,
    GANG: HEX.HEX_4,
    LISTEN: HEX.HEX_5,
    HU: HEX.HEX_6,
};

// 胡牌权位
export const HU = {
    NULL: 0,
    PI: HEX.HEX_0,
    PIAO: HEX.HEX_1,
    QING_YI_SE: HEX.HEX_2,
    QUAN_QIU_REN: HEX.HEX_3,
    ZI_YI_SE: HEX.HEX_4,
    QI_DUI: HEX.HEX_5,
    HAO_QI: HEX.HEX_6,
    HAO_QI_2: HEX.HEX_7,
    HAO_QI_3: HEX.HEX_8,
    LAN_13: HEX.HEX_9,
    LAN_13_7: HEX.HEX_10,
    ONE_DRAGON: HEX.HEX_11,
    RED_4_START: HEX.HEX_12,
    RED_4: HEX.HEX_13,
};


export interface KindItem {
    weaveKind: number, // 从 WIK 取值
    centerCard: number, // 用于计算吃牌时,从哪张牌算起 getWeaveCard 中和 weaveKind 配合使用
    cardIndex: number[], // 牌的索引 [1]/[1,1]/[1,1,1]
    magicCnt: number, // 需要几张混牌
}

export interface AnalyzeItem {
    cardEye: number;    // 将牌 对牌 横牌 (两张相同的牌) data
    weaveKind: number[];
    centerCard: number[];
    cardData: number[][];
    public: boolean[];
    magicEye: boolean; // 两张相同的牌 cardEye 是否需要混牌
}


export const INVALID_INDEX = -1;
export const MAX_INDEX = 34;
export const RED_INDEX = 31;

export const MASK_COLOR = 0xF0;
export const MASK_VALUE = 0x0F;

export const MAX_WEAVE = 4; // 最大的组合牌
export const MAX_COUNT = 14; // 牌的数量(杠没计算)