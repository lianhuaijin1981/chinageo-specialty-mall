import json

# 读取现有数据库
with open(r'C:\Users\Administrator\WorkBuddy\2026-05-10-task-5\gis_products_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# 新产品：GIS-040 吉林长白山人参
new_product = {
    "id": "GIS-040",
    "name": "吉林长白山人参",
    "province": "吉林省",
    "city": "白山市、通化市、延边州等",
    "county": "抚松县、集安市、长白朝鲜族自治县等",
    "certification_date": "2002",
    "certification_number": "国家质检总局地理标志产品保护",
    "category": "中药材",
    "subcategory": "根茎类药材",
    "protection_range": "吉林省长白山地区（北纬41°—42°），包括抚松县、集安市等核心产区",
    "characteristics": {
        "appearance": "野山参：芦碗紧密、体态玲珑、纹深皮老；按'芦、艼、体、腿、须'五形六体分级；整体'形美质坚、皂苷富集、药效卓著'",
        "aroma": "特有香气，浓郁持久",
        "taste": "味甘微苦，回甘持久",
        "texture": "质坚，质地致密，有效成分含量高"
    },
    "production_craft": "野山参：自然生长于深山密林15年以上；林下参：人工播种于山林，仿野生环境生长；园参：人工栽培，生长周期4-6年；加工工艺：红参（蒸制后干燥）、白糖参（糖渍）、生晒参（直接干燥）；抚松县万良长白山人参市场是全球最大的人参交易集散地",
    "historical_background": "《神农本草经》列为上品，称其'主补五脏，安精神，定魂魄，止惊悸，除邪气，明目，开心益智，久服轻身延年'；《本草纲目》李时珍记载'治男妇一切虚证'；采参习俗已列入国家级非物质文化遗产名录；采参人称'参把头'，采挖时有'拉帮''放山''抬参'等古法；发现野山参时需喊'棒槌'，其他采参人回应'接山'，采到后齐喊'快当'（满语'顺利'）；北宋苏东坡《赞参》：'上党天下脊，辽东真井底，元泉倾海腴，白露洒天醴'",
    "nutrition": "主要活性成分：人参皂苷（Rb1、Rg1含量显著高于其他产区）；多糖（可促进造血干细胞增殖）；氨基酸（含量丰富）；多种微量元素和矿物质；吉林集安边条红参、抚松红参的皂苷总量高于高丽红参与日本红参；人参皂苷Rg3被用于抗癌新药'参一胶囊'",
    "health_benefits": "传统功效：补五脏、安精神、定魂魄、止惊悸、除邪气、明目、开心益智、久服轻身延年；现代研究证实：抗氧化、抗疲劳、增强免疫力、调节血糖血脂、抗癌（人参皂苷Rg3）；治疗男妇一切虚证：发热、自汗、眩晕、吐血、嗽血、下血、血淋、血崩、胎前产后诸病",
    "classification": {
        "按栽培方式": ["野山参（自然生长15年以上，参中极品）", "林下参（仿野生环境，药效接近野山参）", "园参（人工栽培4-6年，产量大）"],
        "按参龄": ["15年以上", "20年", "30年以上（参龄越长，药效越强，价格越昂贵）"],
        "按加工方式": ["红参", "白糖参", "生晒参"]
    },
    "famous_brands": ["长白山人参（区域公用品牌）", "参一胶囊（抗癌新药）"],
    "enterprises": ["抚松县万良长白山人参市场", "各类加工企业（开发五大系列3000余种产品）"],
    "honors": [
        "2002年获国家地理标志产品保护",
        "品牌价值突破206亿元，稳居中国区域农业品牌影响力前三名",
        "长白山采参习俗列入国家级非物质文化遗产名录",
        "吉林省人参种植面积占全国85%以上、全球70%以上",
        "申请'人类非物质文化遗产'称号（进行中）"
    ],
    "market_info": {
        "planting_area_share": "占全国85%以上、全球70%以上",
        "annual_output": "1.2万吨",
        "trading_volume": "抚松县万良人参市场年交易额超200亿元",
        "export_value": "年出口额超5亿美元",
        "price_premium": "较普通人参高3-5倍",
        "product_development": "五大系列3000余种产品，年产值超50亿元",
        "key_products": "红参片、人参蜜片、人参口服液等",
        "special_medicine": "参一胶囊（人参单体皂苷Rg3抗癌新药），年销售额超10亿元",
        "tourism": "抚松县每年吸引游客超百万人次，旅游收入超10亿元",
        "export_markets": "远销日本、韩国、东南亚"
    },
    "quality_standard": "GB/T 19506-2009《地理标志产品 吉林长白山人参》；《野山参鉴定及分等质量》；《鲜园参分等质量》；建立全程追溯体系，实现'一参一码'；推行'林下参仿野生栽培'技术；实施'园参绿色种植'技术；应用区块链溯源技术实现全产业链追溯；与吉林农业大学、中国中医科学院合作开发人参成分分析技术；申请国家发明专利50余项",
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
db['metadata']['completion_status'] = '第八阶段完成（40个产品），继续扩展中'

# 更新覆盖省份
if '吉林省' not in db['metadata']['provinces_covered']:
    db['metadata']['provinces_covered'].append('吉林省')

# 写回文件
with open(r'C:\Users\Administrator\WorkBuddy\2026-05-10-task-5\gis_products_database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"成功添加新产品：{new_product['id']} {new_product['name']}")
print(f"数据库当前总数：{db['metadata']['total_count']}个产品")
print(f"覆盖省份数：{len(db['metadata']['provinces_covered'])}个")
print(f"覆盖类别数：{len(db['metadata']['categories_covered'])}个")
