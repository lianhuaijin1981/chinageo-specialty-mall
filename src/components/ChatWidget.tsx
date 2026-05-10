import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: number;
  uuid: string;
  sessionId: number;
  senderId: number;
  senderType: string;
  message: string;
  messageType: string;
  readAt: string | null;
  createdAt: string;
}

interface ChatData {
  session: {
    id: number;
    uuid: string;
    userId: number;
    adminId: number | null;
    status: string;
    lastMessageAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  messages: Message[];
}

const ChatWidget = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取或创建会话
  const initChat = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/chat/session", {
        method: "POST",
      });
      setChatData(data.data);
    } catch (error: any) {
      toast({
        title: "初始化聊天失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 打开/关闭聊天窗口
  const toggleChat = async () => {
    if (!isOpen) {
      await initChat();
    }
    setIsOpen(!isOpen);
  };

  // 发送消息
  const handleSend = async () => {
    if (!message.trim() || !chatData) return;

    try {
      const data = await apiRequest("/api/chat/message", {
        method: "POST",
        body: JSON.stringify({ message }),
      });

      // 添加消息到列表
      setChatData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, data.data],
        };
      });

      setMessage("");
      scrollToBottom();
    } catch (error: any) {
      toast({
        title: "发送失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // 轮询新消息
  useEffect(() => {
    if (!isOpen || !chatData) return;

    const interval = setInterval(async () => {
      try {
        const data = await apiRequest(
          `/api/chat/messages?limit=50&offset=${chatData.messages.length}`
        );
        
        if (data.data && data.data.length > 0) {
          setChatData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: [...prev.messages, ...data.data],
            };
          });
          scrollToBottom();
        }
      } catch (error) {
        console.error("轮询消息失败:", error);
      }
    }, 3000); // 每3秒轮询一次

    return () => clearInterval(interval);
  }, [isOpen, chatData]);

  // 滚动到底部
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* 聊天按钮 */}
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
        onClick={toggleChat}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>

      {/* 聊天窗口 */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 h-96 z-50 flex flex-col shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-lg">客服聊天</CardTitle>
            <Button variant="ghost" size="sm" onClick={toggleChat}>
              <X size={18} />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <p>加载中...</p>
              </div>
            ) : (
              <>
                {/* 消息列表 */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatData?.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.senderType === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.senderType === "user"
                              ? "bg-blue-500 text-white"
                              : msg.senderType === "system"
                              ? "bg-gray-200 text-gray-600 text-center text-sm"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* 输入区域 */}
                <div className="p-4 pt-2 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="请输入消息..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <Button onClick={handleSend} disabled={!message.trim()}>
                      <Send size={18} />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatWidget;
