// Dữ liệu ban đầu: ghi vào Firestore ở lần đăng nhập đầu tiên, sau đó cả nhóm tự sửa trên web.
// Lịch trình lấy theo file Figma "Hà Giang", chỉnh lại theo giờ bay VJ128 (3/12) và VJ157 (8/12).

let n = 0
const id = () => `s${++n}`
const stop = ({ items = [], ...s }) => ({ id: id(), desc: '', img: '', icon: '📍', leg: null, ...s, items: items.map((it) => ({ id: id(), ...it })) })

export const DAYS = [
  {
    id: 'day1', order: 1, date: '2026-12-03', title: 'Sài Gòn → Hà Nội', weather: '🌤️', temp: '19°C – 14°C', figmaImg: '/img/figma/day1.jpg',
    stops: [
      stop({ time: '15:30', icon: '🛫', title: 'Tân Sơn Nhất', desc: 'Kiểm tra hành lí, căn cước, chuẩn bị bay ra Nội Bài.',
        items: [{ label: 'Tập trung, kiểm tra lần nữa', time: '15:30' }, { label: 'VietJet VJ128 · Nhà ga T1', time: '' }, { label: 'Cất cánh', time: '17:20' }],
        leg: { km: '1.160km', dur: '2h10' } }),
      stop({ time: '19:30', icon: '🛬', title: 'Sân bay Nội Bài', desc: 'Xuống máy bay, vệ sinh cá nhân, ăn tối nhẹ, chuẩn bị lên xe đi Hà Giang.',
        items: [{ label: 'Hạ cánh', time: '19:30' }, { label: 'Lấy hành lí', time: '19:30 – 20:00' }, { label: 'Ăn tối, vệ sinh cá nhân', time: '20:00 – 21:00' }],
        leg: { km: '', dur: 'Xe đón' } }),
      stop({ time: '21:30', icon: '🚌', img: '', title: 'Lên xe đi Hà Giang', desc: 'Kiểm tra hành lí đầy đủ trước khi lên xe, cố gắng ngủ để mai đi sớm. Chốt với nhà xe giờ và điểm đón gần Nội Bài.',
        items: [{ label: 'Xe Bằng Phấn', time: '0917.898.898' }, { label: 'Lên xe (chốt giờ với nhà xe)', time: '~21:30' }] }),
    ],
  },
  {
    id: 'day2', order: 2, date: '2026-12-04', title: 'Hà Giang → Đồng Văn', weather: '⛅', temp: '18°C – 9°C', figmaImg: '/img/figma/day2.jpg',
    stops: [
      stop({ time: '04:30', icon: '🛵', title: 'Giang Sơn', desc: 'Chỗ cho thuê xe máy + hostel. Nghỉ ngơi, chuẩn bị cho hành trình.',
        items: [{ label: 'Check in nghỉ ngơi', time: '04:30 – 07:00' }, { label: 'Vệ sinh, ăn sáng', time: '07:00 – 08:00' }, { label: 'Lấy xe, xuất phát', time: '08:30' }],
        leg: { km: '35km', dur: '1h' } }),
      stop({ time: '09:30', icon: '📸', img: '/img/road.jpg', title: 'Dốc Bắc Sum', desc: 'Con dốc dài nhất tỉnh Hà Giang, dài 7km và cao hơn 450m.',
        items: [{ label: 'Check in, chụp ảnh', time: '09:30 – 10:00' }], leg: { km: '14km', dur: '30p' } }),
      stop({ time: '10:30', icon: '☕', img: '/img/quanba.jpg', title: 'Cổng trời Quản Bạ', desc: 'Chủ yếu để nghỉ ngơi, cảnh ở đây tạm ổn.',
        items: [{ label: 'Check in, cafe', time: '10:30 – 11:00' }], leg: { km: '13km', dur: '30p' } }),
      stop({ time: '11:30', icon: '🍜', title: 'Phở Tráng Kìm', desc: 'Ăn trưa, nghỉ ngơi.',
        items: [{ label: 'Ăn trưa', time: '11:30 – 12:30' }], leg: { km: '52km', dur: '1h30' } }),
      stop({ time: '14:00', icon: '📸', img: '/img/thamma.jpg', title: 'Dốc Thẩm Mã', desc: 'Con đường đèo ngoằn ngoèo nguy hiểm nhất miền Bắc, nối thành phố Hà Giang và Mèo Vạc.',
        items: [{ label: 'Check in, chụp ảnh', time: '14:00 – 14:30' }], leg: { km: '62km', dur: '2h' } }),
      stop({ time: '16:30', icon: '🏚️', title: 'Nhà Pao', desc: 'Ngôi nhà 75 năm tuổi mang kiến trúc đặc trưng của người Mông, bối cảnh phim "Chuyện của Pao".',
        items: [{ label: 'Check in, chụp ảnh', time: '16:30 – 17:15' }], leg: { km: '23km', dur: '45p' } }),
      stop({ time: '18:00', icon: '🏡', title: 'Cici Homestay – Đồng Văn', desc: 'Homestay đầu tiên ở Đồng Văn, ở đây 2 đêm.',
        items: [{ label: 'Check in, nhận phòng', time: '0966.898.505' }, { label: 'Tắm rửa', time: '18:30 – 19:30' }, { label: 'Ăn tối', time: '19:30' }] }),
    ],
  },
  {
    id: 'day3', order: 3, date: '2026-12-05', title: 'Đồng Văn – Lũng Cú', weather: '☀️', temp: '17°C – 8°C', figmaImg: '/img/figma/day3.jpg',
    stops: [
      stop({ time: '07:00', icon: '☕', img: '/img/dongvan.jpg', title: 'Phố cổ Đồng Văn', desc: 'Ăn sáng, dạo phố cổ, cafe. Hôm nay thứ 7 nên chưa có chợ phiên, chợ dời sang sáng Chủ nhật.',
        items: [{ label: 'Tập trung, ăn sáng', time: '07:00 – 08:00' }, { label: 'Dạo phố cổ, cafe', time: '08:00 – 09:30' }, { label: 'Lấy xe', time: '10:00' }],
        leg: { km: '13km', dur: '30p' } }),
      stop({ time: '10:30', icon: '🏯', title: 'Dinh Vua Mèo', desc: 'Khu dinh thự của vua Mèo, tên dùng trong văn bản là Dinh thự họ Vương.',
        items: [{ label: 'Check in, tham quan', time: '10:30 – 12:30' }, { label: 'Ăn trưa', time: '12:30 – 13:30' }], leg: { km: '29km', dur: '1h' } }),
      stop({ time: '14:30', icon: '🚩', title: 'Điểm cực Bắc, Lũng Cú', desc: 'Cột cờ Lũng Cú trên đỉnh Lũng Cú (núi Rồng), độ cao khoảng 1.470m.',
        items: [{ label: 'Check in, chụp ảnh', time: '14:30 – 15:30' }, { label: 'Làng Lô Lô Chải', time: '15:30 – 16:30' }], leg: { km: '24km', dur: '1h' } }),
      stop({ time: '17:30', icon: '🏡', title: 'Về Cici Homestay', desc: 'Tắm rửa, ra phố cổ ăn tối (lẩu gà đen, bánh đa, rượu ngô).',
        items: [{ label: 'Tắm rửa', time: '17:30 – 18:30' }, { label: 'Ra phố cổ ăn tối', time: '18:30 – 21:00' }, { label: 'Team building', time: 'Chơi bài, solo hiphop' }] }),
    ],
  },
  {
    id: 'day4', order: 4, date: '2026-12-06', title: 'Đồng Văn → Mèo Vạc', weather: '⛅', temp: '18°C – 9°C', figmaImg: '/img/figma/day4.jpg',
    stops: [
      stop({ time: '06:00', icon: '🧺', title: 'Chợ phiên Đồng Văn', desc: 'Chợ phiên chỉ họp sáng Chủ nhật. Dậy sớm đi bộ ra chợ, ăn sáng ở chợ.',
        items: [{ label: 'Tập trung, đi bộ đến chợ', time: '06:00 – 06:30' }, { label: 'Ăn sáng, trải nghiệm chợ', time: '06:30 – 07:30' }] }),
      stop({ time: '07:45', icon: '🎒', title: 'Trả phòng', desc: 'Thu dọn hành lí, trả phòng, đi Mèo Vạc.',
        items: [{ label: 'Tập trung', time: '07:45' }, { label: 'Checkout', time: '08:00' }], leg: { km: '12km', dur: '30p' } }),
      stop({ time: '08:30', icon: '☕', title: 'Cafe A Páo', desc: 'Mã Pì Lèng Skywalk, quán cafe của A Páo, view đẹp. Ở đỉnh đèo Mã Pì Lèng, gửi xe ở đây để đi lên mỏm đá Tử Thần.',
        items: [{ label: 'Cafe, nghỉ chân', time: '08:30 – 09:30' }], leg: { km: '', dur: '30p đi bộ' } }),
      stop({ time: '10:00', icon: '⛰️', img: '/img/dusk.jpg', title: 'Mỏm Đá Tử Thần', desc: 'View hùng vĩ, khá đẹp nhưng nguy hiểm. Không nên leo lên đá check in; ai không đi thì ở lại A Páo.',
        items: [{ label: 'Check in, chụp ảnh', time: '10:00 – 10:30' }, { label: 'Quay về A Páo', time: '10:30 – 11:00' }], leg: { km: '12km', dur: '30p' } }),
      stop({ time: '11:30', icon: '🛣️', img: '/img/mapileng.jpg', title: 'Đèo Mã Pì Lèng', desc: '"Tứ đại đỉnh đèo" của vùng núi phía Bắc, trải nghiệm trên cung đường đi.',
        items: [{ label: 'Chụp ảnh, flycam', time: '11:30 – 12:00' }], leg: { km: '8km', dur: '30p' } }),
      stop({ time: '12:30', icon: '🚤', img: '/img/nhoque.jpg', title: 'Sông Nho Quế', desc: 'Sông màu xanh của rêu, rất đẹp. Đi thuyền ngắm view, ăn trưa ở đây.',
        items: [{ label: 'Thủy điện NQ1', time: '12:30' }, { label: 'Mua vé + đi thuyền', time: '12:30 – 13:30' }, { label: 'Ăn cơm Anh Quân Camp', time: '13:30 – 15:45' }], leg: { km: '8,8km', dur: '30p' } }),
      stop({ time: '16:15', icon: '🏡', title: "O'Chau Mèo Vạc Homestay", desc: "Homestay cuối cùng, nằm trong làng H'Mông. Cố gắng về sớm để tham quan.",
        items: [{ label: 'Check in nhận phòng', time: '16:30' }, { label: 'Tham quan tự do', time: '16:30 – 19:30' }, { label: 'Tập trung ăn cơm', time: '19:30' }] }),
    ],
  },
  {
    id: 'day5', order: 5, date: '2026-12-07', title: 'Mèo Vạc → Hà Giang → xe đêm', weather: '🌤️', temp: '19°C – 10°C', figmaImg: '/img/figma/day5.jpg',
    stops: [
      stop({ time: '07:00', icon: '🍳', title: 'Ăn sáng, chụp ảnh', desc: 'Dậy sớm ăn sáng, chụp ảnh ở homestay. Làng Mông sáng sớm rất đẹp.',
        items: [{ label: 'Ăn sáng tại homestay', time: '07:00 – 09:00' }, { label: 'Checkout', time: '09:30' }], leg: { km: '30km', dur: '1h30' } }),
      stop({ time: '11:00', icon: '📸', title: 'Cua chữ M', desc: 'Đi mấy cái đèo kia rồi nên cua này cũng bình thường. Ngắm trên đường đi.',
        items: [{ label: 'Chụp ảnh, video', time: '11:00' }], leg: { km: '11km', dur: '30p' } }),
      stop({ time: '11:30', icon: '⛽', title: 'Mậu Duệ', desc: 'Rừng núi hoang sơ, có thể dừng chân nghỉ ngơi. Có thác, suối nhưng tháng 12 rất lạnh nên bỏ qua.',
        items: [{ label: 'Nghỉ ngơi, đổ xăng', time: '11:30 – 12:00' }], leg: { km: '12km', dur: '30p' } }),
      stop({ time: '12:30', icon: '🍚', title: 'Ngã Ba Hữu Vinh', desc: 'Ngã 3 đoạn về Yên Minh, đi lại đường cũ về. Ăn trưa tại đây.',
        items: [{ label: 'Ăn trưa, nghỉ ngơi', time: '12:30 – 13:30' }], leg: { km: '110km', dur: '4h' } }),
      stop({ time: '17:30', icon: '🛵', title: 'Giang Sơn', desc: 'Trả xe, tắm rửa, ăn tối, mua quà. Không ngủ lại: tối nay lên xe đêm về Hà Nội để kịp chuyến bay 12:55 ngày mai.',
        items: [{ label: 'Trả xe, tắm rửa', time: '17:30 – 18:30' }, { label: 'Phở chua 93 Nguyễn Trãi', time: '18:30 – 19:30' }, { label: 'Dạo phố, mua quà', time: '19:30 – 21:00' }],
        leg: { km: '~300km', dur: '6–7h' } }),
      stop({ time: '21:30', icon: '🚌', title: 'Xe đêm về Hà Nội', desc: 'Chốt với nhà xe giờ chạy, xin trả khách ở phố cổ hoặc gần Nội Bài.',
        items: [{ label: 'Xe Bằng Phấn', time: '0917.898.898' }, { label: 'Lên xe (chốt giờ với nhà xe)', time: '~21:30' }] }),
    ],
  },
  {
    id: 'day6', order: 6, date: '2026-12-08', title: 'Hà Nội → Sài Gòn', weather: '🌤️', temp: '20°C – 15°C', figmaImg: '/img/figma/day6.jpg',
    stops: [
      stop({ time: '04:30', icon: '🌅', title: 'Tới Hà Nội', desc: 'Xe trả khách. Vệ sinh, nghỉ ngơi (cafe 24h hoặc thuê phòng theo giờ).',
        items: [{ label: 'Tới nơi', time: '~04:30' }, { label: 'Vệ sinh, nghỉ ngơi', time: '04:30 – 07:00' }] }),
      stop({ time: '07:00', icon: '☕', title: 'Ăn sáng, cafe Hà Nội', desc: 'Phở, cafe trứng quanh Hồ Gươm, mua quà.',
        items: [{ label: 'Ăn sáng', time: '07:00 – 08:00' }, { label: 'Dạo Hồ Gươm, cafe', time: '08:00 – 10:00' }], leg: { km: '30km', dur: '45p – 1h' } }),
      stop({ time: '10:45', icon: '✈️', title: 'Sân bay Nội Bài', desc: 'Có mặt trước giờ bay khoảng 2 tiếng.',
        items: [{ label: 'Làm thủ tục, gửi đồ', time: '11:00 – 12:00' }, { label: 'VietJet VJ157 · Nhà ga T1', time: '' }, { label: 'Cất cánh', time: '12:55' }], leg: { km: '1.160km', dur: '2h10' } }),
      stop({ time: '15:05', icon: '🏙️', title: 'Sân bay Tân Sơn Nhất', desc: 'Welcome back!',
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
  { name: 'Bạn 1', contributed: 10000000, note: 'Đã có vé' },
  { name: 'Bạn 2', contributed: 10000000, note: 'Đã có vé' },
  { name: 'Bạn 3', contributed: 10000000, note: 'Đã có vé' },
  { name: 'Bạn 4', contributed: 10000000, note: 'Chưa đặt vé' },
])

export const CATS = [
  { key: 'flight', label: 'Vé máy bay', icon: '✈️' },
  { key: 'bus', label: 'Xe khách', icon: '🚌' },
  { key: 'bike', label: 'Xe máy & xăng', icon: '🛵' },
  { key: 'stay', label: 'Homestay', icon: '🏡' },
  { key: 'food', label: 'Ăn uống', icon: '🍜' },
  { key: 'ticket', label: 'Vé tham quan', icon: '🎟️' },
  { key: 'other', label: 'Khác', icon: '🧾' },
]

export const EXPENSES = ord([
  { title: 'Vé máy bay 3 người (VJ128 + VJ157)', amount: 8978188, cat: 'flight', status: 'paid', note: '2.959.396đ/vé + 100.000đ phí' },
  { title: 'Vé máy bay bạn thứ 4', amount: 3059396, cat: 'flight', status: 'planned', note: 'Tạm tính cùng giá + phí' },
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
  ...group('Việc cần làm', ['Bạn thứ 4 đặt vé VJ128 / VJ157', 'Chốt giờ xe Bằng Phấn + điểm đón gần Nội Bài (3/12)', 'Đặt Giang Sơn: thuê xe máy + hostel', 'Đặt Cici Homestay 2 đêm (4–5/12)', "Đặt O'Chau Homestay 1 đêm (6/12)", 'Chốt xe đêm 7/12 về Hà Nội']),
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

export const PHOTOS = ord([
  { src: '/img/nhoque.jpg', caption: 'Sông Nho Quế', credit: 'NKSTTSSHNVN · CC BY-SA 4.0' },
  { src: '/img/mapileng.jpg', caption: 'Đèo Mã Pì Lèng', credit: 'Khánh Hmoong · CC BY 2.0' },
  { src: '/img/quanba.jpg', caption: 'Quản Bạ', credit: 'Benjamin Smith · CC BY-SA 4.0' },
  { src: '/img/thamma.jpg', caption: 'Dốc Thẩm Mã', credit: 'NKSTTSSHNVN · CC BY-SA 4.0' },
  { src: '/img/road.jpg', caption: 'Đường đèo Hà Giang', credit: 'Benjamin Smith · CC BY-SA 4.0' },
  { src: '/img/dusk.jpg', caption: 'Hoàng hôn Mã Pì Lèng', credit: 'Hoach Le Dinh · CC0' },
  { src: '/img/dongvan.jpg', caption: 'Chợ cổ Đồng Văn', credit: 'trungydang · CC BY 3.0' },
  { src: '/img/dugia.jpg', caption: 'Du Già', credit: 'NKSTTSSHNVN · CC BY-SA 4.0' },
])

export const IMAGE_LIBRARY = ['/img/nhoque.jpg', '/img/mapileng.jpg', '/img/quanba.jpg', '/img/thamma.jpg', '/img/road.jpg', '/img/dusk.jpg', '/img/dongvan.jpg', '/img/dugia.jpg']
