export interface BreedData {
  fact:  string;
  photo: string;
}

export const BREED_DATA: Record<string, BreedData> = {

  // Retrievers & Spaniels
  "Labrador Retriever": {
    fact:  "Labs have a genetic mutation that switches off the 'I'm full' signal in their brain. Basically, hunger is their factory setting - which explains a lot.",
    photo: "https://images.unsplash.com/photo-1507660392550-9aff6e04c7e5?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Golden Retriever": {
    fact:  "Goldens were bred to gently carry game without damaging it. This is why they put literally everything in their mouth - shoes, TV remotes, your heart.",
    photo: "https://images.unsplash.com/photo-1612464321028-0e86f94b2c52?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Cocker Spaniel": {
    fact:  "Cocker Spaniels were named after the woodcock bird they hunted. These days they hunt exclusively for belly rubs and someone to sit next to on the sofa.",
    photo: "https://images.unsplash.com/photo-1651492017098-3229dc8a8d82?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Cavalier King Charles Spaniel": {
    fact:  "King Charles II loved Cavaliers so much he issued a royal decree allowing them into any public building in England. Dogs: 1. Everyone else: 0.",
    photo: "https://images.unsplash.com/photo-1724525819817-3adfb3f792ce?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Springer Spaniel": {
    fact:  "Springer Spaniels got their name from their job of 'springing' game birds into the air for hunters. They still do this with anything they find exciting — including you.",
    photo: "https://www.zooplus.co.uk/magazine/wp-content/uploads/2025/03/English-Springer-Spaniel-Glucklich-1024x682-1.webp",
  },

  // Bulldogs & Brachycephalics 
  "French Bulldog": {
    fact:  "Frenchies physically cannot swim due to their top-heavy build and short snout. They are, functionally, adorable little bricks. Handle accordingly near water.",
    photo: "https://images.unsplash.com/photo-1583511666445-775f1f2116f5?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Bulldog": {
    fact:  "Bulldogs sleep around 12–14 hours a day. If you were hoping for a high-energy companion, we regret to inform you this is not that.",
    photo: "https://images.unsplash.com/photo-1648047116702-498bb37a5f64?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Pug": {
    fact:  "The collective noun for a group of Pugs is a 'grumble'. Scientists and linguists worldwide agree this is the single most accurate collective noun ever devised.",
    photo: "https://plus.unsplash.com/premium_photo-1726812033741-e774c2721a4b?q=80&w=1120&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Boston Terrier": {
    fact:  "Boston Terriers were the first dog breed developed in the USA. They were nicknamed 'The American Gentleman' due to their tuxedo-like markings. Very distinguished.",
    photo: "https://images.unsplash.com/photo-1623010830364-860f2c821d5d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Shih Tzu": {
    fact:  "Shih Tzus were kept by Chinese emperors and bred exclusively as palace companions. They were considered so precious they weren't sold or given to outsiders for centuries.",
    photo: "https://images.unsplash.com/photo-1589210043112-d4835d91b37a?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },

  // Shepherds & Working Dogs 
  "German Shepherd Dog": {
    fact:  "German Shepherds are so intelligent they've been trained to detect cancer by smell with over 90% accuracy. Your doctor went to medical school. Your German Shepherd just sniffed it out.",
    photo: "https://images.unsplash.com/photo-1612908047639-6ad3640525af?q=80&w=696&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Border Collie": {
    fact:  "A Border Collie named Chaser learned the names of over 1,000 individual objects - the largest vocabulary ever recorded in a non-human. She also knew what 'fetch the red ball' meant. Extraordinary.",
    photo: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Australian Shepherd": {
    fact:  "Despite the name, Australian Shepherds were actually developed in the American West. They were named 'Australian' simply because some of their ancestors came via Australia. Marketing.",
    photo: "https://images.unsplash.com/photo-1692003122872-6400308772d5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Bernese Mountain Dog": {
    fact:  "Bernese Mountain Dogs were farm dogs in the Swiss Alps - herding cattle, pulling carts and keeping watch. Today they mostly herd their owners toward the couch.",    photo: "https://images.unsplash.com/photo-1516033851233-059aa55b0fce?q=80&w=685&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Rottweiler": {
    fact:  "Rottweilers used to walk alongside butchers in ancient Rome, pulling meat carts and guarding earnings. The breed is essentially a retired soldier who now just wants cuddles.",
    photo: "https://images.unsplash.com/photo-1699927198290-b3249ca68361?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Doberman Pinscher": {
    fact:  "The Doberman was created by a tax collector named Karl Dobermann who wanted protection on his rounds. He essentially invented one of history's most formidable dogs out of self-interest. Respect.",
    photo: "https://images.unsplash.com/photo-1536677412572-c277de11e458?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Siberian Husky": {
    fact:  "Huskies were bred by the Chukchi people to run up to 150 miles a day on minimal food. In 1925, a Husky relay team ran 658 miles through an Alaskan blizzard to deliver life-saving medicine. Absolute legends.",
    photo: "https://images.unsplash.com/photo-1617895153857-82fe79adfcd4?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Alaskan Malamute": {
    fact:  "Malamutes are one of the oldest sled dog breeds, largely unchanged for thousands of years. They helped Arctic explorers survive. They also still think they are in charge.",
    photo: "https://geniusvets.s3.amazonaws.com/gv-blog/2023/alaskanmalamutesquare2.jpg",
  },
  "Boxer": {
    fact:  "Boxers were named for their habit of standing on their hind legs and pawing the air with their front paws during play. They have been doing this move since before it was cool.",
    photo: "https://images.unsplash.com/photo-1442605527737-ed62b867591f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Great Dane": {
    fact:  "The tallest dog ever recorded was a Great Dane named Zeus, measuring 111.8 cm at the shoulder. He could rest his head on the kitchen counter without any effort at all.",
    photo: "https://images.unsplash.com/photo-1676290481967-4722005671a1?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },

  // Terriers 
  "Yorkshire Terrier": {
    fact:  "Yorkies were originally bred to hunt rats in Yorkshire textile mills. They now predominantly hunt for their spot under the duvet and the finest treats available.",
    photo: "https://images.unsplash.com/photo-1526440847959-4e38e7f00b04?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Jack Russell Terrier": {
    fact:  "Jack Russells were bred to bolt foxes from their dens. With boundless energy and zero regard for their own size, they will take on anything. Including you at 6am.",
    photo: "https://images.unsplash.com/photo-1597513299114-bfab8234a241?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Bull Terrier": {
    fact:  "Bull Terriers have a uniquely egg-shaped head unlike any other breed. Their eyes are small, dark and deeply set - giving them the permanent expression of someone who has seen things.",
    photo: "https://cdn.mos.cms.futurecdn.net/c9NjT5bXA84ZfjeZC25iLB-1920-80.jpg",
  },
  "Miniature Schnauzer": {
    fact:  "Miniature Schnauzers have genuinely expressive eyebrows. They use them constantly. Every raised eyebrow is a complete sentence. You will understand each one.",
    photo: "https://yumove.co.uk/cdn/shop/files/Miniature-Schnauzer.jpg?v=1749660104",
  },
  "Scottish Terrier": {
    fact:  "Scotties have been owned by more US presidents than any other breed. Franklin D. Roosevelt's Scottie, Fala, even got his own paragraph in FDR's memorial. A paragraph! For a dog!",
    photo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Scottish_Terrier_Photo_of_Face.jpg",
  },
  "West Highland White Terrier": {
    fact:  "Westies were bred to be white so hunters wouldn't accidentally shoot them in the field. They've maintained this level of excellent self-preservation instinct ever since.",
    photo: "https://eu-central-1.graphassets.com/AnwjgMYRvQfWK3bRPjoq3z/resize=height:608,width:1080/output=format:webp/pRlvgczCTKNq8IxzoTN5",
  },

  //  Scent & Hound Breeds
  "Beagle": {
    fact:  "A Beagle's nose contains approximately 225 million scent receptors. Humans have around 5 million. When your Beagle goes for a walk, they are essentially reading an entire newspaper with their face.",
    photo: "https://images.unsplash.com/photo-1611306133736-56a3b973b2cc?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Dachshund": {
    fact:  "Dachshunds were bred to hunt badgers - their name literally means 'badger dog' in German. A small, long dog was sent underground to fight a badger. Dachshunds remain unbothered by this history.",
    photo: "https://images.unsplash.com/photo-1618265341355-d0e2d1fdf26b?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Basset Hound": {
    fact:  "Basset Hounds have the second-best nose in the dog world after Bloodhounds. Their long ears aren't just decorative - they sweep scent particles upward toward the nose. Nature's own smell-funnel.",
    photo: "https://www.zooplus.co.uk/magazine/wp-content/uploads/2019/01/Basset-hound-in-the-grass.webp",
  },
  "Bloodhound": {
    fact:  "A Bloodhound's scent trail is admissible as legal evidence in US courts. No other dog can claim this. They are, technically, certified detectives.",
    photo: "https://cdn.britannica.com/15/8115-050-17220A98/Dogs-bloodhounds-humans-scent-tracking.jpg",
  },
  "Greyhound": {
    fact:  "Greyhounds can accelerate from 0 to 72 km/h in just 6 strides. They are also Olympic-level nap-takers and are perfectly happy doing absolutely nothing for hours at a time. A dog of contrasts.",
    photo: "https://images.unsplash.com/photo-1550268729-a30bcee78dca?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Whippet": {
    fact:  "Whippets are the fastest accelerating dog breed. They are also extraordinarily gentle and love warmth - often found burrowed under blankets even in summer. Speed and snuggles in one lean package.",
    photo: "https://images.unsplash.com/photo-1633835080106-0832760e904b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },

  // Toy & Companion Breeds 
  "Chihuahua": {
    fact:  "Chihuahuas are the smallest dog breed but genuinely believe they are the largest. No amount of evidence will convince them otherwise. This confidence is not teachable; they were born with it.",
    photo: "https://images.unsplash.com/photo-1513757271804-385fb022e70a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Pomeranian": {
    fact:  "Pomeranians used to weigh 30 pounds and were sled-pulling dogs. Breeders miniaturised them over centuries - but kept every bit of the attitude. Current size: small. Current confidence: immense.",
    photo: "https://images.unsplash.com/photo-1582456891925-a53965520520?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Maltese": {
    fact:  "Maltese dogs have been lapdogs to royalty for over 2,000 years. Ancient Greeks built tombs for their Malteses. The Romans called them 'the jewel of women'. Malteses have known their worth for millennia.",
    photo: "https://images.unsplash.com/photo-1661340529386-53d959043b03?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Bichon Frise": {
    fact:  "Bichon Frises were so popular in 16th century France that they became status symbols for the aristocracy. Then the French Revolution came along and the Bichons had to become circus dogs instead. Adaptable.",
    photo: "https://images.unsplash.com/photo-1731315099269-38d767b7e50a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Papillon": {
    fact:  "Papillon means 'butterfly' in French — named for their distinctive wing-shaped ears. They're one of the oldest toy breeds, appearing in paintings alongside European royalty from the 16th century.",
    photo: "https://www.purina.co.uk/sites/default/files/styles/square_medium_440x440/public/2022-09/Papillon.jpg?h=ee77e59f&itok=_5Oez_Fi",
  },

  // Fluffy & Nordic Breeds
  "Samoyed": {
    fact:  "Samoyeds have a permanent upward curve to their lips - called the 'Samoyed smile'. It evolved to prevent drool from forming icicles in Arctic conditions. They are biologically incapable of looking miserable.",
    photo: "https://images.unsplash.com/photo-1681228792245-79ce140ccca5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Poodle": {
    fact:  "Poodles are the second most intelligent dog breed. The fancy show clips weren't decorative - they were cut to protect joints and vital organs in cold water while retrieving. Practical and stylish.",
    photo: "https://images.unsplash.com/photo-1652342516868-50eac8c9af0d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Chow Chow": {
    fact:  "Chow Chows have a blue-black tongue. Nobody is entirely sure why. They also have a lion-like mane, a bear-like face, and the aloof energy of someone who definitely doesn't need you.",
    photo: "https://images.unsplash.com/photo-1591300673309-092e8afa699b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Keeshond": {
    fact:  "Keeshonds were used as watchdogs on Dutch riverboats and canal barges in the 17th century. They wore their thick fur coat year-round and managed just fine. Very practical, very Dutch.",
    photo: "https://cdn.britannica.com/25/258225-050-99760E60/portrait-of-grey-keeshond.jpg",
  },

  // Asian Breeds 
  "Shiba Inu": {
    fact:  "The Shiba Inu became the face of the 'Doge' meme in 2013 and later inspired Dogecoin, a cryptocurrency that reached a market cap of over $80 billion. Most financially significant dog in recorded history.",
    photo: "https://images.unsplash.com/photo-1609114450169-f0656f84799e?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Akita": {
    fact:  "In Japan, receiving an Akita figurine is a traditional symbol of good health and happiness. When a baby is born, friends send Akita statues. When someone is ill, they receive one. The Akita is a living good-luck charm.",
    photo: "https://images.unsplash.com/photo-1564959888455-38991be63424?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Chinese Shar-Pei": {
    fact:  "Shar Peis were nearly extinct by the 1970s. A Hong Kong businessman placed an ad in an American magazine calling them 'the world's rarest dog'. The response saved the breed. Good copy saves lives.",
    photo: "https://images.unsplash.com/photo-1604606517419-28bb3032b553?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Japanese Chin": {
    fact:  "Japanese Chins are known for the 'Chin spin' — a happy greeting that involves spinning in tight circles. They also have a cat-like habit of washing their faces with their paws. Cats and dogs were always a false binary.",
    photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR47UyxGQgFQhJ0dCpP5UpyvY_C0pZ7uj7xw&s",
  },

  // Dalmatian & Spotted
  "Dalmatian": {
    fact:  "Dalmatians are born completely white. Their spots develop over their first few weeks of life. Each Dalmatian's spot pattern is completely unique - no two are ever the same.",
    photo: "https://images.unsplash.com/photo-1627493845137-9470d19af86e?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },

  // Setters & Pointers 
  "Irish Setter": {
    fact:  "Irish Setters are known as the clowns of the dog world. They mature slowly - some remain puppy-brained well into their third year. This is often described as endearing. By their owners. Eventually.",
    photo: "https://images.unsplash.com/photo-1550085146-e2181eb8fb82?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Weimaraner": {
    fact:  "Weimaraners are nicknamed 'the grey ghost' for their silver coats and habit of silently appearing wherever you are. They bond so intensely they will follow you into the bathroom. Every time.",
    photo: "https://images.unsplash.com/photo-1693759544183-f80c8c9b78cf?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },

  // Livestock Guardian & Mountain Dogs
  "Saint Bernard": {
    fact:  "Saint Bernards saved over 2,000 lives in the Swiss Alps over three centuries. The iconic barrel around their neck? Largely a myth invented by a 19th century artist. They were heroic without the accessories.",
    photo: "https://images.unsplash.com/photo-1562193882-0ea2da14e6e3?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "Newfoundland": {
    fact:  "Newfoundlands have webbed paws and water-resistant double coats, making them natural lifeguards. A Newfoundland named Seaman accompanied the Lewis and Clark Expedition across the American continent. An explorer and a very good dog.",
    photo: "https://funnyfuzzy.com/cdn/shop/articles/newfoundland_dog.png?v=1766479528",
  },

  // Catch-all fallback 
  "Mixed Breed": {
    fact:  "Mixed breed dogs have what scientists call 'hybrid vigour' - the genetic diversity from multiple breeds often makes them healthier and longer-lived. Your dog isn't just one great breed. They're all of them.",
    photo: "../../images/klaudia+nox.jpeg",
  },
};

// returns data for a breed or a friendly fallback
export const getBreedData = (breed: string): BreedData | null => {
  return BREED_DATA[breed] ?? null;
};