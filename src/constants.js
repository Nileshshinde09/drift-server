
export const DB_NAME = "DriftSocial"
export const MONGO_CONNECTION_URL = String(process.env.MONGO_CONNECTION_URL);
export const ACCESS_TOKEN_SECRET = String(process.env.ACCESS_TOKEN_SECRET)
export const REFRESH_TOKEN_SECRET = String(process.env.REFRESH_TOKEN_SECRET)
export const ACCESS_TOKEN_EXPIRY = String(process.env.ACCESS_TOKEN_EXPIRY)
export const REFRESH_TOKEN_EXPIRY = String(process.env.REFRESH_TOKEN_EXPIRY)
export const CLOUDINARY_CLOUD_NAME = String(process.env.CLOUDINARY_CLOUD_NAME)
export const CLOUDINARY_API_KEY = String(process.env.CLOUDINARY_API_KEY)
export const CLOUDINARY_API_SECRET = String(process.env.CLOUDINARY_API_SECRET)
export const CLOUDINARY_CLOUD_NAME_V2 = String(process.env.CLOUDINARY_CLOUD_NAME_V2)
export const CLOUDINARY_API_KEY_V2 = String(process.env.CLOUDINARY_API_KEY_V2)
export const CLOUDINARY_API_SECRET_V2 = String(process.env.CLOUDINARY_API_SECRET_V2)
export const EMAIL_OTP_EXPIRY = Number(process.env.EMAIL_OTP_EXPIRY)
export const DEFAULT_AVATAR_URL = ""
export const EMAIL_APP_LINK = String(process.env.EMAIL_APP_LINK)
export const MAILTRAP_SMTP_HOST = String(process.env.MAILTRAP_SMTP_HOST)
export const MAILTRAP_SMTP_PORT = Number(process.env.MAILTRAP_SMTP_PORT)
export const MAILTRAP_SMTP_USER = String(process.env.MAILTRAP_SMTP_USER)
export const MAILTRAP_SMTP_PASS = String(process.env.MAILTRAP_SMTP_PASS)
export const EMAIL_ID_FOR_MAIL = String(process.env.EMAIL_ID_FOR_MAIL)
export const GLOBAL_API_RATELIMITER_REQUEST_COUNT = Number(process.env.GLOBAL_API_RATELIMITER_REQUEST_COUNT)
export const RESET_PASSWORD_RATELIMITER_REQUEST_COUNT = Number(process.env.RESET_PASSWORD_RATELIMITER_REQUEST_COUNT)
export const RESET_FOROGT_PASSWORD_SECURITY_TOKEN_SECRET = String(process.env.RESET_FOROGT_PASSWORD_SECURITY_TOKEN_SECRET)
export const RESET_FOROGT_PASSWORD_TOKEN_EXPIRY = String(process.env.RESET_FOROGT_PASSWORD_TOKEN_EXPIRY)
export const REDIS_HOST = String(process.env.REDIS_HOST)
export const REDIS_PORT = Number(process.env.REDIS_PORT)

export const SocketEventEnum = Object.freeze({
    CONNECTED_EVENT: "connected",
    DISCONNECT_EVENT: "disconnect",
    SOCKET_ERROR_EVENT: "socketError",
    NOTIFICATION_MOUNT_EVENT: "notificationMountEvent",
    NOTIFICATION_ENJECT_EVENT: "notificationEnjectEvent"
});

export const NotificationMessages = Object.freeze(
    {
        VIDEO_CALL_NOTIFICATION_MESSAGE: "incomming video call..."
    }
)
export const NotificationURLs = Object.freeze(
    {
        VIDEO_CALL_NOTIFICATION_URL: "/"
    }
)
export const NotificationTypesEnum = Object.freeze({
    FRIENDS: "to-friends",
    FOLLOWERS: "to-followers",
    INDIVIDUAL: "to-individual-user",
    GROUP: "to-group-of-peoples"
});

export const CallTypesEnum = Object.freeze({
    VIDEO: "video",
    VOICE: "voice"
});

export const GENDER_TYPE = [
    "male",
    "female",
    "others"
]

export const TYPES_OF_NOTIFICATION = [
    "FriendRequest",
    "TimeTrek",
    "RateLimiter",
    "levels",
    "message",
    "JJ",
    "follow",
    "comment",
]

export const REQUEST_STATUS = [
    "Pending",  //default
    "Accepted",
    "Rejected"
]

export const PARTICIPANTS_TYPES = [
    "Participant",   //default
    "Host",
    "Co-Host",
]

export const BAN_REASONS = [
    "Sexual Remarks",
    "Violent speech/Activity",
    "Hateful or abusive Activity",
    "Harmful or dangerous Activity",
    "Spam or misleading Activity"
]

export const FEATURE_SECTIONS = [
    "Acoustics",
    "AnoGroups",
    "Comments",
    "DirectVision",
    "DM",
    "DriftMoments",
    "GroupVision",
    "JourneyJournals",
    "Melody",
    "TimeTrek",
    "Overall"
]

