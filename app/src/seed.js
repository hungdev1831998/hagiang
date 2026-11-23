// Dữ liệu ban đầu: ghi vào Firestore ở lần đăng nhập đầu tiên, sau đó cả nhóm tự sửa trên web.
// Day 1 và Day 6 chép theo file Figma "Hà Giang", chỉnh theo chuyến bay thật (VJ128 17:20 → 19:30, VJ157 13:20, bị delay từ 12:55).
// Day 2–5 (4–7/12) theo bảng "Lịch trình 2: Đồng Văn → Lô Lô Chải → Mèo Vạc" (11/2026). Ảnh Figma các ngày này vẫn là bản cũ.

const img = (name) => `/img/stops/${name}.png`
const FIGMA_DAY = (n) => `/figma/Day ${n}.png`

let n = 0
const id = () => `s${++n}`
// Vị trí trên bản đồ của từng điểm dừng (theo tên), tra trên Google Maps 10/2026; điểm mới của Day 2–5 tra trên
// OpenStreetMap 11/2026. Điểm chỉ là hoạt động (trả phòng, ăn sáng…) dùng vị trí nơi ở. Xe khách đón
// ngay ở sân bay Nội Bài (cùng chỗ với điểm trước) nên để trống. Quân đội hotel và LoLo Ancient House theo link Google Maps nhóm gửi 11/2026.
const OCHAU = '23.206792,105.416675', GIANG_SON = '22.801008,104.980493', QUAN_DOI = '23.279499,105.363355', LOLO = '23.362802,105.309893'
export const STOP_LOCS = {
  'Tân Sơn Nhất': '10.813939,106.662709', 'Sân bay Tân Sơn Nhất': '10.813939,106.662709', 'Sân bay Nội Bài': '21.214525,105.802514',
  'Giang Sơn': GIANG_SON, 'Cột mốc Km0': '22.827330,104.984169', 'Dốc Bắc Sum': '22.992112,104.930303', 'Cổng trời Quản Bạ': '23.049282,104.992677',
  'Phố Tráng Kìm': '23.065561,104.994216', 'Ăn trưa Yên Minh': '23.119454,105.140661', 'Dốc Thẩm Mã': '23.169387,105.194686',
  'Làng Sủng Là – Nhà của Pao': '23.225789,105.203760', 'Dinh Vua Mèo': '23.256285,105.262126', 'Quân đội hotel - Đồng Văn': QUAN_DOI,
  'Ăn sáng, rời Đồng Văn': QUAN_DOI, 'Điểm cực Bắc, Lũng Cú': '23.363406,105.316300', 'Loloancient Homestay': LOLO,
  'Đón bình minh, rời bản': LOLO, 'Chợ phiên Đồng Văn': '23.277074,105.361235', 'Đèo Mã Pì Lèng': '23.243095,105.397883',
  'Sông Nho Quế': '23.222764,105.442163', "O'Chau Meo Vac Homestay": OCHAU, 'Ăn sáng, xuất phát': OCHAU,
  'Cua chữ M': '23.105822,105.259950', 'Mậu Duệ': '23.068512,105.237034', 'Ngã Ba Hữu Vinh': '23.122910,105.164787',
  'Làng dệt lanh Lùng Tám': '23.048691,105.043024',
  'Lên xe về Hà Nội': '22.822498,104.987934', 'Ăn sáng, cafe Hà Nội': '21.033585,105.855242',
  'Phố cổ Đồng Văn về đêm': '23.278261,105.361378', 'Tối ở LoLo Ancient House': LOLO,
  'Dạo thị trấn Mèo Vạc': '23.163438,105.409783', "Tối ở O'Chau": OCHAU, 'Ăn tối, dạo phố TP Hà Giang': '22.812250,104.979979',
}
// Mã địa điểm Google Maps (cid) để nút "Bản đồ" mở đúng trang địa điểm có tên, ảnh, đánh giá thay vì chỉ hiện toạ độ.
// Dò trên Google Maps 11/2026, đều trùng toạ độ ở trên (lệch dưới 130m). Dốc Bắc Sum, Phố Tráng Kìm, chỗ ăn sáng Hà Nội
// chưa có trang đúng tên nên mở bằng toạ độ.
const P_OCHAU = '7588676097143750760', P_QUAN_DOI = '14157721492145757144', P_LOLO = '1099482751974199173'
export const STOP_PLACES = {
  'Tân Sơn Nhất': '14479865043165150186', 'Sân bay Tân Sơn Nhất': '14479865043165150186', 'Sân bay Nội Bài': '14832940231668167514',
  'Giang Sơn': '3548203913388739483', 'Cột mốc Km0': '16449364008016380342', 'Cổng trời Quản Bạ': '7482842577190627613',
  'Ăn trưa Yên Minh': '15255423455836004760', 'Dốc Thẩm Mã': '12723250708292282700', 'Làng Sủng Là – Nhà của Pao': '8344957613155452311',
  'Dinh Vua Mèo': '16628787314829177824', 'Quân đội hotel - Đồng Văn': P_QUAN_DOI, 'Ăn sáng, rời Đồng Văn': P_QUAN_DOI,
  'Điểm cực Bắc, Lũng Cú': '3471234121561903391', 'Loloancient Homestay': P_LOLO, 'Đón bình minh, rời bản': P_LOLO,
  'Chợ phiên Đồng Văn': '8324676100800738763', 'Đèo Mã Pì Lèng': '6859122739488652373', 'Sông Nho Quế': '1423752017579993702',
  "O'Chau Meo Vac Homestay": P_OCHAU, 'Ăn sáng, xuất phát': P_OCHAU, 'Cua chữ M': '5492857547899998434',
  'Mậu Duệ': '3899514343112068669', 'Ngã Ba Hữu Vinh': '16771022136973573071', 'Làng dệt lanh Lùng Tám': '17655723657891581687',
  'Lên xe về Hà Nội': '3760678587039714122',
  'Phố cổ Đồng Văn về đêm': '7577682320141542613', 'Tối ở LoLo Ancient House': P_LOLO,
  'Dạo thị trấn Mèo Vạc': '12923969197946578760', "Tối ở O'Chau": P_OCHAU, 'Ăn tối, dạo phố TP Hà Giang': '6203623173923170693',
}
// leg = đoạn đường từ điểm này tới điểm sau: km, thời gian, giờ đi, giờ tới (giống đường nét đứt trong Figma)
// mode: '' = xe máy, 'car' = ô tô / taxi, 'flight' = máy bay (chỉ đường bỏ qua chặng này), 'walk' = đi bộ
const stop = ({ items = [], ...s }) => ({ id: id(), desc: '', img: '', icon: '📍', leg: null, loc: STOP_LOCS[s.title] || '', place: STOP_PLACES[s.title] || '', ...s, items: items.map((it) => ({ id: id(), ...it })) })
const leg = (km, dur, from, to, mode = '') => ({ km, dur, from, to, mode })

