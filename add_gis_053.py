import json
from datetime import datetime

# 读取现有数据库
with open(r'C:\Users\Administrator\WorkBuddy\2026-05-10-task-5\gis_products_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# 新产品：GIS-053 端砚
new_product_053 = {
    "id": "GIS-053",
    "name": "端砚",
    "province": "广东省",
    "city": "肇庆市",
    "county": "肇庆城郊端溪一带、羚羊峡栏柯山、西江北岸羚山、北岭一带",
    "certification_date": "2004-10-29",
    "certification_number": "国家质检总局公告2004年第160号",
    "category": "工艺品",
    "subcategory": "文房四宝",
    "protection_range": "广东省肇庆市现辖行政区域（古称端州）",
    "characteristics": {
        "appearance": "石质细腻、温润、致密、坚实；质柔而刚，按之如小儿肌肤；磨墨不滞，起墨快，发墨好",
        "aroma": "无特殊气味（石砚）",
        "taste": "无味觉特征（石砚）",
        "texture": "石质坚实、润滑、细腻、娇嫩；摩之寂寂无声响；所研磨之墨汁细腻油亮如漆；书写畅顺不损毫；贮水不凅，具有'呵气研墨'特点；无论是酷暑还是严冬，用手按其砚心，砚心湛蓝墨绿，水气久久不干"
    },
    "production_craft": "主要四道工序：1.采石（从砚坑开采砚石）→2.选料（选择优质石料）→3.雕刻（精心雕刻加工）→4.配盒（配制砚盒）；砚坑情况：历史记载共开采过70多个砚坑，绝大多数已枯竭、停采；新中国成立以来仍在开采的砚坑还有10多个；主要优质砚坑：老坑（水岩）、坑仔岩、麻子坑、朝天岩、宣德岩等",
    "historical_background": "起始于唐代初期（约1300多年前），发源于广东省肇庆（古称端州）东郊羚羊峡栏柯山的端溪一带；早期特点：纯粹作为文人墨客书写的实用工具，石面无任何图案花纹装饰，显得粗陋、简朴；唐朝李肇《唐国史补》记载：'内邱瓷瓯，端州紫石砚，天下无贵贱通用之'；端砚称雄于世一千余年，满誉天下；地质形成：端砚石原始母岩形成于距今4亿年前的泥盆纪中期，肇庆当时位于古陆与半岛之间的海陆交替处，经过长期地质作用沉积形成端石",
    "famous_brands": ["端砚（地理标志产品）"],
    "enterprises": ["肇庆市端砚生产企业（具体企业名称待查）"],
    "honors": [
        "中国四大名砚之首",
        "与歙砚、洮砚并称'三大石质名砚'之美誉",
        "2004年10月29日获得国家质检总局原产地域产品保护（2004年第160号公告）",
        "端砚称雄于世一千余年，满誉天下",
        "唐代已开始广泛使用，'天下无贵贱通用之'"
    ],
    "market_info": {
        "historical_status": "唐代已开始广泛使用，'天下无贵贱通用之'",
        "cultural_status": "历代无数人为此陶醉、痴迷",
        "stone_pits": "历史记载共开采过70多个砚坑，绝大多数已枯竭、停采；新中国成立以来仍在开采的砚坑还有10多个",
        "main_stone_pits": "老坑（水岩）、坑仔岩、麻子坑、朝天岩、宣德岩等"
    },
    "quality_standard": "必须产自广东省肇庆市指定区域；须符合原产地域产品保护的相关技术要求；石质要求：必须细腻、温润如玉；具有质柔而刚的特性；具备独特而丰富多彩的石品花纹；巧夺天工的雕刻艺术；功能标准：磨墨不滞，起墨快，发墨好；所研墨汁细腻油亮如漆；书写畅顺不损毫；贮水不凅，呵气可研墨",
    "image_urls": [],
    "detail_page_template": "taobao_standard",
    "status": "active",
    "created_at": "2026-05-10",
    "updated_at": "2026-05-10"
}

# 添加产品到数据库
db['products'].append(new_product_053)

# 更新元数据
db['metadata']['total_count'] = len(db['products'])
db['metadata']['last_update'] = '2026-05-10'
db['metadata']['completion_status'] = '第十五阶段完成（53个产品），继续向100个产品目标迈进！'

# 写回文件
with open(r'C:\Users\Administrator\WorkBuddy\2026-05-10-task-5\gis_products_database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"成功添加新产品：{new_product_053['id']} {new_product_053['name']}")
print(f"\n数据库当前总数：{db['metadata']['total_count']}个产品")
print(f"覆盖省份数：{len(db['metadata']['provinces_covered'])}个")
print(f"覆盖类别数：{len(db['metadata']['categories_covered'])}个")
print(f"\n还需添加{100 - db['metadata']['total_count']}个产品达到100个目标")
