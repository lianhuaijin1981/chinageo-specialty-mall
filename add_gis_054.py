import json
from datetime import datetime

# 读取现有数据库
with open(r'C:\Users\Administrator\WorkBuddy\2026-05-10-task-5\gis_products_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# 新产品：GIS-054 滇红茶
new_product_054 = {
    "id": "GIS-054",
    "name": "滇红茶",
    "province": "云南省",
    "city": "临沧市、保山市、凤庆市、西双版纳州、德宏州",
    "county": "云南省南部与西南部的临沧、保山、凤庆、西双版纳、德宏等地",
    "certification_date": "待查",
    "certification_number": "待查",
    "category": "茶叶",
    "subcategory": "红茶",
    "protection_range": "云南省南部与西南部的临沧、保山、凤庆、西双版纳、德宏等地",
    "characteristics": {
        "appearance": "条索紧结、雄壮、肥硕；色泽乌润；毫色特显，有淡黄、菊黄、金黄之分；茶树高大，芽壮叶肥，着生茂密白毫，即使长至5～6片叶仍质软而嫩",
        "aroma": "香气鲜浓",
        "taste": "滋味醇厚，富有收敛性",
        "liquor_color": "汤色鲜红，叶底红润匀亮"
    },
    "production_craft": "采用优良的云南大叶种茶树鲜叶，经过工序：1.萎凋→2.揉捻（或揉切）→3.发酵→4.干燥，制成成品茶；再加工分为：滇红工夫茶（经揉捻制成）、滇红碎茶（经揉切制成）；长期以来均以手工操作",
    "historical_background": "抗日战争爆发后，1938年，东南各省茶区接近战区，产制不易，中茶公司遵命开发西南茶区，以维持中国在国际上的茶叶声誉；1939年在凤庆与勐海县试制成功（注：有记载为1938年创制或1939年试制成功）",
    "nutrition": "多酚类化合物含量居中国茶叶之首；生物碱含量居中国茶叶之首；茶树生长在平均海拔1000米以上的亚热带气候区，年均气温18～22℃，年积温6000℃以上，昼夜温差悬殊，年降水量1200～1700毫米，森林茂密，落叶枯草形成深厚的腐殖层，土壤肥沃",
    "health_benefits": "富含茶多酚和生物碱，具有抗氧化、提神醒脑、促进消化、增强免疫力等保健功效；具体功效需参考其他资料补充",
    "famous_brands": ["凤庆滇红茶（地理标志商标）"],
    "enterprises": ["云南省各滇红茶生产企业（具体企业名称待查）"],
    "honors": [
        "外销名茶",
        "多酚类化合物含量居中国茶叶之首",
        "生物碱含量居中国茶叶之首",
        "凤庆滇红茶成功申请国家地理商标"
    ],
    "market_info": {
        "status": "外销名茶",
        "producing_areas": "临沧、保山、凤庆、西双版纳、德宏等地",
        "climate_features": "晴时早晚遍地雾，阴雨成天满山云",
        "altitude": "平均海拔1000米以上",
        "development": "1939年试制成功后逐步发展成为云南重要茶产业"
    },
    "quality_standard": "采用优良的云南大叶种茶树鲜叶；产地：云南省南部与西南部的临沧、保山、凤庆、西双版纳、德宏等地；海拔：平均1000米以上；气候：亚热带气候，年均气温18～22℃，年积温6000℃以上，昼夜温差悬殊，年降水量1200～1700毫米；土壤：森林茂密，落叶枯草形成深厚的腐殖层，土壤肥沃；产品分类：滇红工夫茶、滇红碎茶",
    "image_urls": [],
    "detail_page_template": "taobao_standard",
    "status": "active",
    "created_at": "2026-05-10",
    "updated_at": "2026-05-10"
}

# 添加产品到数据库
db['products'].append(new_product_054)

# 更新元数据
db['metadata']['total_count'] = len(db['products'])
db['metadata']['last_update'] = '2026-05-10'
db['metadata']['completion_status'] = '第十六阶段完成（54个产品），继续向100个产品目标迈进！'

# 写回文件
with open(r'C:\Users\Administrator\WorkBuddy\2026-05-10-task-5\gis_products_database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"成功添加新产品：{new_product_054['id']} {new_product_054['name']}")
print(f"\n数据库当前总数：{db['metadata']['total_count']}个产品")
print(f"覆盖省份数：{len(db['metadata']['provinces_covered'])}个")
print(f"覆盖类别数：{len(db['metadata']['categories_covered'])}个")
print(f"\n还需添加{100 - db['metadata']['total_count']}个产品达到100个目标")
