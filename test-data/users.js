module.exports = {
   validUser: {
      email: process.env.SHOP_EMAIL || 'kaushikgurram66@gmail.com',
      password: process.env.SHOP_PASSWORD || 'kaushikG@123'
   },
   invalidLogin: { email: 'not-an-email', password: 'Wrong@12345' },
   products: ['ZARA COAT 3', 'ADIDAS ORIGINAL', 'IPHONE 13 PRO'],
   // the catalogue search is case sensitive
   catalogue: {
      searches: [
         { keyword: 'ZARA', results: ['ZARA COAT 3'] },
         { keyword: 'ADIDAS', results: ['ADIDAS ORIGINAL'] },
         { keyword: 'iphone', results: ['iphone 13 pro'] }
      ],
      noMatch: 'nothing',
      priceRanges: [
         { min: 20000, max: 60000, results: ['iphone 13 pro'] },
         { min: 1000, max: 12000, results: ['ADIDAS ORIGINAL', 'ZARA COAT 3'] }
      ],
      emptyCategory: 'fashion',
      category: 'electronics'
   },
   payment: { expiryMonth: '08', expiryDay: '28', cvv: '123', nameOnCard: 'Test User', coupon: 'rahulshettyacademy' },
   country: { search: 'ind', name: 'India' }
};
