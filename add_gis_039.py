import json

# 读取现有数据库
with open(r'C:\Users\Administrator\WorkBuddy\2026-05-10-task-5\gis_products_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# 新产品：GIS-039 鄂州武昌鱼
new_product = {
    "id": "GIS-039",
    "name": "鄂州武昌鱼",
    "province": "湖北省",
    "city": "鄂州市",
    "county": "鄂城区",
    "certification_date": "2006",
    "certification_number": "商标注册号4788115-4788118",
    "category": "水产品",
    "subcategory": "淡水鱼",
    "protection_range": "湖北省鄂州市鄂城区梁子湖水域",
    "characteristics": {
        "appearance": "体侧扁而高，呈菱形；头小侧扁，口端位，口裂较宽呈弧形；体呈青灰色，腹侧银灰色；体侧鳞片中间浅色，边缘灰黑色，形成数行深浅相交的纵纹；尾鳍深叉，各鳍均为灰黑色",
        "aroma": "肉质鲜美，无腥味",
        "taste": "肉嫩而鲜美，肉质细嫩肥美，味道鲜美",
        "texture": "肉细嫩肥美，肌纤维较短，组织结构松软；可食部分达70%以上；鱼身两侧有十三根半刺，肉质紧实而不失细嫩"
    },
    "production_craft": "养殖模式：'公司+合作社+基地+农户'模式；养殖方式：主养、混养、套养相结合；数字化养殖：饵料投放、水质监测全流程智能化；新品种：'华海1号'（2017年培育，抗病性强、生长周期缩短15%）；种质保护：梁子湖2004年被列为国家级武昌鱼种质资源保护区，建有国内首个国家级原种场；加工：年加工能力2万吨，开发休闲食品等20余类深加工产品；预制菜：日均10万份（2023年启动中央厨房项目）",
    "historical_background": "历史可追溯至三国时期，《吴志·陆凯传》记载'宁饮建业水，不食武昌鱼'典故；1954年由中国科学家（中国科学院水生生物研究所专家）在梁子湖发现并正式命名（学名：团头鲂，英文名：Bluntnose black bream）；1956年毛泽东所作'才饮长沙水，又食武昌鱼'诗句使其声名远播；原产于中国湖北梁子湖水域，历史上指现今的鄂州市",
    "nutrition": "蛋白质含量约17%（优质蛋白质，消化吸收利用率高）；脂肪含量占体重的1%-3%（相对较低）；脂肪酸构成：约75%为不饱和脂肪酸，含一定量的ω-3脂肪酸（包括EPA、DHA）；维生素：维生素A、维生素D、维生素E、B族维生素、维生素C；矿物质：钾、钠、钙、磷、铁、锌、铜、硒等；鱼皮、鱼鳞中含有丰富的胶原蛋白；一般每100g鱼肉含蛋白质13-17g",
    "health_benefits": "预防贫血症；预防低血糖疾病；开胃健脾、增进食欲（性温、味甘）；高蛋白、低胆固醇的营养特点，适合各类人群食用；ω-3脂肪酸（EPA、DHA）具有特殊的生理功能；一般人都可食用，老少皆宜",
    "famous_brands": ["鄂州武昌鱼"],
    "enterprises": ["海大集团（投资10亿元建设数字化养殖基地）", "130余家加工企业", "顺丰公司（2024年达成战略合作）"],
    "honors": [
        "2006年获地理标志证明商标（湖北省首个水产类地理标志）",
        "2010年获中国驰名商标",
        "2023年获湖北地理标志金奖",
        "2023年获长江流域地理标志银奖",
        "2024年获中部四省地理标志创新银奖",
        "2025年8月28日获水产地理标志区域公用品牌博览会金奖（上海）",
        "2024年央视《一城一味》播出专题纪录片",
        "2025年品牌声誉值达818.2分，在全国120个淡水鱼类地标品牌中高居第一"
    ],
    "market_info": {
        "whole_industry_output_2024": "200亿元（全产业链产值）",
        "breeding_area": "40.34万亩养殖基地（包含2个万亩连片示范区）",
        "processing_capacity": "年加工能力2万吨",
        "processing_enterprises": "130余家加工企业",
        "seed_supply_5years": "近五年累计向全国供应苗种14.5亿尾，覆盖28个省份",
        "beneficiaries": "带动1.5万户农户年均增收超1.1万元",
        "investment_projects": "24个签约投资项目，引资260.52亿元（通过华创会等平台）",
        "logistics": "依托花湖机场构建'航空+冷链'物流体系，鲜活产品12小时内可达全国主要城市",
        "prefabricated_dish_capacity": "日均10万份（2023年启动中央厨房项目）",
        "deep_processed_products": "开发休闲食品等20余类深加工产品"
    },
    "quality_standard": "国家级武昌鱼种质资源保护区（2004年，梁子湖）；国内首个国家级原种场；'华海1号'新品种（2017年培育，抗病性强、生长周期缩短15%）；华中农业大学团队开展无肌间刺武昌鱼研发，计划未来推出新品种；养殖基地：40.34万亩，包含2个万亩连片示范区",
    "image_urls": [],
    "detail_page_template": "taobao_standard",
    "status": "active",
    "created_at": "2026-05-10",
    "updated_at": "2026-05-10"
}

# 添加到数据库
db['products'].append(new_product)

# 更新元数据
db['metadata']['total_count'] = len(db['products'])
db['metadata']['last_update'] = '2026-05-10'
db['metadata']['completion_status'] = '第七阶段完成（39个产品），继续扩展中'

# 更新覆盖省份
if '湖北省' not in db['metadata']['provinces_covered']:
    db['metadata']['provinces_covered'].append('湖北省')

# 更新覆盖类别
if '水产品' not in db['metadata']['categories_covered']:
    db['metadata']['categories_covered'].append('水产品')

# 写回文件
with open(r'C:\Users\Administrator\WorkBuddy\2026-05-10-task-5\gis_products_database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"成功添加新产品：{new_product['id']} {new_product['name']}")
print(f"数据库当前总数：{db['metadata']['total_count']}个产品")
print(f"覆盖省份数：{len(db['metadata']['provinces_covered'])}个")
print(f"覆盖类别数：{len(db['metadata']['categories_covered'])}个")