export const VIEWS_CONTENT_TYPES = [
    "Post",
    "Comments"
]
export const PROHIBITION_DURATION = [
    "0",
    "1 hour",
    "1 day",
    "1 week",
    "1 month",
    "2 months",
    "3 months",
    "5 months",
    "1 year",
    "Permanent"
];

export const SONG_GENERS = [
    "Pop",
    "Hip-Hop/Rap",
    "Rock",
    "Electronic/Dance",
    "R&B/Soul",
    "Indie/Alternative",
    "Country",
    "Latin",
    "Classical",
    "Jazz",
    "Folk",
    "Instrumental"
]

export const LEVEL_NAMES = [
    "Rookie",
    "Maverick",
    "Dynamo",
    "Champion",
    "Maestro",
    "Supreme",
    "Zenith"
]

export const PROFILE_BANNER = [
    //TODO: upload images on cloudinary and put here 👇👇 original URL's
    "https://dummyimage.com/600x400/000/fff&text=Anonymous+Group",
    "https://dummyimage.com/600x400/000/fff&text=Anonymous+Group",
    "https://dummyimage.com/600x400/000/fff&text=Anonymous+Group",
    "https://dummyimage.com/600x400/000/fff&text=Anonymous+Group",
    "https://dummyimage.com/600x400/000/fff&text=Anonymous+Group"
]

export const ANO_GROUP_PROFILE_IMAGE = [
    //TODO: upload images on cloudinary and put here 👇👇 original URL's
    "https://dummyimage.com/600x400/000/fff&text=Anonymous+Group",
    "https://dummyimage.com/600x400/000/fff&text=Anonymous+Group",
    "https://dummyimage.com/600x400/000/fff&text=Anonymous+Group",
    "https://dummyimage.com/600x400/000/fff&text=Anonymous+Group",
    "https://dummyimage.com/600x400/000/fff&text=Anonymous+Group"
]

