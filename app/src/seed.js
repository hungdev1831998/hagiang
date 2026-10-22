// Dữ liệu ban đầu: ghi vào Firestore ở lần đăng nhập đầu tiên, sau đó cả nhóm tự sửa trên web.
// Lịch trình chép theo file Figma "Hà Giang" (giờ giấc giữ nguyên). Chỉ đổi những chỗ bị chuyến bay thật
// ràng buộc: Day 1 (VJ128 17:20 → 19:30), tối Day 5 và Day 6 (VJ157 12:55).

const img = (name) => `/img/stops/${name}.png`
const FIGMA_DAY = (n) => `/img/figma/new/Day ${n}.png`

let n = 0
const id = () => `s${++n}`
// leg = đoạn đường từ điểm này tới điểm sau: km, thời gian, giờ đi, giờ tới (giống đường nét đứt trong Figma)
const stop = ({ items = [], ...s }) => ({ id: id(), desc: '', img: '', icon: '📍', leg: null, ...s, items: items.map((it) => ({ id: id(), ...it })) })
const leg = (km, dur, from, to) => ({ km, dur, from, to })

export const DAYS = [
  {
    id: 'day1', order: 1, date: '2026-12-03', title: 'Sài Gòn → Hà Nội', weather: '🌤️', temp: '26°C - 16°C', figmaImg: FIGMA_DAY(1),
    stops: [
      stop({ time: '15:15', icon: '🛫', img: img('tan-son-nhat'), title: 'Tân Sơn Nhất', desc: 'Kiểm tra hành lí, căn cước chuẩn bị bay đến Nội Bài',
        items: [{ label: 'Tập trung, kiểm tra lần nữa', time: '15:15' }, { label: 'VIETJET AIR', time: 'VJ128 | T1' }, { label: 'Cất cánh', time: '17:20' }],
        leg: leg('1.160km', '2h 10p', '17:20', '19:30') }),
      stop({ time: '19:30', icon: '🛬', img: img('noi-bai'), title: 'Sân bay Nội Bài', desc: 'Xuống máy bay, vệ sinh cá nhân, nghỉ ngơi nhanh, chuẩn bị lên xe đi Hà Giang',
        items: [{ label: 'Hạ cánh', time: '19:30' }, { label: 'Lấy hành lí', time: '19:40 - 20:25' }, { label: 'Vệ sinh cá nhân', time: '20:25 - 20:55' }],
        leg: leg('', '15p', '20:55', '21:10') }),
      stop({ time: '21:10', icon: '🚌', img: img('xe-giuong-nam'), title: 'Lên xe đến Hà Giang', desc: 'Kiểm tra hành lí đầy đủ trước khi lên xe, cố gắng ngủ để mai đi sớm',
        items: [{ label: 'Xe Bằng Phấn', time: '0917.898.898' }, { label: 'Lên xe', time: '21:10' }] }),
    ],
  },
  {
    id: 'day2', order: 2, date: '2026-12-04', title: 'Hà Giang → Đồng Văn', weather: '🌤️', temp: '25°C - 16°C', figmaImg: FIGMA_DAY(2),
    stops: [
      stop({ time: '04:30', icon: '🛵', img: img('giang-son'), title: 'Giang Sơn', desc: 'Chỗ cho thuê xe máy + hostel. Nghỉ ngơi, chuẩn bị cho hành trình.',
        items: [{ label: 'Checkin nghỉ ngơi', time: '04:30 - 07:00' }, { label: 'Vệ sinh, ăn sáng', time: '07:00 - 08:00' }, { label: 'Lấy xe, xuất phát', time: '08:30' }],
        leg: leg('35km', '1h', '08:30', '09:30') }),
      stop({ time: '09:30', icon: '📸', img: img('doc-bac-sum'), title: 'Dốc Bắc Sum', desc: 'Đây là con dốc dài nhất tỉnh Hà Giang với chiều dài 7km và độ cao hơn 450m.',
        items: [{ label: 'Check in, chụp ảnh', time: '09:30 - 10:00' }], leg: leg('14km', '30p', '10:00', '10:30') }),
      stop({ time: '10:30', icon: '☕', img: img('quan-ba'), title: 'Cổng trời Quản Bạ', desc: 'Chủ yếu để nghỉ ngơi, cảnh ở đây tạm ổn',
        items: [{ label: 'Check in, cafe', time: '10:30 - 11:00' }], leg: leg('13km', '30p', '11:00', '11:30') }),
      stop({ time: '11:30', icon: '🍜', img: img('pho-trang-kim'), title: 'Phở Tráng Kìm', desc: 'Ăn trưa, nghỉ ngơi',
        items: [{ label: 'Ăn trưa', time: '11:30 - 12:30' }], leg: leg('52km', '1h30p', '12:30', '14:00') }),
      stop({ time: '14:00', icon: '📸', img: img('tham-ma'), title: 'Dốc Thẩm Mã', desc: 'Dốc Thẩm Mã là một con đường đèo ngoằn ngoèo nguy hiểm nhất ở miền Bắc nối giữa thành phố Hà Giang và huyện Mèo Vạc.',
        items: [{ label: 'Check in, chụp ảnh', time: '14:00 - 14:30' }], leg: leg('62km', '2h', '14:30', '16:30') }),
      stop({ time: '16:30', icon: '🏚️', img: img('nha-pao'), title: 'Nhà Pao', desc: 'Ngôi nhà 75 năm tuổi mang kiến trúc đặc trưng của người Mông, bối cảnh phim "Chuyện của Pao"',
        items: [{ label: 'Check in, chụp ảnh', time: '16:30 - 17:15' }], leg: leg('23km', '45p', '17:15', '18:00') }),
      stop({ time: '18:00', icon: '🏡', img: img('cici-2'), title: 'Cici Homestay - Đồng Văn', desc: 'Homestay đầu tiên của chúng ta ở Đồng Văn, sẽ ở đây 2 đêm',
        items: [{ label: 'Check in, nhận phòng', time: '0966 898 505' }, { label: 'Tắm rửa', time: '18:30 - 19:30' }, { label: 'Ăn tối', time: '19:30' }] }),
    ],
  },
  {
    id: 'day3', order: 3, date: '2026-12-05', title: 'Đồng Văn – Lũng Cú', weather: '🌤️', temp: '25°C - 16°C', figmaImg: FIGMA_DAY(3),
    stops: [
      stop({ time: '06:00', icon: '🧺', img: img('cho-phien'), title: 'Chợ phiên, phố cổ', desc: 'Chợ phiên ở phố cổ Đồng Văn, đi để trải nghiệm',
        items: [{ label: 'Tập trung, đi bộ đến chợ', time: '06:00 - 06:30' }, { label: 'Ăn sáng, trải nghiệm', time: '06:30 - 09:30' }, { label: 'Quay lại homestay lấy xe', time: '09:30 - 10:00' }],
        leg: leg('13km', '30p', '10:00', '10:30') }),
      stop({ time: '10:30', icon: '🏯', img: img('dinh-vua-meo'), title: 'Dinh Vua Mèo', desc: 'Khu dinh thự của vua Mèo, tên dùng trong các văn bản là Dinh thự họ Vương',
        items: [{ label: 'Check in, tham quan', time: '10:30 - 12:30' }, { label: 'Ăn trưa', time: '12:30 - 13:30' }], leg: leg('29km', '1h', '13:30', '14:30') }),
      stop({ time: '14:30', icon: '🚩', img: img('lung-cu'), title: 'Điểm cực Bắc, Lũng Cú', desc: 'Cột cờ Lũng Cú là một cột cờ quốc gia nằm ở đỉnh Lũng Cú hay còn gọi là đỉnh núi Rồng (Long Sơn) có độ cao khoảng 1.470 m',
        items: [{ label: 'Check in, chụp ảnh', time: '14:30 - 15:30' }, { label: 'Làng Lô Lô Chải', time: '15:30 - 16:30' }], leg: leg('24km', '1h', '16:30', '17:30') }),
      stop({ time: '17:30', icon: '🏡', img: img('cici'), title: 'Về Cici Homestay', desc: 'Homestay cũ, tắm rửa ăn tối ở phố cổ (lẩu gà đen, bánh đa, rượu ngô)',
        items: [{ label: 'Tắm rửa', time: '17:00 - 18:00' }, { label: 'Ra phố cổ ăn tối', time: '18:00 - 21:00' }, { label: 'Team building', time: 'Chơi bài, solo hiphop' }] }),
    ],
  },
  {
    id: 'day4', order: 4, date: '2026-12-06', title: 'Đồng Văn → Mèo Vạc', weather: '🌤️', temp: '28°C - 15°C', figmaImg: FIGMA_DAY(4),
    stops: [
      stop({ time: '07:30', icon: '🎒', img: img('tra-phong'), title: 'Trả phòng', desc: 'Thu dọn hành lí, trả phòng, đi Mèo Vạc',
        items: [{ label: 'Tập trung', time: '07:30' }, { label: 'Checkout', time: '08:00' }], leg: leg('12km', '30p', '08:00', '08:30') }),
      stop({ time: '08:30', icon: '☕', img: img('cafe-a-pao'), title: 'Cafe A Páo', desc: 'Ma Pi Leng Skywalk, quán cafe của 1 a Páo mất nết. Đây là đỉnh đèo Mã Pì Lèng, gửi xe ở đây để đi lên mỏm đá tử thần',
        items: [{ label: 'Ăn sáng, cafe', time: '08:30 - 09:30' }], leg: leg('', '30p', '09:30', '10:00') }),
      stop({ time: '10:00', icon: '⛰️', img: img('mom-da-tu-than'), title: 'Mỏm Đá Tử Thần', desc: 'View hùng vĩ khá đẹp nhưng nguy hiểm, lên cho biết, không nên leo lên đá check in, ai không đi ở lại Páo',
        items: [{ label: 'Check in, chụp ảnh', time: '10:00 - 10:30' }, { label: 'Quay về A Páo', time: '10:30 - 11:00' }], leg: leg('12km', '30p', '11:00', '11:30') }),
      stop({ time: '11:30', icon: '🛣️', img: img('ma-pi-leng'), title: 'Đèo Mã Pì Lèng', desc: '‘Tứ đại đỉnh đèo’ của vùng núi đất Bắc, đẹp! Trải nghiệm trên cung đường đi',
        items: [{ label: 'Chụp ảnh, flycam', time: '11:30 - 12:00' }], leg: leg('8km', '30p', '12:00', '12:30') }),
      stop({ time: '12:30', icon: '🚤', img: img('nho-que'), title: 'Sông Nho Quế', desc: 'Sông với màu xanh của rêu, rất đẹp! Trải nghiệm đi thuyền ngắm view, ăn trưa ở đây',
        items: [{ label: 'Thủy điện NQ1', time: '12:30' }, { label: 'Mua vé + đi thuyền', time: '12:30 - 13:30' }, { label: 'Ăn cơm Anh Quân Camp', time: '13:30 - 15:45' }], leg: leg('8.8km', '30p', '15:45', '16:15') }),
      stop({ time: '16:15', icon: '🏡', img: img('ochau'), title: "O'Chau Meo Vac Homestay", desc: "Homestay cuối cùng, nằm trong làng H'Mong, cố gắng về sớm để thăm quan",
        items: [{ label: 'Checkin nhận phòng', time: '16:30' }, { label: 'Tham quan tự do', time: '16:30 - 19:30' }, { label: 'Tập trung ăn cơm', time: '19:30' }] }),
    ],
  },
  {
    id: 'day5', order: 5, date: '2026-12-07', title: 'Mèo Vạc → Hà Giang', weather: '🌤️', temp: '27°C - 12°C', figmaImg: FIGMA_DAY(5),
    stops: [
      stop({ time: '07:00', icon: '🍳', img: img('an-sang-homestay'), title: 'Ăn sáng, chụp ảnh', desc: 'Dậy sớm, ăn sáng chụp ảnh ở homestay, làng Mông đẹp nên dậy sớm nhá',
        items: [{ label: 'Ăn sáng tại homestay', time: '07:00 - 09:00 (giờ tự do)' }, { label: 'Checkout', time: '09:30' }], leg: leg('30km', '1h 30p', '09:30', '11:00') }),
      stop({ time: '11:00', icon: '📸', img: img('cua-chu-m'), title: 'Cua chữ M', desc: 'Đi mấy cái đèo kia rồi nên cua này cũng bình thường! Ngắm trên đường đi',
        items: [{ label: 'Chụp ảnh, video', time: '11:00' }], leg: leg('11km', '30p', '11:00', '11:30') }),
      stop({ time: '11:30', icon: '⛽', img: img('mau-due'), title: 'Mậu Duệ', desc: 'Rừng núi hoang sơ, có thể dừng chân nghỉ ngơi. Có thác, suối nhưng vì lạnh nên bỏ qua',
        items: [{ label: 'Nghỉ ngơi, đổ xăng', time: '11:30 - 12:00' }], leg: leg('12km', '30p', '12:00', '12:30') }),
      stop({ time: '12:30', icon: '🍚', img: img('huu-vinh'), title: 'Ngã Ba Hữu Vinh', desc: 'Ngã 3 đoạn về Yên Minh, đi lại đường cũ về, ăn trưa tại đây',
        items: [{ label: 'Ăn trưa, nghỉ ngơi', time: '12:30 - 13:30' }], leg: leg('110km', '4h', '13:30', '17:30') }),
      stop({ time: '17:30', icon: '🛵', img: img('giang-son'), title: 'Giang Sơn', desc: 'Trả xe, thanh toán, tắm rửa. Mua quà thì mua tối nay. Không ngủ lại: đi xe đêm về Hà Nội để kịp chuyến bay 12:55 ngày mai.',
        items: [{ label: 'Lấy phòng, tắm rửa', time: '17:30 - 18:30' }, { label: 'Phở chua 93 Nguyễn Trãi', time: '18:30 - 19:30' }, { label: 'Dạo phố, mua quà', time: '19:30 - 21:30' }],
        leg: leg('', '15p', '21:45', '22:00') }),
      stop({ time: '22:00', icon: '🚌', img: img('xe-giuong-nam'), title: 'Lên xe về Hà Nội', desc: 'Kiểm tra hành lí, giấy tờ đầy đủ trước khi lên xe, ngủ trên xe',
        items: [{ label: 'Xe Bằng Phấn', time: '0917.898.898' }, { label: 'Lên xe', time: '22:00' }] }),
    ],
  },
  {
    id: 'day6', order: 6, date: '2026-12-08', title: 'Hà Nội → Sài Gòn', weather: '🌤️', temp: '24°C - 12°C', figmaImg: FIGMA_DAY(6),
    stops: [
      stop({ time: '04:00', icon: '☕', img: img('cafe-sang'), title: 'Ăn sáng, cafe Hà Nội', desc: 'Xe trả khách ở Hà Nội. Vệ sinh, ăn sáng cafe, chuẩn bị ra Nội Bài',
        items: [{ label: 'Xuống xe, vệ sinh, nghỉ ngơi', time: '04:00 - 06:30' }, { label: 'Ăn sáng, cafe', time: '06:30 - 09:30' }, { label: 'Đi Nội Bài', time: '10:00' }],
        leg: leg('30km', '45p', '10:00', '10:45') }),
      stop({ time: '10:45', icon: '✈️', img: img('may-bay-noi-bai'), title: 'Sân bay Nội Bài', desc: 'Bắt taxi vào sân bay, làm thủ tục sớm',
        items: [{ label: 'Vệ sinh, nghỉ ngơi', time: '10:45 - 11:00' }, { label: 'Làm thủ tục', time: '11:00 - 12:00' }, { label: 'Fly ------>', time: '12:55' }],
        leg: leg('1.160km', '2h 10p', '12:55', '15:05') }),
      stop({ time: '15:05', icon: '🏙️', img: img('sai-gon'), title: 'Sân bay Tân Sơn Nhất', desc: 'Welcome back!',
        items: [{ label: 'Giải tán!', time: 'Bye mọi người!' }] }),
    ],
  },
]

