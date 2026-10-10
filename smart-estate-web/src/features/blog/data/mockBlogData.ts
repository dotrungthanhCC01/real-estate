// Mock data cho toàn bộ hệ thống Blog
export type ArticleCategory =
  | "Tất cả"
  | "Xu hướng thị trường"
  | "Góc người mua"
  | "Góc người bán"
  | "Tài chính & Vay vốn"
  | "Pháp lý";

export type ListingPostType = "Tìm nhà" | "Bán nhà" | "Cho thuê" | "Cần thuê";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML-like paragraphs
  category: ArticleCategory;
  author: string;
  authorAvatar: string;
  publishedAt: string;
  readTime: number; // minutes
  coverImage: string;
  tags: string[];
  featured?: boolean;
}

export interface ListingPost {
  id: string;
  type: ListingPostType;
  title: string;
  description: string;
  location: string;
  price: string;
  area?: string;
  contactName: string;
  contactPhone: string;
  coverImage: string;
  postedAt: string;
  userId: string;
  userRole: "user" | "landlord";
}

export const MOCK_ARTICLES: Article[] = [
  {
    id: "a-001",
    slug: "tin-tuong-giua-nguoi-mua-nguoi-ban",
    title: "Sự Tin Tưởng Giúp Người Mua & Người Bán Đưa Ra Quyết Định BĐS Tốt Hơn",
    excerpt: "Khi niềm tin được xây dựng đúng cách, cả hai bên đều có thể đưa ra quyết định mua bán bất động sản sáng suốt hơn.",
    content: `<p>Trong bất kỳ giao dịch bất động sản nào, yếu tố quan trọng nhất thường không phải là giá cả hay vị trí — mà là sự tin tưởng. Khi người mua tin tưởng người bán, và ngược lại, cả hai bên đều có thể thương lượng thẳng thắn và đi đến kết quả win-win.</p>
<h2>Tại sao tin tưởng lại quan trọng?</h2>
<p>Bất động sản là quyết định tài chính lớn nhất trong cuộc đời hầu hết mọi người. Khi bạn đặt niềm tin sai chỗ, hậu quả có thể rất nghiêm trọng — từ mất tiền đặt cọc đến tranh chấp pháp lý kéo dài.</p>
<p>Ngược lại, khi giao dịch diễn ra trong môi trường tin cậy, cả người mua và người bán đều cảm thấy an toàn hơn. Người mua sẵn sàng trả giá hợp lý, người bán sẵn sàng minh bạch về tình trạng tài sản.</p>
<h2>Chúng tôi xây dựng niềm tin như thế nào?</h2>
<p>Tại Smart Estate, chúng tôi xác minh thông tin người đăng, lịch sử giao dịch, và trạng thái pháp lý của từng bất động sản trước khi đưa lên nền tảng. Điều này giúp cả người mua lẫn người bán đều có thể giao dịch với sự tự tin.</p>`,
    category: "Góc người mua",
    author: "Michael Harrington",
    authorAvatar: "https://i.pravatar.cc/150?u=m1",
    publishedAt: "2026-01-23",
    readTime: 7,
    coverImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    tags: ["tin tưởng", "mua bán", "tâm lý"],
    featured: true,
  },
  {
    id: "a-002",
    slug: "dieu-nguoi-ban-can-biet-truoc-khi-rao-ban",
    title: "Điều Người Bán Nhà Cần Biết Trước Khi Niêm Yết Bất Động Sản",
    excerpt: "Chuẩn bị đầy đủ thông tin và hình ảnh là chìa khóa để bán nhà nhanh và đúng giá.",
    content: `<p>Nhiều người bán nhà mắc sai lầm ngay từ bước đầu: đăng tin mà không chuẩn bị kỹ lưỡng. Điều này dẫn đến việc nhà rao bán hàng tháng mà không có người hỏi thăm.</p>
<h2>Ảnh chụp chuyên nghiệp là bắt buộc</h2>
<p>Trong thế giới số, người mua xem ảnh trước khi quyết định xem nhà thực tế. Ảnh mờ, tối, hay không thể hiện được không gian sẽ khiến họ bỏ qua tin đăng của bạn ngay lập tức.</p>
<h2>Định giá đúng từ đầu</h2>
<p>Đặt giá quá cao có thể khiến bất động sản "chết" trên thị trường. Tham khảo giá các bất động sản tương tự trong khu vực trong 3 tháng gần nhất để có mức giá phù hợp.</p>`,
    category: "Góc người bán",
    author: "Daniel Whitmore",
    authorAvatar: "https://i.pravatar.cc/150?u=m2",
    publishedAt: "2026-01-16",
    readTime: 6,
    coverImage: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80",
    tags: ["niêm yết", "rao bán", "kinh nghiệm"],
    featured: true,
  },
  {
    id: "a-003",
    slug: "xu-huong-thi-truong-quyet-dinh-thong-minh",
    title: "Xu Hướng Thị Trường Hình Thành Quyết Định Mua Bán Thông Minh",
    excerpt: "Hiểu xu hướng thị trường giúp bạn biết khi nào nên mua, khi nào nên chờ.",
    content: `<p>Thị trường bất động sản luôn biến động theo chu kỳ. Người mua thông minh không chỉ nhìn vào giá hiện tại mà còn phân tích xu hướng để dự đoán chiều hướng trong tương lai.</p>
<h2>Chỉ số cần theo dõi</h2>
<p>Lãi suất ngân hàng, tốc độ đô thị hóa, và quy hoạch hạ tầng là 3 yếu tố quyết định lớn nhất đến giá BĐS trong trung và dài hạn.</p>`,
    category: "Xu hướng thị trường",
    author: "Andrew Collins",
    authorAvatar: "https://i.pravatar.cc/150?u=m3",
    publishedAt: "2026-01-23",
    readTime: 4,
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    tags: ["xu hướng", "phân tích", "đầu tư"],
    featured: true,
  },
  {
    id: "a-004",
    slug: "huong-dan-xay-dung-nha-de-ban-nhanh",
    title: "Hướng Dẫn Toàn Diện Để Staging Nhà Bán Nhanh",
    excerpt: "Ấn tượng đầu tiên quyết định tất cả. Staging đúng cách giúp bạn bán nhanh hơn 30%.",
    content: `<p>Staging nhà là nghệ thuật bày trí không gian để tạo ấn tượng tốt nhất với người mua tiềm năng. Đây không phải là chi phí mà là đầu tư sinh lời.</p>`,
    category: "Góc người bán",
    author: "Sarah Johnson",
    authorAvatar: "https://i.pravatar.cc/150?u=m4",
    publishedAt: "2026-03-24",
    readTime: 8,
    coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    tags: ["staging", "bán nhanh", "thiết kế nội thất"],
  },
  {
    id: "a-005",
    slug: "cai-tao-tang-gia-tri-bat-dong-san",
    title: "5 Cải Tạo Giúp Tăng Giá Trị Bất Động Sản Đáng Kể",
    excerpt: "Không phải cải tạo nào cũng tăng giá trị nhà. Chọn đúng hạng mục để tối đa hóa lợi nhuận.",
    content: `<p>Trong số hàng chục hạng mục cải tạo có thể làm, chỉ một số ít thực sự mang lại ROI dương khi bán nhà. Bài viết này sẽ phân tích từng loại.</p>`,
    category: "Góc người bán",
    author: "Tom Bradley",
    authorAvatar: "https://i.pravatar.cc/150?u=m5",
    publishedAt: "2026-03-18",
    readTime: 5,
    coverImage: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
    tags: ["cải tạo", "tăng giá trị", "đầu tư"],
  },
  {
    id: "a-006",
    slug: "chon-moi-gioi-bat-dong-san-phu-hop",
    title: "Cách Chọn Môi Giới BĐS Phù Hợp Với Nhu Cầu Của Bạn",
    excerpt: "Môi giới tốt là đòn bẩy giúp giao dịch thuận lợi. Biết cách chọn đúng người ngay từ đầu.",
    content: `<p>Không phải môi giới nào cũng phù hợp với mọi loại giao dịch. Có người chuyên bán căn hộ trung cấp, có người giỏi đất nền, có người am hiểu thị trường bất động sản thương mại.</p>`,
    category: "Góc người mua",
    author: "Lisa Chen",
    authorAvatar: "https://i.pravatar.cc/150?u=m6",
    publishedAt: "2026-03-10",
    readTime: 6,
    coverImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80",
    tags: ["môi giới", "tư vấn", "kinh nghiệm"],
  },
  {
    id: "a-007",
    slug: "lai-suat-vay-mua-nha-tot-nhat",
    title: "Hiểu Lãi Suất Vay Mua Nhà: Làm Thế Nào Để Có Mức Tốt Nhất?",
    excerpt: "Lãi suất ảnh hưởng trực tiếp đến tổng chi phí sở hữu nhà. Đây là cách để thương lượng tốt nhất.",
    content: `<p>Chênh lệch 0.5% lãi suất trên khoản vay 2 tỷ đồng trong 20 năm có thể tạo ra sự khác biệt hàng trăm triệu đồng. Đó là lý do việc so sánh lãi suất trước khi vay là cực kỳ quan trọng.</p>`,
    category: "Tài chính & Vay vốn",
    author: "Kevin Park",
    authorAvatar: "https://i.pravatar.cc/150?u=m7",
    publishedAt: "2026-02-10",
    readTime: 7,
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
    tags: ["lãi suất", "vay vốn", "tài chính"],
  },
  {
    id: "a-008",
    slug: "thu-tuc-phap-ly-mua-ban-nha",
    title: "Thủ Tục Pháp Lý Mua Bán Nhà: Checklist Đầy Đủ Từ A-Z",
    excerpt: "Bỏ sót bất kỳ bước pháp lý nào cũng có thể gây ra rủi ro nghiêm trọng. Đây là hướng dẫn hoàn chỉnh.",
    content: `<p>Mua bán bất động sản là một trong những giao dịch pháp lý phức tạp nhất trong cuộc đời. Dưới đây là checklist đầy đủ để bạn không bỏ sót bước nào.</p>`,
    category: "Pháp lý",
    author: "Nguyen Thi Hoa",
    authorAvatar: "https://i.pravatar.cc/150?u=m8",
    publishedAt: "2026-01-18",
    readTime: 10,
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    tags: ["pháp lý", "thủ tục", "công chứng"],
  },
];