export const DAYS = [
  {
    id: 'day1', order: 1, date: '2026-12-03', title: 'Sài Gòn → Hà Nội', weather: '🌤️', temp: '31°C - 16°C', figmaImg: FIGMA_DAY(1),
    stops: [
      stop({ time: '15:15', icon: '🛫', img: img('tan-son-nhat'), title: 'Tân Sơn Nhất', desc: 'Kiểm tra hành lí, căn cước chuẩn bị bay đến Nội Bài',
        items: [{ label: 'Tập trung, kiểm tra lần nữa', time: '15:15' }, { label: 'VIETJET AIR', time: 'VJ128 | T1' }, { label: 'Cất cánh', time: '17:20' }],
        leg: leg('1.160km', '2h 10p', '17:20', '19:30', 'flight') }),
      stop({ time: '19:30', icon: '🛬', img: img('noi-bai'), title: 'Sân bay Nội Bài', desc: 'Xuống máy bay, lấy hành lí, vệ sinh cá nhân, chờ xe Bằng Phấn đón ngay ở sân bay',
        items: [{ label: 'Hạ cánh', time: '19:30' }, { label: 'Lấy hành lí', time: '19:40 - 20:25' }, { label: 'Vệ sinh cá nhân, ăn nhẹ', time: '20:25 - 21:00' }] }),
      stop({ time: '21:30', icon: '🚌', img: img('xe-giuong-nam'), title: 'Lên xe đến Hà Giang', desc: 'Xe cabin cung điện 24 phòng, chạy từ Mỹ Đình 21:00 rồi đón nhóm ở sân bay Nội Bài, tới Hà Giang khoảng 03:30. Giờ đón chính xác hỏi nhà xe. Cố gắng ngủ để mai đi sớm.',
        items: [{ label: 'Xe Bằng Phấn', time: '0917.898.898' }, { label: 'Giường', time: 'A3, A5, B3, B5' }, { label: 'Xe đón ở sân bay Nội Bài', time: '~21:30, nhà xe báo giờ' }] }),
    ],
  },
  {
    id: 'day2', order: 2, date: '2026-12-04', title: 'Hà Giang → Đồng Văn', weather: '🌤️', temp: '21°C - 10°C', figmaImg: FIGMA_DAY(2),
    stops: [
      stop({ time: '03:30', icon: '🛵', img: img('giang-son'), title: 'Giang Sơn', desc: 'Xe đêm tới Hà Giang khoảng 03:30. Nghỉ ở phòng dorm của Giang Sơn tới sáng, ăn sáng, nhận xe máy thuê rồi tự lái.',
        items: [{ label: 'Xuống xe Bằng Phấn', time: '~03:30' }, { label: 'Nghỉ ở phòng dorm Giang Sơn', time: 'tới sáng' }, { label: 'Ăn sáng' }, { label: 'Nhận xe máy' }], leg: leg('3km', '10p', '06:50', '07:00') }),
      stop({ time: '07:00', icon: '🏁', title: 'Cột mốc Km0', desc: 'Xuất phát, chụp ảnh ở cột mốc Km0 Hà Giang',
        items: [{ label: 'Chụp ảnh, xuất phát', time: '07:00' }], leg: leg('31km', '1h', '07:30', '08:30') }),
      stop({ time: '08:30', icon: '📸', img: img('doc-bac-sum'), title: 'Dốc Bắc Sum', desc: 'Đây là con dốc dài nhất tỉnh Hà Giang với chiều dài 7km và độ cao hơn 450m.',
        items: [{ label: 'Check in, chụp ảnh', time: '08:30' }], leg: leg('14km', '35p', '08:55', '09:30') }),
      stop({ time: '09:30', icon: '⛰️', img: img('quan-ba'), title: 'Cổng trời Quản Bạ', desc: 'Check in Cổng Trời, ngắm Núi đôi Cô Tiên',
        items: [{ label: 'Cổng Trời, Núi đôi Cô Tiên', time: '09:30' }], leg: leg('13km', '30p', '10:00', '10:30') }),
      stop({ time: '10:30', icon: '📸', title: 'Phố Tráng Kìm', desc: 'Dừng chụp ảnh 20–30 phút',
        items: [{ label: 'Dừng chụp ảnh', time: '10:30 - 11:00' }], leg: leg('39km', '1h 20p', '11:00', '12:20') }),
      stop({ time: '12:20', icon: '🍚', title: 'Ăn trưa Yên Minh', desc: 'Ăn trưa ở Yên Minh, trên đường đi qua rừng thông Yên Minh',
        items: [{ label: 'Ăn trưa', time: '12:20 - 13:05' }], leg: leg('12km', '35p', '13:05', '13:40') }),
      stop({ time: '13:40', icon: '📸', img: img('tham-ma'), title: 'Dốc Thẩm Mã', desc: 'Dốc Thẩm Mã là một con đường đèo ngoằn ngoèo nguy hiểm nhất ở miền Bắc nối giữa thành phố Hà Giang và huyện Mèo Vạc.',
        items: [{ label: 'Check in, chụp ảnh', time: '13:40 - 13:55' }], leg: leg('10km', '25p', '13:55', '14:20') }),
      stop({ time: '14:20', icon: '🏚️', img: img('nha-pao'), title: 'Làng Sủng Là – Nhà của Pao', desc: 'Ngôi nhà 75 năm tuổi mang kiến trúc đặc trưng của người Mông, bối cảnh phim "Chuyện của Pao". Dừng khoảng 20 phút.',
        items: [{ label: 'Check in, chụp ảnh', time: '14:20 - 14:40' }], leg: leg('12km', '30p', '14:40', '15:10') }),
      stop({ time: '15:10', icon: '🏯', img: img('dinh-vua-meo'), title: 'Dinh Vua Mèo', desc: 'Khu dinh thự của vua Mèo, tên dùng trong các văn bản là Dinh thự họ Vương',
        items: [{ label: 'Tham quan', time: '15:10 - 15:55' }], leg: leg('14km', '35p', '15:55', '16:30') }),
      stop({ time: '16:30', icon: '🏨', title: 'Quân đội hotel - Đồng Văn', desc: 'Về phố cổ Đồng Văn, nhận phòng, tắm rửa nghỉ ngơi.',
        items: [{ label: 'Nhận phòng', time: '16:30' }, { label: 'Tắm rửa, nghỉ ngơi', time: '16:30 - 18:20' }], leg: leg('350m', '5p', '18:25', '18:30', 'walk') }),
      stop({ time: '18:30', icon: '🏮', title: 'Phố cổ Đồng Văn về đêm', desc: 'Ăn tối, dạo phố cổ lên đèn, café Cao Nguyên Đá. Đi bộ từ khách sạn, không cần lấy xe.',
        items: [{ label: 'Ăn tối', time: '18:30 - 19:30' }, { label: 'Dạo phố cổ lên đèn', time: '19:30' }, { label: 'Café Cao Nguyên Đá', time: '~20:00' }] }),
    ],
  },
  {
    id: 'day3', order: 3, date: '2026-12-05', title: 'Đồng Văn → Lô Lô Chải', weather: '🌤️', temp: '16°C - 8°C', figmaImg: FIGMA_DAY(3),
    stops: [
      stop({ time: '08:00', icon: '🍳', title: 'Ăn sáng, rời Đồng Văn', desc: 'Ngày sống chậm (~25km). Ăn sáng thong thả, trả phòng rồi rời Đồng Văn.',
        items: [{ label: 'Ăn sáng thong thả', time: '08:00' }, { label: 'Trả phòng, rời Đồng Văn' }], leg: leg('26km', '1h', '08:30', '09:30') }),
      stop({ time: '09:30', icon: '🚩', img: img('lung-cu'), title: 'Điểm cực Bắc, Lũng Cú', desc: 'Leo cột cờ Lũng Cú (điểm cực Bắc), chụp ảnh, ngắm toàn cảnh bản Lô Lô Chải từ trên cao',
        items: [{ label: 'Leo cột cờ, chụp ảnh', time: '09:30 - 11:00' }], leg: leg('2km', '30p', '11:00', '11:30') }),
      stop({ time: '11:30', icon: '🏡', title: 'Loloancient Homestay', desc: 'Nhận phòng homestay ở bản Lô Lô Chải, ăn cơm nhà dân',
        items: [{ label: 'Nhận phòng', time: '11:30' }, { label: 'Ăn cơm nhà dân' }] }),
      stop({ time: '14:00', icon: '🧶', title: 'Dạo bản Lô Lô Chải', desc: 'Đi bộ quanh bản: học thêu/dệt thổ cẩm, xem nhà trình tường, trò chuyện với người Lô Lô',
        items: [{ label: 'Đi bộ quanh bản', time: '14:00 - 16:30' }, { label: 'Ngắm HOÀNG HÔN', time: '~17:00' }], leg: leg('', '', '', '18:30', 'walk') }),
      stop({ time: '18:30', icon: '🔥', title: 'Tối ở LoLo Ancient House', desc: 'Ăn tối, ngồi bếp lửa cùng gia đình chủ nhà',
        items: [{ label: 'Ăn tối', time: '18:30' }, { label: 'Ngồi bếp lửa cùng gia đình chủ nhà', time: 'sau ăn tối' }] }),
    ],
  },
  {
    id: 'day4', order: 4, date: '2026-12-06', title: 'Lô Lô Chải → Mèo Vạc', weather: '🌤️', temp: '17°C - 8°C', figmaImg: FIGMA_DAY(4),
    stops: [
      stop({ time: '06:00', icon: '🌄', img: img('tra-phong'), title: 'Đón bình minh, rời bản', desc: 'Đón bình minh ở Lô Lô Chải, ăn sáng nhanh, trả phòng',
        items: [{ label: 'Đón BÌNH MINH, ăn sáng nhanh', time: '06:00' }, { label: 'Trả phòng, rời bản', time: '07:00' }], leg: leg('26km', '1h', '07:00', '08:00') }),
      stop({ time: '08:00', icon: '🧺', img: img('cho-phien'), title: 'Chợ phiên Đồng Văn', desc: 'Chợ phiên Chủ nhật ở phố cổ Đồng Văn, đông đến khoảng 10h',
        items: [{ label: 'Đi chợ phiên', time: '08:00 - 09:45' }], leg: leg('10km', '30p', '09:45', '10:15') }),
      stop({ time: '10:15', icon: '⛰️', img: img('mom-da-tu-than'), title: 'Đèo Mã Pì Lèng', desc: 'Mỏm đá Tử Thần và Skywalk trên đỉnh đèo. View đẹp nhưng nguy hiểm, không leo lên mỏm đá để check in.',
        items: [{ label: 'Mỏm đá Tử Thần, Skywalk', time: '10:15 - 11:00' }], leg: leg('16km', '45p', '11:00', '11:45') }),
      stop({ time: '11:45', icon: '🚤', img: img('nho-que'), title: 'Sông Nho Quế', desc: 'Đi thuyền sông Nho Quế, ngắm hẻm Tu Sản, ăn trưa',
        items: [{ label: 'Đi thuyền, hẻm Tu Sản', time: '11:45 - 13:15' }, { label: 'Ăn cơm quán Anh Quân (cách bến ~5km)', time: '13:30 - 14:35' }], leg: leg('5km', '25p', '14:35', '15:00') }),
      stop({ time: '15:00', icon: '🏡', img: img('ochau'), title: "O'Chau Meo Vac Homestay", desc: "Nhận phòng, nghỉ ngơi. Homestay ở làng H'Mông Pả Vi, cách thị trấn Mèo Vạc khoảng 5km.",
        items: [{ label: 'Nhận phòng, nghỉ ngơi', time: '15:00 - 16:00' }], leg: leg('5km', '15p', '16:00', '16:15') }),
      stop({ time: '16:15', icon: '🏘️', title: 'Dạo thị trấn Mèo Vạc', desc: 'Dạo thị trấn lúc trời còn sáng rồi về homestay trước khi tối (không chạy xe sau 18h)',
        items: [{ label: 'Dạo thị trấn, quảng trường', time: '16:15 - 17:15' }], leg: leg('5km', '20p', '17:15', '17:35') }),
      stop({ time: '17:35', icon: '🍲', img: img('ochau'), title: "Tối ở O'Chau", desc: 'Ăn tối tại homestay, ngủ sớm vì mai chạy ~170km về TP Hà Giang',
        items: [{ label: 'Tắm rửa, nghỉ ngơi', time: '17:35 - 18:30' }, { label: 'Ăn tối', time: '18:30' }, { label: 'Ngủ sớm' }] }),
    ],
  },
  {
    id: 'day5', order: 5, date: '2026-12-07', title: 'Mèo Vạc → Hà Giang', weather: '🌤️', temp: '22°C - 11°C', figmaImg: FIGMA_DAY(5),
    stops: [
      stop({ time: '07:30', icon: '🍳', img: img('an-sang-homestay'), title: 'Ăn sáng, xuất phát', desc: 'Ăn sáng thong thả, trả phòng, xuất phát về TP Hà Giang (~170km)',
        items: [{ label: 'Ăn sáng thong thả', time: '07:30' }, { label: 'Trả phòng, xuất phát' }], leg: leg('31km', '1h 10p', '08:20', '09:30') }),
      stop({ time: '09:30', icon: '📸', img: img('cua-chu-m'), title: 'Cua chữ M', desc: 'Đi mấy cái đèo kia rồi nên cua này cũng bình thường! Ngắm trên đường đi',
        items: [{ label: 'Chụp ảnh, video', time: '09:30' }], leg: leg('10km', '25p', '10:05', '10:30') }),
      stop({ time: '10:30', icon: '⛽', img: img('mau-due'), title: 'Mậu Duệ', desc: 'Rừng núi hoang sơ, có thể dừng chân nghỉ ngơi. Có thác, suối nhưng vì lạnh nên bỏ qua',
        items: [{ label: 'Nghỉ ngơi, đổ xăng', time: '10:30' }], leg: leg('12km', '30p', '11:00', '11:30') }),
      stop({ time: '11:30', icon: '📸', img: img('huu-vinh'), title: 'Ngã Ba Hữu Vinh', desc: 'Ngã 3 đoạn về Yên Minh, dừng chụp ảnh khoảng 20 phút',
        items: [{ label: 'Dừng chụp ảnh', time: '11:30 - 11:50' }], leg: leg('3km', '25p', '11:50', '12:15') }),
      stop({ time: '12:15', icon: '🍚', title: 'Ăn trưa Yên Minh', desc: 'Ăn trưa nhanh ở Yên Minh, rời lúc 13:00 để kịp qua dốc Bắc Sum trước khi trời tối',
        items: [{ label: 'Ăn trưa', time: '12:15 - 13:00' }], leg: leg('42km', '1h 35p', '13:00', '14:35') }),
      stop({ time: '14:35', icon: '🧵', title: 'Làng dệt lanh Lùng Tám', desc: "(Tuỳ chọn) Làng dệt lanh Lùng Tám, Quản Bạ: xem dệt vải lanh, vẽ sáp ong của người H'Mông",
        items: [{ label: 'Tham quan (tuỳ chọn)', time: '14:35 - 15:05' }], leg: leg('26km', '1h', '15:05', '16:05') }),
      stop({ time: '16:05', icon: '📸', img: img('doc-bac-sum'), title: 'Dốc Bắc Sum', desc: 'Qua dốc Bắc Sum trước khi trời tối',
        items: [{ label: 'Qua dốc', time: '~16:05' }], leg: leg('35km', '1h 05p', '16:05', '17:10') }),
      stop({ time: '17:10', icon: '🛵', img: img('giang-son'), title: 'Giang Sơn', desc: 'Về tới TP Hà Giang khoảng 17:10 (muộn nhất 17:30). Trả xe, tắm rửa. Không ngủ lại: đi xe đêm về Hà Nội để kịp chuyến bay 13:20 ngày mai.',
        items: [{ label: 'Trả xe, tắm rửa', time: '17:10 - 18:45' }], leg: leg('1.3km', '10p', '18:50', '19:00', 'car') }),
      stop({ time: '19:00', icon: '🍜', title: 'Ăn tối, dạo phố TP Hà Giang', desc: 'Ăn phở chua ở quán Hiền Lương (93 Nguyễn Trãi) rồi dạo phố mua quà. Mang theo hành lí vì đi thẳng ra xe về Hà Nội.',
        items: [{ label: 'Phở chua 93 Nguyễn Trãi', time: '19:00 - 20:00' }, { label: 'Dạo phố, mua quà', time: '20:00 - 21:15' }], leg: leg('2.2km', '15p', '21:15', '21:30', 'car') }),
      stop({ time: '21:30', icon: '🚌', img: img('xe-giuong-nam'), title: 'Lên xe về Hà Nội', desc: 'Văn phòng Bằng Phấn: số 100 Trần Phú, P. Hà Giang 2. Có mặt trước 30 phút, xe chạy 22:00, tới Mỹ Đình khoảng 04:00. Kiểm tra hành lí, giấy tờ trước khi lên xe.',
        items: [{ label: 'Xe Bằng Phấn', time: '0917.898.898' }, { label: 'Giường', time: 'A8, A10, B8, B10' }, { label: 'Xe chạy', time: '22:00' }] }),
    ],
  },
  {
    id: 'day6', order: 6, date: '2026-12-08', title: 'Hà Nội → Sài Gòn', weather: '🌤️', temp: '31°C - 16°C', figmaImg: FIGMA_DAY(6),
    stops: [
      stop({ time: '04:00', icon: '☕', img: img('cafe-sang'), title: 'Ăn sáng, cafe Hà Nội', desc: 'Xe trả khách ở Mỹ Đình khoảng 04:00. Vệ sinh, ăn sáng cafe, chuẩn bị ra Nội Bài',
        items: [{ label: 'Xuống xe ở Mỹ Đình, vệ sinh, nghỉ ngơi', time: '04:00 - 06:30' }, { label: 'Ăn sáng, cafe', time: '06:30 - 09:30' }, { label: 'Đi Nội Bài', time: '10:00' }],
        leg: leg('30km', '45p', '10:00', '10:45', 'car') }),
      stop({ time: '10:45', icon: '✈️', img: img('may-bay-noi-bai'), title: 'Sân bay Nội Bài', desc: 'Bắt taxi vào sân bay, làm thủ tục sớm',
        items: [{ label: 'Vệ sinh, nghỉ ngơi', time: '10:45 - 11:00' }, { label: 'Làm thủ tục', time: '11:00 - 12:00' }, { label: 'Fly ------>', time: '13:20 (delay từ 12:55)' }],
        leg: leg('1.160km', '2h 10p', '13:20', '15:30', 'flight') }),
      stop({ time: '15:30', icon: '🏙️', img: img('sai-gon'), title: 'Sân bay Tân Sơn Nhất', desc: 'Welcome back!',
        items: [{ label: 'Giải tán!', time: 'Bye mọi người!' }] }),
    ],
  },
]

