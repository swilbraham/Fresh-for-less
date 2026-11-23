export interface Area {
  name: string;
  slug: string;
  description: string;
  nearbyAreas: string[];
  region: string;
}

const regionMeta: Record<string, { county: string; postcode: string }> = {
  Wirral: { county: "Merseyside", postcode: "CH" },
  Liverpool: { county: "Merseyside", postcode: "L" },
  Chester: { county: "Cheshire", postcode: "CH" },
  Warrington: { county: "Cheshire", postcode: "WA" },
  Runcorn: { county: "Cheshire", postcode: "WA" },
  "North Wales": { county: "North Wales", postcode: "LL" },
  Manchester: { county: "Greater Manchester", postcode: "M" },
  Stockport: { county: "Greater Manchester", postcode: "SK" },
  "East Cheshire": { county: "Cheshire", postcode: "SK" },
};

const slugPostcode: Record<string, string> = {
  birkenhead: "CH41",
  wallasey: "CH44",
  bebington: "CH63",
  heswall: "CH60",
  "west-kirby": "CH48",
  hoylake: "CH47",
  neston: "CH64",
  bromborough: "CH62",
  moreton: "CH46",
  "new-brighton": "CH45",
  prenton: "CH43",
  oxton: "CH43",
  eastham: "CH66",
  "ellesmere-port": "CH65",
  irby: "CH61",
  pensby: "CH61",
  greasby: "CH49",
  upton: "CH49",
  "rock-ferry": "CH42",
  tranmere: "CH42",
  seacombe: "CH44",
  liscard: "CH44",
  leasowe: "CH46",
  meols: "CH47",
  "new-ferry": "CH62",
  "port-sunlight": "CH62",
  caldy: "CH48",
  thurstaston: "CH61",
  woodchurch: "CH49",
  claughton: "CH41",
  liverpool: "L1",
  bootle: "L20",
  crosby: "L23",
  formby: "L37",
  maghull: "L31",
  kirkby: "L32",
  huyton: "L36",
  prescot: "L34",
  knowsley: "L34",
  halewood: "L26",
  speke: "L24",
  garston: "L19",
  allerton: "L18",
  woolton: "L25",
  childwall: "L16",
  wavertree: "L15",
  toxteth: "L8",
  aigburth: "L17",
  "mossley-hill": "L18",
  "west-derby": "L12",
  "norris-green": "L11",
  anfield: "L4",
  everton: "L5",
  kirkdale: "L4",
  walton: "L4",
  fazakerley: "L9",
  aintree: "L9",
  litherland: "L21",
  seaforth: "L21",
  waterloo: "L22",
  chester: "CH1",
  saltney: "CH4",
  blacon: "CH1",
  handbridge: "CH4",
  christleton: "CH3",
  tarvin: "CH3",
  hoole: "CH2",
  boughton: "CH3",
  huntington: "CH3",
  "vicars-cross": "CH3",
  "upton-chester": "CH2",
  "great-boughton": "CH3",
  warrington: "WA1",
  lymm: "WA13",
  "stockton-heath": "WA4",
  grappenhall: "WA4",
  appleton: "WA4",
  "great-sankey": "WA5",
  penketh: "WA5",
  burtonwood: "WA5",
  padgate: "WA1",
  woolston: "WA1",
  birchwood: "WA3",
  runcorn: "WA7",
  widnes: "WA8",
  halton: "WA7",
  wrexham: "LL11",
  flint: "CH6",
  mold: "CH7",
  deeside: "CH5",
  queensferry: "CH5",
  shotton: "CH5",
  "connahs-quay": "CH5",
  buckley: "CH7",
  holywell: "CH8",
  rhyl: "LL18",
  prestatyn: "LL19",
  "colwyn-bay": "LL29",
  llandudno: "LL30",
  bangor: "LL57",
  conwy: "LL32",
  caernarfon: "LL55",
  ruthin: "LL15",
  denbigh: "LL16",
  abergele: "LL22",
  pwllheli: "LL53",
  "manchester-city-centre": "M1",
  "salford": "M6",
  "eccles": "M30",
  "irlam": "M44",
  "partington": "M31",
  "urmston": "M41",
  "stretford": "M32",
  "sale": "M33",
  "altrincham": "WA14",
  "timperley": "WA15",
  "hale": "WA15",
  "wythenshawe": "M22",
  "northenden": "M22",
  "didsbury": "M20",
  "withington": "M20",
  "chorlton": "M21",
  "fallowfield": "M14",
  "rusholme": "M14",
  "burnage": "M19",
  "levenshulme": "M19",
  "gorton": "M18",
  "denton": "M34",
  "droylsden": "M43",
  "failsworth": "M35",
  "ashton-under-lyne": "OL6",
  "mossley": "OL5",
  "oldham": "OL1",
  "royton": "OL2",
  "middleton": "M24",
  "prestwich": "M25",
  "whitefield": "M45",
  "bury": "BL9",
  "radcliffe": "M26",
  "swinton": "M27",
  "worsley": "M28",
  "walkden": "M28",
  "stockport": "SK1",
  "heaton-moor": "SK4",
  "heaton-mersey": "SK4",
  "reddish": "SK5",
  "gatley": "SK8",
  "cheadle": "SK8",
  "cheadle-hulme": "SK8",
  "bramhall": "SK7",
  "hazel-grove": "SK7",
  "marple": "SK6",
  "romiley": "SK6",
  "hyde": "SK14",
  "dukinfield": "SK16",
  "stalybridge": "SK15",
  "wilmslow": "SK9",
  "handforth": "SK9",
  "poynton": "SK12",
  "macclesfield": "SK10",
  "bollington": "SK10",
};

export function getCountyForRegion(region: string): string {
  return regionMeta[region]?.county ?? "UK";
}

export function getPostcodeForArea(area: Area): string {
  return slugPostcode[area.slug] ?? regionMeta[area.region]?.postcode ?? "";
}

