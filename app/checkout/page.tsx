"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/layout/header-optimized"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/lib/context/app-context-optimized"
import { useRouter } from "next/navigation"

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

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState("")

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

  // Redirect if cart is empty
  if (cart.items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <h1 className="font-serif font-black text-2xl text-foreground mb-4">Your Cart is Empty</h1>
            <p className="text-muted mb-8">Add some items to your cart before checking out.</p>
            <Link href="/products">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Start Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {}

    if (!form.email) newErrors.email = "Email is required"
    if (!form.firstName) newErrors.firstName = "First name is required"
    if (!form.lastName) newErrors.lastName = "Last name is required"
    if (!form.address) newErrors.address = "Address is required"
    if (!form.city) newErrors.city = "City is required"
    if (!form.state) newErrors.state = "State is required"
    if (!form.zipCode) newErrors.zipCode = "ZIP code is required"
    if (!form.phone) newErrors.phone = "Phone number is required"

    if (form.paymentMethod === "card") {
      if (!form.cardNumber) newErrors.cardNumber = "Card number is required"
      if (!form.expiryDate) newErrors.expiryDate = "Expiry date is required"
      if (!form.cvv) newErrors.cvv = "CVV is required"
      if (!form.cardName) newErrors.cardName = "Cardholder name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate order ID
    const newOrderId = `ORD-${Date.now()}`
    setOrderId(newOrderId)
    setOrderComplete(true)
    clearCart()
    setIsProcessing(false)
  }

  const updateForm = (field: keyof CheckoutForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="font-serif font-black text-3xl text-foreground mb-4">Order Confirmed!</h1>
            <p className="text-muted text-lg mb-6">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
            <div className="bg-card p-6 rounded-lg mb-8">
              <p className="text-sm text-muted mb-2">Order Number</p>
              <p className="font-serif font-semibold text-xl text-foreground">{orderId}</p>
            </div>
            <div className="space-y-4">
              <p className="text-muted">
                You will receive an email confirmation shortly with your order details and tracking information.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Continue Shopping
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="lg">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-card py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/cart">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cart
                </Button>
              </Link>
            </div>
            <h1 className="font-serif font-black text-3xl text-foreground">Checkout</h1>
            <p className="text-muted">Complete your purchase</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newsletter"
                        checked={form.newsletter}
                        onCheckedChange={(checked) => updateForm("newsletter", checked as boolean)}
                      />
                      <Label htmlFor="newsletter" className="text-sm">
                        Subscribe to our newsletter for updates and special offers
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={form.firstName}
                          onChange={(e) => updateForm("firstName", e.target.value)}
                          className={errors.firstName ? "border-destructive" : ""}
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
                      />
                      {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={form.city}
                          onChange={(e) => updateForm("city", e.target.value)}
                          className={errors.city ? "border-destructive" : ""}
                        />
                        {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Select value={form.state} onValueChange={(value) => updateForm("state", value)}>
                          <SelectTrigger className={errors.state ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                            <SelectItem value="IL">Illinois</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={form.zipCode}
                          onChange={(e) => updateForm("zipCode", e.target.value)}
                          className={errors.zipCode ? "border-destructive" : ""}
                        />
                        {errors.zipCode && <p className="text-sm text-destructive mt-1">{errors.zipCode}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateForm("phone", e.target.value)}
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup
                      value={form.paymentMethod}
                      onValueChange={(value) => updateForm("paymentMethod", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Credit/Debit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal">PayPal</Label>
                      </div>
                    </RadioGroup>

                    {form.paymentMethod === "card" && (
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label htmlFor="cardName">Cardholder Name</Label>
                          <Input
                            id="cardName"
                            value={form.cardName}
                            onChange={(e) => updateForm("cardName", e.target.value)}
                            className={errors.cardName ? "border-destructive" : ""}
                          />
                          {errors.cardName && <p className="text-sm text-destructive mt-1">{errors.cardName}</p>}
                        </div>

                        <div>
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={form.cardNumber}
                            onChange={(e) => updateForm("cardNumber", e.target.value)}
                            className={errors.cardNumber ? "border-destructive" : ""}
                          />
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
                            <Input
                              id="cvv"
                              placeholder="123"
                              value={form.cvv}
                              onChange={(e) => updateForm("cvv", e.target.value)}
                              className={errors.cvv ? "border-destructive" : ""}
                            />
                            {errors.cvv && <p className="text-sm text-destructive mt-1">{errors.cvv}</p>}
                          </div>
                        </div>
                      </div>
                    )}

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
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="font-serif">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Cart Items */}
                    <div className="space-y-3">
                      {cart.items.map((item) => (
                        <div key={item.product.id} className="flex gap-3">
                          <div className="w-16 h-16 bg-muted/20 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={item.product.images[0] || "/placeholder.svg"}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{item.product.name}</p>
                            <p className="text-sm text-muted">Qty: {item.quantity}</p>
                            <p className="text-sm font-medium text-foreground">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Subtotal</span>
                        <span className="text-foreground">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Shipping</span>
                        <span className="text-foreground">
                          {shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Tax</span>
                        <span className="text-foreground">${tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-serif font-semibold text-foreground">Total</span>
                        <span className="font-serif font-semibold text-foreground">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : `Complete Order - $${total.toFixed(2)}`}
                    </Button>

                    {/* Security Features */}
                    <div className="space-y-2 pt-4">
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>Secure SSL encryption</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Truck className="h-4 w-4 text-green-600" />
                        <span>Free returns within 30 days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
