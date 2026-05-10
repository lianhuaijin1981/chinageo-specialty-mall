import json
from datetime import datetime

# 读取现有数据库
with open(r'C:\Users\Administrator\WorkBuddy\2026-05-10-task-5\gis_products_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# 新产品：GIS-051 冬虫夏草
new_product_051 = {
    "id": "GIS-051",
    "name": "冬虫夏草",
    "province": "青海省、西藏自治区",
    "city": "玉树州、那曲市等",
    "county": "海拔3400米～4600米高寒山区的阴坡或半阴半阳坡",
    "certification_date": "2010",
    "certification_number": "地理标志产品（具体编号待查）",
    "category": "中药材",
    "subcategory": "虫草类",
    "protection_range": "青海省、西藏自治区那曲市等海拔3400米～4600米高寒山区",
    "characteristics": {
        "appearance": "由虫体与从虫头部长出的真菌子座相连而成；虫体似蚕，长3-5cm，直径0.3-0.8cm，表面深黄色至黄棕色，有20-30个环纹，近头部环纹较细；头部红棕色；足部8对，中部4对较明显；子座细长圆柱形，长4-7cm，直径约0.3cm，表面深棕色至棕褐色，有细纵皱纹",
        "aroma": "气微腥，味微苦",
        "taste": "味微苦",
        "texture": "虫体质脆，易折断，断面略平坦，淡黄白色；子座质柔韧，断面类白色"
    },
    "production_craft": "采集时间：夏初子座出土、孢子未发散时挖取；初加工：晒至六七成干；清理：除去似纤维状的附着物及杂质；干燥：晒干或低温干燥；保存方法：置阴凉干燥处，防蛀",
    "historical_background": "古代本草记载：《本草从新》'保肺益肾，止血化痰，已劳嗽。'《药性考》'秘精益气，专补命门。'冬虫夏草主要分布在海拔3400米～4600米高寒山区；青海省地处'世界屋脊'青藏高原的东北部，雪域高原，人烟稀少、洁净、寒冷、缺氧、紫外线照射强烈、无污染，造就了青海冬虫夏草的品质",
    "nutrition": "主要化学成分：核苷类成分（腺苷、腺嘌呤核苷、次黄嘌呤核苷、次黄嘌呤、腺嘌呤、鸟嘌呤、尿嘧啶等）；甾醇类成分（麦角甾醇等）；其他成分：蛋白质、脂肪酸、氨基酸、多糖等",
    "health_benefits": "性味归经：味甘，性平，归肺、肾经；主要功能：补肾益肺，止血化痰；主治：肾虚精亏、阳痿遗精、腰膝酸痛、久咳虚喘、劳嗽咯血；药理作用：调节免疫、改善肾损伤、改善肺损伤、性激素样作用、抗疲劳作用",
    "famous_brands": ["冬虫夏草（地理标志产品）"],
    "enterprises": ["青海省、西藏自治区各冬虫夏草采集加工企业"],
    "honors": [
        "青海省冬虫夏草品质优良，在国内外享有盛誉",
        "西藏那曲冬虫夏草为道地药材",
        "冬虫夏草为名贵中药材，具有极高的药用价值和保健功效"
    ],
    "market_info": {
        "collection_season": "夏初子座出土、孢子未发散时",
        "processing": "晒至六七成干，除去附着物及杂质，晒干或低温干燥",
        "storage": "置阴凉干燥处，防蛀",
        "market_status": "价格昂贵，为名贵中药材；市场需求量大，但野生资源有限"
    },
    "quality_standard": "性状标准：虫体似蚕，长3-5cm，直径0.3-0.8cm，表面深黄色至黄棕色，有20-30个环纹；头部红棕色；足部8对，中部4对较明显；子座细长圆柱形，长4-7cm；气微腥，味微苦；保存标准：置阴凉干燥处，防蛀；执行标准：应符合地理标志产品相关质量要求",
    "image_urls": [],
    "detail_page_template": "taobao_standard",
    "status": "active",
    "created_at": "2026-05-10",
    "updated_at": "2026-05-10"
}

# 新产品：GIS-052 宣纸
new_product_052 = {
    "id": "GIS-052",
    "name": "宣纸",
    "province": "安徽省",
    "city": "宣城市",
    "county": "泾县",
    "certification_date": "2002-08-06",
    "certification_number": "国家质检总局2002年第75号公告",
    "category": "工艺品",
    "subcategory": "文房四宝",
    "protection_range": "安徽省宣城市泾县现辖行政区域",
    "characteristics": {
        "appearance": "光而不滑、洁白稠密、纹理纯净、有隐约竹帘纹；亮度（白度）≥70%",
        "aroma": "无特殊气味（纸品）",
        "taste": "无味觉特征（纸品）",
        "texture": "韧而能润、绵韧、手感润柔；质地：紧度0.35±0.04 g/cm³；裂断长：特种净皮类≥2.50km，净皮类≥2.20km，棉料类≥1.70km；润墨性好，墨韵清晰，层次分明；耐久耐老化强，不易变色；不蛀不腐，寿命长"
    },
    "production_craft": "主要原料：青檀皮（泾县及周边地区喀斯特山地丘陵地带生长的青檀树，三年左右嫩枝的韧皮组织）和沙田稻草（泾县及周边地区河谷平原沙土上生长的纤维长、韧性强、不易腐烂的金黄色稻草）；工艺流程：1.选料工序（青檀皮料：伐条→蒸煮→浸泡→剥皮→日光晒干→皮坯；燎草：选草→切草→捣草→埋浸→洗涤→渍灰→堆积→洗涤→日光晒干→草坯→蒸煮→洗涤→日光摊晒）→2.制浆工序（青檀皮料：皮坯→浸泡→蒸煮→洗涤→压榨→选检→漂白→洗涤→压榨→选检→打料；草料：燎草→鞭草→打料→洗涤漂白）→3.制纸工序（全料配水→配胶→捞纸→压榨焙纸→选纸→剪纸→成品）；产品分类：按原料配比分为特种净皮类、净皮类、棉料类；质量等级：正牌和副牌（优等品和合格品）",
    "historical_background": "唐代天宝年间（742-756年）：宣城郡已生产纸、笔作为贡品运往京城长安；宋元年间：曹氏一支迁徙到安徽泾县小岭，开始全面系统以青檀皮为原料制作宣纸；明朝宣德年间（1426-1435年）：出现由皇室监制的宣纸加工纸；2009年9月：宣纸传统制作技艺列入人类非物质文化遗产名录；被誉为'国宝'，享有'千年寿纸'的美誉，为文房四宝之一",
    "famous_brands": ["红星", "汪六吉"],
    "enterprises": [
        "截至2015年底：泾县共有300多家宣纸和书画纸生产企业",
        "获得宣纸生产资质的企业：15家",
        "年产宣纸约800吨左右"
    ],
    "honors": [
        "文房四宝之一",
        "享有'纸中之王、千年寿纸'的美誉",
        "2002年8月6日成功获批国家地理标志保护产品称号（国家质检总局2002年第75号公告）",
        "2009年9月宣纸传统制作技艺列入人类非物质文化遗产名录",
        "1915年获巴拿马太平洋国际博览会金质奖章",
        "2020年7月27日入选中欧地理标志第二批保护名单"
    ],
    "market_info": {
        "production_capacity_2015": "年产宣纸约800吨左右",
        "enterprise_count_2015": "300多家宣纸和书画纸生产企业，获得宣纸生产资质的企业15家",
        "product_specs": "从四尺单到二丈（千禧）等多种规格",
        "packaging": "以100张为1刀进行包装和销售",
        "development_project": "2025年中国美术学院牵头的'中国传统书画专用纸工艺提升关键技术研发'项目，研发新纸"
    },
    "quality_standard": "GB/T 18739-2008《地理标志产品 宣纸》；技术要求：采用产自安徽省泾县境内及周边地区的青檀皮和沙田稻草，不得使用化学纸浆；感官指标：纸质绵韧，手感润柔，纸面平整，有隐约竹帘纹；理化指标：紧度0.35±0.04 g/cm³，亮度（白度）≥70%，裂断长（特种净皮类）≥2.50km；检验规则：包含交收检验和型式检验的完整质量管控体系；专用标志使用：应符合GB/T 10342规定，需标注地理标志产品标志、产品名称、原料、规格尺寸、制造者信息、生产日期、执行标准号；应有'怕湿'等警示标志",
    "image_urls": [],
    "detail_page_template": "taobao_standard",
    "status": "active",
    "created_at": "2026-05-10",
    "updated_at": "2026-05-10"
}

# 添加产品到数据库
db['products'].append(new_product_051)
db['products'].append(new_product_052)

# 更新元数据
db['metadata']['total_count'] = len(db['products'])
db['metadata']['last_update'] = '2026-05-10'
db['metadata']['completion_status'] = '第十四阶段完成（52个产品），继续向100个产品目标迈进！'

# 写回文件
with open(r'C:\Users\Administrator\WorkBuddy\2026-05-10-task-5\gis_products_database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"成功添加新产品：{new_product_051['id']} {new_product_051['name']}")
print(f"成功添加新产品：{new_product_052['id']} {new_product_052['name']}")
print(f"\n数据库当前总数：{db['metadata']['total_count']}个产品")
print(f"覆盖省份数：{len(db['metadata']['provinces_covered'])}个")
print(f"覆盖类别数：{len(db['metadata']['categories_covered'])}个")
print(f"\n继续扩展中，向100个产品的目标迈进！还需添加{100 - db['metadata']['total_count']}个产品")
