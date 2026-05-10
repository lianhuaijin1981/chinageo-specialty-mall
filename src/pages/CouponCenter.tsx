import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest } from "@/lib/api";

interface Coupon {
  id: number;
  uuid: string;
  name: string;
  type: "fixed" | "percentage" | "shipping";
  discountValue: string;
  minAmount: string;
  startTime: string;
  endTime: string;
  totalCount: number;
  usedCount: number;
  perUserLimit: number;
  status: string;
  description: string;
  receivedCount: number;
  canReceive: boolean;
  isReceived: boolean;
}

const CouponCenter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/coupons/available");
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

  const handleReceive = async (couponId: number) => {
    try {
      await apiRequest("/api/coupons/receive", {
        method: "POST",
        body: JSON.stringify({ couponId }),
      });
      
      toast({
        title: "领取成功",
        description: "优惠券已添加到您的账户",
      });
      
      fetchCoupons(); // 刷新列表
    } catch (error: any) {
      toast({
        title: "领取失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDiscount = (coupon: Coupon) => {
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
        <h1 className="text-3xl font-bold">优惠券中心</h1>
        <Button variant="outline" onClick={() => navigate("/coupons/my")}>
          我的优惠券
        </Button>
      </div>

      <Separator className="mb-6" />

      {coupons.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">暂无可用优惠券</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className="relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-500" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{coupon.name}</CardTitle>
                  <Badge variant={coupon.type === "fixed" ? "default" : "secondary"}>
                    {coupon.type === "fixed" ? "满减" : coupon.type === "percentage" ? "折扣" : "免邮"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-red-500">
                      {formatDiscount(coupon)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>满{coupon.minAmount}元可用</div>
                    <div>有效期：{formatDate(coupon.startTime)} - {formatDate(coupon.endTime)}</div>
                    {coupon.totalCount > 0 && (
                      <div>剩余：{coupon.totalCount - coupon.usedCount}</div>
                    )}
                    {coupon.description && (
                      <div>说明：{coupon.description}</div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    disabled={!coupon.canReceive}
                    onClick={() => handleReceive(coupon.id)}
                  >
                    {coupon.isReceived ? "已领取" : !coupon.canReceive ? "已达领取上限" : "立即领取"}
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

export default CouponCenter;
