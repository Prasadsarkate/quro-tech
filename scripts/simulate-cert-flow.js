// Simulate the mapping from Home page cart item -> checkout razorpayItems -> razorpay create-order notes -> verify mapping

function simulate(item) {
  // Home page created cart item (as stored by use-cart)
  const cartItem = item

  // Checkout maps to razorpayItems (app/checkout/page.tsx)
  const razorpayItems = {
    id: `item-0`,
    name: cartItem.title,
    internship: cartItem.title,
    durationLabel: cartItem.durationLabel || (cartItem.duration === '1-month' ? '1 Month' : cartItem.duration === '2-months' ? '2 Months' : 'Custom'),
    price: cartItem.price,
    quantity: 1,
  }

  // RazorpayCheckout maps items to order items sent to create-razorpay-order (components/razorpay-checkout.tsx)
  const createOrderItem = {
    name: razorpayItems.name,
    course: razorpayItems.course || razorpayItems.internship || razorpayItems.name,
    duration_label: razorpayItems.durationLabel || razorpayItems.durationLabel || razorpayItems.course || razorpayItems.name,
    price: razorpayItems.price,
    quantity: razorpayItems.quantity,
  }

  // create-razorpay-order stores notes: items = [createOrderItem]
  const notes = { items: [createOrderItem], user_id: 'user_123' }

  // verify-razorpay-payment fallback builds order from Razorpay notes and maps into certificate fields
  const srcItem = notes.items[0]
  const internship = srcItem.internship || srcItem.course || srcItem.name || srcItem.title || 'Internship'
  const duration_label = srcItem.duration_label || srcItem.duration || 'N/A'

  return {
    cartItem,
    razorpayItems,
    createOrderItem,
    notes,
    final: { internship, duration_label }
  }
}

const samples = [
  { title: 'Frontend Developer Internship', internship: 'frontend', duration: '1-month', price: 400, durationLabel: '1 Month' },
  { title: 'Backend Developer Internship', internship: 'backend', duration: '2-months', price: 600, durationLabel: '2 Months' },
  { title: 'Full-Stack Developer Internship', internship: 'fullstack', duration: 'custom', price: 700, customHours: 120, customWeeks: 8, durationLabel: '120 hrs, 8 weeks' },
  // edge case: minimal data
  { title: '', internship: 'frontend', duration: '1-month', price: 400 },
]

for (const s of samples) {
  console.log('--- Sample ---')
  console.log(JSON.stringify(simulate(s), null, 2))
}
