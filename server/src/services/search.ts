import { Client } from '@elastic/elasticsearch';
import { db } from '../db';
import { products } from '../schemas/schema';

// Elasticsearch客户端
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

const INDEX_NAME = 'products';

// 初始化Elasticsearch索引
export async function initSearchIndex() {
  try {
    // 检查索引是否存在
    const indexExists = await esClient.indices.exists({ index: INDEX_NAME });

    if (!indexExists) {
      // 创建索引
      await esClient.indices.create({
        index: INDEX_NAME,
        body: {
          settings: {
            analysis: {
              analyzer: {
                custom_analyzer: {
                  type: 'custom',
                  tokenizer: 'ik_max_word',
                  filter: ['lowercase'],
                },
              },
            },
          },
          mappings: {
            properties: {
              id: { type: 'integer' },
              name: { type: 'text', analyzer: 'custom_analyzer' },
              description: { type: 'text', analyzer: 'custom_analyzer' },
              price: { type: 'float' },
              categoryId: { type: 'integer' },
              regionId: { type: 'integer' },
              status: { type: 'keyword' },
              createdAt: { type: 'date' },
            },
          },
        },
      });
      console.log('Elasticsearch索引创建成功');
    }
  } catch (error) {
    console.error('初始化Elasticsearch索引失败:', error);
  }
}

// 索引单个商品
export async function indexProduct(product: any) {
  try {
    await esClient.index({
      index: INDEX_NAME,
      id: product.id.toString(),
      body: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        regionId: product.regionId,
        status: product.status,
        createdAt: product.createdAt,
      },
    });
  } catch (error) {
    console.error('索引商品失败:', error);
  }
}

// 批量索引商品
export async function bulkIndexProducts() {
  try {
    const allProducts = await db.select().from(products);

    const operations = allProducts.flatMap((product) => [
      { index: { _index: INDEX_NAME, _id: product.id.toString() } },
      {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        regionId: product.regionId,
        status: product.status,
        createdAt: product.createdAt,
      },
    ]);

    await esClient.bulk({ body: operations });
    console.log(`批量索引${allProducts.length}个商品`);
  } catch (error) {
    console.error('批量索引失败:', error);
  }
}

// 搜索商品
export async function searchProducts(params: {
  keyword?: string;
  categoryId?: number;
  regionId?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}) {
  try {
    const {
      keyword,
      categoryId,
      regionId,
      minPrice,
      maxPrice,
      page = 1,
      pageSize = 20,
    } = params;

    // 构建查询条件
    const must: any[] = [];
    const filter: any[] = [];

    if (keyword) {
      must.push({
        multi_match: {
          query: keyword,
          fields: ['name^3', 'description'],
        },
      });
    }

    if (categoryId) {
      filter.push({ term: { categoryId } });
    }

    if (regionId) {
      filter.push({ term: { regionId } });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const range: any = {};
      if (minPrice !== undefined) range.gte = minPrice;
      if (maxPrice !== undefined) range.lte = maxPrice;
      filter.push({ range: { price: range } });
    }

    filter.push({ term: { status: 'active' } });

    const query = {
      bool: {
        must: must.length > 0 ? must : [{ match_all: {} }],
        filter,
      },
    };

    const result = await esClient.search({
      index: INDEX_NAME,
      body: {
        query,
        from: (page - 1) * pageSize,
        size: pageSize,
        sort: [{ _score: { order: 'desc' } }],
      },
    });

    const hits = (result as any).hits.hits;
    const total = (result as any).hits.total.value;

    return {
      success: true,
      data: {
        items: hits.map((hit: any) => hit._source),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error: any) {
    console.error('搜索失败:', error);
    return {
      success: false,
      message: error.message,
    };
  }
}

// 删除商品索引
export async function deleteProductIndex(productId: number) {
  try {
    await esClient.delete({
      index: INDEX_NAME,
      id: productId.toString(),
    });
  } catch (error) {
    console.error('删除商品索引失败:', error);
  }
}

export default esClient;
