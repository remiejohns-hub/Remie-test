"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CreditCard, 
  Truck, 
  Shield, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  MapPin,
  Mail,
  Phone,
  User,
  Lock,
  Package,
  Star,
  X,
  RotateCcw,
  Headphones
} from "lucide-react"
import { useCart } from "@/lib/context/app-context-optimized"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface CheckoutForm {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  paymentMethod: string
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string
  saveInfo: boolean
  newsletter: boolean
}

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type CheckoutStep = "shipping" | "payment" | "review" | "complete"

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { cart, clearCart } = useCart()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping")
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [mounted, setMounted] = useState(false)

  const [form, setForm] = useState<CheckoutForm>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    phone: "",
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    saveInfo: false,
    newsletter: false,
  })

  const [errors, setErrors] = useState<Partial<CheckoutForm>>({})

  const subtotal = cart.total
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  // Check if component is mounted (client-side)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset form and step when modal opens
  useEffect(() => {
    if (open) {
      setCurrentStep("shipping")
      setIsProcessing(false)
      setOrderId("")
      setErrors({})
    }
  }, [open])

  // Close modal if cart is empty
  useEffect(() => {
    if (cart.items.length === 0 && currentStep !== "complete") {
      onOpenChange(false)
    }
  }, [cart.items.length, currentStep, onOpenChange])

  const steps = [
    { id: "shipping", title: "Shipping", icon: MapPin },
    { id: "payment", title: "Payment", icon: CreditCard },
    { id: "review", title: "Review", icon: Package },
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const progress = currentStep === "complete" ? 100 : ((currentStepIndex + 1) / steps.length) * 100

  const validateShipping = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {}

    if (!form.email) newErrors.email = "Email is required"
    if (!form.firstName) newErrors.firstName = "First name is required"
    if (!form.lastName) newErrors.lastName = "Last name is required"
    if (!form.address) newErrors.address = "Address is required"
    if (!form.city) newErrors.city = "City is required"
    if (!form.state) newErrors.state = "State is required"
    if (!form.zipCode) newErrors.zipCode = "ZIP code is required"
    if (!form.phone) newErrors.phone = "Phone number is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePayment = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {}

    if (form.paymentMethod === "card") {
      if (!form.cardNumber) newErrors.cardNumber = "Card number is required"
      if (!form.expiryDate) newErrors.expiryDate = "Expiry date is required"
      if (!form.cvv) newErrors.cvv = "CVV is required"
      if (!form.cardName) newErrors.cardName = "Cardholder name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateForm = (field: keyof CheckoutForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleNext = () => {
    if (currentStep === "shipping" && !validateShipping()) return
    if (currentStep === "payment" && !validatePayment()) return

    const stepFlow: Record<CheckoutStep, CheckoutStep> = {
      shipping: "payment",
      payment: "review",
      review: "complete",
      complete: "complete"
    }

    setCurrentStep(stepFlow[currentStep])
  }

  const handleBack = () => {
    const stepFlow: Record<CheckoutStep, CheckoutStep> = {
      payment: "shipping",
      review: "payment",
      shipping: "shipping",
      complete: "complete"
    }

    setCurrentStep(stepFlow[currentStep])
  }

  const handleSubmit = async () => {
    if (!validateShipping() || !validatePayment()) return

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate order ID
      const newOrderId = `ORD-${Date.now()}`
      setOrderId(newOrderId)
      setCurrentStep("complete")
      clearCart()

      toast({
        title: "Order Confirmed!",
        description: `Your order ${newOrderId} has been successfully placed.`,
      })
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "shipping":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Shipping Address</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => updateForm("firstName", e.target.value)}
                    className={errors.firstName ? "border-destructive" : ""}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => updateForm("lastName", e.target.value)}
                    className={errors.lastName ? "border-destructive" : ""}
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                  className={errors.address ? "border-destructive" : ""}
                  placeholder="123 Main Street"
                />
                {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    className={errors.city ? "border-destructive" : ""}
                    placeholder="New York"
                  />
                  {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => updateForm("state", e.target.value)}
                    className={errors.state ? "border-destructive" : ""}
                    placeholder="Enter state"
                  />
                  {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={form.zipCode}
                    onChange={(e) => updateForm("zipCode", e.target.value)}
                    className={errors.zipCode ? "border-destructive" : ""}
                    placeholder="10001"
                  />
                  {errors.zipCode && <p className="text-sm text-destructive mt-1">{errors.zipCode}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    className={cn("pl-10", errors.phone ? "border-destructive" : "")}
                    placeholder="(555) 123-4567"
                  />
                </div>
                {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>
        )

      case "payment":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Payment Method</h3>
            </div>

            <RadioGroup
              value={form.paymentMethod}
              onValueChange={(value) => updateForm("paymentMethod", value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="h-5 w-5 bg-[#0070f3] rounded-sm flex items-center justify-center">
                    <span className="text-xs text-white font-bold">P</span>
                  </div>
                  <div>
                    <p className="font-medium">PayPal</p>
                    <p className="text-sm text-muted-foreground">Pay with your PayPal account</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {form.paymentMethod === "card" && (
              <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cardName"
                      value={form.cardName}
                      onChange={(e) => updateForm("cardName", e.target.value)}
                      className={cn("pl-10", errors.cardName ? "border-destructive" : "")}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.cardName && <p className="text-sm text-destructive mt-1">{errors.cardName}</p>}
                </div>

                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={form.cardNumber}
                      onChange={(e) => updateForm("cardNumber", e.target.value)}
                      className={cn("pl-10", errors.cardNumber ? "border-destructive" : "")}
                    />
                  </div>
                  {errors.cardNumber && <p className="text-sm text-destructive mt-1">{errors.cardNumber}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={form.expiryDate}
                      onChange={(e) => updateForm("expiryDate", e.target.value)}
                      className={errors.expiryDate ? "border-destructive" : ""}
                    />
                    {errors.expiryDate && <p className="text-sm text-destructive mt-1">{errors.expiryDate}</p>}
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={form.cvv}
                        onChange={(e) => updateForm("cvv", e.target.value)}
                        className={cn("pl-10", errors.cvv ? "border-destructive" : "")}
                      />
                    </div>
                    {errors.cvv && <p className="text-sm text-destructive mt-1">{errors.cvv}</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="saveInfo"
                    checked={form.saveInfo}
                    onCheckedChange={(checked) => updateForm("saveInfo", checked as boolean)}
                  />
                  <Label htmlFor="saveInfo" className="text-sm">
                    Save payment information for future purchases
                  </Label>
                </div>
              </div>
            )}

            {form.paymentMethod === "paypal" && (
              <div className="p-4 bg-[#0070f3]/10 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  You will be redirected to PayPal to complete your payment securely.
                </p>
              </div>
            )}
          </div>
        )

      case "review":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Review Order</h3>
            </div>

            {/* Order Summary */}
            <div className="space-y-2">
              <h4 className="font-medium">Order Items</h4>
              <div className="space-y-2">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className="w-16 h-16 bg-muted/20 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.images[0] || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium text-foreground">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Shipping Info */}
            <div>
              <h4 className="font-medium mb-2">Shipping Address</h4>
              <div className="p-3 bg-muted/20 rounded-lg text-sm">
                <p className="font-medium">{form.firstName} {form.lastName}</p>
                <p>{form.address}</p>
                <p>{form.city}, {form.state} {form.zipCode}</p>
                <p>{form.phone}</p>
              </div>
            </div>

            <Separator />

            {/* Payment Info */}
            <div>
              <h4 className="font-medium mb-2">Payment Method</h4>
              <div className="p-3 bg-muted/20 rounded-lg text-sm">
                {form.paymentMethod === "card" ? (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>**** **** **** {form.cardNumber.slice(-4)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-[#0070f3] rounded-sm flex items-center justify-center">
                      <span className="text-xs text-white font-bold">P</span>
                    </div>
                    <span>PayPal</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case "complete":
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h3>
              <p className="text-muted-foreground">
                Thank you for your purchase. Your order has been successfully placed.
              </p>
            </div>
            <div className="p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="font-mono text-lg font-semibold">{orderId}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              You will receive an email confirmation shortly with your order details and tracking information.
            </p>
            <Button 
              onClick={() => onOpenChange(false)} 
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  // Handle escape key and backdrop click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onOpenChange])

  // Don't render on server or if not mounted
  if (!mounted || !open) return null

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 flex items-start justify-center pt-10 pb-10 px-4"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        margin: 0,
        padding: '40px 16px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false)
        }
      }}
    >
      <div 
        className="bg-background rounded-lg shadow-2xl w-full max-w-[900px] h-[90vh] overflow-hidden relative border border-border"
        style={{
          maxWidth: 'min(900px, calc(100vw - 32px))',
          height: 'calc(100vh - 40px)',
          maxHeight: '90vh',
          width: '100%'
        }}
      >

        <div className="flex flex-col lg:flex-row w-full h-full">
          {/* Left side - Form content */}
          <div className="flex-1 min-w-0 p-4 flex flex-col h-full">
            <div className="mb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">
                  {currentStep === "complete" ? "Order Complete" : "Checkout"}
                </h1>
              </div>
              
              {currentStep !== "complete" && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <div className="flex justify-between text-sm">
                    {steps.map((step, index) => {
                      const StepIcon = step.icon
                      const isActive = step.id === currentStep
                      const isCompleted = index < currentStepIndex
                      
                      return (
                        <div
                          key={step.id}
                          className={cn(
                            "flex items-center gap-2",
                            isActive && "text-primary font-medium",
                            isCompleted && "text-green-600"
                          )}
                        >
                          <StepIcon className="h-4 w-4" />
                          <span>{step.title}</span>
                          {isCompleted && <CheckCircle className="h-4 w-4" />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {renderStepContent()}
            </div>

            {/* Navigation buttons */}
            {currentStep !== "complete" && (
              <div className="flex justify-between mt-3 pt-3 border-t flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === "shipping"}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {currentStep !== "review" ? (
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? "Processing..." : `Complete Order - $${total.toFixed(2)}`}
                  </Button>
                )}
              </div>
            )}
            
            {/* Cancel button for complete step */}
            {currentStep === "complete" && (
              <div className="flex justify-center mt-3 pt-3 border-t flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Close
                </Button>
              </div>
            )}
          </div>

          {/* Right side - Enhanced Order summary (hidden on complete step) */}
          {currentStep !== "complete" && (
            <div className="w-full lg:w-[300px] flex-shrink-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-0 border-l lg:border-l border-t lg:border-t-0 border-border/50 flex flex-col h-full">
              {/* Header Section */}
              <div className="p-3 pb-2 border-b border-border/30 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base text-foreground">Order Summary</h3>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Review your items before checkout</p>
              </div>
              
              {/* Cart items with enhanced styling */}
              <div className="p-3 pt-2 flex-1 overflow-y-auto">
                <div className="space-y-2 mb-3">
                  {cart.items.map((item, index) => (
                    <div key={item.product.id} className="group">
                      <div className="flex gap-4 p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-border/30 hover:border-border/60 transition-all duration-200 hover:shadow-sm">
                        <div className="relative w-16 h-16 bg-muted/20 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-border/20">
                          <img
                            src={item.product.images[0] || "/placeholder.svg"}
                            alt={item.product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground mb-2">
                            ${item.product.price.toFixed(2)} each
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-muted/50 px-2 py-1 rounded-md">
                              Qty: {item.quantity}
                            </span>
                            <p className="text-sm font-bold text-foreground">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {index < cart.items.length - 1 && <div className="h-2" />}
                    </div>
                  ))}
                </div>

                {/* Enhanced Pricing Section */}
                <div className="bg-white/80 dark:bg-white/5 rounded-xl p-4 border border-border/30">
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Subtotal
                      </span>
                      <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Shipping
                      </span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="text-green-600 font-semibold">Free</span>
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          </div>
                        ) : (
                          <span className="text-foreground">${shipping.toFixed(2)}</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Tax
                      </span>
                      <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
                    </div>
                    
                    {subtotal < 50 && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                          <Truck className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t border-border/30 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg text-foreground">Total</span>
                        <div className="text-right">
                          <span className="font-bold text-xl text-foreground">${total.toFixed(2)}</span>
                          <p className="text-xs text-muted-foreground">USD</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Cancel Button - Always Visible */}
              <div className="p-3 pt-2 border-t border-border/30 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Render modal at document root using portal
  return createPortal(modalContent, document.body)
}
