import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FileText, CheckCircle, AlertCircle, Building, User, Phone, MapPin, Upload } from "lucide-react";
import api from "../services/api";

const EnterpriseVerify: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [enterpriseInfo, setEnterpriseInfo] = useState<any>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    contactPhone: "",
    companyAddress: "",
    businessLicense: "",
    taxNumber: "",
    invoiceType: "normal" as "normal" | "special",
  });

  // 获取企业信息（如果已提交）
  useEffect(() => {
    fetchEnterpriseInfo();
  }, []);

  const fetchEnterpriseInfo = async () => {
    try {
      const response = await api.get("/api/group-buying/enterprise/my");

      if (response.data.success && response.data.data) {
        setEnterpriseInfo(response.data.data);
        setFormData({
          companyName: response.data.data.companyName || "",
          contactPerson: response.data.data.contactPerson || "",
          contactPhone: response.data.data.contactPhone || "",
          companyAddress: response.data.data.companyAddress || "",
          businessLicense: response.data.data.businessLicense || "",
          taxNumber: response.data.data.taxNumber || "",
          invoiceType: response.data.data.invoiceType || "normal",
        });
      }
    } catch (err: any) {
      // 未提交过，忽略
    } finally {
      setFetchLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 提交企业信息
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // 验证
    if (!formData.companyName.trim()) {
      setError("请输入企业名称");
      setLoading(false);
      return;
    }

    if (!formData.contactPerson.trim()) {
      setError("请输入联系人姓名");
      setLoading(false);
      return;
    }

    if (!formData.contactPhone.trim() || formData.contactPhone.length < 11) {
      setError("请输入有效的联系电话");
      setLoading(false);
      return;
    }

    if (!formData.companyAddress.trim()) {
      setError("请输入企业地址");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/api/group-buying/enterprise/verify", formData);

      if (response.data.success) {
        setSuccess("企业信息已提交，请等待审核");
        fetchEnterpriseInfo(); // 刷新状态
      } else {
        setError(response.data.error || "提交失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 获取状态样式
  const getStatusBadge = () => {
    if (!enterpriseInfo) return null;

    const status = enterpriseInfo.status;

    if (status === "verified") {
      return (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">已认证通过</p>
            <p className="text-sm">您已通过企业认证，可以享受团购特权和发票服务</p>
          </div>
        </div>
      );
    }

    if (status === "pending") {
      return (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">审核中</p>
            <p className="text-sm">您的企业信息已提交，我们正在审核中（1-3个工作日）</p>
          </div>
        </div>
      );
    }

    if (status === "rejected") {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">审核未通过</p>
            <p className="text-sm">{enterpriseInfo.rejectionReason || "请修改后重新提交"}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <Building className="w-8 h-8" />
            <h1 className="text-3xl font-bold">企业认证</h1>
          </motion.div>
          <p className="text-blue-100 text-sm">认证后享受团购特权 + 增值税专用发票</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 状态提示 */}
        {getStatusBadge()}

        {/* 成功提示 */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mt-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mt-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* 认证表单 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mt-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">企业信息</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 企业名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                企业名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="请输入企业全称"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={enterpriseInfo?.status === "verified"}
              />
            </div>

            {/* 联系人 + 联系电话 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  联系人 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="请输入联系人姓名"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={enterpriseInfo?.status === "verified"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  联系电话 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="请输入联系电话"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={enterpriseInfo?.status === "verified"}
                />
              </div>
            </div>

            {/* 企业地址 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                企业地址 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleInputChange}
                placeholder="请输入企业注册地址或经营地址"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={enterpriseInfo?.status === "verified"}
              />
            </div>

            {/* 营业执照 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4 inline mr-1" />
                营业执照
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">点击上传营业执照照片</p>
                <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG 格式，大小不超过 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="business-license"
                  disabled={enterpriseInfo?.status === "verified"}
                />
                <label
                  htmlFor="business-license"
                  className={`mt-3 inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors ${enterpriseInfo?.status === "verified" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  选择文件
                </label>
              </div>
              {formData.businessLicense && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  已上传
                </p>
              )}
            </div>

            {/* 税号 + 发票类型 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  税号（可选）
                </label>
                <input
                  type="text"
                  name="taxNumber"
                  value={formData.taxNumber}
                  onChange={handleInputChange}
                  placeholder="请输入企业税号"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={enterpriseInfo?.status === "verified"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  发票类型
                </label>
                <select
                  name="invoiceType"
                  value={formData.invoiceType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={enterpriseInfo?.status === "verified"}
                >
                  <option value="normal">普通发票</option>
                  <option value="special">增值税专用发票</option>
                </select>
              </div>
            </div>

            {/* 提交按钮 */}
            {enterpriseInfo?.status !== "verified" && (
              <button
                type="submit"
                disabled={loading || enterpriseInfo?.status === "verified"}
                className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
                  enterpriseInfo?.status === "verified"
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-600/30"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    提交中...
                  </span>
                ) : enterpriseInfo?.status === "pending" ? (
                  "重新提交"
                ) : (
                  "提交认证"
                )}
              </button>
            )}
          </form>
        </motion.div>

        {/* 认证说明 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 mt-6"
        >
          <h3 className="font-semibold text-gray-800 mb-3">认证说明</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>认证通过后，您可以在团购活动中享受企业专享价格</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>认证企业可以开具增值税专用发票（需选择"专用发票"类型）</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>审核时间通常为1-3个工作日，请耐心等待</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>如有疑问，请联系客服：400-xxx-xxxx</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default EnterpriseVerify;