export const META = {
  title: 'Hà Giang 2026',
  startAt: '2026-12-03T17:20:00+07:00',
  endAt: '2026-12-08T15:05:00+07:00',
  flights: [
    { id: 'f1', dir: 'Chiều đi', code: 'VJ128', date: '2026-12-03', dep: '17:20', arr: '19:30', from: 'SGN · Tân Sơn Nhất T1', to: 'HAN · Nội Bài T1', note: 'Có mặt sân bay trước 15:30' },
    { id: 'f2', dir: 'Chiều về', code: 'VJ157', date: '2026-12-08', dep: '12:55', arr: '15:05', from: 'HAN · Nội Bài T1', to: 'SGN · Tân Sơn Nhất T1', note: 'Có mặt sân bay trước 11:00' },
  ],
}

const ord = (arr) => arr.map((x, i) => ({ order: i + 1, ...x }))

export const MEMBERS = ord([
  { name: 'Phương', contributed: 10000000, note: 'Đã có vé' },
  { name: 'Hồng', contributed: 10000000, note: 'Đã có vé' },
  { name: 'Nghĩa', contributed: 10000000, note: 'Đã có vé' },
  { name: 'Hưng', contributed: 10000000, note: 'Đã có vé' },
])

export const CATS = [
  { key: 'flight', label: 'Vé máy bay', icon: '✈️' },
  { key: 'bus', label: 'Xe khách', icon: '🚌' },
  { key: 'bike', label: 'Xe máy & xăng', icon: '🛵' },
  { key: 'stay', label: 'Homestay', icon: '🏡' },
  { key: 'food', label: 'Ăn uống', icon: '🍜' },
  { key: 'cafe', label: 'Cafe', icon: '☕', budget: 'food' }, // cafe trừ vào dự kiến ăn uống
  { key: 'gift', label: 'Quà', icon: '🛍️' },
  { key: 'ticket', label: 'Vé tham quan', icon: '🎟️' },
  { key: 'other', label: 'Khác', icon: '🧾' },
]

