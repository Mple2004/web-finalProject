// Product images sourced from the design wireframe
const IMG = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDB0mbXY6JzzJeXHf8jBqlpdm8hPEKfQLIH4mfTAvQ7byw4Hy8HVe-hn10LMx8X6nVrveXNQhuSHdN3rRpLlPvR_ui-5NQYsjtC9wESsOih6lYShgXXFodsxgM3RExnWKjz8L4jfEsipHYOfbHRmVQhyJE4n951y35jbFUn_hot4H3XR5_uk-UF1xC6DkjlVs4aeD4iHLzKvzAMHNKsq8AdjpT5i_kF9prxObd-cgmzvcr0MKX9L6Aysrj9ZIPjasuFgrrMYKQlcLk',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDw1HrNZJ4k9sDrTkEluflkjFPzfP52EFEOwZ0mdiL3UkY5wQiT-qxe4emFbnDUajoM1yesnOG_o-TfdId-ukIdhtcjph3DjCZkkyDahVnbBtbO0M30Xrv0yQZ0CmJ-ujkJZcoGssXqrXXveuRMjf9iy7H0Xm8jP4TVjsbaV4qHkPLeb9NLWj4nXZSOxCnQAzVuf9XM7aR7H7lw_xPeNqZekFpwfSqBb322a9TllhCRzqRFjpO7bvm1rhLEO7TNW1dJJ6rZJ8cKXbA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCJN2NIqQwD6_2a-sMp0Zb1XDqnK9QNitwLN9k3Zr7d7-LFWZo8OXtl3b2PK-pMJHsONvFtZVpE4RWPLlDMH5WDLPW0_NJOCPwVMXAVy-A3NjHT2UKTnr2Q9B4Ff23WqAoA2OtR9UT5Bkj8aWkk2pjjHU76N7P5xbXxdSfFHBkzp43r3xw4FBe4CqFJjN1VXcQB1kq5MPOM0GyH5eWaFqxwPnQFiQ1kKpDNy6F-8ooAGvb9Qcm3hxOY1qP1_kv5Y3h9MOB_eFB',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCXvHtZoUBxZ-34HMb2u1M7x82npjd_d82rF1j_aZdVYR3SHMqP3jQFTxIHv62qMdYWEzQMfugGlrxKfKyKRFMRR0HejcmG2Xoqw3H-y52xn9E67jy36PQ7Zy1uxdb7kbQA5wE82qmuN3VrCh-MSpDyIVRkvA1uwAso5oq9WtozY4Y0NV3Cf1mCz3VOgM1VS4F9D0M7b-UiECEkgZ5erbLB5jiU0Pqg7LC3ArjIerRTNAVhyiCTpZfl3aYFmI2KVziZebOb7OslMro',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCLU0LE-BM1eMwYsaLjlIYlCgJ3sO0Y8A3I5UadpXoDBcvJF-O-y0NIQ9N-2cX3bCQ22m5r8m43YzQKl2h7zPLOcNDsT-J3-1a7JUhR4n3WV5_5OkjuKJqT8O3YDFTgRUCKbVb7qGh_N1oOE8mHpqkWfxnRfNpyawmhOAifM7_8yO-AvuXgHIJwfkXnZqZyBVqJVLjrqekdJnvL34S8GY8QNMl-GBFcYnC-xBKJcO48epRqwaxLpE-DdBCIRh0xV7Y8sOLHPVUQk',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAYkcYuFPRx3j9_dlC9mlk7vXuWadhwmSeIAHc9COyktATPy3_-hkJIIzGGuJ0UzkxgpTDsHnArmhSt7xdKyCoDGpxaxkJeOJiR73sP-6_b6N2-62OD4t1s9fGQQeGketNUl8tDpGiBfkZWpnvRSu79njCYBKmQDaWs-7LCplsRc0z8Hh-aG0tYffOBtfCiQcv_Gk3VCsrh2nkxX0tejwz-R6Uvz2Reqb3Bnxpst8dbok-iQ-U3qzH1Uz636g6Q-HUi1TcSoMZIyys',
]

