import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest } from "@/lib/api";

interface PointsProduct {
  id: number;
  uuid: string;
  name: string;
  description: string;
  image: string;
  pointsCost: number;
  stock: number;
  status: string;
  startDate: string;
  endDate: string;
}

const PointsMall = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<PointsProduct[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, pointsData] = await Promise.all([
        apiRequest("/api/points/products"),
        apiRequest("/api/points/balance"),
      ]);
      
      setProducts(productsData.data || []);
      setUserPoints(pointsData.data.points || 0);
    } catch (error: any) {
      toast({
        title: "获取数据失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExchange = async (productId: number, pointsCost: number) => {
    if (userPoints < pointsCost) {
      toast({
        title: "积分不足",
        description: "您的积分余额不足",
        variant: "destructive",
      });
      return;
    }

    // 这里应该获取用户地址，简化处理直接使用确认框
    if (!confirm("确认兑换该商品？")) {
      return;
    }

    try {
      // 简化处理：直接使用默认地址
      const shippingAddress = {
        name: "测试用户",
        phone: "13800138000",
        province: "北京市",
        city: "北京市",
        district: "朝阳区",
        detail: "测试地址",
      };

      await apiRequest("/api/points/exchange", {
        method: "POST",
        body: JSON.stringify({
          productId,
          quantity: 1,
          shippingAddress,
        }),
      });

      toast({
        title: "兑换成功",
        description: "商品已成功兑换，请等待发货",
      });

      fetchData(); // 刷新数据
    } catch (error: any) {
      toast({
        title: "兑换失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">积分商城</h1>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            我的积分：{userPoints}
          </Badge>
          <Button variant="outline" onClick={() => navigate("/points/orders")}>
            兑换记录
          </Button>
        </div>
      </div>

      <Separator className="mb-6" />

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">暂无可用积分商品</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square relative bg-muted">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground">暂无图片</span>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-red-500">
                      {product.pointsCost} 积分
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="text-sm text-muted-foreground">
                    库存：{product.stock}
                  </div>

                  <Button
                    className="w-full"
                    disabled={product.stock <= 0 || userPoints < product.pointsCost}
                    onClick={() => handleExchange(product.id, product.pointsCost)}
                  >
                    {product.stock <= 0
                      ? "已售罄"
                      : userPoints < product.pointsCost
                      ? "积分不足"
                      : "立即兑换"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PointsMall;
