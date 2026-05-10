import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest } from "@/lib/api";

interface UserCoupon {
  userCoupon: {
    id: number;
    uuid: string;
    userId: number;
    couponId: number;
    status: string;
    usedAt: string | null;
    orderId: number | null;
    createdAt: string;
    updatedAt: string;
  };
  coupon: {
    id: number;
    uuid: string;
    name: string;
    type: string;
    discountValue: string;
    minAmount: string;
    startTime: string;
    endTime: string;
    totalCount: number;
    usedCount: number;
    perUserLimit: number;
    status: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
}

const MyCoupons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("unused");

  useEffect(() => {
    fetchMyCoupons();
  }, []);

  const fetchMyCoupons = async (status?: string) => {
    try {
      setLoading(true);
      const url = status ? `/api/coupons/my?status=${status}` : "/api/coupons/my";
      const data = await apiRequest(url);
      setCoupons(data.data || []);
    } catch (error: any) {
      toast({
        title: "获取优惠券失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const statusMap: { [key: string]: string } = {
      unused: "unused",
      used: "used",
      expired: "expired",
    };
    fetchMyCoupons(statusMap[value]);
  };

  const formatDiscount = (coupon: UserCoupon["coupon"]) => {
    if (coupon.type === "fixed") {
      return `¥${coupon.discountValue}`;
    } else if (coupon.type === "percentage") {
      return `${coupon.discountValue}折`;
    } else if (coupon.type === "shipping") {
      return "免邮";
    }
    return "";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN");
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      unused: "未使用",
      used: "已使用",
      expired: "已过期",
    };
    return statusMap[status] || status;
  };

  const filteredCoupons = coupons.filter((item) => {
    if (activeTab === "unused") return item.userCoupon.status === "unused";
    if (activeTab === "used") return item.userCoupon.status === "used";
    if (activeTab === "expired") return item.userCoupon.status === "expired";
    return true;
  });

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
        <h1 className="text-3xl font-bold">我的优惠券</h1>
        <Button variant="outline" onClick={() => navigate("/coupons")}>
          领券中心
        </Button>
      </div>

      <Separator className="mb-6" />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unused">未使用</TabsTrigger>
          <TabsTrigger value="used">已使用</TabsTrigger>
          <TabsTrigger value="expired">已过期</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无{getStatusText(activeTab)}优惠券</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoupons.map((item) => (
                <Card key={item.userCoupon.id} className="relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                    item.userCoupon.status === "unused" ? "bg-red-500" :
                    item.userCoupon.status === "used" ? "bg-gray-400" : "bg-gray-300"
                  }`} />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{item.coupon.name}</CardTitle>
                      <Badge variant={
                        item.userCoupon.status === "unused" ? "default" :
                        item.userCoupon.status === "used" ? "secondary" : "outline"
                      }>
                        {getStatusText(item.userCoupon.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <span className="text-3xl font-bold text-red-500">
                          {formatDiscount(item.coupon)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>满{item.coupon.minAmount}元可用</div>
                        <div>有效期：{formatDate(item.coupon.startTime)} - {formatDate(item.coupon.endTime)}</div>
                        {item.coupon.description && (
                          <div>说明：{item.coupon.description}</div>
                        )}
                        {item.userCoupon.usedAt && (
                          <div>使用时间：{formatDate(item.userCoupon.usedAt)}</div>
                        )}
                      </div>

                      {item.userCoupon.status === "unused" && (
                        <Button
                          className="w-full"
                          onClick={() => navigate("/cart")}
                        >
                          去使用
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyCoupons;
