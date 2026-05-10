import json
from datetime import datetime

# 读取现有数据库
with open(r'C:\Users\Administrator\WorkBuddy\2026-05-10-task-5\gis_products_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# 新产品：GIS-043 南翔小笼包
new_product_043 = {
    "id": "GIS-043",
    "name": "南翔小笼包",
    "province": "上海市",
    "city": "上海市",
    "county": "嘉定区南翔镇",
    "certification_date": "2014",
    "certification_number": "国家级非物质文化遗产",
    "category": "副食品",
    "subcategory": "小吃",
    "protection_range": "上海市嘉定区南翔镇",
    "characteristics": {
        "appearance": "小巧玲珑，形似宝塔，呈半透明状，晶莹透黄；每只面皮厚1.5毫米、重8克，包入16克馅料，捏出18个以上折褶，蒸熟后呈半透明状",
        "aroma": "卤重、味鲜，香气扑鼻",
        "taste": "皮薄、馅多、汁鲜、形美；一咬一包汤，满口生津，滋味鲜美",
        "texture": "采用不发酵精面粉制皮，夹心腿肉拌肉皮冻为馅；口感细腻，卤汁丰富"
    },
    "production_craft": "创立于1871年（清同治十年），创始人黄明贤（南翔镇日华轩点心店主）；制作工艺：采用不发酵精面粉制皮，夹心腿肉拌肉皮冻为馅；2000年第六代传承人李建钢制定标准化制作规范；选料、配方、搅拌乃至揉面、擀面，每道工序都有明确标准；制作工序：制馅（猪夹心肉绞碎，加入调料搅拌上劲）→制皮（精面粉加冷水揉至柔软光滑）→成形（搓条、摘坯、擀皮、包馅、摺裥包捏）→成熟（旺火沸水蒸约8分钟，至皮成玉色半透明）",
    "historical_background": "1871年：黄明贤对大肉馒头采取'重馅薄皮，以大改小'的方法创制；1900年：第二代传人吴翔升在上海城隍庙开设南翔小笼馒头店；1958年：古猗园重新恢复经营，第五代传人封荣泉改良制作工艺；1997年：李建钢成为第六代传人；2000年：制定标准化制作规范；2014年：制作技艺被列入国家级非物质文化遗产名录；传承谱系：第一代黄明贤→第二代吴翔升→第三四代（姓名流失）→第五代封荣泉→第六代李建钢",
    "nutrition": "主要食材：面粉、猪肉、肉皮冻；详细配方（以500克面粉为基准）：净夹心肉500克、肉皮冻250克、精盐12.5克、白酱油12.5克、白糖15克、味精10克、芝麻油5克、花生油15克、绍酒和姜汁少许；营养丰富，提供蛋白质、碳水化合物和脂肪",
    "health_benefits": "传统小吃，营养丰富；提供蛋白质和碳水化合物，适量食用有益健康",
    "famous_brands": ["南翔"],
    "enterprises": [
        "上海老城隍庙餐饮（集团）有限公司",
        "上海豫园南翔馒头店有限公司（主营餐饮服务）",
        "上海南翔食品股份有限公司（主营速冻商品）",
        "上海南翔餐饮管理有限公司"
    ],
    "honors": [
        "2014年制作技艺被列入国家级非物质文化遗产名录",
        "2002年6月第四届中国烹饪世界大赛金奖",
        "2002年10月第十二届中国厨师节金厨奖",
        "2002年11月中国名点称号",
        "2004年3月上海首届餐饮文化博览会金奖",
        "2006年8月上海名点称号",
        "2013年舞蹈《小笼师傅》、音乐剧小品《爱情小笼包》获第十届中国艺术节'群星奖'"
    ],
    "market_info": {
        "product_variants": "鲜肉、蟹粉、虾仁等品种；部分门店推出泡椒藕带、五彩全家福等创新口味",
        "chain_development": "豫园南翔馒头店开启连锁化经营，在浦东等地开设新店",
        "export_markets": "进入日本、新加坡等海外市场",
        "trademark_dispute": "2021年4月22日两家'中华老字号'因'南翔'商标使用权产生法律纠纷，法院判决上海南翔食品股份有限公司等四被告停止商标侵权，赔偿234.2万元"
    },
    "quality_standard": "2000年制定标准化制作规范：面皮厚1.5毫米、重8克；包入16克馅料；捏出18个以上折褶；蒸熟后呈半透明状；选料、配方、搅拌、揉面、擀面每道工序都有明确标准；制作技艺：制馅→制皮→成形→成熟",
    "image_urls": [],
    "detail_page_template": "taobao_standard",
    "status": "active",
    "created_at": "2026-05-10",
    "updated_at": "2026-05-10"
}

# 新产品：GIS-044 青海老酸奶
new_product_044 = {
    "id": "GIS-044",
    "name": "青海老酸奶",
    "province": "青海省",
    "city": "西宁市等",
    "county": "青海省各州县",
    "certification_date": "2008-05",
    "certification_number": "地理标志产品（具体编号待查）",
    "category": "副食品",
    "subcategory": "乳制品",
    "protection_range": "青海省行政区域内",
    "characteristics": {
        "appearance": "固态酸奶，浓度大到可以凝结到碗里，必须用勺子舀起来吃；表层有厚实的奶皮；上层奶皮纯净，色泽自然",
        "aroma": "浓郁的奶香味，特有发酵香气",
        "taste": "醇厚浓郁，酸甜适中，口感绵滑如丝，超级治愈；表层奶皮厚实，撒白糖食用更佳",
        "texture": "稠到倒不出来；奶皮厚实；口感绵滑，组织细腻"
    },
    "production_craft": "传统方法：在瓷碗中发酵，借助炕上高温形成固态；制作流程：优质鲜奶→杀菌→接种传统乳酸菌发酵剂→装入瓷碗→自然发酵（借助炕上高温）→形成固态酸奶→表层形成奶皮；现代工艺：青海小西牛生物乳业有限公司2008年5月推出第一碗青海老酸奶，采用传统工艺结合现代技术；高原奶牛以天然草料为食，产出的牛奶富含营养，为老酸奶奠定了天然基础",
    "historical_background": "在青海民族饮食上有悠久的历史，早在公元641年唐朝文成公主经过青海湖畔的日月山、倒淌河等地进藏的民间故事中，就有关于酸奶的记述；在可称之为古代藏族社会百科全书的史诗《格萨尔》中，也有关于酸奶的记载；可见酸奶在青海问世至少也有一千多年的历史；青海老酸奶与外地酸奶不同，浓度大到可以凝结到碗里",
    "nutrition": "含多种乳酸、乳糖、氨基酸、矿物质、维生素等；青藏高原的奶牛以天然草料为食，产出的牛奶营养丰富；表层奶皮富含蛋白质、脂肪等营养成分；主要营养成分：蛋白质、脂肪、乳糖、乳酸菌、氨基酸、钙、磷、维生素A、维生素D等",
    "health_benefits": "益生菌丰富，调节肠道菌群，促进消化；营养丰富，易于吸收；乳酸菌有助于肠道健康；补钙强身；传统发酵工艺保留更多活性成分；高原特色奶制品，营养价值高",
    "famous_brands": ["小西牛", "青海老酸奶"],
    "enterprises": ["青海小西牛生物乳业有限公司", "青海当地多家乳品企业"],
    "honors": [
        "2008年5月青海小西牛生物乳业有限公司推出第一碗青海老酸奶，开创市场先河",
        "从青海扩展到全国，甚至进入北京市场",
        "青海老酸奶不仅仅是一种食物，更是一份情感的寄托，一种文化的传承"
    ],
    "market_info": {
        "launch_date": "2008年5月（第一碗青海老酸奶上市）",
        "market_expansion": "从青海扩展到全国，甚至进入北京市场",
        "product_features": "固态酸奶，浓度大到可以凝结到碗里，必须用勺子舀起来吃",
        "traditional_consumption": "表层奶皮厚实，撒白糖食用，这种传统食用方式不仅保留了酸奶的原汁原味，也传承了青海地区的饮食文化",
        "cultural_value": "青海老酸奶不仅仅是一种食物，更是一份情感的寄托，一种文化的传承；它用浓郁的奶香味和独特的口感，征服了无数人的味蕾，也用背后深厚的文化底蕴，让人们感受到了青海这片土地"
    },
    "quality_standard": "传统工艺：在瓷碗中发酵，借助炕上高温形成固态；原料：青藏高原优质鲜奶，奶牛以天然草料为食；发酵剂：传统乳酸菌发酵剂；成品标准：固态，浓度大到可以凝结到碗里；表层形成厚实奶皮；口感绵滑，酸甜适中",
    "image_urls": [],
    "detail_page_template": "taobao_standard",
    "status": "active",
    "created_at": "2026-05-10",
    "updated_at": "2026-05-10"
}

# 添加产品到数据库
db['products'].append(new_product_043)
db['products'].append(new_product_044)

# 更新元数据
db['metadata']['total_count'] = len(db['products'])
db['metadata']['last_update'] = '2026-05-10'
db['metadata']['completion_status'] = '第十阶段完成（44个产品），继续扩展中'

# 更新覆盖省份
if '上海市' not in db['metadata']['provinces_covered']:
    db['metadata']['provinces_covered'].append('上海市')
if '青海省' not in db['metadata']['provinces_covered']:
    db['metadata']['provinces_covered'].append('青海省')

# 写回文件
with open(r'C:\Users\Administrator\WorkBuddy\2026-05-10-task-5\gis_products_database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"成功添加新产品：{new_product_043['id']} {new_product_043['name']}")
print(f"成功添加新产品：{new_product_044['id']} {new_product_044['name']}")
print(f"数据库当前总数：{db['metadata']['total_count']}个产品")
print(f"覆盖省份数：{len(db['metadata']['provinces_covered'])}个")
print(f"覆盖类别数：{len(db['metadata']['categories_covered'])}个")