export const MOCK_LISTING_POSTS: ListingPost[] = [
  {
    id: "lp-001",
    type: "Tìm nhà",
    title: "Cần tìm phòng trọ gần ĐH Bách Khoa HCM",
    description: "Sinh viên năm 3 cần tìm phòng trọ gần khu vực Đại học Bách Khoa HCM. Ngân sách 3-4 triệu/tháng, ưu tiên có điều hoà, gần xe buýt. Liên hệ ngay.",
    location: "Quận 10, TP. HCM",
    price: "3–4 triệu/tháng",
    contactName: "Nguyễn Văn An",
    contactPhone: "0901234567",
    coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80",
    postedAt: "2026-09-28",
    userId: "u-001",
    userRole: "user",
  },
  {
    id: "lp-002",
    type: "Cho thuê",
    title: "Cho thuê phòng trọ sạch sẽ, đầy đủ nội thất tại Bình Thạnh",
    description: "Phòng 25m², có điều hoà, tủ lạnh, máy giặt. Gần chợ, siêu thị, an ninh tốt. Giá đã bao gồm điện nước internet.",
    location: "Bình Thạnh, TP. HCM",
    price: "4.500.000đ/tháng",
    area: "25m²",
    contactName: "Trần Thị Bích",
    contactPhone: "0912345678",
    coverImage: "https://images.unsplash.com/photo-1536858974309-969fd9db8e22?auto=format&fit=crop&w=400&q=80",
    postedAt: "2026-09-27",
    userId: "l-001",
    userRole: "landlord",
  },
  {
    id: "lp-003",
    type: "Bán nhà",
    title: "Bán nhà hẻm xe hơi Quận 7, 4x15m, 3 tầng",
    description: "Nhà đẹp, hẻm thông thoáng, gần trường học, bệnh viện. Pháp lý đầy đủ, sang tên nhanh. Không qua trung gian.",
    location: "Quận 7, TP. HCM",
    price: "6.8 tỷ",
    area: "60m²",
    contactName: "Lê Hoàng Nam",
    contactPhone: "0923456789",
    coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80",
    postedAt: "2026-09-25",
    userId: "u-002",
    userRole: "user",
  },
  {
    id: "lp-004",
    type: "Cần thuê",
    title: "Cần thuê văn phòng nhỏ khu vực Quận 1",
    description: "Công ty startup cần thuê văn phòng 30-50m² ở khu trung tâm, tòa nhà có thang máy, đủ điều kiện đăng ký doanh nghiệp. Thời hạn tối thiểu 1 năm.",
    location: "Quận 1, TP. HCM",
    price: "15–25 triệu/tháng",
    contactName: "Phạm Minh Tuấn",
    contactPhone: "0934567890",
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80",
    postedAt: "2026-09-24",
    userId: "u-003",
    userRole: "user",
  },
  {
    id: "lp-005",
    type: "Cho thuê",
    title: "Căn hộ Studio mới xây, full nội thất cao cấp tại Thủ Đức",
    description: "Căn hộ 35m² mới 100%, nội thất Châu Âu, view sông. Toà nhà có gym, hồ bơi, bảo vệ 24/7.",
    location: "Thành phố Thủ Đức, TP. HCM",
    price: "8.000.000đ/tháng",
    area: "35m²",
    contactName: "Nguyễn Thị Lan",
    contactPhone: "0945678901",
    coverImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80",
    postedAt: "2026-09-22",
    userId: "l-002",
    userRole: "landlord",
  },
  {
    id: "lp-006",
    type: "Tìm nhà",
    title: "Gia đình 4 người tìm nhà nguyên căn cho thuê ở Gò Vấp",
    description: "Cần thuê nhà nguyên căn 3-4 phòng ngủ, ưu tiên có sân để xe ô tô, yên tĩnh. Thanh toán 3 tháng/lần.",
    location: "Gò Vấp, TP. HCM",
    price: "12–18 triệu/tháng",
    contactName: "Trần Văn Đức",
    contactPhone: "0956789012",
    coverImage: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&q=80",
    postedAt: "2026-09-20",
    userId: "u-004",
    userRole: "user",
  },
];

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  "Tất cả",
  "Xu hướng thị trường",
  "Góc người mua",
  "Góc người bán",
  "Tài chính & Vay vốn",
  "Pháp lý",
];

export const LISTING_POST_TYPES: ListingPostType[] = [
  "Tìm nhà",
  "Bán nhà",
  "Cho thuê",
  "Cần thuê",
];