export const areas: Area[] = [
  // ─── WIRRAL ──────────────────────────────────────────
  {
    name: "Birkenhead",
    slug: "birkenhead",
    description:
      "Looking for professional carpet cleaning in Birkenhead? Fresh For Less provides affordable, high-quality carpet and upholstery cleaning services throughout Birkenhead and surrounding areas. Our local team knows the area well, delivering fast and reliable service with eco-friendly products to homes and businesses across Birkenhead.",
    nearbyAreas: ["wallasey", "prenton", "oxton", "tranmere", "rock-ferry", "claughton", "liverpool"],
    region: "Wirral",
  },
  {
    name: "Wallasey",
    slug: "wallasey",
    description:
      "Looking for professional carpet cleaning in Wallasey? Fresh For Less delivers outstanding carpet and upholstery cleaning results across Wallasey and the surrounding neighbourhoods. Our experienced local team provides prompt, dependable service using eco-friendly cleaning solutions that are safe for families and pets.",
    nearbyAreas: ["new-brighton", "liscard", "seacombe", "moreton", "leasowe", "birkenhead", "liverpool"],
    region: "Wirral",
  },
  {
    name: "Bebington",
    slug: "bebington",
    description:
      "Looking for professional carpet cleaning in Bebington? Fresh For Less offers expert carpet and upholstery cleaning across Bebington and nearby areas. We use advanced hot-water extraction methods and eco-friendly products to leave your carpets looking and smelling fresh, with competitive prices that won't break the bank.",
    nearbyAreas: ["bromborough", "port-sunlight", "new-ferry", "eastham", "rock-ferry", "heswall", "birkenhead"],
    region: "Wirral",
  },
  {
    name: "Heswall",
    slug: "heswall",
    description:
      "Looking for professional carpet cleaning in Heswall? Fresh For Less provides top-quality carpet and upholstery cleaning services throughout Heswall and the Wirral peninsula. Our trained technicians deliver thorough deep cleans using eco-friendly products, ensuring outstanding results every time at affordable prices.",
    nearbyAreas: ["pensby", "irby", "caldy", "thurstaston", "neston", "west-kirby", "bebington"],
    region: "Wirral",
  },
  {
    name: "West Kirby",
    slug: "west-kirby",
    description:
      "Looking for professional carpet cleaning in West Kirby? Fresh For Less brings expert carpet and upholstery cleaning services to homes and businesses in West Kirby and across the Wirral. We combine professional-grade equipment with eco-friendly solutions for carpets that look and feel brand new.",
    nearbyAreas: ["hoylake", "caldy", "thurstaston", "meols", "heswall", "irby", "greasby"],
    region: "Wirral",
  },
  {
    name: "Hoylake",
    slug: "hoylake",
    description:
      "Looking for professional carpet cleaning in Hoylake? Fresh For Less serves Hoylake with reliable, affordable carpet and upholstery cleaning. Our local technicians use the latest cleaning technology and eco-friendly products to remove deep-set dirt, stains, and allergens from your carpets.",
    nearbyAreas: ["meols", "west-kirby", "moreton", "leasowe", "greasby", "caldy", "wallasey"],
    region: "Wirral",
  },
  {
    name: "Neston",
    slug: "neston",
    description:
      "Looking for professional carpet cleaning in Neston? Fresh For Less provides expert carpet and upholstery cleaning across Neston and south Wirral. Our friendly team delivers exceptional results with fast turnaround times, using safe, eco-friendly cleaning solutions at prices you'll love.",
    nearbyAreas: ["heswall", "ellesmere-port", "pensby", "irby", "bebington", "chester", "west-kirby"],
    region: "Wirral",
  },
  {
    name: "Bromborough",
    slug: "bromborough",
    description:
      "Looking for professional carpet cleaning in Bromborough? Fresh For Less offers high-quality carpet and upholstery cleaning throughout Bromborough and east Wirral. Whether it's a residential deep clean or commercial carpet maintenance, our local team delivers outstanding results at competitive prices.",
    nearbyAreas: ["eastham", "bebington", "port-sunlight", "new-ferry", "ellesmere-port", "rock-ferry", "birkenhead"],
    region: "Wirral",
  },
  {
    name: "Moreton",
    slug: "moreton",
    description:
      "Looking for professional carpet cleaning in Moreton? Fresh For Less serves Moreton with premium carpet and upholstery cleaning at affordable prices. Our skilled technicians use professional hot-water extraction to remove stubborn stains, odours, and allergens, leaving your home feeling fresh and clean.",
    nearbyAreas: ["leasowe", "upton", "greasby", "wallasey", "hoylake", "meols", "birkenhead"],
    region: "Wirral",
  },
  {
    name: "New Brighton",
    slug: "new-brighton",
    description:
      "Looking for professional carpet cleaning in New Brighton? Fresh For Less provides first-class carpet and upholstery cleaning throughout New Brighton and north Wirral. Our dedicated team offers flexible appointments and reliable results, using eco-friendly products that are safe for your family.",
    nearbyAreas: ["wallasey", "liscard", "seacombe", "birkenhead", "leasowe", "moreton", "liverpool"],
    region: "Wirral",
  },
  {
    name: "Prenton",
    slug: "prenton",
    description:
      "Looking for professional carpet cleaning in Prenton? Fresh For Less delivers exceptional carpet and upholstery cleaning services across Prenton. Our experienced team combines cutting-edge equipment with eco-friendly solutions to restore your carpets to their best, all at prices that represent genuine value.",
    nearbyAreas: ["birkenhead", "oxton", "woodchurch", "bebington", "claughton", "upton", "rock-ferry"],
    region: "Wirral",
  },
  {
    name: "Oxton",
    slug: "oxton",
    description:
      "Looking for professional carpet cleaning in Oxton? Fresh For Less offers meticulous carpet and upholstery cleaning throughout Oxton and central Wirral. We take pride in delivering spotless results using advanced cleaning techniques and environmentally friendly products at honest, transparent prices.",
    nearbyAreas: ["birkenhead", "prenton", "claughton", "tranmere", "rock-ferry", "woodchurch", "bebington"],
    region: "Wirral",
  },
  {
    name: "Eastham",
    slug: "eastham",
    description:
      "Looking for professional carpet cleaning in Eastham? Fresh For Less serves Eastham with thorough carpet and upholstery cleaning at competitive rates. Our local team provides reliable, high-quality results using professional-grade equipment and eco-friendly products that are gentle on your carpets.",
    nearbyAreas: ["bromborough", "bebington", "ellesmere-port", "port-sunlight", "new-ferry", "birkenhead", "chester"],
    region: "Wirral",
  },
  {
    name: "Ellesmere Port",
    slug: "ellesmere-port",
    description:
      "Looking for professional carpet cleaning in Ellesmere Port? Fresh For Less provides affordable, high-quality carpet and upholstery cleaning services throughout Ellesmere Port. Our professional team delivers outstanding results for both residential and commercial customers, using eco-friendly products and modern cleaning techniques.",
    nearbyAreas: ["eastham", "bromborough", "neston", "chester", "port-sunlight", "bebington", "birkenhead"],
    region: "Wirral",
  },
  {
    name: "Irby",
    slug: "irby",
    description:
      "Looking for professional carpet cleaning in Irby? Fresh For Less offers reliable carpet and upholstery cleaning across Irby and the western Wirral. Our trained technicians provide a thorough, deep-cleaning service using environmentally safe products, delivering results that exceed expectations at fair prices.",
    nearbyAreas: ["greasby", "pensby", "heswall", "thurstaston", "upton", "west-kirby", "woodchurch"],
    region: "Wirral",
  },
  {
    name: "Pensby",
    slug: "pensby",
    description:
      "Looking for professional carpet cleaning in Pensby? Fresh For Less delivers premium carpet and upholstery cleaning services in Pensby and the surrounding area. Our local professionals use advanced equipment and eco-friendly solutions to tackle even the toughest stains, providing excellent value for money.",
    nearbyAreas: ["heswall", "irby", "greasby", "thurstaston", "west-kirby", "woodchurch", "upton"],
    region: "Wirral",
  },
  {
    name: "Greasby",
    slug: "greasby",
    description:
      "Looking for professional carpet cleaning in Greasby? Fresh For Less provides exceptional carpet and upholstery cleaning throughout Greasby. We combine modern cleaning technology with eco-friendly products to remove dirt, allergens, and stains, leaving your carpets beautifully refreshed at affordable rates.",
    nearbyAreas: ["irby", "upton", "moreton", "pensby", "west-kirby", "hoylake", "woodchurch"],
    region: "Wirral",
  },
  {
    name: "Upton",
    slug: "upton",
    description:
      "Looking for professional carpet cleaning in Upton? Fresh For Less serves Upton with outstanding carpet and upholstery cleaning at competitive prices. Our experienced technicians deliver thorough results using professional equipment and safe, eco-friendly cleaning solutions for homes and businesses.",
    nearbyAreas: ["moreton", "greasby", "woodchurch", "prenton", "birkenhead", "irby", "leasowe"],
    region: "Wirral",
  },
  {
    name: "Rock Ferry",
    slug: "rock-ferry",
    description:
      "Looking for professional carpet cleaning in Rock Ferry? Fresh For Less provides expert carpet and upholstery cleaning across Rock Ferry and east Wirral. Our dedicated local team offers reliable service with fast response times, using eco-friendly products that are safe for families and pets.",
    nearbyAreas: ["birkenhead", "tranmere", "bebington", "new-ferry", "oxton", "prenton", "port-sunlight"],
    region: "Wirral",
  },
  {
    name: "Tranmere",
    slug: "tranmere",
    description:
      "Looking for professional carpet cleaning in Tranmere? Fresh For Less delivers professional carpet and upholstery cleaning services throughout Tranmere. Our skilled team uses advanced hot-water extraction and eco-friendly products to restore your carpets, providing exceptional results at honest prices.",
    nearbyAreas: ["birkenhead", "rock-ferry", "oxton", "seacombe", "prenton", "new-ferry", "liverpool"],
    region: "Wirral",
  },
  {
    name: "Seacombe",
    slug: "seacombe",
    description:
      "Looking for professional carpet cleaning in Seacombe? Fresh For Less offers reliable carpet and upholstery cleaning across Seacombe and the Wirral waterfront. Our professional technicians provide deep-cleaning services using eco-friendly solutions, ensuring your carpets look spotless at prices that suit every budget.",
    nearbyAreas: ["wallasey", "liscard", "birkenhead", "new-brighton", "tranmere", "liverpool", "leasowe"],
    region: "Wirral",
  },
  {
    name: "Liscard",
    slug: "liscard",
    description:
      "Looking for professional carpet cleaning in Liscard? Fresh For Less provides high-quality carpet and upholstery cleaning throughout Liscard. Our local team delivers fast, effective cleaning using advanced techniques and eco-friendly products, ensuring brilliant results at affordable prices.",
    nearbyAreas: ["wallasey", "seacombe", "new-brighton", "moreton", "birkenhead", "leasowe", "liverpool"],
    region: "Wirral",
  },
  {
    name: "Leasowe",
    slug: "leasowe",
    description:
      "Looking for professional carpet cleaning in Leasowe? Fresh For Less serves Leasowe with dependable carpet and upholstery cleaning at great prices. Our friendly team uses modern cleaning equipment and eco-friendly products to leave your carpets looking immaculate and smelling fresh.",
    nearbyAreas: ["moreton", "wallasey", "meols", "hoylake", "upton", "liscard", "new-brighton"],
    region: "Wirral",
  },
  {
    name: "Meols",
    slug: "meols",
    description:
      "Looking for professional carpet cleaning in Meols? Fresh For Less offers expert carpet and upholstery cleaning across Meols and north-west Wirral. Our professional team provides thorough cleaning services using eco-friendly solutions, delivering outstanding results at competitive rates.",
    nearbyAreas: ["hoylake", "west-kirby", "moreton", "leasowe", "greasby", "caldy", "wallasey"],
    region: "Wirral",
  },
  {
    name: "New Ferry",
    slug: "new-ferry",
    description:
      "Looking for professional carpet cleaning in New Ferry? Fresh For Less provides top-quality carpet and upholstery cleaning throughout New Ferry and east Wirral. Our experienced technicians use advanced cleaning methods and eco-friendly products to restore your carpets to pristine condition at fair prices.",
    nearbyAreas: ["rock-ferry", "bebington", "port-sunlight", "bromborough", "tranmere", "birkenhead", "eastham"],
    region: "Wirral",
  },
  {
    name: "Port Sunlight",
    slug: "port-sunlight",
    description:
      "Looking for professional carpet cleaning in Port Sunlight? Fresh For Less delivers careful, high-quality carpet and upholstery cleaning in Port Sunlight and the surrounding area. We use gentle yet effective eco-friendly products to clean your carpets thoroughly, with competitive pricing and reliable service.",
    nearbyAreas: ["bebington", "new-ferry", "rock-ferry", "bromborough", "eastham", "birkenhead", "tranmere"],
    region: "Wirral",
  },
  {
    name: "Caldy",
    slug: "caldy",
    description:
      "Looking for professional carpet cleaning in Caldy? Fresh For Less provides premium carpet and upholstery cleaning services in Caldy and across the Wirral. Our skilled technicians deliver meticulous cleaning using eco-friendly products, ensuring your carpets are beautifully clean at honest prices.",
    nearbyAreas: ["west-kirby", "heswall", "thurstaston", "hoylake", "irby", "pensby", "meols"],
    region: "Wirral",
  },
  {
    name: "Thurstaston",
    slug: "thurstaston",
    description:
      "Looking for professional carpet cleaning in Thurstaston? Fresh For Less offers outstanding carpet and upholstery cleaning throughout Thurstaston and rural Wirral. Our local team provides reliable, professional cleaning using eco-friendly solutions, delivering excellent results at prices you'll love.",
    nearbyAreas: ["heswall", "caldy", "irby", "west-kirby", "pensby", "greasby", "neston"],
    region: "Wirral",
  },
  {
    name: "Woodchurch",
    slug: "woodchurch",
    description:
      "Looking for professional carpet cleaning in Woodchurch? Fresh For Less provides affordable, thorough carpet and upholstery cleaning in Woodchurch and central Wirral. Our professional team uses advanced equipment and eco-friendly products for deep-cleaning results that make your carpets look like new.",
    nearbyAreas: ["prenton", "upton", "greasby", "irby", "oxton", "birkenhead", "moreton"],
    region: "Wirral",
  },
  {
    name: "Claughton",
    slug: "claughton",
    description:
      "Looking for professional carpet cleaning in Claughton? Fresh For Less delivers expert carpet and upholstery cleaning services across Claughton and Birkenhead. Our dedicated team provides reliable, high-quality cleaning using eco-friendly products and modern techniques at competitive prices.",
    nearbyAreas: ["birkenhead", "oxton", "prenton", "seacombe", "wallasey", "tranmere", "upton"],
    region: "Wirral",
  },

  // ─── LIVERPOOL ───────────────────────────────────────
  {
    name: "Liverpool",
    slug: "liverpool",
    description:
      "Looking for professional carpet cleaning in Liverpool? Fresh For Less provides comprehensive carpet and upholstery cleaning across Liverpool city centre and all surrounding areas. Our experienced team serves homes, offices, and commercial premises with eco-friendly, professional-grade cleaning at affordable rates.",
    nearbyAreas: ["birkenhead", "bootle", "toxteth", "wavertree", "everton", "kirkdale", "walton"],
    region: "Liverpool",
  },
  {
    name: "Bootle",
    slug: "bootle",
    description:
      "Looking for professional carpet cleaning in Bootle? Fresh For Less serves Bootle with reliable, high-quality carpet and upholstery cleaning. Our local team provides fast response times and outstanding results using eco-friendly products, making professional carpet cleaning accessible and affordable.",
    nearbyAreas: ["liverpool", "litherland", "seaforth", "walton", "kirkdale", "crosby", "aintree"],
    region: "Liverpool",
  },
  {
    name: "Crosby",
    slug: "crosby",
    description:
      "Looking for professional carpet cleaning in Crosby? Fresh For Less delivers premium carpet and upholstery cleaning throughout Crosby and Sefton. Our professional technicians use advanced cleaning methods and eco-friendly solutions to restore your carpets, providing excellent value and reliable service.",
    nearbyAreas: ["waterloo", "litherland", "formby", "bootle", "seaforth", "maghull", "aintree"],
    region: "Liverpool",
  },
  {
    name: "Formby",
    slug: "formby",
    description:
      "Looking for professional carpet cleaning in Formby? Fresh For Less provides exceptional carpet and upholstery cleaning across Formby. Our skilled team combines modern cleaning technology with eco-friendly products to deliver thorough, professional results at competitive prices for homes and businesses.",
    nearbyAreas: ["crosby", "maghull", "waterloo", "litherland", "aintree", "bootle", "kirkby"],
    region: "Liverpool",
  },
  {
    name: "Maghull",
    slug: "maghull",
    description:
      "Looking for professional carpet cleaning in Maghull? Fresh For Less offers reliable carpet and upholstery cleaning services in Maghull and north Liverpool. Our experienced team delivers outstanding deep-cleaning results using safe, eco-friendly products at prices that suit every household budget.",
    nearbyAreas: ["aintree", "kirkby", "formby", "crosby", "litherland", "fazakerley", "bootle"],
    region: "Liverpool",
  },
  {
    name: "Kirkby",
    slug: "kirkby",
    description:
      "Looking for professional carpet cleaning in Kirkby? Fresh For Less provides thorough carpet and upholstery cleaning across Kirkby and Knowsley. Our dedicated local team offers reliable service with eco-friendly products, ensuring your carpets are spotlessly clean at genuinely affordable prices.",
    nearbyAreas: ["fazakerley", "aintree", "maghull", "knowsley", "huyton", "walton", "crosby"],
    region: "Liverpool",
  },
  {
    name: "Huyton",
    slug: "huyton",
    description:
      "Looking for professional carpet cleaning in Huyton? Fresh For Less serves Huyton with professional carpet and upholstery cleaning at competitive prices. Our trained technicians use advanced equipment and eco-friendly solutions to remove deep-set dirt, stains, and allergens from your carpets.",
    nearbyAreas: ["knowsley", "prescot", "kirkby", "childwall", "halewood", "west-derby", "woolton"],
    region: "Liverpool",
  },
  {
    name: "Prescot",
    slug: "prescot",
    description:
      "Looking for professional carpet cleaning in Prescot? Fresh For Less delivers expert carpet and upholstery cleaning across Prescot and east Liverpool. Our professional team provides thorough cleaning using eco-friendly products, ensuring your home looks and feels its best at honest prices.",
    nearbyAreas: ["huyton", "knowsley", "halewood", "kirkby", "childwall", "warrington", "widnes"],
    region: "Liverpool",
  },
  {
    name: "Knowsley",
    slug: "knowsley",
    description:
      "Looking for professional carpet cleaning in Knowsley? Fresh For Less provides high-quality carpet and upholstery cleaning throughout the Knowsley area. Our experienced team delivers exceptional results using advanced techniques and eco-friendly products, with transparent pricing and reliable service.",
    nearbyAreas: ["huyton", "prescot", "kirkby", "halewood", "childwall", "west-derby", "fazakerley"],
    region: "Liverpool",
  },
  {
    name: "Halewood",
    slug: "halewood",
    description:
      "Looking for professional carpet cleaning in Halewood? Fresh For Less offers dependable carpet and upholstery cleaning services in Halewood and south Knowsley. Our local team provides thorough deep-cleaning using eco-friendly products at competitive rates, with outstanding customer satisfaction.",
    nearbyAreas: ["speke", "huyton", "woolton", "garston", "prescot", "knowsley", "widnes"],
    region: "Liverpool",
  },
  {
    name: "Speke",
    slug: "speke",
    description:
      "Looking for professional carpet cleaning in Speke? Fresh For Less provides expert carpet and upholstery cleaning across Speke and south Liverpool. Our skilled team delivers professional results using modern equipment and eco-friendly products, ensuring a thorough clean at prices you'll love.",
    nearbyAreas: ["garston", "halewood", "allerton", "woolton", "aigburth", "widnes", "liverpool"],
    region: "Liverpool",
  },
  {
    name: "Garston",
    slug: "garston",
    description:
      "Looking for professional carpet cleaning in Garston? Fresh For Less serves Garston with reliable, affordable carpet and upholstery cleaning. Our professional team uses eco-friendly cleaning solutions and advanced equipment to deliver outstanding results for homes and businesses throughout the area.",
    nearbyAreas: ["speke", "aigburth", "allerton", "halewood", "woolton", "mossley-hill", "liverpool"],
    region: "Liverpool",
  },
  {
    name: "Allerton",
    slug: "allerton",
    description:
      "Looking for professional carpet cleaning in Allerton? Fresh For Less offers premium carpet and upholstery cleaning services throughout Allerton. Our experienced local team provides meticulous cleaning using eco-friendly products and professional-grade equipment, ensuring exceptional results at fair prices.",
    nearbyAreas: ["woolton", "mossley-hill", "childwall", "garston", "aigburth", "speke", "wavertree"],
    region: "Liverpool",
  },
  {
    name: "Woolton",
    slug: "woolton",
    description:
      "Looking for professional carpet cleaning in Woolton? Fresh For Less delivers outstanding carpet and upholstery cleaning across Woolton and south Liverpool. Our trained technicians use safe, eco-friendly products and modern cleaning techniques to restore your carpets beautifully at competitive prices.",
    nearbyAreas: ["allerton", "childwall", "halewood", "garston", "mossley-hill", "huyton", "speke"],
    region: "Liverpool",
  },
  {
    name: "Childwall",
    slug: "childwall",
    description:
      "Looking for professional carpet cleaning in Childwall? Fresh For Less provides thorough carpet and upholstery cleaning in Childwall and the surrounding area. Our reliable team uses advanced cleaning technology and eco-friendly solutions to deliver spotless results at genuinely affordable prices.",
    nearbyAreas: ["woolton", "wavertree", "allerton", "mossley-hill", "huyton", "west-derby", "liverpool"],
    region: "Liverpool",
  },
  {
    name: "Wavertree",
    slug: "wavertree",
    description:
      "Looking for professional carpet cleaning in Wavertree? Fresh For Less offers expert carpet and upholstery cleaning throughout Wavertree. Our dedicated local team delivers professional-quality results using eco-friendly products, with fast turnaround times and prices that represent outstanding value.",
    nearbyAreas: ["childwall", "toxteth", "mossley-hill", "allerton", "west-derby", "liverpool", "aigburth"],
    region: "Liverpool",
  },
  {
    name: "Toxteth",
    slug: "toxteth",
    description:
      "Looking for professional carpet cleaning in Toxteth? Fresh For Less provides affordable, high-quality carpet and upholstery cleaning across Toxteth and inner Liverpool. Our professional team delivers reliable service with eco-friendly products, ensuring your carpets look their absolute best.",
    nearbyAreas: ["liverpool", "aigburth", "wavertree", "everton", "garston", "mossley-hill", "kirkdale"],
    region: "Liverpool",
  },
  {
    name: "Aigburth",
    slug: "aigburth",
    description:
      "Looking for professional carpet cleaning in Aigburth? Fresh For Less serves Aigburth with premium carpet and upholstery cleaning at competitive prices. Our experienced team uses advanced methods and eco-friendly solutions to deliver deep-cleaning results that leave your carpets looking fantastic.",
    nearbyAreas: ["garston", "mossley-hill", "toxteth", "allerton", "speke", "liverpool", "wavertree"],
    region: "Liverpool",
  },
  {
    name: "Mossley Hill",
    slug: "mossley-hill",
    description:
      "Looking for professional carpet cleaning in Mossley Hill? Fresh For Less provides meticulous carpet and upholstery cleaning throughout Mossley Hill. Our skilled technicians deliver exceptional results using eco-friendly products and professional equipment, with honest pricing and reliable service.",
    nearbyAreas: ["aigburth", "allerton", "childwall", "wavertree", "woolton", "garston", "toxteth"],
    region: "Liverpool",
  },
  {
    name: "West Derby",
    slug: "west-derby",
    description:
      "Looking for professional carpet cleaning in West Derby? Fresh For Less offers dependable carpet and upholstery cleaning services in West Derby and east Liverpool. Our local team provides thorough, professional cleaning using eco-friendly solutions at prices that won't break the bank.",
    nearbyAreas: ["norris-green", "childwall", "wavertree", "huyton", "fazakerley", "anfield", "knowsley"],
    region: "Liverpool",
  },
  {
    name: "Norris Green",
    slug: "norris-green",
    description:
      "Looking for professional carpet cleaning in Norris Green? Fresh For Less delivers reliable carpet and upholstery cleaning across Norris Green. Our professional team provides outstanding deep-cleaning results using eco-friendly products, ensuring your home looks and feels wonderfully fresh at affordable rates.",
    nearbyAreas: ["west-derby", "anfield", "fazakerley", "walton", "kirkby", "everton", "huyton"],
    region: "Liverpool",
  },
  {
    name: "Anfield",
    slug: "anfield",
    description:
      "Looking for professional carpet cleaning in Anfield? Fresh For Less provides expert carpet and upholstery cleaning throughout Anfield and north Liverpool. Our dedicated team delivers fast, reliable service with eco-friendly products, helping keep homes and businesses across Anfield looking their best.",
    nearbyAreas: ["everton", "walton", "norris-green", "west-derby", "kirkdale", "fazakerley", "liverpool"],
    region: "Liverpool",
  },
  {
    name: "Everton",
    slug: "everton",
    description:
      "Looking for professional carpet cleaning in Everton? Fresh For Less offers affordable, high-quality carpet and upholstery cleaning across Everton. Our experienced local team provides prompt, professional service using eco-friendly products, delivering spotless results at prices that offer genuine value.",
    nearbyAreas: ["liverpool", "anfield", "kirkdale", "walton", "toxteth", "norris-green", "bootle"],
    region: "Liverpool",
  },
  {
    name: "Kirkdale",
    slug: "kirkdale",
    description:
      "Looking for professional carpet cleaning in Kirkdale? Fresh For Less serves Kirkdale with thorough carpet and upholstery cleaning at competitive rates. Our professional technicians use modern equipment and eco-friendly cleaning solutions to remove stubborn stains and refresh your carpets.",
    nearbyAreas: ["liverpool", "everton", "walton", "bootle", "anfield", "toxteth", "litherland"],
    region: "Liverpool",
  },
  {
    name: "Walton",
    slug: "walton",
    description:
      "Looking for professional carpet cleaning in Walton? Fresh For Less provides premium carpet and upholstery cleaning throughout Walton and north Liverpool. Our reliable team delivers outstanding results using advanced cleaning techniques and eco-friendly products at honest, affordable prices.",
    nearbyAreas: ["anfield", "kirkdale", "everton", "bootle", "fazakerley", "norris-green", "aintree"],
    region: "Liverpool",
  },
  {
    name: "Fazakerley",
    slug: "fazakerley",
    description:
      "Looking for professional carpet cleaning in Fazakerley? Fresh For Less delivers professional carpet and upholstery cleaning across Fazakerley. Our experienced team provides fast, effective service using eco-friendly solutions, ensuring your carpets are thoroughly cleaned and refreshed at great prices.",
    nearbyAreas: ["aintree", "walton", "kirkby", "norris-green", "anfield", "maghull", "west-derby"],
    region: "Liverpool",
  },
  {
    name: "Aintree",
    slug: "aintree",
    description:
      "Looking for professional carpet cleaning in Aintree? Fresh For Less offers reliable carpet and upholstery cleaning services in Aintree and north Liverpool. Our skilled technicians use professional equipment and eco-friendly products to deliver deep-cleaning results at genuinely competitive prices.",
    nearbyAreas: ["fazakerley", "maghull", "bootle", "walton", "kirkby", "litherland", "crosby"],
    region: "Liverpool",
  },
  {
    name: "Litherland",
    slug: "litherland",
    description:
      "Looking for professional carpet cleaning in Litherland? Fresh For Less provides expert carpet and upholstery cleaning throughout Litherland. Our local team offers reliable, professional service with eco-friendly cleaning products, delivering exceptional results for homes and businesses at affordable rates.",
    nearbyAreas: ["bootle", "seaforth", "crosby", "aintree", "walton", "kirkdale", "waterloo"],
    region: "Liverpool",
  },
  {
    name: "Seaforth",
    slug: "seaforth",
    description:
      "Looking for professional carpet cleaning in Seaforth? Fresh For Less serves Seaforth with outstanding carpet and upholstery cleaning at competitive prices. Our professional team uses advanced equipment and eco-friendly solutions to ensure your carpets look their very best.",
    nearbyAreas: ["bootle", "litherland", "waterloo", "crosby", "kirkdale", "walton", "liverpool"],
    region: "Liverpool",
  },
  {
    name: "Waterloo",
    slug: "waterloo",
    description:
      "Looking for professional carpet cleaning in Waterloo? Fresh For Less delivers high-quality carpet and upholstery cleaning across Waterloo and coastal Sefton. Our experienced local team provides thorough cleaning using eco-friendly products, offering excellent results at fair and transparent prices.",
    nearbyAreas: ["crosby", "seaforth", "litherland", "bootle", "formby", "aintree", "liverpool"],
    region: "Liverpool",
  },

  // ─── CHESTER ─────────────────────────────────────────
  {
    name: "Chester",
    slug: "chester",
    description:
      "Looking for professional carpet cleaning in Chester? Fresh For Less provides comprehensive carpet and upholstery cleaning across Chester and the surrounding area. Our experienced team serves both residential and commercial customers with eco-friendly products and professional-grade equipment at competitive prices.",
    nearbyAreas: ["hoole", "boughton", "handbridge", "great-boughton", "upton-chester", "saltney", "ellesmere-port"],
    region: "Chester",
  },
  {
    name: "Saltney",
    slug: "saltney",
    description:
      "Looking for professional carpet cleaning in Saltney? Fresh For Less offers reliable carpet and upholstery cleaning throughout Saltney and the Chester borders. Our professional team delivers thorough cleaning using eco-friendly solutions, providing outstanding results at prices you'll love.",
    nearbyAreas: ["chester", "blacon", "handbridge", "boughton", "hoole", "deeside", "queensferry"],
    region: "Chester",
  },
  {
    name: "Blacon",
    slug: "blacon",
    description:
      "Looking for professional carpet cleaning in Blacon? Fresh For Less delivers expert carpet and upholstery cleaning services across Blacon. Our dedicated team provides fast, reliable cleaning using advanced techniques and eco-friendly products, ensuring exceptional results at affordable prices.",
    nearbyAreas: ["chester", "saltney", "upton-chester", "hoole", "deeside", "queensferry", "great-boughton"],
    region: "Chester",
  },
  {
    name: "Handbridge",
    slug: "handbridge",
    description:
      "Looking for professional carpet cleaning in Handbridge? Fresh For Less provides premium carpet and upholstery cleaning in Handbridge and south Chester. Our skilled technicians use eco-friendly products and modern cleaning methods to deliver spotless results at genuinely competitive rates.",
    nearbyAreas: ["chester", "saltney", "boughton", "great-boughton", "huntington", "hoole", "christleton"],
    region: "Chester",
  },
  {
    name: "Christleton",
    slug: "christleton",
    description:
      "Looking for professional carpet cleaning in Christleton? Fresh For Less serves Christleton with high-quality carpet and upholstery cleaning. Our experienced team provides meticulous cleaning using eco-friendly solutions and professional equipment, delivering outstanding results at transparent prices.",
    nearbyAreas: ["chester", "huntington", "vicars-cross", "great-boughton", "tarvin", "hoole", "handbridge"],
    region: "Chester",
  },
  {
    name: "Tarvin",
    slug: "tarvin",
    description:
      "Looking for professional carpet cleaning in Tarvin? Fresh For Less offers expert carpet and upholstery cleaning across Tarvin and rural Cheshire. Our professional team provides thorough cleaning services using eco-friendly products, ensuring your carpets are beautifully refreshed at fair prices.",
    nearbyAreas: ["chester", "christleton", "hoole", "vicars-cross", "great-boughton", "huntington", "mold"],
    region: "Chester",
  },
  {
    name: "Hoole",
    slug: "hoole",
    description:
      "Looking for professional carpet cleaning in Hoole? Fresh For Less provides outstanding carpet and upholstery cleaning throughout Hoole and Chester. Our reliable local team uses modern equipment and eco-friendly solutions to deliver professional-quality results at prices that represent excellent value.",
    nearbyAreas: ["chester", "boughton", "upton-chester", "great-boughton", "blacon", "huntington", "christleton"],
    region: "Chester",
  },
  {
    name: "Boughton",
    slug: "boughton",
    description:
      "Looking for professional carpet cleaning in Boughton? Fresh For Less delivers affordable carpet and upholstery cleaning across Boughton and Chester city centre. Our dedicated team provides thorough cleaning with eco-friendly products, ensuring excellent results at honest, competitive prices.",
    nearbyAreas: ["chester", "hoole", "handbridge", "great-boughton", "christleton", "huntington", "saltney"],
    region: "Chester",
  },
  {
    name: "Huntington",
    slug: "huntington",
    description:
      "Looking for professional carpet cleaning in Huntington? Fresh For Less offers reliable carpet and upholstery cleaning services in Huntington and east Chester. Our skilled team delivers deep-cleaning results using professional equipment and eco-friendly products at prices you'll love.",
    nearbyAreas: ["chester", "christleton", "vicars-cross", "great-boughton", "boughton", "hoole", "handbridge"],
    region: "Chester",
  },
  {
    name: "Vicars Cross",
    slug: "vicars-cross",
    description:
      "Looking for professional carpet cleaning in Vicars Cross? Fresh For Less provides thorough carpet and upholstery cleaning throughout Vicars Cross. Our professional team delivers exceptional results using advanced cleaning techniques and eco-friendly solutions at genuinely affordable prices.",
    nearbyAreas: ["chester", "christleton", "huntington", "great-boughton", "hoole", "tarvin", "boughton"],
    region: "Chester",
  },
  {
    name: "Upton (Chester)",
    slug: "upton-chester",
    description:
      "Looking for professional carpet cleaning in Upton, Chester? Fresh For Less serves the Upton area with expert carpet and upholstery cleaning. Our experienced team provides reliable, professional service using eco-friendly products and modern equipment, delivering exceptional results at competitive prices.",
    nearbyAreas: ["chester", "hoole", "blacon", "great-boughton", "boughton", "christleton", "ellesmere-port"],
    region: "Chester",
  },
  {
    name: "Great Boughton",
    slug: "great-boughton",
    description:
      "Looking for professional carpet cleaning in Great Boughton? Fresh For Less delivers premium carpet and upholstery cleaning across Great Boughton and south Chester. Our local team uses eco-friendly products and advanced cleaning methods to provide spotless results at fair, transparent prices.",
    nearbyAreas: ["chester", "boughton", "handbridge", "christleton", "huntington", "hoole", "vicars-cross"],
    region: "Chester",
  },

  // ─── WARRINGTON ──────────────────────────────────────
  {
    name: "Warrington",
    slug: "warrington",
    description:
      "Looking for professional carpet cleaning in Warrington? Fresh For Less provides comprehensive carpet and upholstery cleaning across Warrington and all surrounding areas. Our experienced team serves homes and businesses with eco-friendly, professional-grade cleaning at prices that offer outstanding value.",
    nearbyAreas: ["stockton-heath", "lymm", "great-sankey", "padgate", "grappenhall", "appleton", "woolston"],
    region: "Warrington",
  },
  {
    name: "Lymm",
    slug: "lymm",
    description:
      "Looking for professional carpet cleaning in Lymm? Fresh For Less serves Lymm with premium carpet and upholstery cleaning at competitive prices. Our professional team uses advanced equipment and eco-friendly solutions to deliver thorough cleaning results for homes and businesses across the area.",
    nearbyAreas: ["warrington", "grappenhall", "stockton-heath", "appleton", "great-sankey", "runcorn", "widnes"],
    region: "Warrington",
  },
  {
    name: "Stockton Heath",
    slug: "stockton-heath",
    description:
      "Looking for professional carpet cleaning in Stockton Heath? Fresh For Less delivers exceptional carpet and upholstery cleaning throughout Stockton Heath and south Warrington. Our dedicated team provides reliable service with eco-friendly products, ensuring your carpets look their absolute best.",
    nearbyAreas: ["warrington", "grappenhall", "appleton", "lymm", "great-sankey", "padgate", "woolston"],
    region: "Warrington",
  },
  {
    name: "Grappenhall",
    slug: "grappenhall",
    description:
      "Looking for professional carpet cleaning in Grappenhall? Fresh For Less provides expert carpet and upholstery cleaning across Grappenhall. Our skilled local team uses professional-grade equipment and eco-friendly solutions to deliver outstanding results at honest, affordable prices.",
    nearbyAreas: ["warrington", "stockton-heath", "lymm", "appleton", "woolston", "padgate", "great-sankey"],
    region: "Warrington",
  },
  {
    name: "Appleton",
    slug: "appleton",
    description:
      "Looking for professional carpet cleaning in Appleton? Fresh For Less offers reliable carpet and upholstery cleaning services in Appleton and south Warrington. Our experienced technicians deliver thorough cleaning using advanced methods and eco-friendly products at competitive prices.",
    nearbyAreas: ["warrington", "stockton-heath", "grappenhall", "lymm", "great-sankey", "penketh", "runcorn"],
    region: "Warrington",
  },
  {
    name: "Great Sankey",
    slug: "great-sankey",
    description:
      "Looking for professional carpet cleaning in Great Sankey? Fresh For Less delivers professional carpet and upholstery cleaning throughout Great Sankey and west Warrington. Our reliable team uses eco-friendly cleaning products and modern techniques to provide spotless results at fair prices.",
    nearbyAreas: ["warrington", "penketh", "appleton", "burtonwood", "stockton-heath", "widnes", "runcorn"],
    region: "Warrington",
  },
  {
    name: "Penketh",
    slug: "penketh",
    description:
      "Looking for professional carpet cleaning in Penketh? Fresh For Less provides high-quality carpet and upholstery cleaning in Penketh and west Warrington. Our professional team delivers fast, effective cleaning using eco-friendly solutions, ensuring excellent results at genuinely affordable rates.",
    nearbyAreas: ["warrington", "great-sankey", "widnes", "appleton", "runcorn", "burtonwood", "stockton-heath"],
    region: "Warrington",
  },
  {
    name: "Burtonwood",
    slug: "burtonwood",
    description:
      "Looking for professional carpet cleaning in Burtonwood? Fresh For Less serves Burtonwood with dependable carpet and upholstery cleaning. Our experienced team provides thorough cleaning services using eco-friendly products and professional equipment at prices that represent great value.",
    nearbyAreas: ["warrington", "great-sankey", "penketh", "padgate", "woolston", "liverpool", "kirkby"],
    region: "Warrington",
  },
  {
    name: "Padgate",
    slug: "padgate",
    description:
      "Looking for professional carpet cleaning in Padgate? Fresh For Less offers expert carpet and upholstery cleaning across Padgate and east Warrington. Our dedicated local team delivers reliable, professional cleaning using eco-friendly products, ensuring your carpets look and feel wonderfully fresh.",
    nearbyAreas: ["warrington", "woolston", "birchwood", "burtonwood", "grappenhall", "great-sankey", "lymm"],
    region: "Warrington",
  },
  {
    name: "Woolston",
    slug: "woolston",
    description:
      "Looking for professional carpet cleaning in Woolston? Fresh For Less provides outstanding carpet and upholstery cleaning throughout Woolston. Our skilled team uses advanced cleaning technology and eco-friendly solutions to remove deep-set dirt and stains, delivering excellent results at competitive prices.",
    nearbyAreas: ["warrington", "padgate", "grappenhall", "birchwood", "stockton-heath", "lymm", "great-sankey"],
    region: "Warrington",
  },
  {
    name: "Birchwood",
    slug: "birchwood",
    description:
      "Looking for professional carpet cleaning in Birchwood? Fresh For Less delivers reliable carpet and upholstery cleaning across Birchwood and east Warrington. Our professional team provides thorough deep-cleaning using eco-friendly products, ensuring outstanding results for homes and offices at fair prices.",
    nearbyAreas: ["warrington", "padgate", "woolston", "grappenhall", "lymm", "stockton-heath", "runcorn"],
    region: "Warrington",
  },

  // ─── RUNCORN ─────────────────────────────────────────
  {
    name: "Runcorn",
    slug: "runcorn",
    description:
      "Looking for professional carpet cleaning in Runcorn? Fresh For Less provides affordable, high-quality carpet and upholstery cleaning across Runcorn and Halton. Our experienced team delivers outstanding results for homes and businesses using eco-friendly products and advanced cleaning techniques.",
    nearbyAreas: ["widnes", "halton", "warrington", "great-sankey", "penketh", "lymm", "liverpool"],
    region: "Runcorn",
  },
  {
    name: "Widnes",
    slug: "widnes",
    description:
      "Looking for professional carpet cleaning in Widnes? Fresh For Less serves Widnes with expert carpet and upholstery cleaning at competitive prices. Our professional team uses modern equipment and eco-friendly cleaning solutions to deliver thorough, reliable results that leave your carpets spotlessly clean.",
    nearbyAreas: ["runcorn", "halton", "warrington", "halewood", "speke", "great-sankey", "penketh"],
    region: "Runcorn",
  },
  {
    name: "Halton",
    slug: "halton",
    description:
      "Looking for professional carpet cleaning in Halton? Fresh For Less offers comprehensive carpet and upholstery cleaning throughout the Halton borough. Our dedicated team provides reliable, professional service using eco-friendly products, delivering exceptional cleaning results at genuinely affordable prices.",
    nearbyAreas: ["runcorn", "widnes", "warrington", "great-sankey", "penketh", "lymm", "liverpool"],
    region: "Runcorn",
  },

  // ─── NORTH WALES ─────────────────────────────────────
  {
    name: "Wrexham",
    slug: "wrexham",
    description:
      "Looking for professional carpet cleaning in Wrexham? Fresh For Less provides expert carpet and upholstery cleaning across Wrexham and north-east Wales. Our experienced team delivers outstanding results using eco-friendly products and professional equipment, with competitive pricing and reliable service.",
    nearbyAreas: ["chester", "mold", "buckley", "deeside", "ruthin", "ellesmere-port", "flint"],
    region: "North Wales",
  },
  {
    name: "Flint",
    slug: "flint",
    description:
      "Looking for professional carpet cleaning in Flint? Fresh For Less serves Flint with reliable, high-quality carpet and upholstery cleaning. Our skilled local team uses eco-friendly solutions and advanced cleaning techniques to restore your carpets, providing excellent results at honest prices.",
    nearbyAreas: ["connahs-quay", "shotton", "mold", "deeside", "holywell", "buckley", "chester"],
    region: "North Wales",
  },
  {
    name: "Mold",
    slug: "mold",
    description:
      "Looking for professional carpet cleaning in Mold? Fresh For Less delivers premium carpet and upholstery cleaning across Mold and Flintshire. Our professional team provides thorough deep-cleaning using eco-friendly products, ensuring your carpets look and feel their best at competitive prices.",
    nearbyAreas: ["buckley", "flint", "deeside", "wrexham", "ruthin", "connahs-quay", "chester"],
    region: "North Wales",
  },
  {
    name: "Deeside",
    slug: "deeside",
    description:
      "Looking for professional carpet cleaning in Deeside? Fresh For Less provides comprehensive carpet and upholstery cleaning throughout Deeside and the surrounding area. Our experienced team uses eco-friendly products and modern techniques to deliver outstanding cleaning results at affordable rates.",
    nearbyAreas: ["queensferry", "shotton", "connahs-quay", "flint", "chester", "buckley", "ellesmere-port"],
    region: "North Wales",
  },
  {
    name: "Queensferry",
    slug: "queensferry",
    description:
      "Looking for professional carpet cleaning in Queensferry? Fresh For Less offers expert carpet and upholstery cleaning across Queensferry and Deeside. Our dedicated team delivers reliable, professional cleaning using eco-friendly solutions, providing spotless results at genuinely competitive prices.",
    nearbyAreas: ["deeside", "shotton", "connahs-quay", "chester", "saltney", "blacon", "flint"],
    region: "North Wales",
  },
  {
    name: "Shotton",
    slug: "shotton",
    description:
      "Looking for professional carpet cleaning in Shotton? Fresh For Less delivers thorough carpet and upholstery cleaning throughout Shotton and Deeside. Our professional team uses advanced equipment and eco-friendly products to ensure your carpets are deep-cleaned and refreshed at fair prices.",
    nearbyAreas: ["connahs-quay", "queensferry", "deeside", "flint", "buckley", "chester", "mold"],
    region: "North Wales",
  },
  {
    name: "Connah's Quay",
    slug: "connahs-quay",
    description:
      "Looking for professional carpet cleaning in Connah's Quay? Fresh For Less provides reliable carpet and upholstery cleaning across Connah's Quay and Deeside. Our experienced local team uses eco-friendly products and professional techniques to deliver exceptional cleaning results at competitive rates.",
    nearbyAreas: ["shotton", "queensferry", "deeside", "flint", "buckley", "mold", "chester"],
    region: "North Wales",
  },
  {
    name: "Buckley",
    slug: "buckley",
    description:
      "Looking for professional carpet cleaning in Buckley? Fresh For Less serves Buckley with premium carpet and upholstery cleaning at competitive prices. Our skilled technicians use modern cleaning methods and eco-friendly solutions to deliver deep-cleaning results that exceed expectations.",
    nearbyAreas: ["mold", "connahs-quay", "flint", "deeside", "wrexham", "chester", "shotton"],
    region: "North Wales",
  },
  {
    name: "Holywell",
    slug: "holywell",
    description:
      "Looking for professional carpet cleaning in Holywell? Fresh For Less provides affordable carpet and upholstery cleaning throughout Holywell and north Flintshire. Our professional team delivers outstanding results using eco-friendly products and advanced cleaning techniques at honest prices.",
    nearbyAreas: ["flint", "mold", "prestatyn", "rhyl", "connahs-quay", "denbigh", "buckley"],
    region: "North Wales",
  },
  {
    name: "Rhyl",
    slug: "rhyl",
    description:
      "Looking for professional carpet cleaning in Rhyl? Fresh For Less delivers expert carpet and upholstery cleaning across Rhyl and the north Wales coast. Our dedicated team provides reliable service using eco-friendly products, ensuring your carpets are spotlessly clean at affordable prices.",
    nearbyAreas: ["prestatyn", "abergele", "denbigh", "colwyn-bay", "holywell", "flint", "mold"],
    region: "North Wales",
  },
  {
    name: "Prestatyn",
    slug: "prestatyn",
    description:
      "Looking for professional carpet cleaning in Prestatyn? Fresh For Less offers high-quality carpet and upholstery cleaning throughout Prestatyn. Our experienced team uses eco-friendly cleaning solutions and professional-grade equipment to deliver thorough results at prices that represent excellent value.",
    nearbyAreas: ["rhyl", "holywell", "abergele", "denbigh", "flint", "colwyn-bay", "mold"],
    region: "North Wales",
  },
  {
    name: "Colwyn Bay",
    slug: "colwyn-bay",
    description:
      "Looking for professional carpet cleaning in Colwyn Bay? Fresh For Less provides expert carpet and upholstery cleaning across Colwyn Bay and the north Wales coast. Our professional team delivers exceptional results using eco-friendly products and modern cleaning techniques at competitive rates.",
    nearbyAreas: ["abergele", "llandudno", "conwy", "rhyl", "prestatyn", "denbigh", "bangor"],
    region: "North Wales",
  },
  {
    name: "Llandudno",
    slug: "llandudno",
    description:
      "Looking for professional carpet cleaning in Llandudno? Fresh For Less serves Llandudno with outstanding carpet and upholstery cleaning at affordable prices. Our skilled team uses advanced cleaning technology and eco-friendly solutions to deliver deep-cleaning results for homes and holiday properties.",
    nearbyAreas: ["conwy", "colwyn-bay", "bangor", "abergele", "caernarfon", "rhyl", "prestatyn"],
    region: "North Wales",
  },
  {
    name: "Bangor",
    slug: "bangor",
    description:
      "Looking for professional carpet cleaning in Bangor? Fresh For Less delivers premium carpet and upholstery cleaning across Bangor and Gwynedd. Our dedicated local team provides thorough cleaning using eco-friendly products, ensuring exceptional results for homes and businesses at honest prices.",
    nearbyAreas: ["caernarfon", "llandudno", "conwy", "colwyn-bay", "pwllheli", "abergele", "mold"],
    region: "North Wales",
  },
  {
    name: "Conwy",
    slug: "conwy",
    description:
      "Looking for professional carpet cleaning in Conwy? Fresh For Less provides reliable carpet and upholstery cleaning throughout Conwy and the surrounding area. Our professional team uses eco-friendly solutions and modern equipment to deliver spotless results at genuinely competitive prices.",
    nearbyAreas: ["llandudno", "colwyn-bay", "bangor", "abergele", "caernarfon", "rhyl", "prestatyn"],
    region: "North Wales",
  },
  {
    name: "Caernarfon",
    slug: "caernarfon",
    description:
      "Looking for professional carpet cleaning in Caernarfon? Fresh For Less offers expert carpet and upholstery cleaning across Caernarfon and Gwynedd. Our experienced team delivers reliable, high-quality cleaning using eco-friendly products, providing outstanding results at prices that suit every budget.",
    nearbyAreas: ["bangor", "pwllheli", "llandudno", "conwy", "colwyn-bay", "mold", "wrexham"],
    region: "North Wales",
  },
  {
    name: "Ruthin",
    slug: "ruthin",
    description:
      "Looking for professional carpet cleaning in Ruthin? Fresh For Less delivers thorough carpet and upholstery cleaning across Ruthin and the Vale of Clwyd. Our skilled team uses professional equipment and eco-friendly cleaning solutions to ensure your carpets look their absolute best at fair prices.",
    nearbyAreas: ["denbigh", "mold", "wrexham", "chester", "rhyl", "prestatyn", "flint"],
    region: "North Wales",
  },
  {
    name: "Denbigh",
    slug: "denbigh",
    description:
      "Looking for professional carpet cleaning in Denbigh? Fresh For Less provides affordable carpet and upholstery cleaning throughout Denbigh and Denbighshire. Our professional team delivers outstanding deep-cleaning results using eco-friendly products, with fast turnaround and reliable service.",
    nearbyAreas: ["ruthin", "rhyl", "prestatyn", "mold", "abergele", "colwyn-bay", "holywell"],
    region: "North Wales",
  },
  {
    name: "Abergele",
    slug: "abergele",
    description:
      "Looking for professional carpet cleaning in Abergele? Fresh For Less serves Abergele with high-quality carpet and upholstery cleaning at competitive prices. Our experienced team uses eco-friendly products and advanced cleaning methods to deliver exceptional results for homes and businesses.",
    nearbyAreas: ["colwyn-bay", "rhyl", "llandudno", "conwy", "prestatyn", "denbigh", "bangor"],
    region: "North Wales",
  },
  {
    name: "Pwllheli",
    slug: "pwllheli",
    description:
      "Looking for professional carpet cleaning in Pwllheli? Fresh For Less provides expert carpet and upholstery cleaning across Pwllheli and the Llyn Peninsula. Our dedicated team delivers thorough cleaning using eco-friendly solutions, ensuring your carpets are beautifully refreshed at honest, affordable prices.",
    nearbyAreas: ["caernarfon", "bangor", "llandudno", "conwy", "colwyn-bay", "wrexham", "mold"],
    region: "North Wales",
  },

  // ─── MANCHESTER ──────────────────────────────────────
  {
    name: "Manchester",
    slug: "manchester-city-centre",
    description:
      "Looking for professional carpet cleaning in Manchester? Fresh For Less delivers thorough carpet and upholstery cleaning across Manchester, the city centre and Ancoats. Our vetted local cleaners use professional hot-water extraction equipment and eco-friendly solutions, with your fixed price shown online before you book.",
    nearbyAreas: ["salford", "eccles", "irlam", "partington", "urmston", "stretford", "sale"],
    region: "Manchester",
  },
  {
    name: "Salford",
    slug: "salford",
    description:
      "Need your carpets refreshed in Salford? Fresh For Less provides affordable carpet and upholstery cleaning throughout Salford, Salford Quays and the surrounding area. See your fixed price online in about a minute — no home visit needed — and pay nothing until the work is done.",
    nearbyAreas: ["eccles", "irlam", "partington", "urmston", "stretford", "sale", "altrincham"],
    region: "Manchester",
  },
  {
    name: "Eccles",
    slug: "eccles",
    description:
      "Fresh For Less brings professional carpet and upholstery cleaning to Eccles, Monton and Winton. Deep hot-water extraction cleaning, stain and pet-odour treatment and fast drying times, all at fixed prices you can see online before you book.",
    nearbyAreas: ["irlam", "partington", "urmston", "stretford", "sale", "altrincham", "timperley"],
    region: "Manchester",
  },
  {
    name: "Irlam",
    slug: "irlam",
    description:
      "Looking for a reliable carpet cleaner in Irlam? Fresh For Less serves Irlam, Cadishead and the surrounding area, with vetted, insured local cleaners. Fixed prices online, morning or afternoon slots, and nothing to pay upfront.",
    nearbyAreas: ["partington", "urmston", "stretford", "sale", "altrincham", "timperley", "hale"],
    region: "Manchester",
  },
  {
    name: "Partington",
    slug: "partington",
    description:
      "Fresh For Less offers expert carpet and upholstery cleaning across Partington, Carrington and the surrounding area. Our experienced local cleaners lift years of wear out of carpets using professional equipment and eco-friendly products, at honest fixed prices.",
    nearbyAreas: ["urmston", "stretford", "sale", "altrincham", "timperley", "hale", "wythenshawe"],
    region: "Manchester",
  },
  {
    name: "Urmston",
    slug: "urmston",
    description:
      "Want spotless carpets in Urmston? Fresh For Less covers Urmston, Flixton and Davyhulme, with professional carpet, rug and upholstery cleaning. Instant fixed prices online, vetted insured cleaners, and a satisfaction guarantee on every job.",
    nearbyAreas: ["stretford", "sale", "altrincham", "timperley", "hale", "wythenshawe", "northenden"],
    region: "Manchester",
  },
  {
    name: "Stretford",
    slug: "stretford",
    description:
      "Fresh For Less provides top-rated carpet and upholstery cleaning in Stretford, Old Trafford and Firswood. Our skilled local team delivers outstanding deep-cleaning results using eco-friendly products, with your price fixed online before you book.",
    nearbyAreas: ["sale", "altrincham", "timperley", "hale", "wythenshawe", "northenden", "didsbury"],
    region: "Manchester",
  },
  {
    name: "Sale",
    slug: "sale",
    description:
      "After a professional carpet clean in Sale? Fresh For Less works across Sale, Sale Moor and Brooklands, cleaning carpets, stairs, rugs and sofas at fixed online prices. Vetted local cleaners, fast drying and nothing to pay until the job is done.",
    nearbyAreas: ["altrincham", "timperley", "hale", "wythenshawe", "northenden", "didsbury", "withington"],
    region: "Manchester",
  },
  {
    name: "Altrincham",
    slug: "altrincham",
    description:
      "Looking for professional carpet cleaning in Altrincham? Fresh For Less delivers thorough carpet and upholstery cleaning across Altrincham, Bowdon and Broadheath. Our vetted local cleaners use professional hot-water extraction equipment and eco-friendly solutions, with your fixed price shown online before you book.",
    nearbyAreas: ["timperley", "hale", "wythenshawe", "northenden", "didsbury", "withington", "chorlton"],
    region: "Manchester",
  },
  {
    name: "Timperley",
    slug: "timperley",
    description:
      "Need your carpets refreshed in Timperley? Fresh For Less provides affordable carpet and upholstery cleaning throughout Timperley, Brooklands and the surrounding area. See your fixed price online in about a minute — no home visit needed — and pay nothing until the work is done.",
    nearbyAreas: ["hale", "wythenshawe", "northenden", "didsbury", "withington", "chorlton", "fallowfield"],
    region: "Manchester",
  },
  {
    name: "Hale",
    slug: "hale",
    description:
      "Fresh For Less brings professional carpet and upholstery cleaning to Hale, Hale Barns and Bowdon. Deep hot-water extraction cleaning, stain and pet-odour treatment and fast drying times, all at fixed prices you can see online before you book.",
    nearbyAreas: ["wythenshawe", "northenden", "didsbury", "withington", "chorlton", "fallowfield", "rusholme"],
    region: "Manchester",
  },
  {
    name: "Wythenshawe",
    slug: "wythenshawe",
    description:
      "Looking for a reliable carpet cleaner in Wythenshawe? Fresh For Less serves Wythenshawe, Sharston and Peel Hall, with vetted, insured local cleaners. Fixed prices online, morning or afternoon slots, and nothing to pay upfront.",
    nearbyAreas: ["northenden", "didsbury", "withington", "chorlton", "fallowfield", "rusholme", "burnage"],
    region: "Manchester",
  },
  {
    name: "Northenden",
    slug: "northenden",
    description:
      "Fresh For Less offers expert carpet and upholstery cleaning across Northenden, and the surrounding area. Our experienced local cleaners lift years of wear out of carpets using professional equipment and eco-friendly products, at honest fixed prices.",
    nearbyAreas: ["didsbury", "withington", "chorlton", "fallowfield", "rusholme", "burnage", "levenshulme"],
    region: "Manchester",
  },
  {
    name: "Didsbury",
    slug: "didsbury",
    description:
      "Want spotless carpets in Didsbury? Fresh For Less covers Didsbury, West Didsbury and East Didsbury, with professional carpet, rug and upholstery cleaning. Instant fixed prices online, vetted insured cleaners, and a satisfaction guarantee on every job.",
    nearbyAreas: ["withington", "chorlton", "fallowfield", "rusholme", "burnage", "levenshulme", "gorton"],
    region: "Manchester",
  },
  {
    name: "Withington",
    slug: "withington",
    description:
      "Fresh For Less provides top-rated carpet and upholstery cleaning in Withington, and the surrounding area. Our skilled local team delivers outstanding deep-cleaning results using eco-friendly products, with your price fixed online before you book.",
    nearbyAreas: ["chorlton", "fallowfield", "rusholme", "burnage", "levenshulme", "gorton", "denton"],
    region: "Manchester",
  },
  {
    name: "Chorlton",
    slug: "chorlton",
    description:
      "After a professional carpet clean in Chorlton? Fresh For Less works across Chorlton, Chorlton Green and Firswood, cleaning carpets, stairs, rugs and sofas at fixed online prices. Vetted local cleaners, fast drying and nothing to pay until the job is done.",
    nearbyAreas: ["fallowfield", "rusholme", "burnage", "levenshulme", "gorton", "denton", "droylsden"],
    region: "Manchester",
  },
  {
    name: "Fallowfield",
    slug: "fallowfield",
    description:
      "Looking for professional carpet cleaning in Fallowfield? Fresh For Less delivers thorough carpet and upholstery cleaning across Fallowfield, and the surrounding area. Our vetted local cleaners use professional hot-water extraction equipment and eco-friendly solutions, with your fixed price shown online before you book.",
    nearbyAreas: ["rusholme", "burnage", "levenshulme", "gorton", "denton", "droylsden", "failsworth"],
    region: "Manchester",
  },
  {
    name: "Rusholme",
    slug: "rusholme",
    description:
      "Need your carpets refreshed in Rusholme? Fresh For Less provides affordable carpet and upholstery cleaning throughout Rusholme, Victoria Park and the surrounding area. See your fixed price online in about a minute — no home visit needed — and pay nothing until the work is done.",
    nearbyAreas: ["burnage", "levenshulme", "gorton", "denton", "droylsden", "failsworth", "ashton-under-lyne"],
    region: "Manchester",
  },
  {
    name: "Burnage",
    slug: "burnage",
    description:
      "Fresh For Less brings professional carpet and upholstery cleaning to Burnage, and the surrounding area. Deep hot-water extraction cleaning, stain and pet-odour treatment and fast drying times, all at fixed prices you can see online before you book.",
    nearbyAreas: ["levenshulme", "gorton", "denton", "droylsden", "failsworth", "ashton-under-lyne", "mossley"],
    region: "Manchester",
  },
  {
    name: "Levenshulme",
    slug: "levenshulme",
    description:
      "Looking for a reliable carpet cleaner in Levenshulme? Fresh For Less serves Levenshulme, and the surrounding area, with vetted, insured local cleaners. Fixed prices online, morning or afternoon slots, and nothing to pay upfront.",
    nearbyAreas: ["gorton", "denton", "droylsden", "failsworth", "ashton-under-lyne", "mossley", "oldham"],
    region: "Manchester",
  },
  {
    name: "Gorton",
    slug: "gorton",
    description:
      "Fresh For Less offers expert carpet and upholstery cleaning across Gorton, Abbey Hey and the surrounding area. Our experienced local cleaners lift years of wear out of carpets using professional equipment and eco-friendly products, at honest fixed prices.",
    nearbyAreas: ["denton", "droylsden", "failsworth", "ashton-under-lyne", "mossley", "oldham", "royton"],
    region: "Manchester",
  },
  {
    name: "Denton",
    slug: "denton",
    description:
      "Want spotless carpets in Denton? Fresh For Less covers Denton, Audenshaw and Haughton Green, with professional carpet, rug and upholstery cleaning. Instant fixed prices online, vetted insured cleaners, and a satisfaction guarantee on every job.",
    nearbyAreas: ["droylsden", "failsworth", "ashton-under-lyne", "mossley", "oldham", "royton", "middleton"],
    region: "Manchester",
  },
  {
    name: "Droylsden",
    slug: "droylsden",
    description:
      "Fresh For Less provides top-rated carpet and upholstery cleaning in Droylsden, and the surrounding area. Our skilled local team delivers outstanding deep-cleaning results using eco-friendly products, with your price fixed online before you book.",
    nearbyAreas: ["failsworth", "ashton-under-lyne", "mossley", "oldham", "royton", "middleton", "prestwich"],
    region: "Manchester",
  },
  {
    name: "Failsworth",
    slug: "failsworth",
    description:
      "After a professional carpet clean in Failsworth? Fresh For Less works across Failsworth, and the surrounding area, cleaning carpets, stairs, rugs and sofas at fixed online prices. Vetted local cleaners, fast drying and nothing to pay until the job is done.",
    nearbyAreas: ["ashton-under-lyne", "mossley", "oldham", "royton", "middleton", "prestwich", "whitefield"],
    region: "Manchester",
  },
  {
    name: "Ashton-under-Lyne",
    slug: "ashton-under-lyne",
    description:
      "Looking for professional carpet cleaning in Ashton-under-Lyne? Fresh For Less delivers thorough carpet and upholstery cleaning across Ashton-under-Lyne, and the surrounding Tameside area. Our vetted local cleaners use professional hot-water extraction equipment and eco-friendly solutions, with your fixed price shown online before you book.",
    nearbyAreas: ["mossley", "oldham", "royton", "middleton", "prestwich", "whitefield", "bury"],
    region: "Manchester",
  },
  {
    name: "Mossley",
    slug: "mossley",
    description:
      "Need your carpets refreshed in Mossley? Fresh For Less provides affordable carpet and upholstery cleaning throughout Mossley, and the surrounding area. See your fixed price online in about a minute — no home visit needed — and pay nothing until the work is done.",
    nearbyAreas: ["oldham", "royton", "middleton", "prestwich", "whitefield", "bury", "radcliffe"],
    region: "Manchester",
  },
  {
    name: "Oldham",
    slug: "oldham",
    description:
      "Fresh For Less brings professional carpet and upholstery cleaning to Oldham, and the surrounding area. Deep hot-water extraction cleaning, stain and pet-odour treatment and fast drying times, all at fixed prices you can see online before you book.",
    nearbyAreas: ["royton", "middleton", "prestwich", "whitefield", "bury", "radcliffe", "swinton"],
    region: "Manchester",
  },
  {
    name: "Royton",
    slug: "royton",
    description:
      "Looking for a reliable carpet cleaner in Royton? Fresh For Less serves Royton, Shaw and the surrounding area, with vetted, insured local cleaners. Fixed prices online, morning or afternoon slots, and nothing to pay upfront.",
    nearbyAreas: ["middleton", "prestwich", "whitefield", "bury", "radcliffe", "swinton", "worsley"],
    region: "Manchester",
  },
  {
    name: "Middleton",
    slug: "middleton",
    description:
      "Fresh For Less offers expert carpet and upholstery cleaning across Middleton, Alkrington and the surrounding area. Our experienced local cleaners lift years of wear out of carpets using professional equipment and eco-friendly products, at honest fixed prices.",
    nearbyAreas: ["prestwich", "whitefield", "bury", "radcliffe", "swinton", "worsley", "walkden"],
    region: "Manchester",
  },
  {
    name: "Prestwich",
    slug: "prestwich",
    description:
      "Want spotless carpets in Prestwich? Fresh For Less covers Prestwich, and the surrounding area, with professional carpet, rug and upholstery cleaning. Instant fixed prices online, vetted insured cleaners, and a satisfaction guarantee on every job.",
    nearbyAreas: ["whitefield", "bury", "radcliffe", "swinton", "worsley", "walkden", "manchester-city-centre"],
    region: "Manchester",
  },
  {
    name: "Whitefield",
    slug: "whitefield",
    description:
      "Fresh For Less provides top-rated carpet and upholstery cleaning in Whitefield, and the surrounding area. Our skilled local team delivers outstanding deep-cleaning results using eco-friendly products, with your price fixed online before you book.",
    nearbyAreas: ["bury", "radcliffe", "swinton", "worsley", "walkden", "manchester-city-centre", "salford"],
    region: "Manchester",
  },
  {
    name: "Bury",
    slug: "bury",
    description:
      "After a professional carpet clean in Bury? Fresh For Less works across Bury, and the surrounding area, cleaning carpets, stairs, rugs and sofas at fixed online prices. Vetted local cleaners, fast drying and nothing to pay until the job is done.",
    nearbyAreas: ["radcliffe", "swinton", "worsley", "walkden", "manchester-city-centre", "salford", "eccles"],
    region: "Manchester",
  },
  {
    name: "Radcliffe",
    slug: "radcliffe",
    description:
      "Looking for professional carpet cleaning in Radcliffe? Fresh For Less delivers thorough carpet and upholstery cleaning across Radcliffe, and the surrounding area. Our vetted local cleaners use professional hot-water extraction equipment and eco-friendly solutions, with your fixed price shown online before you book.",
    nearbyAreas: ["swinton", "worsley", "walkden", "manchester-city-centre", "salford", "eccles", "irlam"],
    region: "Manchester",
  },
  {
    name: "Swinton",
    slug: "swinton",
    description:
      "Need your carpets refreshed in Swinton? Fresh For Less provides affordable carpet and upholstery cleaning throughout Swinton, Pendlebury and Clifton. See your fixed price online in about a minute — no home visit needed — and pay nothing until the work is done.",
    nearbyAreas: ["worsley", "walkden", "manchester-city-centre", "salford", "eccles", "irlam", "partington"],
    region: "Manchester",
  },
  {
    name: "Worsley",
    slug: "worsley",
    description:
      "Fresh For Less brings professional carpet and upholstery cleaning to Worsley, Boothstown and the surrounding area. Deep hot-water extraction cleaning, stain and pet-odour treatment and fast drying times, all at fixed prices you can see online before you book.",
    nearbyAreas: ["walkden", "manchester-city-centre", "salford", "eccles", "irlam", "partington", "urmston"],
    region: "Manchester",
  },
  {
    name: "Walkden",
    slug: "walkden",
    description:
      "Looking for a reliable carpet cleaner in Walkden? Fresh For Less serves Walkden, Little Hulton and the surrounding area, with vetted, insured local cleaners. Fixed prices online, morning or afternoon slots, and nothing to pay upfront.",
    nearbyAreas: ["manchester-city-centre", "salford", "eccles", "irlam", "partington", "urmston", "stretford"],
    region: "Manchester",
  },
  // ─── STOCKPORT ───────────────────────────────────────
  {
    name: "Stockport",
    slug: "stockport",
    description:
      "Looking for professional carpet cleaning in Stockport? Fresh For Less delivers thorough carpet and upholstery cleaning across Stockport, Edgeley and Davenport. Our vetted local cleaners use professional hot-water extraction equipment and eco-friendly solutions, with your fixed price shown online before you book.",
    nearbyAreas: ["heaton-moor", "heaton-mersey", "reddish", "gatley", "cheadle", "cheadle-hulme", "bramhall"],
    region: "Stockport",
  },
  {
    name: "Heaton Moor",
    slug: "heaton-moor",
    description:
      "Need your carpets refreshed in Heaton Moor? Fresh For Less provides affordable carpet and upholstery cleaning throughout Heaton Moor, and the Four Heatons. See your fixed price online in about a minute — no home visit needed — and pay nothing until the work is done.",
    nearbyAreas: ["heaton-mersey", "reddish", "gatley", "cheadle", "cheadle-hulme", "bramhall", "hazel-grove"],
    region: "Stockport",
  },
  {
    name: "Heaton Mersey",
    slug: "heaton-mersey",
    description:
      "Fresh For Less brings professional carpet and upholstery cleaning to Heaton Mersey, Heaton Norris and the surrounding area. Deep hot-water extraction cleaning, stain and pet-odour treatment and fast drying times, all at fixed prices you can see online before you book.",
    nearbyAreas: ["reddish", "gatley", "cheadle", "cheadle-hulme", "bramhall", "hazel-grove", "marple"],
    region: "Stockport",
  },
  {
    name: "Reddish",
    slug: "reddish",
    description:
      "Looking for a reliable carpet cleaner in Reddish? Fresh For Less serves Reddish, and the surrounding area, with vetted, insured local cleaners. Fixed prices online, morning or afternoon slots, and nothing to pay upfront.",
    nearbyAreas: ["gatley", "cheadle", "cheadle-hulme", "bramhall", "hazel-grove", "marple", "romiley"],
    region: "Stockport",
  },
  {
    name: "Gatley",
    slug: "gatley",
    description:
      "Fresh For Less offers expert carpet and upholstery cleaning across Gatley, and the surrounding area. Our experienced local cleaners lift years of wear out of carpets using professional equipment and eco-friendly products, at honest fixed prices.",
    nearbyAreas: ["cheadle", "cheadle-hulme", "bramhall", "hazel-grove", "marple", "romiley", "hyde"],
    region: "Stockport",
  },
  {
    name: "Cheadle",
    slug: "cheadle",
    description:
      "Want spotless carpets in Cheadle? Fresh For Less covers Cheadle, and Cheadle Heath, with professional carpet, rug and upholstery cleaning. Instant fixed prices online, vetted insured cleaners, and a satisfaction guarantee on every job.",
    nearbyAreas: ["cheadle-hulme", "bramhall", "hazel-grove", "marple", "romiley", "hyde", "dukinfield"],
    region: "Stockport",
  },
  {
    name: "Cheadle Hulme",
    slug: "cheadle-hulme",
    description:
      "Fresh For Less provides top-rated carpet and upholstery cleaning in Cheadle Hulme, and the surrounding area. Our skilled local team delivers outstanding deep-cleaning results using eco-friendly products, with your price fixed online before you book.",
    nearbyAreas: ["bramhall", "hazel-grove", "marple", "romiley", "hyde", "dukinfield", "stalybridge"],
    region: "Stockport",
  },
  {
    name: "Bramhall",
    slug: "bramhall",
    description:
      "After a professional carpet clean in Bramhall? Fresh For Less works across Bramhall, Woodford and the surrounding area, cleaning carpets, stairs, rugs and sofas at fixed online prices. Vetted local cleaners, fast drying and nothing to pay until the job is done.",
    nearbyAreas: ["hazel-grove", "marple", "romiley", "hyde", "dukinfield", "stalybridge", "stockport"],
    region: "Stockport",
  },
  {
    name: "Hazel Grove",
    slug: "hazel-grove",
    description:
      "Looking for professional carpet cleaning in Hazel Grove? Fresh For Less delivers thorough carpet and upholstery cleaning across Hazel Grove, and the surrounding area. Our vetted local cleaners use professional hot-water extraction equipment and eco-friendly solutions, with your fixed price shown online before you book.",
    nearbyAreas: ["marple", "romiley", "hyde", "dukinfield", "stalybridge", "stockport", "heaton-moor"],
    region: "Stockport",
  },
  {
    name: "Marple",
    slug: "marple",
    description:
      "Need your carpets refreshed in Marple? Fresh For Less provides affordable carpet and upholstery cleaning throughout Marple, Marple Bridge and Mellor. See your fixed price online in about a minute — no home visit needed — and pay nothing until the work is done.",
    nearbyAreas: ["romiley", "hyde", "dukinfield", "stalybridge", "stockport", "heaton-moor", "heaton-mersey"],
    region: "Stockport",
  },
  {
    name: "Romiley",
    slug: "romiley",
    description:
      "Fresh For Less brings professional carpet and upholstery cleaning to Romiley, Woodley and Bredbury. Deep hot-water extraction cleaning, stain and pet-odour treatment and fast drying times, all at fixed prices you can see online before you book.",
    nearbyAreas: ["hyde", "dukinfield", "stalybridge", "stockport", "heaton-moor", "heaton-mersey", "reddish"],
    region: "Stockport",
  },
  {
    name: "Hyde",
    slug: "hyde",
    description:
      "Looking for a reliable carpet cleaner in Hyde? Fresh For Less serves Hyde, Gee Cross and the surrounding area, with vetted, insured local cleaners. Fixed prices online, morning or afternoon slots, and nothing to pay upfront.",
    nearbyAreas: ["dukinfield", "stalybridge", "stockport", "heaton-moor", "heaton-mersey", "reddish", "gatley"],
    region: "Stockport",
  },
  {
    name: "Dukinfield",
    slug: "dukinfield",
    description:
      "Fresh For Less offers expert carpet and upholstery cleaning across Dukinfield, and the surrounding area. Our experienced local cleaners lift years of wear out of carpets using professional equipment and eco-friendly products, at honest fixed prices.",
    nearbyAreas: ["stalybridge", "stockport", "heaton-moor", "heaton-mersey", "reddish", "gatley", "cheadle"],
    region: "Stockport",
  },
  {
    name: "Stalybridge",
    slug: "stalybridge",
    description:
      "Want spotless carpets in Stalybridge? Fresh For Less covers Stalybridge, and the surrounding area, with professional carpet, rug and upholstery cleaning. Instant fixed prices online, vetted insured cleaners, and a satisfaction guarantee on every job.",
    nearbyAreas: ["stockport", "heaton-moor", "heaton-mersey", "reddish", "gatley", "cheadle", "cheadle-hulme"],
    region: "Stockport",
  },
  // ─── EAST CHESHIRE ───────────────────────────────────
  {
    name: "Wilmslow",
    slug: "wilmslow",
    description:
      "Looking for professional carpet cleaning in Wilmslow? Fresh For Less delivers thorough carpet and upholstery cleaning across Wilmslow, Alderley Edge and the surrounding area. Our vetted local cleaners use professional hot-water extraction equipment and eco-friendly solutions, with your fixed price shown online before you book.",
    nearbyAreas: ["handforth", "poynton", "macclesfield", "bollington"],
    region: "East Cheshire",
  },
  {
    name: "Handforth",
    slug: "handforth",
    description:
      "Need your carpets refreshed in Handforth? Fresh For Less provides affordable carpet and upholstery cleaning throughout Handforth, and the surrounding area. See your fixed price online in about a minute — no home visit needed — and pay nothing until the work is done.",
    nearbyAreas: ["poynton", "macclesfield", "bollington", "wilmslow"],
    region: "East Cheshire",
  },
  {
    name: "Poynton",
    slug: "poynton",
    description:
      "Fresh For Less brings professional carpet and upholstery cleaning to Poynton, and the surrounding area. Deep hot-water extraction cleaning, stain and pet-odour treatment and fast drying times, all at fixed prices you can see online before you book.",
    nearbyAreas: ["macclesfield", "bollington", "wilmslow", "handforth"],
    region: "East Cheshire",
  },
  {
    name: "Macclesfield",
    slug: "macclesfield",
    description:
      "Looking for a reliable carpet cleaner in Macclesfield? Fresh For Less serves Macclesfield, Tytherington and the surrounding area, with vetted, insured local cleaners. Fixed prices online, morning or afternoon slots, and nothing to pay upfront.",
    nearbyAreas: ["bollington", "wilmslow", "handforth", "poynton"],
    region: "East Cheshire",
  },
  {
    name: "Bollington",
    slug: "bollington",
    description:
      "Fresh For Less offers expert carpet and upholstery cleaning across Bollington, Prestbury and the surrounding area. Our experienced local cleaners lift years of wear out of carpets using professional equipment and eco-friendly products, at honest fixed prices.",
    nearbyAreas: ["wilmslow", "handforth", "poynton", "macclesfield"],
    region: "East Cheshire",
  },
];

export function getAreaBySlug(slug: string): Area | undefined {
  return areas.find((a) => a.slug === slug);
}

export function getAreasByRegion(region: string): Area[] {
  return areas.filter((a) => a.region === region);
}
