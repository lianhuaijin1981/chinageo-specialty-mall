import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest } from "@/lib/api";

interface PointsOrder {
  order: {
    id: number;
    uuid: string;
    userId: number;
    productId: number;
    quantity: number;
    totalPoints: number;
    status: string;
    trackingNo: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  product: {
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
    limitPerUser: number;
    createdAt: string;
    updatedAt: string;
  };
}

const MyPointsOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<PointsOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/points/orders");
      setOrders(data.data || []);
    } catch (error: any) {
      toast({
        title: "获取订单失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "处理中",
      completed: "已完成",
      cancelled: "已取消",
    };
    return statusMap[status] || status;
  };

  const getStatusVariant = (status: string) => {
    if (status === "completed") return "default";
    if (status === "cancelled") return "destructive";
    return "secondary";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN");
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
        <h1 className="text-3xl font-bold">我的兑换记录</h1>
        <Button variant="outline" onClick={() => navigate("/points-mall")}>
          积分商城
        </Button>
      </div>

      <Separator className="mb-6" />

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">暂无兑换记录</p>
          <Button
            className="mt-4"
            onClick={() => navigate("/points-mall")}
          >
            去逛逛
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((item) => (
            <Card key={item.order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    订单号：{item.order.uuid}
                  </CardTitle>
                  <Badge variant={getStatusVariant(item.order.status)}>
                    {getStatusText(item.order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6">
                  <div className="w-24 h-24 relative bg-muted rounded-md overflow-hidden">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">暂无图片</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      数量：{item.order.quantity} | 消耗积分：{item.order.totalPoints}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      兑换时间：{formatDate(item.order.createdAt)}
                    </p>
                    {item.order.trackingNo && (
                      <p className="text-sm text-muted-foreground">
                        物流单号：{item.order.trackingNo}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPointsOrders;
