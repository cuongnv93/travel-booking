const fs = require('fs');
const path = require('path');

const locales = ['vi', 'en', 'zh', 'ko', 'ja'];
const baseDir = path.join(__dirname, 'frontend', 'src', 'messages');

const commonTranslations = {
  vi: {
    from: 'Từ',
    viewDetails: 'Xem Chi Tiết',
    viewAll: 'Xem Tất Cả',
    readMore: 'Đọc Thêm'
  },
  en: {
    from: 'From',
    viewDetails: 'View Details',
    viewAll: 'View All',
    readMore: 'Read More'
  },
  zh: {
    from: '起',
    viewDetails: '查看详情',
    viewAll: '查看全部',
    readMore: '阅读更多'
  },
  ko: {
    from: '부터',
    viewDetails: '상세 보기',
    viewAll: '모두 보기',
    readMore: '더 đọc기'
  },
  ja: {
    from: 'から',
    viewDetails: '詳細を見る',
    viewAll: 'すべて見る',
    readMore: '続きを読む'
  }
};

locales.forEach(loc => {
  const filePath = path.join(baseDir, `${loc}.json`);
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    content.common = {
      ...(content.common || {}),
      ...commonTranslations[loc]
    };
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
    console.log(`Updated common namespace in ${loc}.json`);
  }
});