export const EXPENSES = ord([
  { title: 'Vé máy bay 3 người (VJ128 + VJ157)', amount: 8978188, cat: 'flight', status: 'paid', note: '2.959.396đ/vé + 100.000đ phí' },
  { title: 'Vé máy bay bạn thứ 4', amount: 2683422, cat: 'flight', status: 'paid', note: 'Đi 1.338.178 + về 1.233.413 + bảo hiểm 51.500 + phí 60.331' },
  { title: 'Xe khách Bằng Phấn, 4 người × 2 chiều', amount: 2400000, cat: 'bus', status: 'planned', note: 'Ước tính 300k/chiều' },
  { title: 'Thuê xe máy Giang Sơn, 2 xe × 4 ngày + xăng', amount: 2240000, cat: 'bike', status: 'planned', note: 'Ước tính' },
  { title: 'Hostel Giang Sơn (sáng 4/12 + tắm 7/12)', amount: 600000, cat: 'stay', status: 'planned', note: 'Ước tính' },
  { title: 'Cici Homestay, 2 đêm', amount: 1200000, cat: 'stay', status: 'planned', note: 'Ước tính' },
  { title: "O'Chau Homestay, 1 đêm", amount: 600000, cat: 'stay', status: 'planned', note: 'Ước tính' },
  { title: 'Ăn uống 6 ngày', amount: 6000000, cat: 'food', status: 'planned', note: '250k/người/ngày' },
  { title: 'Vé tham quan + thuyền Nho Quế', amount: 800000, cat: 'ticket', status: 'planned', note: 'Ước tính' },
  { title: 'Grab Hà Nội – Nội Bài', amount: 500000, cat: 'other', status: 'planned', note: 'Ước tính' },
])

