import json
from datetime import datetime

# 读取现有数据库
with open(r'C:\Users\Administrator\WorkBuddy\2026-05-10-task-5\gis_products_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# 新产品：GIS-057 西湖龙井
new_product_057 = {
    "id": "GIS-057",
    "name": "西湖龙井",
    "province": "浙江省",
    "city": "杭州市",
    "county": "西湖风景名胜区（西湖龙井茶基地一级保护区）",
    "certification_date": "2011-06-28",
    "certification_number": "国家工商行政管理总局批准'西湖龙井'为地理标志证明商标",
    "category": "茶叶",
    "subcategory": "绿茶",
    "protection_range": "浙江省杭州市西湖风景名胜区（西湖龙井茶基地一级保护区），以'狮（峰）、龙（井）、云（栖）、虎（跑）、梅（家坞）'排列品第",
    "characteristics": {
        "appearance": "外形扁平挺秀，光滑匀齐，芽叶色绿；以色绿、香郁、味甘、形美四绝著称",
        "aroma": "香气清高持久，香馥若兰，有清香或嫩栗香",
        "taste": "滋味清爽或浓醇，回味甘甜；色绿、香郁、味甘、形美四绝",
        "liquor_color": "汤色杏绿明亮"
    },
    "production_craft": "采摘特点：早、嫩、勤三大特点；制作工艺：采摘→摊放→杀青→理条→烘干等工序；西湖产区独特小气候保障龙井茶品质；分级：以'狮峰、龙井、云栖、虎跑、梅家坞'排列品第，以西湖龙井茶为最",
    "historical_background": "最早可追溯至唐代，茶圣陆羽《茶经》中有记载；宋代：龙井茶之名始于宋，北宋时期已形成规模；元代：品质进一步提升，开始露面；明代：崭露头角，名声远播，列为名茶；清代：驰名中外，乾隆皇帝封为'御茶'；民国：成为中国名茶之首；现代：2014年举行明前茶拍卖会，2021年西湖龙井茶传统制作技艺列入人类非物质文化遗产",
    "nutrition": "含有茶碱、氨基酸、维生素、矿物质等；具体营养成分表在文中未详细说明",
    "health_benefits": "提神（含有茶碱，有提神醒脑作用）；生津止渴、清热解渴；降脂（有助于降低血脂）；降胆固醇（对胆固醇有调节作用）；清热解暑、消食利尿、润肤美容",
    "famous_brands": ["狮峰龙井", "梅坞龙井", "云栖龙井", "虎跑龙井"],
    "enterprises": ["杭州市西湖龙井茶管理协会", "西湖龙井茶基地一级保护区各生产企业"],
    "honors": [
        "中国十大名茶之首",
        "清代乾隆皇帝封为'御茶'",
        "国家外交礼品茶",
        "2011年6月28日获国家地理标志证明商标",
        "2012年11月29日列入联合国教科文组织人类非物质文化遗产代表作名录",
        "西湖龙井中有几个有名的品类：'狮峰龙井'（色泽略黄，素称'糙米色'）、'梅坞龙井'等"
    ],
    "market_info": {
        "management": "杭州市西湖龙井茶管理协会对全国专卖店实行授牌许可",
        "auction": "2014年开始举行明前茶拍卖会",
        "market_status": "驰名中外的名茶，走向世界的名品；顶级品牌需要顶级品质呵护",
        "product_grading": "按'狮峰、龙井、云栖、虎跑、梅家坞'分品第，以西湖龙井茶为最"
    },
    "quality_standard": "建立龙井茶分级质量标准；品质特征：特级（外形扁平光滑，苗锋尖削，芽叶细嫩，手感光滑，均匀成朵，小巧玲珑，顶叶包芽，呈糙米色，不匀，无碎末）；随级别下降，色泽由嫩绿→青绿→墨绿，香味由嫩爽转向浓粗；夏秋茶：品质比同级春茶差；分级：按'狮峰、龙井、云栖、虎跑、梅家坞'排列品第",
    "image_urls": [],
    "detail_page_template": "taobao_standard",
    "status": "active",
    "created_at": "2026-05-10",
    "updated_at": "2026-05-10"
}

# 添加产品到数据库
db['products'].append(new_product_057)

# 更新元数据
db['metadata']['total_count'] = len(db['products'])
db['metadata']['last_update'] = '2026-05-10'
db['metadata']['completion_status'] = '第十九阶段完成（57个产品），继续向100个产品目标迈进！'

# 写回文件
with open(r'C:\Users\Administrator\WorkBuddy\2026-05-10-task-5\gis_products_database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"成功添加新产品：{new_product_057['id']} {new_product_057['name']}")
print(f"\n数据库当前总数：{db['metadata']['total_count']}个产品")
print(f"覆盖省份数：{len(db['metadata']['provinces_covered'])}个")
print(f"覆盖类别数：{len(db['metadata']['categories_covered'])}个")
print(f"\n还需添加{100 - db['metadata']['total_count']}个产品达到100个目标")
