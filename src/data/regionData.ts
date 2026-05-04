export interface Product {
  id: number;
  name: string;
  origin: string;
  province: string;
  city: string;
  region: string;
  price: number;
  sales: string;
  image: string;
  tags: string[];
  category: string;
  subCategory: string;
  isSelfOperated: boolean;
  isGI: boolean;
  soldOut?: boolean;
}

export interface RegionArea {
  name: string;
  param: string;
  image: string;
  provinces: { name: string; cities: string[] }[];
}

export interface CategoryDef {
  id: string;
  name: string;
  image: string;
  description: string;
  count: number;
  subCategories: string[];
}

export const regionAreas: RegionArea[] = [
  {
    name: '华北',
    param: 'north',
    image: '/region-north.jpg',
    provinces: [
      { name: '北京', cities: ['北京'] },
      { name: '天津', cities: ['天津'] },
      { name: '河北', cities: ['石家庄', '保定', '承德', '唐山'] },
      { name: '山西', cities: ['太原', '晋中', '运城', '大同'] },
      { name: '内蒙古', cities: ['呼和浩特', '包头', '赤峰', '锡林郭勒'] },
    ],
  },
  {
    name: '华东',
    param: 'east',
    image: '/region-east.jpg',
    provinces: [
      { name: '上海', cities: ['上海'] },
      { name: '江苏', cities: ['南京', '苏州', '无锡', '扬州', '徐州'] },
      { name: '浙江', cities: ['杭州', '宁波', '温州', '绍兴', '嘉兴'] },
      { name: '安徽', cities: ['合肥', '黄山', '芜湖', '六安'] },
      { name: '福建', cities: ['福州', '厦门', '泉州', '南平', '安溪'] },
      { name: '江西', cities: ['南昌', '景德镇', '九江'] },
      { name: '山东', cities: ['济南', '青岛', '烟台', '潍坊', '临沂'] },
    ],
  },
  {
    name: '华南',
    param: 'south',
    image: '/region-south.jpg',
    provinces: [
      { name: '广东', cities: ['广州', '深圳', '佛山', '梅州', '潮州'] },
      { name: '广西', cities: ['南宁', '桂林', '柳州', '北海'] },
      { name: '海南', cities: ['海口', '三亚'] },
    ],
  },
  {
    name: '西南',
    param: 'southwest',
    image: '/region-southwest.jpg',
    provinces: [
      { name: '四川', cities: ['成都', '绵阳', '乐山', '宜宾', '泸州'] },
      { name: '贵州', cities: ['贵阳', '遵义', '安顺', '黔东南'] },
      { name: '云南', cities: ['昆明', '大理', '丽江', '普洱', '西双版纳'] },
      { name: '重庆', cities: ['重庆'] },
      { name: '西藏', cities: ['拉萨', '日喀则'] },
    ],
  },
  {
    name: '西北',
    param: 'northwest',
    image: '/region-northwest.jpg',
    provinces: [
      { name: '陕西', cities: ['西安', '延安', '汉中', '宝鸡'] },
      { name: '甘肃', cities: ['兰州', '天水', '张掖', '酒泉'] },
      { name: '青海', cities: ['西宁', '海东'] },
      { name: '宁夏', cities: ['银川', '中卫', '吴忠'] },
      { name: '新疆', cities: ['乌鲁木齐', '吐鲁番', '阿克苏', '和田', '喀什'] },
    ],
  },
  {
    name: '华中',
    param: 'central',
    image: '/region-central.jpg',
    provinces: [
      { name: '河南', cities: ['郑州', '洛阳', '开封', '信阳'] },
      { name: '湖北', cities: ['武汉', '宜昌', '恩施', '荆州'] },
      { name: '湖南', cities: ['长沙', '岳阳', '张家界', '湘西'] },
    ],
  },
];