const group = (g, items) => items.map((text) => ({ group: g, text, done: false }))
export const CHECKLIST = ord([
  ...group('Việc cần làm', ['Chốt giờ xe Bằng Phấn + điểm đón gần Nội Bài (3/12)', 'Đặt Giang Sơn: thuê xe máy + hostel', 'Đặt Cici Homestay 2 đêm (4–5/12)', "Đặt O'Chau Homestay 1 đêm (6/12)", 'Chốt xe đêm 7/12 về Hà Nội']),
  ...group('Giấy tờ', ['CCCD (bay + nhận xe)', 'Bằng lái xe máy', 'Tiền mặt (ATM vùng cao ít)']),
  ...group('Quần áo', ['Áo phao + áo giữ nhiệt', 'Mũ len, găng tay, tất dày', 'Giày bám tốt', 'Áo mưa bộ']),
  ...group('Đồ dùng', ['Sạc dự phòng', 'Thuốc say xe, thuốc cơ bản', 'Kem chống nắng, son dưỡng', 'Flycam + pin dự phòng']),
])

export const CONTACTS = ord([
  { name: 'Nhà xe Bằng Phấn', role: 'Xe khách Hà Nội ⇄ Hà Giang', phone: '0917898898', url: 'https://www.tiktok.com/@nhaxebangphanhagiang', icon: '🚌' },
  { name: 'Giang Sơn', role: 'Thuê xe máy + hostel, TP Hà Giang', phone: '0983380333', url: 'https://www.tiktok.com/@thuexemayhagianggiangson', icon: '🛵' },
  { name: 'Cici Homestay', role: 'Phố cổ Đồng Văn · đêm 4 & 5/12', phone: '0966898505', url: 'https://www.tiktok.com/@cicihomestay.ng.v', icon: '🏡' },
  { name: "O'Chau Mèo Vạc Homestay", role: 'Mèo Vạc · đêm 6/12', phone: '', url: 'https://www.tiktok.com/@meovacochauhomestay', icon: '🏡' },
])

