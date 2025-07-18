'use client'

import { useState, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { productApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Edit, Plus, Package, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Product } from "@/lib/types"

export default function AdminProductsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    description: "",
    productImage: "",
    stock: "",
    orderCount: "0"
  })

  // 관리자 권한 체크
  useEffect(() => {
    if (!isAuthenticated || user?.email !== 'admin@email.com') {
      router.push('/')
      toast({
        title: "접근 권한 없음",
        description: "관리자만 접근할 수 있습니다.",
        variant: "destructive"
      })
    }
  }, [isAuthenticated, user, router])

  // 상품 목록 가져오기
  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await productApi.getProducts()
      if (response.success) {
        setProducts(response.data)
      }
    } catch (error) {
      toast({
        title: "상품 목록 조회 실패",
        description: "상품 목록을 불러올 수 없습니다.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.email === 'admin@email.com') {
      fetchProducts()
    }
  }, [user])

  // 상품 등록/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const productData = {
        productName: formData.productName,
        price: parseInt(formData.price),
        description: formData.description,
        productImage: formData.productImage || "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80",
        stock: parseInt(formData.stock),
        orderCount: parseInt(formData.orderCount)
      }

      if (editingProduct) {
        // 수정 API 호출
        const response = await productApi.updateProduct(editingProduct.productId, productData)
        if (response.success) {
          toast({
            title: "상품 수정 완료",
            description: "상품이 성공적으로 수정되었습니다."
          })
        }
      } else {
        // 등록 API 호출
        const response = await productApi.createProduct(productData)
        if (response.success) {
          toast({
            title: "상품 등록 완료",
            description: "새 상품이 성공적으로 등록되었습니다."
          })
        }
      }

      setIsDialogOpen(false)
      resetForm()
      fetchProducts()
    } catch (error) {
      toast({
        title: editingProduct ? "상품 수정 실패" : "상품 등록 실패",
        description: "작업을 완료할 수 없습니다.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 상품 삭제
  const handleDelete = async (productId: number) => {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) return

    try {
      const response = await productApi.deleteProduct(productId)
      if (response.success) {
        toast({
          title: "상품 삭제 완료",
          description: "상품이 성공적으로 삭제되었습니다."
        })
        fetchProducts()
      }
    } catch (error) {
      toast({
        title: "상품 삭제 실패",
        description: "상품을 삭제할 수 없습니다.",
        variant: "destructive"
      })
    }
  }

  // 폼 리셋
  const resetForm = () => {
    setFormData({
      productName: "",
      price: "",
      description: "",
      productImage: "",
      stock: "",
      orderCount: "0"
    })
    setEditingProduct(null)
  }

  // 수정 모드로 전환
  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      productName: product.productName,
      price: product.price.toString(),
      description: product.description || "",
      productImage: product.productImage || "",
      stock: product.stock.toString(),
      orderCount: product.orderCount.toString()
    })
    setIsDialogOpen(true)
  }

  if (!isAuthenticated || user?.email !== 'admin@email.com') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            상품 관리
          </h1>
          <p className="text-gray-600">
            상품을 등록, 수정, 삭제할 수 있습니다.
          </p>
        </motion.div>

        {/* 상품 등록 버튼 */}
        <div className="flex justify-end mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => resetForm()}
                className="bg-mediterranean-blue hover:bg-mediterranean-blue/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                새 상품 등록
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? '상품 수정' : '새 상품 등록'}
                </DialogTitle>
                <DialogDescription>
                  상품 정보를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">상품명 *</Label>
                    <Input
                      id="productName"
                      value={formData.productName}
                      onChange={(e) => setFormData({...formData, productName: e.target.value})}
                      required
                      placeholder="예: 에티오피아 예가체프"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">가격 *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                      placeholder="15000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">상품 설명</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="상품에 대한 설명을 입력하세요"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">재고 *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      required
                      placeholder="100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="productImage">이미지 URL</Label>
                    <Input
                      id="productImage"
                      value={formData.productImage}
                      onChange={(e) => setFormData({...formData, productImage: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      resetForm()
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-mediterranean-blue hover:bg-mediterranean-blue/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      editingProduct ? '수정하기' : '등록하기'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 상품 목록 테이블 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-mediterranean-blue" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">등록된 상품이 없습니다.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>상품명</TableHead>
                  <TableHead>가격</TableHead>
                  <TableHead>재고</TableHead>
                  <TableHead>주문수</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell>{product.productId}</TableCell>
                    <TableCell className="font-medium">{product.productName}</TableCell>
                    <TableCell>₩{product.price.toLocaleString()}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.orderCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.productId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </motion.div>
      </div>
    </div>
  )
}