export const categories: CategoryDef[] = [
  {
    id: 'fresh',
    name: '生鲜果蔬',
    image: '/category-fresh.jpg',
    description: '产地直采的时令鲜果与有机蔬菜，从田间到餐桌不超过48小时',
    count: 328,
    subCategories: ['叶菜类', '根茎类', '菌菇类', '水果类', '豆制品'],
  },
  {
    id: 'grain',
    name: '粮油干货',
    image: '/category-grain.jpg',
    description: '五常大米、杂粮杂豆、山珍干货，每一粒都饱含土地的温度',
    count: 256,
    subCategories: ['大米', '杂粮', '食用油', '干货', '调味品'],
  },
  {
    id: 'tea',
    name: '茶饮酒水',
    image: '/category-tea.jpg',
    description: '龙井、普洱、铁观音，以及各地特色酒饮，品味千年茶酒文化',
    count: 412,
    subCategories: ['绿茶', '红茶', '乌龙茶', '白酒', '黄酒', '果酒'],
  },
  {
    id: 'snack',
    name: '糕点零食',
    image: '/category-snack.jpg',
    description: '传统手工酥点、地方特色小食，儿时的味道与匠心的传承',
    count: 189,
    subCategories: ['中式糕点', '坚果炒货', '蜜饯果脯', '肉脯零食', '糖果巧克力'],
  },
  {
    id: 'tonic',
    name: '滋补养生',
    image: '/category-tonic.jpg',
    description: '人参、枸杞、燕窝、阿胶等滋补臻品，养身更养心',
    count: 145,
    subCategories: ['参茸贵细', '枸杞红枣', '燕窝阿胶', '蜂产品', '养生茶饮'],
  },
  {
    id: 'gift',
    name: '伴手礼盒',
    image: '/category-gift.jpg',
    description: '精选各地风物组合而成的礼盒套装，传递心意与祝福',
    count: 98,
    subCategories: ['节日礼盒', '商务礼盒', '地方特色礼盒', '定制礼盒'],
  },
];

const productImages = [
  '/category-fresh.jpg',
  '/category-grain.jpg',
  '/category-tea.jpg',
  '/category-snack.jpg',
  '/category-tonic.jpg',
  '/category-gift.jpg',
  '/product-placeholder.jpg',
];

function getImage(idx: number) {
  return productImages[idx % productImages.length];
}

