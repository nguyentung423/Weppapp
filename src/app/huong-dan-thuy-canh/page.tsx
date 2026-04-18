"use client";

import { useRouter } from "next/navigation";

type GuideSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type GuideModule = {
  id: string;
  shortTitle: string;
  title: string;
  intro: string[];
  sections: GuideSection[];
};

const MODULES: GuideModule[] = [
  {
    id: "module-i",
    shortTitle: "I. Kế hoạch sản xuất",
    title: "I. Xây dựng kế hoạch sản xuất trong nhà màng",
    intro: [
      "Đây là chương nên đặt ở đầu hệ thống vì nó đóng vai trò như phần định hướng cho toàn bộ dự án sản xuất.",
      "Nếu chương này được làm tốt, người dùng sẽ hiểu mình đang trồng cây gì, bán cho ai, đầu tư theo quy mô nào và cần theo dõi các chỉ số nào trong suốt quá trình vận hành.",
      "Trên web, chương này nên được xây dựng thành một module có tính chất quản trị, không chỉ là bài đọc tham khảo. Người dùng có thể vừa xem hướng dẫn vừa nhập các thông tin kế hoạch thực tế của cơ sở sản xuất.",
    ],
    sections: [
      {
        heading: "1. Mục tiêu và định hướng sản xuất",
        paragraphs: [
          "Trước khi bắt đầu, cần xác định rõ mô hình sản xuất: trồng rau ăn lá ngắn ngày, rau gia vị, cây ăn quả trong nhà màng hay kết hợp nhiều nhóm cây.",
          "Việc xác định mục tiêu ngay từ đầu ảnh hưởng trực tiếp đến thiết kế nhà màng, hệ thống tưới, lịch gieo trồng, chiến lược dinh dưỡng và phương án tiêu thụ.",
          "Nên trả lời tối thiểu các câu hỏi sau: sản xuất để bán lẻ hay bán sỉ, hướng tới thị trường phổ thông hay phân khúc chất lượng cao, cần sản lượng ổn định quanh năm hay theo mùa vụ, ưu tiên giảm chi phí hay tối ưu chất lượng và độ đồng đều sản phẩm.",
        ],
        bullets: [
          "Loại cây trồng chủ lực và cây trồng phụ.",
          "Quy mô sản xuất dự kiến theo diện tích hoặc số giàn/kênh trồng.",
          "Mục tiêu sản lượng theo tuần, tháng và quý.",
          "Nhóm khách hàng mục tiêu: hộ gia đình, cửa hàng rau sạch, siêu thị, bếp ăn, nhà hàng.",
        ],
      },
      {
        heading: "2. Nghiên cứu thị trường và phân tích xu hướng",
        paragraphs: [
          "Nghiên cứu thị trường không chỉ để biết loại cây nào đang bán chạy mà còn để hiểu hành vi mua hàng, mức giá chấp nhận được, yêu cầu về mẫu mã và thời gian tiêu thụ.",
          "Trong sản xuất nhà màng, sai lầm thường gặp là chọn cây trồng theo cảm tính mà không đối chiếu với đầu ra thực tế.",
          "Nội dung nghiên cứu nên bao gồm: nhu cầu của khách hàng ở khu vực mục tiêu, giá bán trung bình theo từng kênh, mức độ cạnh tranh, thời điểm tiêu thụ cao, yêu cầu về bao gói, truy xuất nguồn gốc, chứng nhận và khả năng mở rộng thị trường.",
        ],
        bullets: [
          "Khảo sát 3-5 đối thủ hoặc đơn vị cùng phân khúc.",
          "Theo dõi giá bán theo tuần và theo mùa.",
          "Xác định sản phẩm dễ tiêu thụ nhanh và sản phẩm có giá trị gia tăng cao.",
          "Tính đến xu hướng xanh, an toàn thực phẩm và truy xuất nguồn gốc.",
        ],
      },
      {
        heading: "3. Lựa chọn phương pháp sản xuất và vị trí",
        paragraphs: [
          "Phương pháp sản xuất có thể là thủy canh, giá thể, đất cải tạo trong nhà màng hoặc mô hình kết hợp. Mỗi phương pháp đòi hỏi chi phí đầu tư, mức độ kiểm soát kỹ thuật và nhân công khác nhau.",
          "Vị trí nhà màng cần được đánh giá theo hướng nhận nắng, thông thoáng, khả năng thoát nước, chất lượng nguồn nước, giao thông vận chuyển, độ an toàn sinh học và khoảng cách đến nơi tiêu thụ.",
          "Một vị trí đẹp về mặt đất đai nhưng khó vận chuyển hoặc thiếu điện, nước ổn định vẫn có thể làm giảm hiệu quả đầu tư.",
        ],
      },
      {
        heading: "4. Kế hoạch chi phí, nhân lực và vận hành",
        paragraphs: [
          "Kế hoạch sản xuất cần đi kèm kế hoạch nguồn lực. Trên web nên có biểu mẫu để nhập vốn đầu tư ban đầu, chi phí cố định hằng tháng, chi phí vật tư biến đổi, chi phí điện, nước, lao động và doanh thu kỳ vọng.",
          "Việc này giúp người quản lý theo dõi điểm hòa vốn và đánh giá hiệu quả theo từng lứa trồng.",
          "Ngoài chi phí, cũng cần xác định rõ vai trò nhân sự: người phụ trách kỹ thuật, người ghi nhận số liệu, người chăm sóc, thu hoạch, đóng gói và người phụ trách bán hàng.",
          "Cơ sở nhỏ có thể kiêm nhiệm, nhưng hệ thống vẫn nên phân vai để quản lý minh bạch.",
        ],
        bullets: [
          "Checklist đầu ngày: kiểm tra môi trường, dung dịch, sâu bệnh, tình trạng hệ thống.",
          "Checklist cuối ngày: vệ sinh, chốt số liệu, ghi nhận bất thường, chuẩn bị lịch ngày mai.",
          "Kế hoạch ngắn hạn: theo ngày và theo tuần.",
          "Kế hoạch dài hạn: theo tháng, theo vụ và theo năm.",
        ],
      },
    ],
  },
  {
    id: "module-ii",
    shortTitle: "II. Yếu tố đầu vào",
    title: "II. Các yếu tố đầu vào trong nhà màng",
    intro: [
      "Đây là nhóm nội dung phục vụ cho việc kiểm soát điều kiện sản xuất.",
      "Nếu chương I là phần chiến lược thì chương II là phần nền tảng kỹ thuật giúp cây sinh trưởng ổn định.",
      "Trong giao diện web, nên trình bày chương này theo dạng từng chỉ số môi trường với 3 lớp thông tin: vai trò của chỉ số, khoảng vận hành phù hợp và hậu quả khi vượt ngưỡng.",
    ],
    sections: [
      {
        heading: "1. Khí hậu trong nhà màng",
        bullets: [
          "Hệ thống thông gió giúp điều hòa nhiệt độ, giảm ẩm dư thừa, tăng trao đổi khí và bổ sung CO2 từ môi trường bên ngoài.",
          "Nếu thông gió kém, độ ẩm có thể quá cao làm cây thoát hơi nước kém, rễ hấp thu dinh dưỡng giảm và nguy cơ bùng phát nấm, vi khuẩn tăng lên.",
          "Hệ thống làm mát và phun sương có thể giúp hạ nhiệt, nhưng cần thiết kế để hạn chế làm ướt tán lá quá lâu.",
          "Với vùng nhiệt đới như Việt Nam, nhiệt độ trong nhà màng có thể tăng lên 35-40°C vào ban ngày, gây sốc nhiệt và làm giảm hiệu quả quang hợp.",
          "Lưới cắt nắng phải được điều chỉnh linh hoạt; không nên che quá mức vì cây vẫn cần ánh sáng để duy trì sinh trưởng bình thường.",
        ],
      },
      {
        heading: "2. Nhiệt độ và chất lượng dung dịch",
        bullets: [
          "Nhiệt độ dung dịch quá cao làm giảm lượng oxy hòa tan, khiến rễ dễ bị stress và tăng nguy cơ bệnh vùng rễ.",
          "Dòng chảy quá chậm cũng có thể làm dung dịch nóng lên và kém đồng đều giữa các vị trí trong hệ thống.",
          "Nên áp dụng các biện pháp như bể giảm nhiệt, tháp nước, vật liệu che bể, tuần hoàn hợp lý và máy sục oxy khi cần.",
        ],
      },
      {
        heading: "3. Nguồn nước và vệ sinh hệ thống",
        bullets: [
          "Nguồn nước phải ổn định, ít tạp chất, hạn chế mầm bệnh và có pH phù hợp cho pha dinh dưỡng.",
          "Bể chứa, đường ống, đầu tưới và máng trồng cần được vệ sinh định kỳ để tránh rong rêu, tảo, cặn muối và biofilm.",
          "Khi hệ thống không sạch, rủi ro nghẹt đường ống, sai lệch dinh dưỡng và phát sinh bệnh rễ sẽ tăng nhanh.",
        ],
      },
    ],
  },
  {
    id: "module-iii",
    shortTitle: "III. Ươm cây",
    title: "III. Ươm cây",
    intro: [
      "Ươm cây là giai đoạn quyết định chất lượng cây giống.",
      "Cây con khỏe, rễ phát triển tốt và đồng đều sẽ giúp cả lứa trồng ổn định hơn về sau.",
    ],
    sections: [
      {
        heading: "1. Thiết kế vườn ươm",
        bullets: [
          "Khu ươm phải sạch, thông thoáng, tách biệt tương đối với khu sản xuất chính.",
          "Không ăn uống, hút thuốc trong khu ươm.",
          "Bố trí lối đi, giá kê và khu thao tác hợp lý để tránh giẫm đạp hoặc làm đổ khay.",
        ],
      },
      {
        heading: "2. Bảo quản hạt giống",
        bullets: [
          "Giữ hạt ở nơi khô, mát; ưu tiên bảo quản lạnh nếu điều kiện cho phép.",
          "Sử dụng bao bì kín hoặc túi hút chân không.",
          "Không nên để hạt giống lâu trong nhà màng vì nóng ẩm làm giảm sức nảy mầm.",
        ],
      },
      {
        heading: "3. Giá thể ươm phù hợp",
        bullets: [
          "Có thể dùng rockwool, perlite, foam, coco-peat, peat-moss hoặc phối trộn phù hợp.",
          "Giá thể cần được xử lý sạch, khử trùng, điều chỉnh pH hợp lý và không nén quá chặt.",
          "Không nên tái sử dụng giá thể cũ để ươm vì nguy cơ mang mầm bệnh và mất đồng đều.",
        ],
      },
      {
        heading: "4. Chăm sóc cây con",
        bullets: [
          "Tưới lại giá thể sau gieo với lượng vừa đủ; tránh úng kéo dài.",
          "Độ sâu lỗ gieo phải phù hợp với từng loại hạt.",
          "Nên che nhẹ trong tuần đầu nếu nắng gắt.",
          "Ưu tiên tưới nhúng hoặc tưới nhẹ để lá mầm khô thoáng.",
          "Trước khi chuyển cây ra khu trồng chính cần có giai đoạn tập thích nghi.",
          "Thời điểm ra cây phù hợp thường là chiều mát hoặc cuối ngày.",
        ],
      },
    ],
  },
  {
    id: "module-iv",
    shortTitle: "IV. Dinh dưỡng",
    title: "IV. Chế độ dinh dưỡng",
    intro: [
      "Chương này nên là một trong những mục được truy cập nhiều nhất trên web vì liên quan trực tiếp đến năng suất, chất lượng và tính ổn định của cây trồng.",
      "Nội dung không nên chỉ dừng ở việc giải thích khái niệm mà cần hỗ trợ người dùng hiểu được: đang đo cái gì, giá trị đó phản ánh điều gì và khi lệch chuẩn thì cần xử lý ra sao.",
    ],
    sections: [
      {
        heading: "1. EC, pH và nhóm nguyên tố",
        bullets: [
          "EC là độ dẫn điện, phản ánh tổng nồng độ ion hòa tan trong dung dịch. EC cao hay thấp cho biết mức đậm đặc tương đối của dung dịch nhưng không cho biết thành phần dinh dưỡng đã cân đối hay chưa.",
          "pH phản ánh mức axit - kiềm của nước và dung dịch. Khi pH không phù hợp, cây có thể khó hấp thu một số nguyên tố dù trong dung dịch vẫn có mặt các chất đó.",
          "Trong giai đoạn sinh dưỡng, cây dùng nhiều NO3- nên pH có thể tăng; ở giai đoạn ra hoa, mang trái hoặc thay đổi cân bằng ion, pH có thể giảm mạnh hơn.",
          "Các nguyên tố được chia thành đa lượng (N, P, K), trung lượng (Ca, Mg, S, Cl) và vi lượng (Fe, Zn, B, Cu, Mn, Mo).",
        ],
      },
      {
        heading: "2. Bể chứa và quản lý dung dịch",
        bullets: [
          "Nên theo dõi định kỳ thể tích, EC, pH, nhiệt độ và mức độ sạch của bể chứa.",
          "Dung dịch nên được thay toàn bộ định kỳ 1-2 tuần hoặc sớm hơn nếu có dấu hiệu mất cân bằng, nhiễm bẩn hoặc tích tụ chất cây không hấp thu.",
          "Thời điểm thay cuối ngày thường thuận lợi hơn cho khâu vệ sinh và giảm rủi ro sốc hệ thống.",
        ],
      },
      {
        heading: "3. Bảng môi trường tối ưu",
        paragraphs: [
          "Bảng đề xuất môi trường tối ưu cho một số cây trồng.",
          "Lưu ý: các khoảng trên mang tính tham khảo định hướng. Khi đưa lên hệ thống, nên cho phép tùy chỉnh theo giống, mùa vụ, vùng khí hậu và mục tiêu chất lượng sản phẩm.",
        ],
      },
    ],
  },
  {
    id: "module-v",
    shortTitle: "V. IPM",
    title: "V. Quản lý dịch hại tổng hợp (IPM)",
    intro: [
      "Đây là chương cần được làm dày hơn vì trong thực tế vận hành, dịch hại thường là nguyên nhân khiến sản lượng giảm mạnh, chất lượng không đồng đều và chi phí đội lên nhanh nhất.",
      "IPM không chỉ là diệt sâu bệnh mà là cách quản lý tổng thể nhằm giảm rủi ro ngay từ đầu, phát hiện sớm, ưu tiên biện pháp an toàn và chỉ dùng thuốc hóa học khi thật sự cần.",
      "Nếu xây dựng tốt trên web, đây có thể là một module cảnh báo rất hữu ích cho người vận hành.",
    ],
    sections: [
      {
        heading: "1. Khái niệm và mục tiêu",
        bullets: [
          "IPM là phương pháp quản lý dịch hại tổng hợp, kết hợp nhiều biện pháp kỹ thuật, sinh học, vệ sinh và hóa học một cách hợp lý.",
          "Mục tiêu là kiểm soát dịch hại ở mức chấp nhận được thay vì phụ thuộc hoàn toàn vào thuốc.",
          "Giảm kháng thuốc, giảm tồn dư và nâng cao an toàn thực phẩm.",
        ],
      },
      {
        heading: "2. Nguyên tắc phòng là chính",
        bullets: [
          "Sử dụng lưới chắn côn trùng và kiểm soát cửa ra vào để giảm nguồn dịch hại xâm nhập.",
          "Duy trì vệ sinh nhà màng, khu ươm, khu pha thuốc, bể chứa và dụng cụ sản xuất.",
          "Loại bỏ lá già, cây bệnh, cỏ dại, tàn dư hữu cơ và nguồn nước bẩn.",
          "Theo dõi thường xuyên để phát hiện sớm điểm bất thường thay vì đợi đến khi dịch bùng mạnh.",
          "Áp dụng luân canh hoặc thay đổi nhóm cây trồng khi điều kiện sản xuất cho phép.",
          "Ưu tiên biện pháp sinh học, bẫy dính, thiên địch và các giải pháp ít gây ảnh hưởng tồn dư.",
        ],
      },
      {
        heading: "3. Quy trình giám sát dịch hại trên web",
        paragraphs: [
          "Đội phát triển có thể biến phần này thành quy trình số hóa. Mỗi khu trồng hoặc mỗi lô cây nên có một nhật ký theo dõi riêng với tần suất cập nhật hằng ngày hoặc ít nhất 2-3 lần/tuần tùy mức độ rủi ro.",
          "Dữ liệu giám sát nên đủ đơn giản để người vận hành nhập nhanh nhưng vẫn đủ để truy vết: ngày kiểm tra, vị trí, loại triệu chứng, mức độ xuất hiện, ảnh chụp, hành động đã thực hiện và tình trạng sau xử lý.",
        ],
        bullets: [
          "Chỉ số quan sát: lá thủng, đốm lá, héo rũ, rệp, bọ trĩ, nhện, sâu non, thối rễ, rong rêu, tảo.",
          "Mức độ: nhẹ - trung bình - nặng hoặc chấm điểm theo thang 1-5.",
          "Vị trí: lô, hàng, giàn, máng hoặc tọa độ khu vực.",
          "Hành động: cách ly, cắt bỏ, vệ sinh, tăng thông gió, điều chỉnh tưới, dùng chế phẩm sinh học, dùng thuốc hóa học.",
        ],
      },
      {
        heading: "4. Thuốc bảo vệ thực vật",
        bullets: [
          "Cần phân loại rõ nhóm thuốc trừ sâu, trừ bệnh, trừ nấm, trừ cỏ, điều hòa sinh trưởng và chế phẩm sinh học để người dùng không nhầm lẫn.",
          "Khi dùng thuốc hóa học phải tuân thủ nguyên tắc 4 đúng: đúng thuốc, đúng liều lượng - nồng độ, đúng lúc và đúng cách.",
          "Nên luân phiên hoạt chất hoặc nhóm tác động để hạn chế hiện tượng kháng thuốc.",
          "Phải hiển thị rõ thời gian cách ly sau phun để đảm bảo an toàn trước khi thu hoạch.",
          "Mọi lần sử dụng thuốc cần được lưu nhật ký để truy xuất về sau.",
        ],
      },
      {
        heading: "5. Phòng bệnh vùng rễ",
        bullets: [
          "Vùng rễ là nơi thường phát sinh các vấn đề khó nhận biết sớm, đặc biệt trong hệ thống thủy canh và tuần hoàn dinh dưỡng.",
          "Chiến lược tưới phải phù hợp với môi trường, giá thể và giai đoạn cây; tưới quá nhiều hoặc kéo dài trạng thái ẩm bão hòa làm rễ suy yếu.",
          "Oxy hòa tan bị ảnh hưởng bởi nhiệt độ nước, rong rêu, tảo, chất hữu cơ, vi sinh vật, dòng chảy và mức độ sục khí.",
          "Vệ sinh hệ thống là biện pháp bắt buộc để ngăn chặn bệnh rễ lây lan trên diện rộng.",
        ],
      },
      {
        heading: "6. Gợi ý chức năng nên có trên web",
        paragraphs: [
          "Phần này nên được phát triển thành nhóm tính năng vận hành thực tế: nhật ký dịch hại theo lô, cảnh báo theo ngưỡng, theo dõi hiệu quả xử lý và báo cáo xu hướng theo tuần/tháng.",
        ],
      },
    ],
  },
  {
    id: "module-vi",
    shortTitle: "VI. Thu hoạch & thương mại",
    title: "VI. Thu hoạch và thương mại hóa",
    intro: [
      "Đây là chương cần mở rộng rõ ràng vì nhiều tài liệu kỹ thuật thường dừng ở khâu trồng mà chưa đi sâu vào khâu sau thu hoạch và bán hàng.",
      "Tuy nhiên, với web quản lý nông sản, đây lại là phần quyết định giá trị thương mại, trải nghiệm khách hàng và khả năng quay vòng vốn.",
      "Nội dung chương này nên được thiết kế như một chuỗi công việc từ lúc cây đạt tiêu chuẩn thu hoạch cho đến khi sản phẩm đến tay người mua.",
      "Nếu hệ thống tách được thành các bước rõ ràng, đội code sẽ dễ xây thành luồng thao tác thực tế hơn.",
    ],
    sections: [
      {
        heading: "1. Tiêu chuẩn thu hoạch",
        bullets: [
          "Cần xác định tiêu chuẩn thu hoạch cho từng nhóm cây: kích thước, khối lượng, màu sắc, độ đồng đều, tình trạng lá, mức độ sạch và độ già sinh lý.",
          "Không nên thu hoạch chỉ dựa vào cảm tính; nên có checklist hoặc tiêu chí tối thiểu để hạn chế lẫn sản phẩm non, già hoặc lỗi hình thức.",
          "Thời điểm thu hoạch nên ưu tiên lúc mát trong ngày để giảm mất nước và giữ độ tươi.",
        ],
      },
      {
        heading: "2. Vệ sinh an toàn thực phẩm",
        bullets: [
          "Người thu hoạch phải sử dụng dụng cụ sạch, khay chứa sạch và tuân thủ vệ sinh cá nhân.",
          "Khu sơ chế cần tách biệt với khu chứa hóa chất, khu rác và nguồn nhiễm bẩn.",
          "Sản phẩm sau thu hoạch cần được hạn chế tiếp xúc trực tiếp với nền đất, bụi bẩn và ánh nắng gắt.",
          "Nếu sản phẩm có liên quan đến phun thuốc hoặc xử lý hóa chất trước đó, phải bảo đảm đã qua đủ thời gian cách ly.",
        ],
      },
      {
        heading: "3. Phân loại, sơ chế và kéo dài vòng đời",
        paragraphs: [
          "Sau thu hoạch, nên phân loại sản phẩm theo cấp chất lượng để tối ưu giá bán và giảm tỷ lệ hàng bị trả. Có thể chia thành hạng cao cấp, hạng tiêu chuẩn và hạng xử lý nhanh hoặc chế biến.",
          "Các bước sơ chế thường bao gồm làm sạch, cắt tỉa lá hư, loại bỏ phần lỗi, để ráo, đóng gói và bảo quản mát. Mỗi bước cần được thiết kế sao cho giảm dập nát, giữ độ tươi và hạn chế nhiễm chéo.",
        ],
        bullets: [
          "Sản phẩm càng đồng đều, sạch và giữ tươi tốt thì vòng đời bán hàng càng dài.",
          "Bao bì phù hợp và chuỗi lạnh ổn định giúp giảm hao hụt sau thu hoạch.",
          "Nên theo dõi tỷ lệ hao hụt để cải tiến khâu cắt, rửa, làm ráo và bảo quản.",
        ],
      },
      {
        heading: "4. Mixing & combining (combo sản phẩm)",
        paragraphs: [
          "Mục này có thể phát triển thành chức năng tạo combo sản phẩm trên web. Ví dụ: set rau ăn lẩu, set salad, combo rau gia vị hoặc gói rau theo tuần.",
          "Việc phối hợp nhiều loại nông sản trong một đơn vị bán giúp tăng giá trị đơn hàng, tạo sự tiện lợi cho khách và tận dụng tốt hơn sản lượng thu hoạch không đồng đều giữa các loại cây.",
        ],
        bullets: [
          "Nên có quy tắc phối hợp theo nhóm sử dụng, thời hạn bảo quản và tính tương thích khi đóng gói.",
          "Các combo cần ghi rõ thành phần, khối lượng từng loại, ngày đóng gói và hướng dẫn bảo quản.",
        ],
      },
      {
        heading: "5. Nhãn dán, truy xuất và thông tin sản phẩm",
        bullets: [
          "Mỗi sản phẩm nên có nhãn cơ bản gồm tên sản phẩm, khối lượng, ngày thu hoạch hoặc đóng gói, nơi sản xuất, hướng dẫn bảo quản và thông tin liên hệ.",
          "Nếu hướng đến kênh hiện đại, nên bổ sung mã QR để truy xuất lô sản xuất, nhật ký canh tác và thời gian thu hoạch.",
          "Thông tin rõ ràng giúp tăng niềm tin của khách hàng và hỗ trợ xử lý khiếu nại nếu có.",
        ],
      },
      {
        heading: "6. Marketing, định vị và sự tiện lợi",
        paragraphs: [
          "Thương mại hóa không chỉ là bán được hàng mà còn là xây dựng hình ảnh sản phẩm đáng tin cậy và dễ mua.",
          "Trong bối cảnh cạnh tranh hiện nay, sản phẩm sạch nhưng truyền thông yếu vẫn khó tạo lợi thế.",
          "Do đó, web quản lý nông sản có thể tích hợp phần nội dung thương mại như hồ sơ sản phẩm, câu chuyện vùng trồng, tiêu chuẩn chất lượng, ảnh thực tế, combo bán hàng và kênh đặt mua.",
        ],
        bullets: [
          "Định vị rõ sản phẩm đang bán điều gì: tươi hơn, sạch hơn, truy xuất rõ hơn hay tiện lợi hơn.",
          "Tập trung vào sự tiện lợi cho khách: gói nhỏ, gói gia đình, gói nhà hàng, combo theo món ăn hoặc theo tuần.",
          "Dùng hình ảnh thật, thông tin dễ hiểu, đơn vị đóng gói hợp lý và ngôn ngữ thân thiện.",
          "Theo dõi phản hồi khách hàng để cải tiến chất lượng, quy cách đóng gói và danh mục sản phẩm.",
        ],
      },
    ],
  },
];

