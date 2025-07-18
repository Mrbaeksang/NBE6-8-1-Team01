'use client'

import { useState } from "react"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { authApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Calendar, Shield, AlertTriangle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, logout } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)

  // 로그인 체크
  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  // 회원 탈퇴 처리
  const handleDeleteAccount = async () => {
    if (!user?.email) return

    try {
      setIsDeleting(true)
      const response = await authApi.deleteUser(user.email)
      
      if (response.resultCode === '200-DELETED') {
        toast({
          title: "회원 탈퇴 완료",
          description: "그동안 이용해주셔서 감사합니다.",
        })
        logout()
        router.push('/')
      }
    } catch (error) {
      toast({
        title: "회원 탈퇴 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-mediterranean-sky/5">
      <Navigation />
      
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif' }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-mediterranean-blue to-mediterranean-terracotta">
              내 정보
            </span>
          </h1>
          <p className="text-lg text-gray-700" style={{ fontFamily: 'var(--font-noto), Noto Sans KR, sans-serif' }}>
            회원 정보를 확인하고 관리하세요
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* 회원 정보 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-mediterranean-blue/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <User className="w-6 h-6 text-mediterranean-blue" />
                  회원 정보
                </CardTitle>
                <CardDescription>
                  가입하신 회원 정보입니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-mediterranean-sky/10 rounded-lg">
                  <Mail className="w-5 h-5 text-mediterranean-blue" />
                  <div>
                    <p className="text-sm text-gray-600">이메일</p>
                    <p className="font-semibold">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-mediterranean-sand/10 rounded-lg">
                  <User className="w-5 h-5 text-mediterranean-terracotta" />
                  <div>
                    <p className="text-sm text-gray-600">이름</p>
                    <p className="font-semibold">{user?.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-mediterranean-olive/10 rounded-lg">
                  <Shield className="w-5 h-5 text-mediterranean-olive" />
                  <div>
                    <p className="text-sm text-gray-600">회원 등급</p>
                    <p className="font-semibold">
                      {user?.role === 'ADMIN' ? '관리자' : '일반 회원'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 빠른 메뉴 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-mediterranean-blue/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">빠른 메뉴</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-6 border-2 hover:border-mediterranean-blue hover:bg-mediterranean-blue/5"
                  onClick={() => router.push('/orders')}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Package className="w-8 h-8 text-mediterranean-blue" />
                    <span>주문 내역</span>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-6 border-2 hover:border-mediterranean-terracotta hover:bg-mediterranean-terracotta/5"
                  onClick={() => router.push('/wishlist')}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Heart className="w-8 h-8 text-mediterranean-terracotta" />
                    <span>위시리스트</span>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* 회원 탈퇴 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-red-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  회원 탈퇴
                </CardTitle>
                <CardDescription>
                  회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      disabled={isDeleting}
                    >
                      회원 탈퇴하기
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>정말로 탈퇴하시겠습니까?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>회원 탈퇴 시 다음 정보가 모두 삭제됩니다:</p>
                        <ul className="list-disc list-inside text-sm">
                          <li>회원 정보</li>
                          <li>주문 내역</li>
                          <li>위시리스트</li>
                        </ul>
                        <p className="font-semibold text-red-600">
                          이 작업은 되돌릴 수 없습니다.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            처리 중...
                          </>
                        ) : (
                          '탈퇴하기'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}