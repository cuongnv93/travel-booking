const fs = require('fs');
const path = require('path');

const locales = ['vi', 'en', 'zh', 'ko', 'ja'];
const baseDir = path.join(__dirname, 'frontend/src/messages');

const translations = {
  about: {
    storyTag: { vi: "Câu Chuyện Travel Booking", en: "Travel Booking Story", zh: "Travel Booking 故事", ko: "Travel Booking 이야기", ja: "Travel Booking ストーリー" },
    visionTitle: { vi: "Tầm Nhìn", en: "Vision", zh: "愿景", ko: "비전", ja: "ビジョン" },
    visionDesc: { vi: "Trở thành nền tảng đặt phòng và tour du lịch hàng đầu Đông Nam Á...", en: "Becoming the leading booking platform in Southeast Asia...", zh: "成为东南亚领先的预订平台...", ko: "동남아 최고의 예약 플랫폼...", ja: "東南アジア有数の予約プラットフォームに..." },
    missionTitle: { vi: "Sứ Mệnh", en: "Mission", zh: "使命", ko: "사명", ja: "使命" },
    missionDesc: { vi: "Cung cấp dịch vụ chất lượng cao với giá trị minh bạch...", en: "Providing high quality services with transparent values...", zh: "提供高质量和透明的服务...", ko: "고품질의 투명한 서비스 제공...", ja: "高品質で透明なサービスを提供する..." },
    exploreTitle: { vi: "Khám Phá", en: "Explore", zh: "探索", ko: "탐험", ja: "探検" },
    exploreDesc: { vi: "Không ngừng đổi mới và tìm kiếm những điểm đến độc đáo...", en: "Constantly innovating and finding unique destinations...", zh: "不断创新并寻找独特的目的地...", ko: "지속적인 혁신과 독특한 목적지 발굴...", ja: "常に革新し、ユニークな目的地を見つける..." },
    ourStory: { vi: "Câu Chuyện Của Chúng Tôi", en: "Our Story", zh: "我们的故事", ko: "우리의 이야기", ja: "私たちのストーリー" },
    readyTitle: { vi: "Bạn đã sẵn sàng cho chuyến đi tiếp theo?", en: "Ready for your next trip?", zh: "准备好下一次旅行了吗？", ko: "다음 여행을 준비하셨나요?", ja: "次の旅行の準備はできましたか？" },
    readySub: { vi: "Hàng ngàn điểm đến thú vị đang chờ đón bạn.", en: "Thousands of exciting destinations await you.", zh: "成千上万个激动人心的目的地等着您。", ko: "수천 개의 흥미로운 목적지가 여러분을 기다립니다.", ja: "数千の魅力的な目的地があなたを待っています。" },
    exploreToursBtn: { vi: "Khám Phá Tour", en: "Explore Tours", zh: "探索行程", ko: "투어 탐색", ja: "ツアーを見る" },
    contactBtn: { vi: "Liên Hệ Tư Vấn", en: "Contact Us", zh: "联系我们", ko: "문의하기", ja: "お問い合わせ" }
  },
  contact: {
    heroTag: { vi: "☎️ Hỗ Trợ 24/7", en: "☎️ 24/7 Support", zh: "☎️ 24/7 支持", ko: "☎️ 24/7 지원", ja: "☎️ 24/7 サポート" },
    heroTitle: { vi: "Liên Hệ & Hỗ Trợ 24/7", en: "Contact & 24/7 Support", zh: "联系我们 & 24/7 支持", ko: "연락처 및 24/7 지원", ja: "お問い合わせ & 24/7 サポート" },
    heroSub: { vi: "Chúng tôi luôn lắng nghe và sẵn sàng hỗ trợ mọi thắc mắc của bạn.", en: "We are always here to listen and ready to support you.", zh: "我们随时准备倾听并支持您的问题。", ko: "저희는 항상 귀하의 질문에 귀 기울이고 지원할 준비가 되어 있습니다.", ja: "お客様のご質問に耳を傾け、サポートいたします。" },
    infoTitle: { vi: "Thông Tin Liên Hệ", en: "Contact Information", zh: "联系方式", ko: "연락처 정보", ja: "連絡先情報" },
    hqTitle: { vi: "Trụ Sở Chính", en: "Headquarters", zh: "总部", ko: "본사", ja: "本社" },
    hotlineTitle: { vi: "Tổng Đài Khách Hàng", en: "Customer Hotline", zh: "客服热线", ko: "고객 센터", ja: "カスタマーホットライン" },
    hotlineSub: { vi: "Miễn phí cước gọi 24/7", en: "Toll-free 24/7", zh: "免费拨打 24/7", ko: "수신자 부담 24/7", ja: "フリーダイヤル 24/7" },
    emailTitle: { vi: "Email Tư Vấn", en: "Consulting Email", zh: "咨询邮箱", ko: "상담 이메일", ja: "相談メール" },
    hoursTitle: { vi: "Giờ Làm Việc", en: "Working Hours", zh: "工作时间", ko: "영업 시간", ja: "営業時間" },
    hoursDesc: { vi: "Thứ Hai - Chủ Nhật: 08:00 - 21:00", en: "Mon - Sun: 08:00 - 21:00", zh: "周一 - 周日: 08:00 - 21:00", ko: "월 - 일: 08:00 - 21:00", ja: "月 - 日: 08:00 - 21:00" },
    formTitle: { vi: "Gửi Tin Nhắn Cho Chúng Tôi", en: "Send Us a Message", zh: "给我们发消息", ko: "메시지 보내기", ja: "メッセージを送信" },
    formSub: { vi: "Vui lòng điền thông tin bên dưới, chuyên viên tư vấn sẽ liên hệ lại.", en: "Please fill out the info below, our consultant will contact you.", zh: "请填写以下信息，我们的顾问会与您联系。", ko: "아래 정보를 작성해주시면 상담원이 연락드리겠습니다.", ja: "以下の情報をご記入ください。担当者がご連絡いたします。" },
    nameLabel: { vi: "Họ và tên *", en: "Full Name *", zh: "姓名 *", ko: "이름 *", ja: "氏名 *" },
    emailLabel: { vi: "Email *", en: "Email *", zh: "电子邮件 *", ko: "이메일 *", ja: "メール *" },
    phoneLabel: { vi: "Số điện thoại *", en: "Phone Number *", zh: "电话号码 *", ko: "전화번호 *", ja: "電話番号 *" },
    subjectLabel: { vi: "Chủ đề cần tư vấn", en: "Subject", zh: "咨询主题", ko: "주제", ja: "件名" },
    msgLabel: { vi: "Nội dung tin nhắn *", en: "Message Content *", zh: "留言内容 *", ko: "메시지 내용 *", ja: "メッセージ内容 *" },
    submitBtn: { vi: "Gửi Tin Nhắn", en: "Send Message", zh: "发送信息", ko: "메시지 보내기", ja: "メッセージを送信" },
    successTitle: { vi: "Gửi Thông Tin Thành Công!", en: "Message Sent Successfully!", zh: "信息发送成功！", ko: "메시지가 성공적으로 전송되었습니다!", ja: "送信成功！" },
    successDesc: { vi: "Cảm ơn bạn đã liên hệ. Chúng tôi đã nhận được tin nhắn.", en: "Thank you for contacting us. We have received your message.", zh: "感谢您的联系。我们已收到您的信息。", ko: "연락해 주셔서 감사합니다. 귀하의 메시지를 받았습니다.", ja: "ご連絡ありがとうございます。メッセージを受け取りました。" },
    anotherMsgBtn: { vi: "Gửi tin nhắn khác", en: "Send another message", zh: "发送其他信息", ko: "다른 메시지 보내기", ja: "別のメッセージを送信" }
  },
  search: {
    heroTitle: { vi: "Kết Quả Tìm Kiếm Chuyến Đi", en: "Trip Search Results", zh: "旅行搜索结果", ko: "여행 검색 결과", ja: "旅行検索結果" },
    heroSub: { vi: "Khám phá hàng ngàn tour, khách sạn và cẩm nang du lịch", en: "Explore thousands of tours, hotels, and travel guides", zh: "探索数以千计的旅游、酒店和指南", ko: "수천 개의 투어, 호텔 및 여행 가이드 탐색", ja: "数千のツアー、ホテル、旅行ガイドを検索" },
    placeholder: { vi: "Nhập từ khóa (Hà Nội, Phú Quốc...)...", en: "Enter keywords (Hanoi, Phu Quoc...)...", zh: "输入关键字（河内，富国岛...）...", ko: "키워드를 입력하세요 (하노이, 푸꾸옥...)...", ja: "キーワードを入力（ハノイ、フーコックなど）..." },
    searchBtn: { vi: "Tìm Kiếm", en: "Search", zh: "搜索", ko: "검색", ja: "検索" },
    tabAll: { vi: "Tất Cả Kết Quả", en: "All Results", zh: "所有结果", ko: "모든 결과", ja: "すべての結果" },
    tabTours: { vi: "Tour Du Lịch", en: "Tours", zh: "旅行团", ko: "투어", ja: "ツアー" },
    tabHotels: { vi: "Khách Sạn & Resort", en: "Hotels & Resorts", zh: "酒店和度假村", ko: "호텔 및 리조트", ja: "ホテル＆リゾート" },
    tabNews: { vi: "Cẩm Nang Du Lịch", en: "Travel Guides", zh: "旅游指南", ko: "여행 가이드", ja: "旅行ガイド" },
    emptySearch: { vi: "Vui lòng nhập từ khóa tìm kiếm ở trên để bắt đầu khám phá!", en: "Please enter a keyword above to start exploring!", zh: "请输入关键字开始探索！", ko: "위에서 키워드를 입력하고 탐색을 시작하세요!", ja: "上部のキーワードを入力して検索を開始してください！" },
    noResults: { vi: "Không tìm thấy kết quả nào phù hợp với từ khóa", en: "No results found for", zh: "未找到符合的结果", ko: "일치하는 결과를 찾을 수 없습니다", ja: "一致する結果が見つかりません" },
    tryShorter: { vi: "Hãy thử nhập từ khóa ngắn hơn...", en: "Try entering a shorter keyword...", zh: "尝试输入较短的关键字...", ko: "더 짧은 키워드를 입력해 보세요...", ja: "短いキーワードを試してください..." },
    seeAllToursBtn: { vi: "Xem Tất Cả Tours Du Lịch", en: "See All Tours", zh: "查看所有旅行团", ko: "모든 투어 보기", ja: "すべてのツアーを見る" },
    duration: { vi: "Thời gian:", en: "Duration:", zh: "时间:", ko: "시간:", ja: "時間:" },
    from: { vi: "Từ", en: "From", zh: "从", ko: "부터", ja: "から" },
    perNight: { vi: "1 đêm từ", en: "1 night from", zh: "1晚起", ko: "1박부터", ja: "1泊から" },
    readMore: { vi: "Đọc thêm →", en: "Read more →", zh: "阅读更多 →", ko: "더 읽기 →", ja: "続きを読む →" }
  },
  cart: {
    emptyTitle: { vi: "Giỏ Hàng Đặt Tour Trống", en: "Empty Cart", zh: "购物车为空", ko: "빈 장바구니", ja: "カートは空です" },
    emptyDesc: { vi: "Bạn chưa chọn gói tour hoặc dịch vụ du lịch nào.", en: "You haven't selected any tours or services.", zh: "您还没有选择任何旅游或服务。", ko: "아직 투어나 서비스를 선택하지 않았습니다.", ja: "ツアーやサービスが選択されていません。" },
    exploreBtn: { vi: "Khám Phá Tours Du Lịch", en: "Explore Tours", zh: "探索旅行团", ko: "투어 탐색", ja: "ツアーを見る" },
    bookHotelBtn: { vi: "Đặt Khách Sạn", en: "Book Hotels", zh: "预订酒店", ko: "호텔 예약", ja: "ホテルを予約" },
    step1: { vi: "Giỏ Hàng & Dịch Vụ", en: "Cart & Services", zh: "购物车与服务", ko: "장바구니 및 서비스", ja: "カートとサービス" },
    step2: { vi: "Thông Tin Khách Hàng", en: "Customer Info", zh: "客户信息", ko: "고객 정보", ja: "顧客情報" },
    step3: { vi: "Xác Nhận & VietQR", en: "Confirm & Payment", zh: "确认并支付", ko: "확인 및 결제", ja: "確認して支払い" },
    orderDetailTitle: { vi: "Chi Tiết Đơn Hàng", en: "Order Details", zh: "订单详情", ko: "주문 세부정보", ja: "注文の詳細" },
    autoHold: { vi: "Giữ chỗ tự động 24h", en: "Auto-hold for 24h", zh: "自动保留 24 小时", ko: "24시간 자동 유지", ja: "24時間の自動保留" },
    serviceCode: { vi: "Mã Dịch Vụ:", en: "Service Code:", zh: "服务代码:", ko: "서비스 코드:", ja: "サービスコード:" },
    tourPackage: { vi: "Tour Trọn Gói", en: "Package Tour", zh: "套餐游", ko: "패키지 투어", ja: "パッケージツアー" },
    depDate: { vi: "Ngày khởi hành:", en: "Departure date:", zh: "出发日期:", ko: "출발일:", ja: "出発日:" },
    destination: { vi: "Điểm đến:", en: "Destination:", zh: "目的地:", ko: "목적지:", ja: "目的地:" },
    adults: { vi: "Người lớn:", en: "Adults:", zh: "成人:", ko: "성인:", ja: "大人:" },
    children: { vi: "Trẻ em:", en: "Children:", zh: "儿童:", ko: "어린이:", ja: "子供:" },
    totalAmt: { vi: "Thành tiền", en: "Total amount", zh: "总额", ko: "총액", ja: "合計金額" },
    couponTitle: { vi: "Mã Ưu Đãi / Voucher Giảm Giá", en: "Coupon / Voucher Code", zh: "优惠券/代金券", ko: "쿠폰/바우처 코드", ja: "クーポン/バウチャーコード" },
    couponDesc: { vi: "Nhập mã TRAVEL2026 để giảm ngay 200.000đ", en: "Enter code TRAVEL2026 for a 200,000VND discount", zh: "输入代码 TRAVEL2026 即可立减 200,000 越南盾", ko: "TRAVEL2026 코드를 입력하여 200,000VND 할인받으세요", ja: "コード TRAVEL2026 を入力すると 200,000VND 割引" },
    applyBtn: { vi: "Áp Dụng", en: "Apply", zh: "应用", ko: "적용", ja: "適用" },
    contactInfoTitle: { vi: "Thông Tin Liên Hệ Đặt Chỗ", en: "Booking Contact Information", zh: "预订联系信息", ko: "예약 연락처 정보", ja: "予約連絡先情報" },
    nameLabel: { vi: "Họ và tên khách hàng *", en: "Full Name *", zh: "姓名 *", ko: "이름 *", ja: "氏名 *" },
    phoneLabel: { vi: "Số điện thoại *", en: "Phone Number *", zh: "电话号码 *", ko: "전화번호 *", ja: "電話番号 *" },
    emailLabel: { vi: "Email nhận vé *", en: "Email for ticket *", zh: "接收电子票的邮箱 *", ko: "티켓을 받을 이메일 *", ja: "チケット用メール *" },
    addressLabel: { vi: "Địa chỉ sinh sống", en: "Living Address", zh: "居住地址", ko: "거주 주소", ja: "現住所" },
    notesLabel: { vi: "Ghi chú đặc biệt", en: "Special Notes", zh: "特殊要求", ko: "특별 요청", ja: "特別なご要望" },
    paymentMethodTitle: { vi: "Phương Thức Thanh Toán", en: "Payment Method", zh: "支付方式", ko: "결제 방법", ja: "支払い方法" },
    vietqrTitle: { vi: "Chuyển Khoản VietQR Auto", en: "VietQR Transfer", zh: "VietQR 自动转账", ko: "VietQR 송금", ja: "VietQR 自動振込" },
    vietqrDesc: { vi: "Napas 24/7 tức thì & không tốn phí", en: "Napas 24/7 instant & free", zh: "Napas 24/7 即时且免费", ko: "Napas 24/7 즉시 및 무료", ja: "Napas 24/7 即時＆無料" },
    officeTitle: { vi: "Thanh Toán Tại Văn Phòng", en: "Pay at Office", zh: "在办公室付款", ko: "사무실에서 결제", ja: "オフィスでの支払い" },
    officeDesc: { vi: "Giữ chỗ trước, nộp tiền mặt sau", en: "Reserve now, pay cash later", zh: "先预留，后付现金", ko: "예약 후 현금 결제", ja: "今すぐ予約、後で現金支払い" },
    subtotal: { vi: "Tạm tính", en: "Subtotal", zh: "小计", ko: "소계", ja: "小計" },
    services: { vi: "dịch vụ", en: "services", zh: "服务", ko: "서비스", ja: "サービス" },
    voucherDiscount: { vi: "Giảm giá Voucher", en: "Voucher Discount", zh: "优惠券折扣", ko: "바우처 할인", ja: "バウチャー割引" },
    taxFee: { vi: "Phí dịch vụ & Thuế", en: "Service Fee & Tax", zh: "服务费及税费", ko: "서비스 이용료 및 세금", ja: "サービス料と税金" },
    free: { vi: "Miễn phí", en: "Free", zh: "免费", ko: "무료", ja: "無料" },
    finalTotal: { vi: "Tổng tiền thanh toán", en: "Final Total", zh: "总计", ko: "총 지불액", ja: "お支払い合計" },
    checkoutBtn: { vi: "Xác Nhận & Tạo Đơn Đặt Tour", en: "Confirm & Create Order", zh: "确认并创建订单", ko: "주문 확인 및 생성", ja: "注文の確認と作成" },
    secureTitle: { vi: "Bảo mật 100%", en: "100% Secure", zh: "100% 安全", ko: "100% 안전", ja: "100% 安全" },
    instantHold: { vi: "Giữ chỗ tức thì", en: "Instant Hold", zh: "即时保留", ko: "즉시 예약 유지", ja: "即時予約" }
  },
  lookup: {
    heroTitle: { vi: "Tra Cứu Đơn Đặt Tour", en: "Lookup Tour Booking", zh: "查询旅游订单", ko: "투어 예약 조회", ja: "ツアー予約の確認" },
    heroSub: { vi: "Nhập mã đặt chỗ (VD: TRV-123456) để kiểm tra tình trạng chuyến đi", en: "Enter booking code (e.g., TRV-123456) to check trip status", zh: "输入预订代码 (例如: TRV-123456) 以检查行程状态", ko: "예약 코드(예: TRV-123456)를 입력하여 여행 상태를 확인하세요", ja: "予約コード（例：TRV-123456）を入力して旅行のステータスを確認してください" },
    placeholder: { vi: "Nhập mã đặt tour (VD: TRV-891234)", en: "Enter tour booking code", zh: "输入预订代码", ko: "예약 코드 입력", ja: "予約コードを入力" },
    lookupBtn: { vi: "Tra Cứu Ngay", en: "Lookup Now", zh: "立即查询", ko: "지금 조회하기", ja: "今すぐ確認" },
    orderCode: { vi: "Mã đơn hàng", en: "Order code", zh: "订单号", ko: "주문 코드", ja: "注文コード" },
    confirmed: { vi: "Đã xác nhận", en: "Confirmed", zh: "已确认", ko: "확인됨", ja: "確認済み" },
    cancelled: { vi: "Đã hủy", en: "Cancelled", zh: "已取消", ko: "취소됨", ja: "キャンセルされました" },
    pending: { vi: "Đang chờ xử lý", en: "Pending", zh: "待处理", ko: "처리 중", ja: "保留中" },
    customerInfo: { vi: "Thông tin khách hàng", en: "Customer info", zh: "客户信息", ko: "고객 정보", ja: "顧客情報" },
    tripDetails: { vi: "Chi tiết chuyến đi", en: "Trip details", zh: "行程详情", ko: "여행 세부정보", ja: "旅行の詳細" },
    depDate: { vi: "Ngày khởi hành:", en: "Departure date:", zh: "出发日期:", ko: "출발일:", ja: "出発日:" },
    guestsInfo: { vi: "Số khách:", en: "Guests:", zh: "客人数量:", ko: "게스트:", ja: "ゲスト数:" },
    totalAmt: { vi: "Tổng thanh toán:", en: "Total Amount:", zh: "总额:", ko: "총액:", ja: "合計金額:" }
  },
  success: {
    heroTitle: { vi: "Đặt Chỗ Thành Công!", en: "Booking Successful!", zh: "预订成功！", ko: "예약 성공!", ja: "予約完了！" },
    heroSub: { vi: "Cảm ơn bạn đã lựa chọn Travel. Chúng tôi đã nhận được thông tin đặt chỗ của bạn.", en: "Thank you for choosing Travel. We have received your booking information.", zh: "感谢您选择Travel。我们已经收到了您的预订信息。", ko: "Travel을 선택해 주셔서 감사합니다. 귀하의 예약 정보를 받았습니다.", ja: "Travelをお選びいただきありがとうございます。予約情報を受け取りました。" },
    codeLabel: { vi: "Mã đặt chỗ của bạn", en: "Your Booking Code", zh: "您的预订代码", ko: "예약 코드", ja: "予約コード" },
    codeSub: { vi: "Vui lòng lưu lại mã này để tra cứu tình trạng chuyến đi.", en: "Please save this code to check your trip status.", zh: "请保存此代码以检查您的旅行状态。", ko: "여행 상태를 확인하려면 이 코드를 저장해 두세요.", ja: "旅行のステータスを確認するために、このコードを保存してください。" },
    serviceBooked: { vi: "Dịch vụ đã đặt", en: "Service Booked", zh: "预订的服务", ko: "예약된 서비스", ja: "予約されたサービス" },
    pendingCheck: { vi: "Chờ xác nhận", en: "Pending Check", zh: "等待确认", ko: "확인 대기 중", ja: "確認待ち" },
    time: { vi: "Thời gian", en: "Time", zh: "时间", ko: "시간", ja: "時間" },
    quantity: { vi: "Số lượng", en: "Quantity", zh: "数量", ko: "수량", ja: "数量" },
    totalPayment: { vi: "Tổng thanh toán:", en: "Total Payment:", zh: "总额:", ko: "총액:", ja: "お支払い合計:" },
    customerName: { vi: "Người đặt:", en: "Booked by:", zh: "预订人:", ko: "예약자:", ja: "予約者:" },
    qrTitle: { vi: "Thanh Toán Chuyển Khoản Qua VietQR", en: "VietQR Transfer Payment", zh: "VietQR 转账支付", ko: "VietQR 송금 결제", ja: "VietQR 振込支払い" },
    qrDesc: { vi: "Quét mã QR để chuyển khoản chính xác nội dung & số tiền", en: "Scan QR code to transfer exact amount and description", zh: "扫描二维码即可转账确切金额和说明", ko: "정확한 금액과 설명을 이체하려면 QR 코드를 스캔하세요.", ja: "QRコードをスキャンして正確な金額と説明を振り込んでください" },
    autoFill: { vi: "Tự động điền", en: "Auto-fill", zh: "自动填充", ko: "자동 채우기", ja: "自動入力" },
    bank: { vi: "Ngân hàng:", en: "Bank:", zh: "银行:", ko: "은행:", ja: "銀行:" },
    bankNo: { vi: "Số tài khoản:", en: "Account number:", zh: "账号:", ko: "계좌 번호:", ja: "口座番号:" },
    accName: { vi: "Chủ tài khoản:", en: "Account name:", zh: "账户名:", ko: "계좌명:", ja: "口座名:" },
    amount: { vi: "Số tiền:", en: "Amount:", zh: "金额:", ko: "금액:", ja: "金額:" },
    content: { vi: "Nội dung CK:", en: "Transfer description:", zh: "转账说明:", ko: "송금 설명:", ja: "振込説明:" },
    homeBtn: { vi: "Trang chủ", en: "Home", zh: "首页", ko: "홈", ja: "ホーム" },
    lookupBtn: { vi: "Tra cứu đơn hàng", en: "Lookup order", zh: "查询订单", ko: "주문 조회", ja: "注文検索" }
  },
  profile: {
    heroTitle: { vi: "Hồ Sơ Cá Nhân", en: "Personal Profile", zh: "个人资料", ko: "개인 프로필", ja: "個人プロフィール" },
    heroSub: { vi: "Quản lý thông tin tài khoản và thông tin liên hệ", en: "Manage account and contact information", zh: "管理账户和联系信息", ko: "계정 및 연락처 정보 관리", ja: "アカウントと連絡先情報の管理" },
    viewBookingsBtn: { vi: "Xem Đơn Đặt Tour", en: "View Bookings", zh: "查看订单", ko: "주문 보기", ja: "注文を見る" },
    successUpdate: { vi: "Cập nhật thông tin hồ sơ thành công!", en: "Profile updated successfully!", zh: "个人资料更新成功！", ko: "프로필이 성공적으로 업데이트되었습니다!", ja: "プロフィールが正常に更新されました！" },
    nameLabel: { vi: "Họ và tên", en: "Full Name", zh: "姓名", ko: "이름", ja: "氏名" },
    emailLabel: { vi: "Email (Cố định)", en: "Email (Fixed)", zh: "电子邮箱（不可修改）", ko: "이메일 (고정)", ja: "メール (固定)" },
    phoneLabel: { vi: "Số điện thoại", en: "Phone Number", zh: "电话号码", ko: "전화번호", ja: "電話番号" },
    roleLabel: { vi: "Vai trò tài khoản", en: "Account Role", zh: "账户角色", ko: "계정 역할", ja: "アカウントの役割" },
    roleAdmin: { vi: "Quản Trị Viên (Admin)", en: "Administrator", zh: "管理员", ko: "관리자", ja: "管理者" },
    roleCustomer: { vi: "Khách Hàng Thành Viên", en: "Member Customer", zh: "会员客户", ko: "회원 고객", ja: "メンバーカスタマー" },
    addressLabel: { vi: "Địa chỉ giao dịch", en: "Trading Address", zh: "交易地址", ko: "거래 주소", ja: "取引住所" },
    saveBtn: { vi: "Lưu Thay Đổi", en: "Save Changes", zh: "保存更改", ko: "변경 사항 저장", ja: "変更を保存" }
  },
  visa: {
    heroTitle: { vi: "Dịch Vụ Hỗ Trợ Visa Du Lịch", en: "Tourist Visa Services", zh: "旅游签证服务", ko: "관광 비자 서비스", ja: "観光ビザサービス" },
    heroSub: { vi: "Trọn gói thủ tục - Tỷ lệ đậu cao - Xử lý nhanh chóng", en: "Full package - High approval rate - Fast processing", zh: "全包服务 - 高通过率 - 快速办理", ko: "풀 패키지 - 높은 승인률 - 빠른 처리", ja: "フルパッケージ - 高い承認率 - 迅速な処理" },
    countriesTitle: { vi: "Visa Các Nước Phổ Biến", en: "Popular Visas", zh: "热门签证", ko: "인기 비자", ja: "人気のビザ" },
    processTitle: { vi: "Quy Trình Xin Visa", en: "Visa Process", zh: "签证申请流程", ko: "비자 신청 절차", ja: "ビザ申請プロセス" },
    step1Title: { vi: "Tư Vấn & Đánh Giá", en: "Consultation & Assessment", zh: "咨询与评估", ko: "상담 및 평가", ja: "相談と評価" },
    step1Desc: { vi: "Chuyên viên sẽ liên hệ và đánh giá hồ sơ của bạn miễn phí.", en: "Specialists will contact and evaluate your profile for free.", zh: "专家将联系您并免费评估您的资料。", ko: "전문가가 연락하여 귀하의 프로필을 무료로 평가해 드립니다.", ja: "専門家がご連絡し、無料でプロフィールを評価します。" },
    step2Title: { vi: "Chuẩn Bị Hồ Sơ", en: "Prepare Documents", zh: "准备材料", ko: "서류 준비", ja: "書類の準備" },
    step2Desc: { vi: "Hướng dẫn chi tiết giấy tờ cần thiết, hỗ trợ dịch thuật công chứng.", en: "Detailed guide on required documents, notarized translation support.", zh: "有关所需文件的详细指南，提供公证翻译支持。", ko: "필요한 서류에 대한 자세한 안내, 공증 번역 지원.", ja: "必要な書類の詳しい案内、公証翻訳のサポート。" },
    step3Title: { vi: "Nộp Hồ Sơ & Lấy Dấu Vân Tay", en: "Submit & Biometrics", zh: "提交申请 & 录入指纹", ko: "제출 및 생체 인식", ja: "提出と指紋採取" },
    step3Desc: { vi: "Hỗ trợ đặt lịch hẹn, đồng hành cùng khách hàng tại trung tâm tiếp nhận.", en: "Support booking appointments, accompany customers at the center.", zh: "协助预约，在中心陪同客户。", ko: "예약 지원, 센터에서 고객 동행.", ja: "予約のサポート、センターでのお客様の同行。" },
    step4Title: { vi: "Nhận Kết Quả", en: "Receive Results", zh: "获取结果", ko: "결과 수령", ja: "結果の受け取り" },
    step4Desc: { vi: "Theo dõi tiến độ, nhận visa và bàn giao tận tay khách hàng.", en: "Track progress, receive visa and hand it over to customers.", zh: "跟踪进度，领取签证并亲自交给客户。", ko: "진행 상황을 추적하고 비자를 받아 고객에게 전달합니다.", ja: "進捗状況を追跡し、ビザを受け取り、お客様にお渡しします。" },
    whyChooseTitle: { vi: "Vì Sao Chọn Dịch Vụ Của Chúng Tôi?", en: "Why Choose Us?", zh: "为什么选择我们的服务？", ko: "왜 우리를 선택해야 합니까?", ja: "なぜ当社のサービスを選ぶのですか？" },
    reason1Title: { vi: "Tỷ Lệ Đậu Lên Đến 99%", en: "Up to 99% Approval", zh: "通过率高达 99%", ko: "최대 99% 승인률", ja: "最大99%の承認率" },
    reason1Desc: { vi: "Hồ sơ được thẩm định kỹ lưỡng bởi chuyên gia trước khi nộp.", en: "Profiles are carefully evaluated by experts before submission.", zh: "资料在提交前由专家进行仔细评估。", ko: "프로필은 제출 전에 전문가가 신중하게 평가합니다.", ja: "提出前に専門家によってプロフィールが慎重に評価されます。" },
    reason2Title: { vi: "Xử Lý Nhanh Chóng", en: "Fast Processing", zh: "处理速度快", ko: "빠른 처리", ja: "迅速な処理" },
    reason2Desc: { vi: "Có dịch vụ xử lý khẩn cấp (VIP) cho khách hàng cần đi gấp.", en: "VIP express processing available for urgent trips.", zh: "为需要紧急出行的客户提供加急处理服务（VIP）。", ko: "긴급한 여행을 위해 VIP 특급 처리 서비스 이용 가능.", ja: "お急ぎの旅行にはVIPのスピード処理がご利用いただけます。" },
    reason3Title: { vi: "Minh Bạch Chi Phí", en: "Transparent Costs", zh: "费用透明", ko: "투명한 비용", ja: "透明なコスト" },
    reason3Desc: { vi: "Cam kết không phát sinh bất kỳ khoản phí nào sau khi báo giá.", en: "Commitment to no hidden fees after quoting.", zh: "承诺报价后没有任何隐藏费用。", ko: "견적 후 숨겨진 수수료가 없음을 약속합니다.", ja: "お見積り後の追加料金は一切かかりません。" },
    contactSpec: { vi: "Đội Ngũ Chuyên Gia Visa Đang Online (24/7)", en: "Visa Experts Team Online (24/7)", zh: "签证专家团队在线 (24/7)", ko: "비자 전문가 팀 온라인 (24/7)", ja: "ビザ専門家チーム オンライン (24/7)" },
    hotlineConsult: { vi: "Hotline Tư Vấn Chuyên Sâu", en: "Expert Consultation Hotline", zh: "专家咨询热线", ko: "전문가 상담 핫라인", ja: "専門家への相談ホットライン" },
    emailReq: { vi: "Gửi Yêu Cầu Đánh Giá Hồ Sơ", en: "Send Profile Evaluation Request", zh: "发送资料评估请求", ko: "프로필 평가 요청 보내기", ja: "プロフィールの評価リクエストを送信" },
    consultationTitle: { vi: "Đăng Ký Tư Vấn Visa Miễn Phí", en: "Register for Free Consultation", zh: "注册免费签证咨询", ko: "무료 비자 상담 등록", ja: "無料ビザ相談に登録" }
  },
  flights: {
    heroTitle: { vi: "Săn Vé Máy Bay Giá Tốt", en: "Hunt for Cheap Flights", zh: "寻找廉价机票", ko: "저렴한 항공편 찾기", ja: "格安航空券を探す" },
    heroSub: { vi: "Khám phá hàng ngàn chặng bay quốc tế & nội địa với mức giá ưu đãi nhất từ các đối tác hàng không", en: "Explore thousands of domestic & international flights at the best prices", zh: "从航空合作伙伴那里探索数以千计的国内外航班", ko: "항공 파트너로부터 수천 개의 국내 및 국제선 항공편을 가장 좋은 가격에 탐색하세요", ja: "航空パートナーからの最安値で数千の国内および国際線航空券を検索" },
    roundTrip: { vi: "Khứ hồi", en: "Round Trip", zh: "往返", ko: "왕복", ja: "往復" },
    oneWay: { vi: "Một chiều", en: "One Way", zh: "单程", ko: "편도", ja: "片道" },
    from: { vi: "Từ", en: "From", zh: "从", ko: "출발지", ja: "出発地" },
    to: { vi: "Đến", en: "To", zh: "到", ko: "도착지", ja: "目的地" },
    departDate: { vi: "Ngày đi", en: "Departure", zh: "出发日期", ko: "출발일", ja: "出発日" },
    searchBtn: { vi: "Tìm Chuyến Bay", en: "Search Flights", zh: "搜索航班", ko: "항공편 검색", ja: "航空券の検索" },
    resultsTitle: { vi: "Kết Quả Tìm Kiếm ({count} chuyến bay)", en: "Search Results ({count} flights)", zh: "搜索结果 ({count} 趟航班)", ko: "검색 결과 ({count} 개 항공편)", ja: "検索結果 ({count} 件のフライト)" },
    departure: { vi: "Cất cánh", en: "Take-off", zh: "起飞", ko: "이륙", ja: "離陸" },
    landing: { vi: "Hạ cánh", en: "Landing", zh: "降落", ko: "착륙", ja: "着陸" },
    duration: { vi: "Thời gian bay", en: "Duration", zh: "飞行时间", ko: "비행 시간", ja: "飛行時間" },
    bookFlightBtn: { vi: "Đặt Vé Ngay", en: "Book Now", zh: "立即预订", ko: "지금 예약하기", ja: "今すぐ予約" },
    noFlights: { vi: "Không tìm thấy chuyến bay phù hợp", en: "No matching flights found", zh: "未找到符合的航班", ko: "일치하는 항공편이 없습니다", ja: "該当するフライトが見つかりません" },
    tourCombo: { vi: "Gói Tour Du Lịch HOT Kết Hợp Chuyến Bay", en: "HOT Tour & Flight Combos", zh: "热门旅游与航班组合", ko: "인기 투어 & 항공편 콤보", ja: "人気のツアー＆フライトコンボ" },
    bookingModalTitle: { vi: "Xác Nhận Đặt Vé Máy Bay", en: "Confirm Flight Booking", zh: "确认机票预订", ko: "항공편 예약 확인", ja: "フライト予約の確認" },
    contactInfo: { vi: "Thông tin liên hệ", en: "Contact Information", zh: "联系方式", ko: "연락처 정보", ja: "連絡先情報" },
    confirmBtn: { vi: "Xác Nhận Đặt Vé", en: "Confirm Booking", zh: "确认预订", ko: "예약 확인", ja: "予約を確定" }
  },
  filters: {
    destinations: { vi: "Lọc theo khu vực", en: "Filter by region", zh: "按地区筛选", ko: "지역별 필터", ja: "地域で絞り込む" },
    allDests: { vi: "Tất cả điểm đến", en: "All destinations", zh: "所有目的地", ko: "모든 목적지", ja: "すべての目的地" },
    priceRange: { vi: "Khoảng giá", en: "Price Range", zh: "价格范围", ko: "가격 범위", ja: "価格帯" },
    starRating: { vi: "Hạng sao", en: "Star Rating", zh: "星级评分", ko: "별점 등급", ja: "星評価" },
    allStars: { vi: "Tất cả", en: "All", zh: "所有", ko: "모두", ja: "すべて" }
  }
};

locales.forEach(loc => {
  const file = path.join(baseDir, `${loc}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  for (const [moduleName, keys] of Object.entries(translations)) {
    if (!data[moduleName]) data[moduleName] = {};
    for (const [key, tr] of Object.entries(keys)) {
      data[moduleName][key] = tr[loc];
    }
  }
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`Updated ${loc}.json`);
});