export const ANO_GROP_TOPICS =
    [
        "Travel Enthusiasts",
        "Cooking and Recipes",
        "Fitness and Wellness",
        "Book Club",
        "Photography Lovers",
        "Tech Talk",
        "Art and Creativity",
        "Music Makers",
        "Movie Buffs",
        "DIY Projects",
        "Pet Lovers",
        "Gaming Community",
        "Outdoor Adventures",
        "Meditation and Mindfulness",
        "Language Exchange",
        "Career Development",
        "Fashion Trends",
        "Foodies Unite",
        "Parenting Support",
        "Environmental Conservation",
        "Financial Planning",
        "Sports Fans",
        "Local Events and Meetups",
        "Academic Discussions",
        "Political Debates",
        "Health and Nutrition",
        "Yoga and Meditation",
        "Coding and Programming",
        "Mental Health Support",
        "Sustainable Living",
        "Entrepreneurship",
        "Film Making",
        "Car Enthusiasts",
        "Gardening Tips",
        "Philosophy and Ethics",
        "Virtual Reality (VR) Enthusiasts",
        "Cosplay Community",
        "Music Production",
        "History Buffs",
        "Cryptocurrency and Blockchain",
        "DIY Home Decor",
        "Parenting Advice",
        "Travel Hacks",
        "Astronomy and Space Exploration",
        "Writing Workshops",
        "LGBTQ+ Support",
        "Community Service and Volunteering",
        "Meditation and Spirituality",
        "Fitness Challenges",
        "Local Business Networking",
        "Comedy Club",
        "Self-Improvement",
        "Interior Design Inspiration",
        "Wildlife Conservation",
        "Creative Writing",
        "Podcast Discussions",
        "Meditation Techniques",
        "Urban Exploration",
        "Current Events Analysis",
        "Relationship Advice",
        "Craft Beer Enthusiasts",
        "Street Photography",
        "Renewable Energy Solutions",
        "Movie Night Suggestions",
        "Language Learning Groups",
        "Stock Market Discussions",
        "Hiking Trails Exploration",
        "Urban Gardening",
        "Social Justice Advocacy",
        "Poetry Readings",
        "Meditation Retreat Planning",
        "DIY Electronics Projects",
        "Classic Literature Appreciation",
        "Board Games Enthusiasts",
        "Sustainable Fashion Ideas",
        "Virtual Fitness Classes",
        "Cryptocurrency Trading Tips",
        "Cooking Challenges",
        "Art Therapy Sessions",
        "Music Theory Workshops",
        "Historical Reenactments",
        "Travel Photography Tips",
        "Vegan and Vegetarian Cooking",
        "Entrepreneurial Networking",
        "Independent Film Screenings",
        "Mindful Eating Practices",
        "DIY Beauty Products",
        "Vintage Car Restorations",
        "Political Activism",
        "Nature Sketching Workshops",
        "Mindfulness in Daily Life",
        "Adventure Travel Planning",
        "Local History Tours",
        "Robotics Projects",
        "Social Media Marketing Strategies",
        "Slow Fashion Movement",
        "Sustainable Agriculture Practices",
        "DIY Upcycling Projects",
        "LGBTQ+ Film Discussions",
        "Networking for Remote Workers",
        "Film Photography Enthusiasts",
        "AI and Machine Learning Discussions",
        "Home Brewing Techniques",
        "Nature Conservation Initiatives",
        "Writing Poetry Workshops",
        "Science Fiction Book Club",
        "Traveling with Pets Tips",
        "Digital Marketing Strategies",
        "Mountain Biking Adventures",
        "Creative Writing Prompts",
        "DIY Woodworking Projects",
        "Local Art Exhibitions",
        "Renewable Energy Technologies",
        "Cooking for Beginners",
        "Language Exchange for Advanced Speakers",
        "Stock Trading Strategies",
        "Birdwatching Expeditions",
        "Urban Farming Community",
        "Racial Justice Advocacy",
        "Spoken Word Poetry Nights",
        "Group Fitness Challenges",
        "Virtual Reality Game Development",
        "Ethical Fashion Trends",
        "Virtual Music Jam Sessions",
        "World History Discussions",
        "Vegan and Vegetarian Recipes Exchange",
        "Startup Pitch Competitions",
        "Independent Music Releases Showcase",
        "Mindfulness in Education",
        "Backpacking Adventures Planning",
        "Architectural Photography",
        "Sustainable Transportation Solutions",
        "Culinary Adventures",
        "Online Learning Resources Sharing",
        "Street Art Tours",
        "Environmental Policy Debates",
        "Yoga Retreat Planning",
        "Open Source Software Development",
        "Alternative Energy Sources Exploration",
        "DIY Clothing Alterations",
        "LGBTQ+ Rights Activism",
        "Wildlife Photography Tips",
        "Personal Finance Management",
        "Trail Running Community",
        "Science Fiction Film Screenings",
        "Virtual Reality Art Exhibitions",
        "Conscious Consumerism Discussions",
        "Online Fitness Coaching",
        "Cryptocurrency Investment Strategies",
        "Baking and Pastry Making Workshops",
        "DIY Natural Beauty Products",
        "Vintage Motorcycle Restoration",
        "Community Gardening Projects",
        "Diversity and Inclusion in the Workplace",
        "Virtual Music Production Workshops",
        "World Religions Discussions",
        "Plant-Based Nutrition Education",
        "Social Entrepreneurship Ventures",
        "Online Gaming Tournaments",
        "Environmental Education Programs",
        "DIY Home Renovation Projects",
        "LGBTQ+ Literature Discussions",
        "Wildlife Conservation Volunteering",
        "Personal Growth Book Club",
        "Remote Work Productivity Tips",
        "Astrophotography Techniques",
        "Minimalist Lifestyle Discussions",
        "Urban Cycling Advocacy",
        "Sustainable Tourism Initiatives",
        "Handmade Craft Exchanges",
        "Human Rights Advocacy",
        "Science Communication Workshops",
        "Mindful Parenting Support",
        "Adventure Travel Photography",
        "Online Music Production Collaborations",
        "Classical Music Appreciation",
        "Historical Fiction Book Club",
        "Zero Waste Living Tips",
        "Social Impact Investment Opportunities",
        "DIY Green Energy Projects",
        "LGBTQ+ Film Screenings",
        "Community Supported Agriculture (CSA)",
        "Personal Development Seminars",
        "Urban Birdwatching",
        "Virtual Reality Travel Experiences",
        "Eco-Friendly Fashion Swaps",
        "Virtual Reality Gaming Community",
        "Indigenous Rights Activism",
        "Sustainable Architecture Design",
        "DIY Home Brewing Techniques",
        "LGBTQ+ History Discussions",
        "Wildlife Habitat Restoration Projects",
        "Mindfulness Meditation for Beginners",
        "Backpacking Gear Reviews",
        "Environmental Justice Advocacy",
        "Digital Nomad Lifestyle Tips",
        "DIY Herbal Remedies",
        "Classic Car Restoration Tips",
        "Community Clean-up Events",
        "LGBTQ+ Parenting Support",
        "Wilderness Survival Skills",
        "DIY Sustainable Living Solutions",
        "Women in Tech Networking",
        "Sustainable Fishing Practices",
        "Online Language Teaching Methods",
        "Urban Foraging Expeditions",
        "Climate Change Policy Discussions",
        "Sustainable Fashion Brands Showcase",
        "Virtual Reality Storytelling Workshops",
        "LGBTQ+ Poetry Readings",
        "Community Supported Fisheries (CSF)",
        "Personal Finance Workshops",
        "Trail Running Gear Recommendations",
        "Science Fiction Writing Workshops",
        "Urban Agriculture Projects",
        "DIY Home Energy Efficiency Upgrades",
        "LGBTQ+ Art Exhibitions",
        "Wildlife Conservation Research",
        "Mindful Eating Recipes Exchange",
        "Adventure Travel Photography Tips",
        "Virtual Reality Music Festivals",
        "Indigenous Language Revitalization",
        "Sustainable Transportation Advocacy",
        "DIY Natural Cleaning",
    ]