export const products: Product[] = [
  // 华北
  { id: 1, name: '燕山板栗', origin: '北京·怀柔', province: '北京', city: '北京', region: 'north', price: 35, sales: '2.1万', image: getImage(0), tags: ['当季'], category: 'fresh', subCategory: '水果类', isSelfOperated: true, isGI: true },
  { id: 2, name: '天津狗不理包子礼盒', origin: '天津·和平', province: '天津', city: '天津', region: 'north', price: 128, sales: '8千', image: getImage(3), tags: ['礼盒'], category: 'gift', subCategory: '节日礼盒', isSelfOperated: true, isGI: true },
  { id: 3, name: '保定驴肉火烧', origin: '河北·保定', province: '河北', city: '保定', region: 'north', price: 68, sales: '1.5万', image: getImage(3), tags: ['速食'], category: 'snack', subCategory: '肉脯零食', isSelfOperated: false, isGI: true },
  { id: 4, name: '山西老陈醋', origin: '山西·晋中', province: '山西', city: '晋中', region: 'north', price: 58, sales: '4千', image: getImage(4), tags: ['传统'], category: 'grain', subCategory: '调味品', isSelfOperated: true, isGI: true },
  { id: 5, name: '内蒙古风干牛肉', origin: '内蒙古·锡林郭勒', province: '内蒙古', city: '锡林郭勒', region: 'north', price: 168, sales: '3.2万', image: getImage(3), tags: ['热销'], category: 'snack', subCategory: '肉脯零食', isSelfOperated: true, isGI: true },
  { id: 6, name: '承德杏仁', origin: '河北·承德', province: '河北', city: '承德', region: 'north', price: 45, sales: '1.1万', image: getImage(4), tags: ['坚果'], category: 'snack', subCategory: '坚果炒货', isSelfOperated: false, isGI: true },
  { id: 7, name: '大同黄花', origin: '山西·大同', province: '山西', city: '大同', region: 'north', price: 38, sales: '6千', image: getImage(1), tags: ['干货'], category: 'grain', subCategory: '干货', isSelfOperated: true, isGI: true },
  { id: 8, name: '赤峰小米', origin: '内蒙古·赤峰', province: '内蒙古', city: '赤峰', region: 'north', price: 29, sales: '9千', image: getImage(1), tags: ['粗粮'], category: 'grain', subCategory: '杂粮', isSelfOperated: true, isGI: false },
  { id: 9, name: '唐山蜂蜜麻糖', origin: '河北·唐山', province: '河北', city: '唐山', region: 'north', price: 48, sales: '5千', image: getImage(3), tags: ['传统'], category: 'snack', subCategory: '中式糕点', isSelfOperated: false, isGI: true },
  { id: 10, name: '北京景泰蓝工艺茶具', origin: '北京·东城', province: '北京', city: '北京', region: 'north', price: 688, sales: '1千', image: getImage(2), tags: ['工艺'], category: 'tea', subCategory: '绿茶', isSelfOperated: true, isGI: false },
  // 华东
  { id: 11, name: '阳澄湖大闸蟹', origin: '江苏·苏州', province: '江苏', city: '苏州', region: 'east', price: 298, sales: '5.8万', image: getImage(0), tags: ['当季', '热销'], category: 'fresh', subCategory: '水果类', isSelfOperated: true, isGI: true },
  { id: 12, name: '西湖龙井', origin: '浙江·杭州', province: '浙江', city: '杭州', region: 'east', price: 368, sales: '3.6万', image: getImage(2), tags: ['明前'], category: 'tea', subCategory: '绿茶', isSelfOperated: true, isGI: true },
  { id: 13, name: '黄山毛峰', origin: '安徽·黄山', province: '安徽', city: '黄山', region: 'east', price: 218, sales: '1.8万', image: getImage(2), tags: ['春茶'], category: 'tea', subCategory: '绿茶', isSelfOperated: true, isGI: true },
  { id: 14, name: '福建铁观音', origin: '福建·安溪', province: '福建', city: '安溪', region: 'east', price: 198, sales: '2.9万', image: getImage(2), tags: ['乌龙'], category: 'tea', subCategory: '乌龙茶', isSelfOperated: true, isGI: true },
  { id: 15, name: '景德镇瓷器茶具套装', origin: '江西·景德镇', province: '江西', city: '景德镇', region: 'east', price: 458, sales: '4千', image: getImage(2), tags: ['工艺'], category: 'gift', subCategory: '商务礼盒', isSelfOperated: true, isGI: false },
  { id: 16, name: '南京盐水鸭', origin: '江苏·南京', province: '江苏', city: '南京', region: 'east', price: 88, sales: '1.2万', image: getImage(3), tags: ['熟食'], category: 'snack', subCategory: '肉脯零食', isSelfOperated: true, isGI: true },
  { id: 17, name: '温州鸭舌', origin: '浙江·温州', province: '浙江', city: '温州', region: 'east', price: 78, sales: '2.5万', image: getImage(3), tags: ['热销'], category: 'snack', subCategory: '肉脯零食', isSelfOperated: true, isGI: true },
  { id: 18, name: '绍兴黄酒', origin: '浙江·绍兴', province: '浙江', city: '绍兴', region: 'east', price: 128, sales: '7千', image: getImage(2), tags: ['传统'], category: 'tea', subCategory: '黄酒', isSelfOperated: true, isGI: true },
  { id: 19, name: '五常稻花香米', origin: '黑龙江·五常', province: '黑龙江', city: '五常', region: 'east', price: 128, sales: '6.5万', image: getImage(1), tags: ['热销', '当季'], category: 'grain', subCategory: '大米', isSelfOperated: true, isGI: true },
  { id: 20, name: '崂山绿茶', origin: '山东·青岛', province: '山东', city: '青岛', region: 'east', price: 168, sales: '9千', image: getImage(2), tags: ['春茶'], category: 'tea', subCategory: '绿茶', isSelfOperated: false, isGI: true },
  { id: 21, name: '烟台苹果', origin: '山东·烟台', province: '山东', city: '烟台', region: 'east', price: 58, sales: '4.2万', image: getImage(0), tags: ['当季'], category: 'fresh', subCategory: '水果类', isSelfOperated: true, isGI: true },
  { id: 22, name: '太湖银鱼', origin: '江苏·无锡', province: '江苏', city: '无锡', region: 'east', price: 138, sales: '3千', image: getImage(0), tags: ['水产'], category: 'fresh', subCategory: '豆制品', isSelfOperated: true, isGI: true },
  // 华南
  { id: 23, name: '增城挂绿荔枝', origin: '广东·广州', province: '广东', city: '广州', region: 'south', price: 188, sales: '2.8万', image: getImage(0), tags: ['当季', '珍稀'], category: 'fresh', subCategory: '水果类', isSelfOperated: true, isGI: true },
  { id: 24, name: '广西柳州螺蛳粉', origin: '广西·柳州', province: '广西', city: '柳州', region: 'south', price: 45, sales: '7.5万', image: getImage(3), tags: ['热销', '网红'], category: 'snack', subCategory: '肉脯零食', isSelfOperated: true, isGI: true },
  { id: 25, name: '海南文昌鸡', origin: '海南·文昌', province: '海南', city: '文昌', region: 'south', price: 168, sales: '1.6万', image: getImage(0), tags: ['散养'], category: 'fresh', subCategory: '水果类', isSelfOperated: true, isGI: true },
  { id: 26, name: '潮州凤凰单丛', origin: '广东·潮州', province: '广东', city: '潮州', region: 'south', price: 298, sales: '1.2万', image: getImage(2), tags: ['乌龙'], category: 'tea', subCategory: '乌龙茶', isSelfOperated: true, isGI: true },
  { id: 27, name: '桂林三花酒', origin: '广西·桂林', province: '广西', city: '桂林', region: 'south', price: 98, sales: '5千', image: getImage(2), tags: ['米酒'], category: 'tea', subCategory: '白酒', isSelfOperated: false, isGI: true },
  { id: 28, name: '广东腊肠', origin: '广东·佛山', province: '广东', city: '佛山', region: 'south', price: 88, sales: '3.1万', image: getImage(3), tags: ['传统'], category: 'snack', subCategory: '肉脯零食', isSelfOperated: true, isGI: true },
  { id: 29, name: '海南椰子', origin: '海南·三亚', province: '海南', city: '三亚', region: 'south', price: 25, sales: '4.8万', image: getImage(0), tags: ['新鲜'], category: 'fresh', subCategory: '水果类', isSelfOperated: true, isGI: false },
  { id: 30, name: '梧州龟苓膏', origin: '广西·梧州', province: '广西', city: '梧州', region: 'south', price: 35, sales: '2.2万', image: getImage(4), tags: ['养生'], category: 'tonic', subCategory: '养生茶饮', isSelfOperated: true, isGI: true },
  // 西南
  { id: 31, name: '云南普洱茶饼', origin: '云南·普洱', province: '云南', city: '普洱', region: 'southwest', price: 268, sales: '3.4万', image: getImage(2), tags: ['陈年老茶'], category: 'tea', subCategory: '红茶', isSelfOperated: true, isGI: true },
  { id: 32, name: '四川郫县豆瓣酱', origin: '四川·成都', province: '四川', city: '成都', region: 'southwest', price: 35, sales: '8.2万', image: getImage(1), tags: ['热销', '传统'], category: 'grain', subCategory: '调味品', isSelfOperated: true, isGI: true },
  { id: 33, name: '贵州茅台', origin: '贵州·遵义', province: '贵州', city: '遵义', region: 'southwest', price: 1499, sales: '5.6万', image: getImage(2), tags: ['名酒'], category: 'tea', subCategory: '白酒', isSelfOperated: true, isGI: true },
  { id: 34, name: '重庆火锅底料', origin: '重庆·江北', province: '重庆', city: '重庆', region: 'southwest', price: 48, sales: '6.8万', image: getImage(1), tags: ['热销', '麻辣'], category: 'grain', subCategory: '调味品', isSelfOperated: true, isGI: false },
  { id: 35, name: '云南野生菌菇', origin: '云南·楚雄', province: '云南', city: '楚雄', region: 'southwest', price: 168, sales: '2.1万', image: getImage(0), tags: ['珍稀'], category: 'fresh', subCategory: '菌菇类', isSelfOperated: true, isGI: true },
  { id: 36, name: '四川宜宾五粮液', origin: '四川·宜宾', province: '四川', city: '宜宾', region: 'southwest', price: 1099, sales: '3.2万', image: getImage(2), tags: ['名酒'], category: 'tea', subCategory: '白酒', isSelfOperated: true, isGI: true },
  { id: 37, name: '云南鲜花饼', origin: '云南·昆明', province: '云南', city: '昆明', region: 'southwest', price: 58, sales: '4.5万', image: getImage(3), tags: ['特色'], category: 'snack', subCategory: '中式糕点', isSelfOperated: true, isGI: true },
  { id: 38, name: '贵州老干妈', origin: '贵州·贵阳', province: '贵州', city: '贵阳', region: 'southwest', price: 22, sales: '12万', image: getImage(1), tags: ['热销'], category: 'grain', subCategory: '调味品', isSelfOperated: false, isGI: false },
  { id: 39, name: '西藏牦牛肉干', origin: '西藏·拉萨', province: '西藏', city: '拉萨', region: 'southwest', price: 198, sales: '1.5万', image: getImage(3), tags: ['高原'], category: 'snack', subCategory: '肉脯零食', isSelfOperated: true, isGI: true },
  { id: 40, name: '四川蒙顶山茶', origin: '四川·雅安', province: '四川', city: '成都', region: 'southwest', price: 158, sales: '8千', image: getImage(2), tags: ['春茶'], category: 'tea', subCategory: '绿茶', isSelfOperated: true, isGI: true },
  // 西北
  { id: 41, name: '新疆阿克苏苹果', origin: '新疆·阿克苏', province: '新疆', city: '阿克苏', region: 'northwest', price: 88, sales: '5.2万', image: getImage(0), tags: ['当季', '冰糖心'], category: 'fresh', subCategory: '水果类', isSelfOperated: true, isGI: true },
  { id: 42, name: '宁夏中宁枸杞', origin: '宁夏·中卫', province: '宁夏', city: '中卫', region: 'northwest', price: 88, sales: '3.8万', image: getImage(4), tags: ['滋补'], category: 'tonic', subCategory: '枸杞红枣', isSelfOperated: true, isGI: true },
  { id: 43, name: '新疆和田大枣', origin: '新疆·和田', province: '新疆', city: '和田', region: 'northwest', price: 68, sales: '4.1万', image: getImage(4), tags: ['干果'], category: 'tonic', subCategory: '枸杞红枣', isSelfOperated: true, isGI: true },
  { id: 44, name: '甘肃兰州百合', origin: '甘肃·兰州', province: '甘肃', city: '兰州', region: 'northwest', price: 78, sales: '1.9万', image: getImage(0), tags: ['鲜甜'], category: 'fresh', subCategory: '根茎类', isSelfOperated: true, isGI: true },
  { id: 45, name: '陕西眉县猕猴桃', origin: '陕西·宝鸡', province: '陕西', city: '宝鸡', region: 'northwest', price: 58, sales: '2.7万', image: getImage(0), tags: ['当季'], category: 'fresh', subCategory: '水果类', isSelfOperated: true, isGI: true },
  { id: 46, name: '青海黑枸杞', origin: '青海·西宁', province: '青海', city: '西宁', region: 'northwest', price: 138, sales: '1.4万', image: getImage(4), tags: ['珍稀'], category: 'tonic', subCategory: '枸杞红枣', isSelfOperated: true, isGI: true },
  { id: 47, name: '新疆葡萄干', origin: '新疆·吐鲁番', province: '新疆', city: '吐鲁番', region: 'northwest', price: 45, sales: '3.3万', image: getImage(4), tags: ['干果'], category: 'snack', subCategory: '蜜饯果脯', isSelfOperated: true, isGI: true },
  { id: 48, name: '宁夏滩羊肉', origin: '宁夏·银川', province: '宁夏', city: '银川', region: 'northwest', price: 238, sales: '2.6万', image: getImage(0), tags: ['散养'], category: 'fresh', subCategory: '水果类', isSelfOperated: true, isGI: true },
  { id: 49, name: '陕西凉皮', origin: '陕西·西安', province: '陕西', city: '西安', region: 'northwest', price: 28, sales: '5.1万', image: getImage(3), tags: ['速食'], category: 'snack', subCategory: '中式糕点', isSelfOperated: false, isGI: true },
  { id: 50, name: '甘肃酒泉夜光杯', origin: '甘肃·酒泉', province: '甘肃', city: '酒泉', region: 'northwest', price: 388, sales: '8百', image: getImage(5), tags: ['工艺'], category: 'gift', subCategory: '商务礼盒', isSelfOperated: true, isGI: false },
  // 华中
  { id: 51, name: '河南信阳毛尖', origin: '河南·信阳', province: '河南', city: '信阳', region: 'central', price: 228, sales: '2.3万', image: getImage(2), tags: ['春茶'], category: 'tea', subCategory: '绿茶', isSelfOperated: true, isGI: true },
  { id: 52, name: '湖北武昌鱼', origin: '湖北·武汉', province: '湖北', city: '武汉', region: 'central', price: 118, sales: '1.7万', image: getImage(0), tags: ['水产'], category: 'fresh', subCategory: '豆制品', isSelfOperated: true, isGI: true },
  { id: 53, name: '湖南安化黑茶', origin: '湖南·益阳', province: '湖南', city: '益阳', region: 'central', price: 198, sales: '1.3万', image: getImage(2), tags: ['陈茶'], category: 'tea', subCategory: '红茶', isSelfOperated: true, isGI: true },
  { id: 54, name: '洛阳牡丹花茶', origin: '河南·洛阳', province: '河南', city: '洛阳', region: 'central', price: 78, sales: '9千', image: getImage(2), tags: ['花茶'], category: 'tea', subCategory: '绿茶', isSelfOperated: true, isGI: false },
  { id: 55, name: '荆州鱼糕', origin: '湖北·荆州', province: '湖北', city: '荆州', region: 'central', price: 68, sales: '1.1万', image: getImage(3), tags: ['传统'], category: 'snack', subCategory: '中式糕点', isSelfOperated: true, isGI: true },
  { id: 56, name: '湖南酱板鸭', origin: '湖南·长沙', province: '湖南', city: '长沙', region: 'central', price: 88, sales: '2.9万', image: getImage(3), tags: ['热销', '辣味'], category: 'snack', subCategory: '肉脯零食', isSelfOperated: true, isGI: true },
  { id: 57, name: '湖北恩施玉露', origin: '湖北·恩施', province: '湖北', city: '恩施', region: 'central', price: 168, sales: '8千', image: getImage(2), tags: ['春茶'], category: 'tea', subCategory: '绿茶', isSelfOperated: true, isGI: true },
  { id: 58, name: '河南铁棍山药', origin: '河南·焦作', province: '河南', city: '郑州', region: 'central', price: 48, sales: '3.1万', image: getImage(0), tags: ['滋补'], category: 'tonic', subCategory: '参茸贵细', isSelfOperated: true, isGI: true },
  { id: 59, name: '湖南剁辣椒', origin: '湖南·岳阳', province: '湖南', city: '岳阳', region: 'central', price: 25, sales: '4.7万', image: getImage(1), tags: ['热销'], category: 'grain', subCategory: '调味品', isSelfOperated: false, isGI: true },
  { id: 60, name: '湖北热干面', origin: '湖北·武汉', province: '湖北', city: '武汉', region: 'central', price: 35, sales: '6.3万', image: getImage(3), tags: ['速食', '热销'], category: 'snack', subCategory: '中式糕点', isSelfOperated: true, isGI: true },
  // Additional for categories coverage
  { id: 61, name: '长白山人参', origin: '吉林·延边', province: '吉林', city: '延边', region: 'north', price: 688, sales: '1.2万', image: getImage(4), tags: ['珍稀'], category: 'tonic', subCategory: '参茸贵细', isSelfOperated: true, isGI: true },
  { id: 62, name: '大连海参', origin: '辽宁·大连', province: '辽宁', city: '大连', region: 'north', price: 888, sales: '8千', image: getImage(4), tags: ['高端'], category: 'tonic', subCategory: '参茸贵细', isSelfOperated: true, isGI: true },
  { id: 63, name: '东北黑木耳', origin: '黑龙江·牡丹江', province: '黑龙江', city: '牡丹江', region: 'north', price: 58, sales: '2.4万', image: getImage(1), tags: ['干货'], category: 'grain', subCategory: '干货', isSelfOperated: true, isGI: true },
  { id: 64, name: '吉林鹿茸', origin: '吉林·通化', province: '吉林', city: '通化', region: 'north', price: 1280, sales: '3千', image: getImage(4), tags: ['珍稀'], category: 'tonic', subCategory: '参茸贵细', isSelfOperated: true, isGI: true },
  { id: 65, name: '辽宁辽参', origin: '辽宁·大连', province: '辽宁', city: '大连', region: 'north', price: 568, sales: '5千', image: getImage(4), tags: ['滋补'], category: 'tonic', subCategory: '参茸贵细', isSelfOperated: true, isGI: true },
  { id: 66, name: '东北酸菜', origin: '黑龙江·哈尔滨', province: '黑龙江', city: '哈尔滨', region: 'north', price: 28, sales: '3.6万', image: getImage(0), tags: ['传统'], category: 'fresh', subCategory: '叶菜类', isSelfOperated: false, isGI: false },
  { id: 67, name: '赣南脐橙', origin: '江西·赣州', province: '江西', city: '赣州', region: 'east', price: 68, sales: '5.1万', image: getImage(0), tags: ['当季', '热销'], category: 'fresh', subCategory: '水果类', isSelfOperated: true, isGI: true },
  { id: 68, name: '福州鱼丸', origin: '福建·福州', province: '福建', city: '福州', region: 'east', price: 58, sales: '2.2万', image: getImage(0), tags: ['传统'], category: 'fresh', subCategory: '豆制品', isSelfOperated: true, isGI: true },
  { id: 69, name: '舟山带鱼', origin: '浙江·舟山', province: '浙江', city: '宁波', region: 'east', price: 128, sales: '1.9万', image: getImage(0), tags: ['水产'], category: 'fresh', subCategory: '豆制品', isSelfOperated: true, isGI: true },
  { id: 70, name: '洞庭碧螺春', origin: '湖南·岳阳', province: '湖南', city: '岳阳', region: 'central', price: 288, sales: '1.1万', image: getImage(2), tags: ['春茶'], category: 'tea', subCategory: '绿茶', isSelfOperated: true, isGI: true },
  { id: 71, name: '海南燕窝', origin: '海南·海口', province: '海南', city: '海口', region: 'south', price: 1280, sales: '2千', image: getImage(4), tags: ['高端'], category: 'tonic', subCategory: '燕窝阿胶', isSelfOperated: true, isGI: false },
  { id: 72, name: '云南三七粉', origin: '云南·文山', province: '云南', city: '昆明', region: 'southwest', price: 298, sales: '1.5万', image: getImage(4), tags: ['养生'], category: 'tonic', subCategory: '参茸贵细', isSelfOperated: true, isGI: true },
  { id: 73, name: '贵州蜂蜜', origin: '贵州·遵义', province: '贵州', city: '遵义', region: 'southwest', price: 128, sales: '9千', image: getImage(4), tags: ['土蜂蜜'], category: 'tonic', subCategory: '蜂产品', isSelfOperated: true, isGI: true },
  { id: 74, name: '新疆核桃', origin: '新疆·喀什', province: '新疆', city: '喀什', region: 'northwest', price: 68, sales: '3.5万', image: getImage(3), tags: ['坚果'], category: 'snack', subCategory: '坚果炒货', isSelfOperated: true, isGI: true },
  { id: 75, name: '陕西柿子饼', origin: '陕西·西安', province: '陕西', city: '西安', region: 'northwest', price: 38, sales: '2.8万', image: getImage(3), tags: ['传统'], category: 'snack', subCategory: '蜜饯果脯', isSelfOperated: true, isGI: true },
];

export function getProductsByRegion(areaParam?: string, province?: string, subCategory?: string) {
  let filtered = [...products];
  if (areaParam) {
    filtered = filtered.filter((p) => p.region === areaParam);
  }
  if (province) {
    filtered = filtered.filter((p) => p.province === province);
  }
  if (subCategory) {
    filtered = filtered.filter((p) => p.subCategory === subCategory);
  }
  return filtered;
}

export function getProductsByCategory(categoryId: string, subCategories: string[] = []) {
  let filtered = products.filter((p) => p.category === categoryId);
  if (subCategories.length > 0) {
    filtered = filtered.filter((p) => subCategories.includes(p.subCategory));
  }
  return filtered;
}

export function getFeaturedByRegion(areaParam: string) {
  return products
    .filter((p) => p.region === areaParam)
    .slice(0, 4);
}

export function getHotPicksByCategory(categoryId: string) {
  return products
    .filter((p) => p.category === categoryId)
    .sort((a, b) => parseFloat(b.sales.replace(/[^\d.]/g, '')) - parseFloat(a.sales.replace(/[^\d.]/g, '')))
    .slice(0, 6);
}