export default function HuongDanThuyCanhPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_6px_20px_rgba(15,23,42,0.08)] sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Tài liệu hướng dẫn vận hành nhà màng
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Phiên bản module hóa cho đội vận hành và đội phát triển hệ thống.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
          >
            Quay lại Dashboard
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Mục lục module
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module) => (
            <a
              key={module.id}
              href={`#${module.id}`}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {module.shortTitle}
            </a>
          ))}
        </div>
      </section>

      {MODULES.map((module) => (
        <section
          key={module.id}
          id={module.id}
          className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
        >
          <h2 className="font-display text-xl font-bold text-slate-900">
            {module.title}
          </h2>
          <div className="mt-2 space-y-2">
            {module.intro.map((introText) => (
              <p
                key={introText}
                className="text-[15px] leading-7 text-slate-700"
              >
                {introText}
              </p>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {module.sections.map((section) => (
              <details
                key={section.heading}
                className="group rounded-xl border border-slate-200 bg-slate-50 p-3.5 open:border-emerald-300 open:bg-emerald-50/50"
              >
                <summary className="cursor-pointer list-none text-[15px] font-semibold text-slate-900">
                  {section.heading}
                </summary>
                {section.paragraphs ? (
                  <div className="mt-2 space-y-2">
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-[15px] leading-7 text-slate-700"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : null}
                {section.bullets ? (
                  <ul className="mt-2 space-y-2 text-[15px] leading-7 text-slate-700">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>• {bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </details>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