export const HERO_IMAGE = IMG[3]

export const MOCK_PRODUCTS = [
  { id: 1,  name: 'The Royal Glenlivet 18 Year',   subcategory: 'Whisky',  region: 'Highlands, Scotland', price: 185.00, oldPrice: null,   volume: '750ml', abv: '43% ABV',  rating: 5,   reviews: 178, tag: 'rare',    image: IMG[0], description: 'Aged in Oloroso Sherry casks with notes of honey and spice. A rare and distinguished single malt.', nose: 'Dried apricot, honey, gentle oak.', palate: 'Rich fruit cake, dark chocolate, warming spice.' },
  { id: 2,  name: 'Suntory Hibiki Harmony',         subcategory: 'Whisky',  region: 'Kyoto, Japan',        price: 120.00, oldPrice: null,   volume: '700ml', abv: '43% ABV',  rating: 5,   reviews: 203, tag: '',        image: IMG[1], description: 'Luminous. Delicate. A transparency that unveils complexity.', nose: 'Rose, lychee, rosemary.', palate: 'Honey, candied orange peel, white chocolate.' },
  { id: 3,  name: 'Lagavulin Distillers Edition',    subcategory: 'Whisky',  region: 'Islay, Scotland',     price: 145.00, oldPrice: null,   volume: '750ml', abv: '46% ABV',  rating: 4.5, reviews: 165, tag: 'new',     image: IMG[2], description: 'Double matured in Pedro Ximenez seasoned casks for intense peat.', nose: 'Intense peat smoke, seaweed, sweet raisins.', palate: 'Powerful smoky malt, PX sweetness, long dry finish.' },
  { id: 4,  name: 'Woodford Reserve Double Oaked',   subcategory: 'Whisky',  region: 'Kentucky, USA',       price: 68.00,  oldPrice: null,   volume: '750ml', abv: '45.2% ABV', rating: 4.5, reviews: 143, tag: '',        image: IMG[4], description: 'Twice barreled for an exceptionally rich and smooth character.', nose: 'Toasted oak, vanilla, dark caramel.', palate: 'Creamy, full-bodied, apple, honey, chocolate.' },
  { id: 5,  name: 'Macallan Sherry Oak 12',          subcategory: 'Beer',  region: 'Speyside, Scotland',  price: 95.00,  oldPrice: null,   volume: '750ml', abv: '40% ABV',  rating: 5,   reviews: 321, tag: '',        image: IMG[0], description: 'Iconic single malt with rich gold color and mature oak spice.', nose: 'Rich dried fruits, ginger, sherry sweetness.', palate: 'Smooth, creamy, wood smoke, dried fruits.' },
  { id: 6,  name: 'Redbreast 12 Year Old',           subcategory: 'Wine',  region: 'Dublin, Ireland',     price: 72.00,  oldPrice: null,   volume: '750ml', abv: '40% ABV',  rating: 4.5, reviews: 198, tag: '',        image: IMG[5], description: 'Traditional single pot still Irish whiskey, aged in bourbon casks.', nose: 'Sherry nuttiness, toasted wood.', palate: 'Creamy, full with berries, spiced toast.' },
  { id: 7,  name: 'Grey Goose Vodka',                subcategory: 'Vodka',   region: 'Cognac, France',      price: 42.00,  oldPrice: null,   volume: '750ml', abv: '40% ABV',  rating: 4,   reviews: 220, tag: '',        image: IMG[1], description: 'Ultra-premium French vodka made from fine French wheat.', nose: 'Clean, fresh, hint of almond.', palate: 'Smooth, round, subtle sweetness.' },
  { id: 8,  name: 'Belvedere Intense',               subcategory: 'Vodka',   region: 'Żyrardów, Poland',   price: 55.00,  oldPrice: null,   volume: '700ml', abv: '50% ABV',  rating: 4.5, reviews: 112, tag: 'limited', image: IMG[5], description: 'Bold. Full-bodied. A more intense expression of rye character.', nose: 'White pepper, vanilla.', palate: 'Full-bodied, creamy, spice.' },
  { id: 9,  name: 'Patrón Silver Tequila',           subcategory: 'Tequila', region: 'Jalisco, Mexico',     price: 55.00,  oldPrice: null,   volume: '750ml', abv: '40% ABV',  rating: 4.5, reviews: 178, tag: '',        image: IMG[2], description: 'Handcrafted from finest 100% Weber Blue Agave.', nose: 'Fresh agave, citrus.', palate: 'Smooth, sweet agave, light oak.' },
  { id: 10, name: 'Don Julio 1942',                  subcategory: 'Tequila', region: 'Jalisco, Mexico',     price: 165.00, oldPrice: 189.00, volume: '750ml', abv: '38% ABV',  rating: 5,   reviews: 341, tag: 'hot',     image: IMG[4], description: 'Slow-aged for a minimum of two and a half years. Smooth and complex.', nose: 'Caramel, chocolate, roasted agave.', palate: 'Warm oak, vanilla, toffee.' },
  { id: 11, name: 'Hennessy XO Cognac',              subcategory: 'Brandy',  region: 'Cognac, France',      price: 210.00, oldPrice: null,   volume: '700ml', abv: '40% ABV',  rating: 5,   reviews: 156, tag: 'rare',    image: IMG[0], description: 'A rich blend of over 100 eaux-de-vie aged between 10 and 30 years.', nose: 'Candied fruit, spice, oak.', palate: 'Dense, powerful, very long finish.' },
  { id: 12, name: 'Rémy Martin VSOP',                subcategory: 'Brandy',  region: 'Cognac, France',      price: 58.00,  oldPrice: null,   volume: '700ml', abv: '40% ABV',  rating: 4,   reviews: 189, tag: '',        image: IMG[3], description: 'Mature and balanced with notes of vanilla, ripe apricot, and baking spices.', nose: 'Vanilla, fresh almond, stone fruit.', palate: 'Round, smooth, balanced.' },
  { id: 13, name: 'Diplomático Reserva Exclusiva',   subcategory: 'Rum',     region: 'Venezuela',           price: 42.00,  oldPrice: null,   volume: '700ml', abv: '40% ABV',  rating: 4.5, reviews: 267, tag: '',        image: IMG[2], description: 'Rich and complex dark rum. Notes of toffee, orange peel, and coffee.', nose: 'Toffee, orange peel, licorice.', palate: 'Smooth, rich sweetness, long finish.' },
  { id: 14, name: 'Ron Zacapa Centenario 23',        subcategory: 'Rum',     region: 'Guatemala',           price: 72.00,  oldPrice: null,   volume: '750ml', abv: '40% ABV',  rating: 5,   reviews: 143, tag: 'new',     image: IMG[4], description: 'Aged using the Solera system at 2,300 meters above sea level.', nose: 'Butterscotch, honey, caramel.', palate: 'Velvety, complex, dark fruit.' },
  { id: 15, name: 'Nikka From The Barrel',           subcategory: 'Spirits',  region: 'Tokyo, Japan',        price: 75.00,  oldPrice: null,   volume: '500ml', abv: '51.4% ABV', rating: 5,   reviews: 412, tag: 'hot',     image: IMG[1], description: 'Punchy full-flavoured blend at cask strength. Bold and complex.', nose: 'Citrus, malt, caramel.', palate: 'Rich, oily, spicy, long warm finish.' },
  { id: 16, name: 'Glenfiddich 15 Solera',           subcategory: 'Whisky',  region: 'Speyside, Scotland',  price: 78.00,  oldPrice: null,   volume: '700ml', abv: '40% ABV',  rating: 4.5, reviews: 198, tag: '',        image: IMG[3], description: 'Matured using a unique Solera vat process. Sweet, fruity, full-bodied.', nose: 'Honey, vanilla, pear.', palate: 'Silky, cinnamon, dried fruit.' },
  { id: 17, name: "Maker's Mark Bourbon",            subcategory: 'Whisky',  region: 'Kentucky, USA',       price: 35.00,  oldPrice: null,   volume: '750ml', abv: '45% ABV',  rating: 4,   reviews: 567, tag: '',        image: IMG[4], description: 'Full-flavored handmade bourbon. Soft with caramel and fruit.', nose: 'Caramel, vanilla, wheat.', palate: 'Sweet, warm, gentle spice.' },
  { id: 18, name: 'Ciroc Vodka',                    subcategory: 'Vodka',   region: 'France',              price: 40.00,  oldPrice: null,   volume: '750ml', abv: '40% ABV',  rating: 4,   reviews: 220, tag: '',        image: IMG[5], description: 'Ultra-premium vodka made from fine French grapes.', nose: 'Fresh grapes, citrus.', palate: 'Smooth, crisp, subtle sweetness.' },  
]



