module.exports = {
   totalProducts: 30,
   search: {
      keyword: 'ca',
      results: ['Cauliflower - 1 Kg', 'Carrot - 1 Kg', 'Capsicum', 'Cashews - 1 Kg'],
      noMatch: 'zzzz',
      // keyword -> matching products with their prices, in the order the site lists them
      cases: [
         { keyword: 'ca', products: [['Cauliflower - 1 Kg', 60], ['Carrot - 1 Kg', 56], ['Capsicum', 60], ['Cashews - 1 Kg', 650]] },
         { keyword: 'ber', products: [['Cucumber - 1 Kg', 48], ['Raspberry - 1/4 Kg', 160], ['Strawberry - 1/4 Kg', 180]] },
         { keyword: 'nut', products: [['Nuts Mixture - 1 Kg', 950], ['Walnuts - 1/4 Kg', 170]] },
         { keyword: 'mel', products: [['Musk Melon - 1 Kg', 36], ['Water Melon - 1 Kg', 28]] },
         { keyword: 'an', products: [['Beans - 1 Kg', 82], ['Banana - 1 Kg', 45], ['Mango - 1 Kg', 75], ['Orange - 1 Kg', 75], ['Pomegranate - 1 Kg', 95]] },
         { keyword: 'CARROT', products: [['Carrot - 1 Kg', 56]] }
      ],
      noMatches: ['zzzz', '12345', 'carrot juice', '@#$%', 'tomatoo']
   },
   order: {
      product: 'Carrot',
      quantity: 3,
      unitPrice: 56,
      extraProduct: 'Mango',
      extraUnitPrice: 75,
      invalidPromoCode: 'wrong',
      promoCode: 'rahulshettyacademy',
      discountPercent: 10,
      country: 'India'
   },
   deals: {
      keyword: 'to',
      results: ['Tomato', 'Potato'],
      searches: [
         { keyword: 'to', results: ['Tomato', 'Potato'] },
         { keyword: 'ch', results: ['Chocolate', 'Cherry', 'Cheese'] },
         { keyword: 'an', results: ['Orange', 'Mango', 'Beans', 'Banana'] },
         { keyword: 'ap', results: ['Pineapple', 'Apple'] },
         { keyword: 'rr', results: ['Strawberry', 'Cherry', 'Carrot'] }
      ],
      noMatch: 'zzz',
      total: 19,
      // default page size is 5
      pages: [
         ['Wheat', 'Tomato', 'Strawberry', 'Rice', 'Potato'],
         ['Pineapple', 'Orange', 'Mango', 'Guava', 'Dragon fruit'],
         ['Chocolate', 'Cherry', 'Cheese', 'Carrot', 'Brinjal'],
         ['Beans', 'Banana', 'Apple', 'Almond']
      ]
   }
};