export const NOTES = ord([
  { title: 'Lỡ máy bay ra trễ thì sao?', body: 'Báo ngay cho nhà xe Bằng Phấn trong nhóm chat. Hỏi trước nhà xe có chuyến muộn hơn hoặc chờ được không.' },
  { title: 'Thời tiết tháng 12', body: 'Trên đèo khoảng 5–12°C, sáng sớm có sương mù. Mặc nhiều lớp, áo gió bên ngoài, găng tay khi chạy xe.' },
  { title: 'Đi đoàn', body: 'Đi thành hàng, người lái vững nhất đi đầu và chốt đuôi. Ai lạc thì đứng yên chỗ an toàn và gọi vào nhóm chat. Không chạy xe sau 18h.' },
  { title: 'Xe số hay xe ga?', body: 'Xe số phanh động cơ tốt khi đổ đèo, tiết kiệm xăng. Xe ga cần phanh đều tay, không bóp phanh liên tục khi xuống dốc dài.' },
  { title: 'Đổ xăng', body: 'Đổ đầy ở Yên Minh, Đồng Văn, Mèo Vạc. Đoạn Mậu Duệ – Hữu Vinh ít cây xăng.' },
  { title: 'Chụp ảnh', body: 'Hỏi trước khi chụp người dân, không cho trẻ em tiền/kẹo để chụp ảnh, không leo lên mỏm đá nguy hiểm, mang rác về.' },
])