export const HERO_IMAGES = {
  bg:     'https://lh3.googleusercontent.com/aida-public/AB6AXuBUKg4EQS06RIJFCIAz2jqnSRm0HsFOXmEFED21tSb0KknFSx2JUhzH-iMjWbpHsR6QqssF6PH0l8vVcR1CZZQRI4WdzFJrnXI4l5Pa7DxEJ782gp8QWohMifr4KjByBp_EkWNBfMvkcotXmzl6TZYv7c4RkN1ryO-6RlACN3MG9cVqi6fy-xsNBwVg5NsXZfIt5BGPbmIITVZopevisoteY6bjXG3YSE94lB61rbDnDKinqWTk1wVUBhD8dMWAP6GN2l5ZKCVpoa4',
  bottle: IMG[0],
}

export const CATEGORY_CARDS = [
  {
    title: 'Premium Wines',
    subtitle: 'Curated vintage selections',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2cab2707d?w=400&h=320&fit=crop',
  },
  {
    title: 'Craft Beers',
    subtitle: 'Artisanal brews from around the world',
    image: 'https://images.unsplash.com/photo-1618183479302-1461ae2b2195?w=400&h=320&fit=crop',
  },
  {
    title: 'Fine Spirits',
    subtitle: 'Premium distilled choices',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=320&fit=crop',
  },
]