export const META = {
  title: 'Hà Giang 2026',
  startAt: '2026-12-03T17:20:00+07:00',
  endAt: '2026-12-08T15:30:00+07:00',
  flights: [
    { id: 'f1', dir: 'Chiều đi', code: 'VJ128', date: '2026-12-03', dep: '17:20', arr: '19:30', from: 'SGN · Tân Sơn Nhất T1', to: 'HAN · Nội Bài T1', note: 'Có mặt sân bay trước 15:30' },
    { id: 'f2', dir: 'Chiều về', code: 'VJ157', date: '2026-12-08', dep: '13:20', arr: '15:30', from: 'HAN · Nội Bài T1', to: 'SGN · Tân Sơn Nhất T1', note: 'Có mặt sân bay trước 11:00' },
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
  { title: 'Xe khách Bằng Phấn, 4 người × 2 chiều', amount: 2800000, cat: 'bus', status: 'planned', note: 'Đã đặt: 350k/người/chiều, đi 3/12 + về 7/12, chưa thanh toán' },
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
  { name: 'Nhà xe Quang Nghị', role: 'Xe khách Hà Nội ⇄ Hà Giang · VP phố cổ: 6 Hàng Muối · VP Hà Giang: 60 Minh Khai', phone: '0949744733', url: 'https://www.facebook.com/xequangnghi', icon: '🚌' },
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

// Gợi ý quán / chỗ chơi tra từ Foody, VnExpress, Vietnam Coracle, vietnam.travel (bài 2019–2024): giờ mở cửa có thể đã đổi.
const maps = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
const tip = (name, kind, area, note, q) => ({ name, kind, area, note, link: maps(q), img: '', by: '', votes: [], chosen: false })

export const SUGGESTIONS = ord([
  { name: 'Cafe A Páo', kind: 'cafe', area: 'Mã Pì Lèng', note: 'Ma Pi Leng Skywalk, ngay đỉnh đèo. Gửi xe ở đây để đi bộ lên mỏm đá Tử Thần (có trong lịch trình Day 4).', link: '', img: '', by: '', votes: [], chosen: true },
  // Hà Giang (thành phố)
  tip('Cháo ấu tẩu Hương', 'food', 'Hà Giang', 'Món đặc sản phải thử, khoảng 30–50k/tô. Cháo ấu tẩu thường chỉ bán buổi tối.\nTổ 5 Trần Hưng Đạo, P. Nguyễn Trãi.', 'Cháo ấu tẩu Hương Trần Hưng Đạo Hà Giang'),
  tip('Bà Hoa – Bánh cuốn', 'food', 'Hà Giang', 'Bánh cuốn Hà Giang ăn kèm nước dùng, hợp bữa sáng trước khi lên xe. Có review nói hơi béo hơn bánh cuốn Hà Nội.\nP. Minh Khai.', 'Bà Hoa Bánh Cuốn Minh Khai Hà Giang'),
  tip('Phúc Coffee', 'cafe', 'Hà Giang', 'Đồ uống ngon, giá vừa phải, không gian dễ chịu.\n495 Nguyễn Trãi.', 'Phúc Coffee 495 Nguyễn Trãi Hà Giang'),
  // Quản Bạ, Yên Minh (Day 2)
  tip('Cafe Cổng Trời', 'cafe', 'Quản Bạ', 'Ngồi hiên nhìn xuống đoạn đèo quanh co. Có bán tinh dầu và thuốc tắm thảo dược của người Dao Đỏ.', 'Cafe Cổng Trời Quản Bạ'),
  tip('Phong Vân Quán', 'food', 'Yên Minh', 'Món phở chua, phần ăn nhiều. Hợp ăn trưa dọc đường Day 2, giá hơi cao.\n233 Tổ 5, TT Yên Minh.', 'Phong Vân Quán Yên Minh'),
  // Đồng Văn
  tip('Cà Phê Phố Cổ', 'cafe', 'Đồng Văn', 'Nhà cổ 2 tầng quanh sân đá, sân hiên rộng ngắm chợ cổ. Buổi tối hay có văn nghệ tự phát.\n2 Nguyễn Trãi, góc chợ cổ.', 'Cà Phê Phố Cổ 2 Nguyễn Trãi Đồng Văn'),
  tip('Phiên Coffee', 'cafe', 'Đồng Văn', 'Quán "chất" nhất phố cổ, ngồi ban công tầng 2 nhìn xuống chợ. Cà phê ngon, có bia thủ công Thơm.\n11 Phố Cổ.', 'Phiên Coffee Phố Cổ Đồng Văn'),
  tip("H'mong Coffee", 'cafe', 'Đồng Văn', 'Nhân viên người Mông thân thiện, bàn gỗ có ổ cắm. Ngồi bàn vỉa hè buổi sáng nắng rất thích.\n10 QL4C.', "H'mong Coffee Đồng Văn"),
  tip('Bò Thảo Dược – Cao Nguyên Đá', 'food', 'Đồng Văn', 'Bò nướng đá, cà phê được khen, kiến trúc lạ. Foody chấm 9.7.\nKhu chợ cổ Đồng Văn.', 'Bò Thảo Dược Cao Nguyên Đá Đồng Văn'),
  tip('Cháo Ấu Tẩu & Bánh Cuốn', 'food', 'Đồng Văn', 'Bánh cuốn Đồng Văn ăn với nước dùng xương, khoảng 30k. Review về cháo trái chiều (củ ấu hơi đắng).\nQL4C, TT Đồng Văn.', 'Cháo Ấu Tẩu Bánh Cuốn Đồng Văn'),
  tip('Quán cháo Mộc Miên', 'food', 'Đồng Văn', 'VnExpress gợi ý cho bữa tối muộn ở phố cổ.', 'Cháo Mộc Miên Đồng Văn'),
  tip('Hải Hiền – Cơm Lẩu', 'food', 'Đồng Văn', 'Thắng cố, lẩu bò, lẩu gà đen theo nồi, hợp nhóm 4 người.\nTổ 3, TT Đồng Văn.', 'Hải Hiền Cơm Lẩu Đồng Văn'),
  tip('Thắng dền phố cổ', 'food', 'Đồng Văn', 'Hàng rong buổi tối, 5–15k/bát. Ăn nóng khi dạo phố cổ.', 'Phố cổ Đồng Văn'),
  tip('Cafe Cực Bắc', 'cafe', 'Đồng Văn', 'Quán trong ngôi nhà cổ nhất bản Lô Lô Chải, tường đất, mái ngói. Ngồi nghỉ sau khi lên cột cờ Lũng Cú.\nCó bản lưu Foody ghi đã đóng cửa, nên kiểm tra lại.', 'Cafe Cực Bắc Lô Lô Chải Lũng Cú'),
  // Hà Nội (sáng Day 6)
  tip('Phở Bát Đàn', 'food', 'Hà Nội', 'Phở bò gia truyền, mở từ sáng sớm, thường phải xếp hàng.\n49 Bát Đàn.', 'Phở Bát Đàn 49 Bát Đàn Hà Nội'),
  tip('Bánh cuốn Thanh Vân', 'food', 'Hà Nội', 'Bánh cuốn nóng kiểu Hà Nội.\n14 Hàng Gà.', 'Bánh cuốn Thanh Vân 14 Hàng Gà Hà Nội'),
  tip('Xôi Yến', 'food', 'Hà Nội', 'Xôi xéo, xôi pate, ăn nhanh trước khi ra sân bay.\n35B Nguyễn Hữu Huân.', 'Xôi Yến 35B Nguyễn Hữu Huân Hà Nội'),
  tip('Cafe Giảng', 'cafe', 'Hà Nội', 'Cà phê trứng "gốc" của Hà Nội.\n39 Nguyễn Hữu Huân.', 'Cafe Giảng 39 Nguyễn Hữu Huân Hà Nội'),
  // Chỗ chơi
  tip('Núi đôi Cô Tiên', 'other', 'Quản Bạ', 'Ngay dưới Cổng Trời, danh thắng quốc gia. Vé 20–30k, xem 30–45 phút. Tháng 12 hay có sương, nên tới trước 9h.', 'Núi đôi Cô Tiên Quản Bạ'),
  tip('Động Lùng Khúy', 'other', 'Quản Bạ', 'Hang thạch nhũ, vé khoảng 50k. Rẽ vào hơn 10 km từ Tam Sơn, mất thêm 1,5–2 tiếng. Chỉ đi nếu dư thời gian.', 'Động Lùng Khúy Quản Bạ'),
  tip('Rừng thông Yên Minh', 'other', 'Yên Minh', 'Ngay trên QL4C (xã Na Khê), được ví như "Đà Lạt thu nhỏ". Ghé 15 phút chụp ảnh, nghỉ chân.', 'Rừng thông Yên Minh'),
  tip('Làng cổ Phố Cáo', 'other', 'Đồng Văn', 'Làng người Mông còn giữ nét xưa, ít bị thương mại hoá, nằm trên đường Day 2. Chợ ở đây là chợ lùi, 6 ngày họp một lần.', 'Phố Cáo Đồng Văn'),
  tip('Thung lũng Sủng Là', 'other', 'Đồng Văn', 'Ngay cạnh Nhà Pao. Tháng 11–12 có hoa tam giác mạch, đầu tháng 12 có thể đã tàn bớt.', 'Thung lũng Sủng Là Đồng Văn'),
  tip('Bản Lô Lô Chải', 'other', 'Đồng Văn', 'Dưới chân cột cờ Lũng Cú (cách 1 km). Dạo bản nhà tường đất, ghé Cafe Cực Bắc.', 'Lô Lô Chải Lũng Cú'),
  tip('Chợ phiên Mèo Vạc', 'other', 'Mèo Vạc', 'Họp sáng Chủ nhật, từ 4–5h sáng, tan trước trưa. Dự phòng nếu không kịp chợ phiên Đồng Văn (cũng họp sáng Chủ nhật).', 'Chợ Mèo Vạc'),
  tip('Dạo Hồ Gươm, phố cổ', 'other', 'Hà Nội', 'Sáng Day 6 sau khi xuống xe đêm, đi bộ ngay cạnh các quán ăn sáng phố cổ.', 'Hồ Hoàn Kiếm Hà Nội'),
  tip('Mã Pì Lèng Panorama', 'cafe', 'Mã Pì Lèng', 'Toà nhà 7 tầng giữa đèo, view thẳng xuống thung lũng Tu Sản và sông Nho Quế.\nTừng gây tranh cãi vì xây không phép (2019–2021) và bị yêu cầu tạm ngừng kinh doanh, nên kiểm tra còn mở không.', 'Mã Pì Lèng Panorama'),
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
