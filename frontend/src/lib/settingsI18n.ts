export const BRANCH_FALLBACKS: Record<string, { name: Record<string, string>; address: Record<string, string> }> = {
  hcm: {
    name: {
      vi: 'Trụ Sở Chính TP. Hồ Chí Minh',
      en: 'Ho Chi Minh City Headquarter',
      zh: '胡志明市总公司',
      ko: '호치민시 본사',
      ja: 'ホーチミン市本社'
    },
    address: {
      vi: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      en: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
      zh: '胡志明市第一郡阮惠大道 123 号',
      ko: '호치민시 1군 응우옌후에 거리 123',
      ja: 'ホーチミン市1区グエンフエ通り123'
    }
  },
  danang: {
    name: {
      vi: 'Chi Nhánh Đà Nẵng',
      en: 'Da Nang Regional Office',
      zh: '岘港分公司',
      ko: '다낭 지사',
      ja: 'ダナン支社'
    },
    address: {
      vi: '168 Nguyễn Văn Linh, Phường Vĩnh Trung, Quận Thanh Khê, Đà Nẵng',
      en: '168 Nguyen Van Linh, Thanh Khe, Da Nang',
      zh: '岘港市清溪郡阮文灵路 168 号',
      ko: '다낭시 탄케군 응우옌반린 거리 168',
      ja: 'ダナン市タインケー区グエンヴァンリン通り168'
    }
  },
  hanoi: {
    name: {
      vi: 'Văn Phòng Đại Diện Hà Nội',
      en: 'Hanoi Representative Office',
      zh: '河内代表处',
      ko: '하노이 지사',
      ja: 'ハノイ支社'
    },
    address: {
      vi: '45 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội',
      en: '45 Trang Tien Street, Hoan Kiem District, Hanoi',
      zh: '河内市还剑郡长钱路 45 号',
      ko: '하노이시 호안끼엠군 짱띠엔 거리 45',
      ja: 'ハノイ市ホアンキエム区チャンティエン通り45'
    }
  }
};

export const WORKING_HOURS_FALLBACKS: {
  weekdays: Record<string, string>;
  weekend: Record<string, string>;
  hotlineNote: Record<string, string>;
} = {
  weekdays: {
    vi: 'Thứ Hai - Thứ Sáu: 08:00 - 21:00',
    en: 'Monday - Friday: 08:00 - 21:00',
    zh: '周一至周五：08:00 - 21:00',
    ko: '월요일 - 금요일: 08:00 - 21:00',
    ja: '月曜日 - 金曜日: 08:00 - 21:00'
  },
  weekend: {
    vi: 'Thứ Bảy - Chủ Nhật: 08:30 - 18:00',
    en: 'Saturday - Sunday: 08:30 - 18:00',
    zh: '周六至周日：08:30 - 18:00',
    ko: '토요일 - 일요일: 08:30 - 18:00',
    ja: '土曜日 - 日曜日: 08:30 - 18:00'
  },
  hotlineNote: {
    vi: 'Tổng đài chăm sóc khách hàng hỗ trợ 24/7 kể cả ngày Lễ & Tết',
    en: 'Customer Care Hotline operates 24/7 including Public Holidays',
    zh: '客服热线 24/7 全天候支持，节假日无休',
    ko: '고객 센터 24시간 연중무휴 지원',
    ja: 'カスタマーサポート 24時間年中無休'
  }
};

export function getLocalizedBranchInfo(branch: any, locale: string) {
  if (!branch) return { name: '', address: '' };
  const branchId = (branch.id || '').toLowerCase();
  const fallback = BRANCH_FALLBACKS[branchId] || (branch.isMain ? BRANCH_FALLBACKS.hcm : undefined);

  let name = '';
  if (typeof branch.name === 'object' && branch.name) {
    name = branch.name[locale] || fallback?.name[locale] || branch.name.en || branch.name.vi || '';
  } else if (typeof branch.name === 'string') {
    name = fallback?.name[locale] || branch.name;
  }

  let address = '';
  if (typeof branch.address === 'object' && branch.address) {
    address = branch.address[locale] || fallback?.address[locale] || branch.address.en || branch.address.vi || '';
  } else if (typeof branch.address === 'string') {
    address = fallback?.address[locale] || branch.address;
  }

  return {
    name: name || fallback?.name[locale] || fallback?.name.vi || '',
    address: address || fallback?.address[locale] || fallback?.address.vi || ''
  };
}

export function getLocalizedHours(hoursObj: any, type: 'weekdays' | 'weekend' | 'hotlineNote', locale: string) {
  if (typeof hoursObj === 'object' && hoursObj?.[type]) {
    const val = hoursObj[type];
    if (typeof val === 'object' && val) {
      return val[locale] || WORKING_HOURS_FALLBACKS[type][locale] || val.en || val.vi;
    }
  }
  return WORKING_HOURS_FALLBACKS[type][locale] || WORKING_HOURS_FALLBACKS[type].vi;
}