export const MOCK_ORDERS = [
  {
    id: 'ORD-00312',
    userId: 1,
    date: 'Mar 20, 2026',
    status: 'Delivered',
    items: MOCK_PRODUCTS.slice(0, 2),
    total: MOCK_PRODUCTS[0].price + MOCK_PRODUCTS[1].price,
  },
  {
    id: 'ORD-00287',
    userId: 1,
    date: 'Mar 14, 2026',
    status: 'Processing',
    items: MOCK_PRODUCTS.slice(3, 4),
    total: MOCK_PRODUCTS[3].price,
  },
  {
    id: 'ORD-00251',
    userId: 2,
    date: 'Feb 28, 2026',
    status: 'Delivered',
    items: MOCK_PRODUCTS.slice(5, 8),
    total: MOCK_PRODUCTS[5].price + MOCK_PRODUCTS[6].price + MOCK_PRODUCTS[7].price,
  },
]




export const mockUsers = [
  {
    id: 1,
    name: 'Jane Doe',
    email: 'test123@gmail.com',
    password: 'test123',
    role: 'user',
    avatar: 'https://i.pravatar.cc/100?img=12',
  },
  {
    id: 2,
    name: 'Admin',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/100?img=1',
  },
  {
    id: 3,
    name: 'John Smith',
    email: 'johnsmith@gmail.com',
    password: 'johnsmith',
    role: 'user',
    avatar: 'https://i.pravatar.cc/100?img=12',
  },
]