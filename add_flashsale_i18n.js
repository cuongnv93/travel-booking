const fs = require('fs');
const path = require('path');

const locales = ['vi', 'en', 'zh', 'ko', 'ja'];
const baseDir = path.join(__dirname, 'frontend', 'src', 'messages');

const flashSaleTranslations = {
  vi: {
    title: '🔥 FLASH SALE GIỜ VÀNG',
    subtitle: 'Cơ hội săn vé & phòng ưu đãi cực sốc. Số lượng giới hạn!',
    hotBadge: 'GIẢM ĐẾN 50%',
    endsIn: 'Kết Thúc Trong',
    buyBtn: 'Săn Deal',
    itemTimerLabel: 'Hết hạn trong:'
  },
  en: {
    title: '🔥 GOLDEN HOUR FLASH SALE',
    subtitle: 'Unbeatable deals on tours & hotels. Limited availability!',
    hotBadge: 'UP TO 50% OFF',
    endsIn: 'Ends In',
    buyBtn: 'Grab Deal',
    itemTimerLabel: 'Expires in:'
  },
  zh: {
    title: '🔥 黄金时段限时特惠',
    subtitle: '旅游与酒店惊爆特价，数量有限！',
    hotBadge: '最高 50% 折扣',
    endsIn: '距离结束',
    buyBtn: '立即抢购',
    itemTimerLabel: '倒计时:'
  },
  ko: {
    title: '🔥 골든 타임 타임 딜',
    subtitle: '투어 & 호텔 파격 할인 기회. 한정 수량!',
    hotBadge: '최대 50% 할인',
    endsIn: '마감까지',
    buyBtn: '딜 획득',
    itemTimerLabel: '남은 시간:'
  },
  ja: {
    title: '🔥 タイムセール開催中',
    subtitle: 'ツアー＆ホテルの超お得な限定セール。数量限定！',
    hotBadge: '最大50% OFF',
    endsIn: '終了まで',
    buyBtn: '今すぐゲット',
    itemTimerLabel: '残り時間:'
  }
};

locales.forEach(loc => {
  const filePath = path.join(baseDir, `${loc}.json`);
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    content.flashSale = flashSaleTranslations[loc];
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
    console.log(`Added flashSale namespace to ${loc}.json`);
  }
});