export const SUGGESTIONS = ord([
  { name: 'Cafe A Páo', kind: 'cafe', area: 'Mã Pì Lèng', note: 'Ma Pi Leng Skywalk, ngay đỉnh đèo. Gửi xe ở đây để đi bộ lên mỏm đá Tử Thần (có trong lịch trình Day 4).', link: '', img: '', by: '', votes: [], chosen: true },
])

const CAPTIONS = {
  'tan-son-nhat': 'Tân Sơn Nhất', 'noi-bai': 'Sân bay Nội Bài', 'xe-giuong-nam': 'Xe giường nằm Bằng Phấn', 'giang-son': 'Giang Sơn Hostel',
  'doc-bac-sum': 'Dốc Bắc Sum', 'quan-ba': 'Cổng trời Quản Bạ', 'pho-trang-kim': 'Phở Tráng Kìm', 'tham-ma': 'Dốc Thẩm Mã', 'nha-pao': 'Nhà Pao',
  'cici-2': 'Cici Homestay', 'cho-phien': 'Chợ phiên Đồng Văn', 'dinh-vua-meo': 'Dinh Vua Mèo', 'lung-cu': 'Cột cờ Lũng Cú', 'cici': 'Cici Homestay',
  'tra-phong': 'Phố cổ Đồng Văn', 'cafe-a-pao': 'Cafe A Páo', 'mom-da-tu-than': 'Mỏm Đá Tử Thần', 'ma-pi-leng': 'Đèo Mã Pì Lèng', 'nho-que': 'Sông Nho Quế',
  'ochau': "O'Chau Homestay", 'an-sang-homestay': 'Sáng ở làng Mông', 'cua-chu-m': 'Cua chữ M', 'mau-due': 'Mậu Duệ', 'huu-vinh': 'Ngã Ba Hữu Vinh',
  'cafe-sang': 'Cafe sáng', 'may-bay-noi-bai': 'Bay về', 'sai-gon': 'Sài Gòn của tôi',
}

export const PHOTOS = ord(Object.entries(CAPTIONS).filter(([k]) => k !== 'cici-2').map(([k, caption]) => ({ src: img(k), caption, credit: 'Figma Hà Giang' })))

// Ảnh có sẵn để chọn khi sửa điểm dừng / thêm ảnh
export const IMAGE_LIBRARY = Object.keys(CAPTIONS).map(img)
