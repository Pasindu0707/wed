import "@/lib/loadEnv";

import { connectToDatabase } from "@/lib/db";
import { WeddingModel } from "@/models/Wedding";
import { ChecklistItemModel } from "@/models/ChecklistItem";
import { InventoryItemModel } from "@/models/InventoryItem";
import { MediaShotModel } from "@/models/MediaShot";
import { ReferenceImageModel } from "@/models/ReferenceImage";
import { TimelineItemModel } from "@/models/TimelineItem";

type Section =
  | "Church"
  | "Hotel"
  | "Inventory"
  | "PhotoVideo"
  | "Timeline"
  | "RobeShoot"
  | "FinalHandover"
  | "Other";

type Priority = "low" | "medium" | "high" | "critical";
type ChecklistStatus = "pending" | "in_progress" | "done" | "issue";

function item(input: {
  section: Section;
  title: string;
  description?: string;
  priority: Priority;
  status?: ChecklistStatus;
  dueTime?: string;
  assignedTo?: string;
  imageRefs?: string[];
}) {
  return { ...input, status: input.status ?? "pending" };
}

async function main() {
  await connectToDatabase();

  const date = new Date("2026-05-02T00:00:00.000Z");
  const coupleName = "Suhashi & Darshana";
  const slug = "suhashi-darshana";

  const wedding =
    (await WeddingModel.findOne({ slug }).lean()) ??
    (await WeddingModel.create({
      slug,
      coupleName,
      date,
      churchName: "St Mary’s Church Negombo",
      hotelName: "Suriya Resort",
      locations: [
        { name: "St Mary’s Church Negombo", type: "Church" },
        { name: "Suriya Resort", type: "Hotel" },
        { name: "Suhashi location", type: "Home", mapUrl: "https://maps.google.com/?q=7.246447,79.870705" },
        { name: "Darshana location", type: "Home", mapUrl: "https://maps.google.com/?q=7.258938,79.931381" }
      ],
      notes:
        "Hotel total guests: 440, tables: 43. Chair counts may vary (8/9/11/12). Seating plan must always be in hand."
    }));

  const weddingId = "_id" in wedding ? wedding._id : (wedding as any)._id;

  // Idempotent re-seed: remove old items for this wedding
  await Promise.all([
    ChecklistItemModel.deleteMany({ weddingId }),
    InventoryItemModel.deleteMany({ weddingId }),
    MediaShotModel.deleteMany({ weddingId }),
    ReferenceImageModel.deleteMany({ weddingId }),
    TimelineItemModel.deleteMany({ weddingId })
  ]);

  const checklist = [
    // --- Church Function ---
    item({
      section: "Church",
      title: "Church entrance decoration reference selected (no ground piece)",
      description: "Use church_deco_entrance image. Selected entrance design but without ground piece.",
      priority: "high",
      imageRefs: ["church_deco_entrance.jpeg"]
    }),
    item({
      section: "Church",
      title: "Altar reference confirmed",
      description: "Use church altar reference image.",
      priority: "high",
      imageRefs: ["church_alter.jpeg"]
    }),
    item({ section: "Church", title: "Church aisle: box stand 14", priority: "high" }),
    item({ section: "Church", title: "Altar pots: 4", priority: "high" }),
    item({ section: "Church", title: "Father table fresh flowers", priority: "high" }),
    item({ section: "Church", title: "Green carpet", priority: "high" }),
    item({ section: "Church", title: "Couple chairs: 2 with fresh flowers", priority: "high" }),
    item({ section: "Church", title: "Group chairs: 10", priority: "medium" }),
    item({ section: "Church", title: "Unity candle stand with fresh flowers", priority: "high" }),
    item({
      section: "Church",
      title: "Flower color ratio confirmed (white 80%, green 20%)",
      priority: "medium"
    }),
    item({
      section: "Church",
      title: "Confirm all promised church decorations completed before ceremony",
      priority: "critical",
      dueTime: "03:00 PM"
    }),
    item({
      section: "Church",
      title: "Hymn sheets distributed to pews + priest/lectern copies ready",
      priority: "high",
      dueTime: "03:00 PM"
    }),
    item({
      section: "Church",
      title: "Unity candles + matchbox ready",
      priority: "high",
      dueTime: "03:00 PM"
    }),
    item({
      section: "Church",
      title: "Keep pens ready for church registration",
      priority: "high",
      dueTime: "04:30 PM"
    }),
    item({
      section: "Church",
      title: "Snack packs delivered and ready",
      priority: "high",
      dueTime: "04:00 PM"
    }),

    // --- Cake (Hotel / Other) ---
    item({
      section: "Hotel",
      title: "Cake: 4 layer blue cake must match reference",
      description: "Must match cake.jpeg. Also check cake placement, cake table, and cake boxes including sides.",
      priority: "critical",
      imageRefs: ["cake.jpeg"]
    }),
    item({ section: "Hotel", title: "Check cake placement", priority: "high" }),
    item({ section: "Hotel", title: "Check cake table", priority: "high" }),
    item({ section: "Hotel", title: "Check cake boxes including sides", priority: "high" }),

    // --- Hotel Reception ---
    item({
      section: "Hotel",
      title: "Suriya Resort entrance without arch reference",
      description: "Use hotel entrance image (without arch).",
      priority: "high",
      imageRefs: ["hotel_entrance.jpeg"]
    }),
    item({
      section: "Hotel",
      title: "Hotel door/entrance arch reference",
      description: "Use door_hotel image (with arch).",
      priority: "high",
      imageRefs: ["door_hotel.jpeg"]
    }),
    item({
      section: "Hotel",
      title: "Entrance includes couple picture + seating plan table + welcome mirror",
      priority: "high"
    }),
    item({
      section: "Hotel",
      title: "Settee back reference confirmed",
      priority: "high",
      imageRefs: ["settiback.jpeg"]
    }),
    item({
      section: "Hotel",
      title: "Table deco reference confirmed",
      priority: "high",
      imageRefs: ["table_deco.jpeg"]
    }),
    item({
      section: "Hotel",
      title: "Main table reference confirmed",
      priority: "high",
      imageRefs: ["main_table.jpeg"]
    }),
    item({ section: "Hotel", title: "Reception table decor: 20% fresh flowers", priority: "high" }),
    item({ section: "Hotel", title: "Leaves must be fully fresh", priority: "high" }),
    item({ section: "Hotel", title: "Table deco must include 20% fresh flowers", priority: "high" }),
    item({ section: "Hotel", title: "Check poruwa", priority: "high" }),
    item({ section: "Hotel", title: "Check oil lamp", priority: "high" }),
    item({ section: "Hotel", title: "Check champagne fountain", priority: "high" }),

    // --- Full hotel check before function ---
    item({ section: "Hotel", title: "Seating plan", priority: "critical" }),
    item({ section: "Hotel", title: "43 tables confirmed", priority: "high" }),
    item({
      section: "Hotel",
      title: "Chair numbers confirmed (some tables may have 8/9/11/12; usual 10)",
      priority: "high"
    }),
    item({ section: "Hotel", title: "Decor", priority: "high" }),
    item({ section: "Hotel", title: "Napkins", priority: "medium" }),
    item({ section: "Hotel", title: "Side plates", priority: "medium" }),
    item({ section: "Hotel", title: "Cutlery", priority: "medium" }),
    item({ section: "Hotel", title: "Cake boxes including sides", priority: "high" }),
    item({ section: "Hotel", title: "Confirm everything around 5:45 PM", priority: "critical", dueTime: "05:45 PM" }),
    item({ section: "Hotel", title: "Laptop + videos/sound tracks checked", priority: "critical" }),
    item({ section: "Hotel", title: "Get pen drive in the morning", priority: "critical", dueTime: "10:30 AM" }),
    item({
      section: "Hotel",
      title: "If 75% guests are in hall, couple must enter at 7:00 PM sharp",
      priority: "critical",
      dueTime: "07:00 PM"
    }),
    item({ section: "Hotel", title: "Check agenda", priority: "high" }),
    item({ section: "Hotel", title: "Projector + screen set (keep aside)", priority: "high", dueTime: "06:00 PM" }),
    item({ section: "Hotel", title: "Sounds, mics, podium checked", priority: "high", dueTime: "05:45 PM" }),

    // --- Robe Shoot ---
    item({ section: "RobeShoot", title: "Glass", priority: "medium" }),
    item({ section: "RobeShoot", title: "Snacks", priority: "medium" }),
    item({ section: "RobeShoot", title: "Photographers to room", priority: "high" }),
    item({ section: "RobeShoot", title: "Water bottles", priority: "high" }),

    // --- Final Handover ---
    item({
      section: "FinalHandover",
      title: "Hand over/collect leftover bottles at end",
      priority: "high"
    }),
    item({
      section: "FinalHandover",
      title: "If handing over anything more to hotel, get photos + bill/inventory from them",
      priority: "critical"
    }),

    // --- Urgent Reminders / Other ---
    item({
      section: "Other",
      title: "After going away outfit change, set a location for photos",
      priority: "high"
    }),
    item({
      section: "Other",
      title: "4 guests will sing a song — get introduced by them before their item",
      priority: "medium"
    }),
    item({
      section: "Other",
      title: "After friend’s speech, take one video",
      priority: "high"
    }),
    item({
      section: "Other",
      title: "During father & daughter dance, take one video",
      priority: "high"
    }),
    item({
      section: "PhotoVideo",
      title: "Critical: 1-minute couple recommendation video during ceremony",
      description: "Get a 1 minute video of the couple recommending us during ceremony.",
      priority: "critical"
    })
  ];

  // Expand into ChecklistItem docs with sort orders per section
  const bySection = new Map<string, number>();
  const checklistDocs = checklist.map((c) => {
    const next = (bySection.get(c.section) ?? 0) + 1;
    bySection.set(c.section, next);
    return {
      weddingId,
      section: c.section,
      title: c.title,
      description: c.description,
      priority: c.priority,
      status: c.status,
      dueTime: c.dueTime,
      assignedTo: c.assignedTo,
      imageRefs: c.imageRefs,
      sortOrder: next
    };
  });

  await ChecklistItemModel.insertMany(checklistDocs);

  // Timeline items extracted from "Wedding Schedule - Suhashi & Darshana.pdf"
  await TimelineItemModel.insertMany([
    { weddingId, time: "04:30 AM", title: "Team Bride leaving the house to the hotel", location: "Suriya Resort", description: "Checklist: bags, dresses, accessories", status: "pending", sortOrder: 1 },
    { weddingId, time: "04:30 AM", title: "Bride MUA team arrive", status: "pending", sortOrder: 2 },
    { weddingId, time: "05:00 AM", title: "Team Bride arrive to Suriya Resort", location: "Suriya Resort", description: "Bring items for detail shots", status: "pending", sortOrder: 3 },
    { weddingId, time: "05:10 AM", title: "Team Bride start getting dressed", status: "pending", sortOrder: 4 },
    { weddingId, time: "08:15 AM", title: "Groom leaves the home", status: "pending", sortOrder: 5 },
    { weddingId, time: "08:45 AM", title: "Team Groom arrive to salon and start getting dressed", description: "Bring snacks", status: "pending", sortOrder: 6 },
    { weddingId, time: "09:00 AM", title: "Hotel deco starts", location: "Suriya Resort", status: "pending", sortOrder: 7 },
    { weddingId, time: "09:00 AM", title: "Photographers arrive to Suriya Resort", location: "Suriya Resort", status: "pending", sortOrder: 8 },
    { weddingId, time: "09:10 AM", title: "Robe shoot", status: "pending", sortOrder: 9 },
    { weddingId, time: "09:45 AM", title: "Snack time", status: "pending", sortOrder: 10 },
    { weddingId, time: "10:00 AM", title: "Bouquets delivery to Suriya Resort", location: "Suriya Resort", status: "pending", sortOrder: 11 },
    { weddingId, time: "10:15 AM", title: "Team groom leave the salon", status: "pending", sortOrder: 12 },
    { weddingId, time: "10:30 AM", title: "Handover items to hotel", location: "Suriya Resort", description: "Liquor, sparkling wine, champagne, cake boxes, pen drive, cashew mixture, apple, grapes, cheese", status: "pending", sortOrder: 13 },
    { weddingId, time: "10:30 AM", title: "Church decos start", location: "St Mary’s Church Negombo", status: "pending", sortOrder: 14 },
    { weddingId, time: "10:30 AM", title: "Detail pics / getting ready pics", status: "pending", sortOrder: 15 },
    { weddingId, time: "11:00 AM", title: "Team groom arrive to the hotel", location: "Suriya Resort", status: "pending", sortOrder: 16 },
    { weddingId, time: "11:00 AM", title: "Bride finish getting dressed", status: "pending", sortOrder: 17 },
    { weddingId, time: "11:00 AM", title: "Flower girls and page boys arrive", status: "pending", sortOrder: 18 },
    { weddingId, time: "11:10 AM", title: "Main photoshoot starts (father first look)", status: "pending", sortOrder: 19 },
    { weddingId, time: "01:30 PM", title: "Check for vehicles", status: "pending", sortOrder: 20 },
    { weddingId, time: "01:30 PM", title: "Photoshoot ends", status: "pending", sortOrder: 21 },
    { weddingId, time: "01:35 PM", title: "Collect and handover necklace and rings with ring box", status: "pending", sortOrder: 22 },
    { weddingId, time: "01:40 PM", title: "Team Groom leave to their house", status: "pending", sortOrder: 23 },
    { weddingId, time: "01:45 PM", title: "Team Bride leave to their house", status: "pending", sortOrder: 24 },
    { weddingId, time: "02:15 PM", title: "Bride and groom arrive to their houses", status: "pending", sortOrder: 25 },
    { weddingId, time: "02:20 PM", title: "Tea table at both places", status: "pending", sortOrder: 26 },
    { weddingId, time: "02:45 PM", title: "Everyone leaves to the church", location: "St Mary’s Church Negombo", status: "pending", sortOrder: 27 },
    { weddingId, time: "03:00 PM", title: "Check church setup / hymn sheets / candles / readings / registration / tissues / chairs", location: "St Mary’s Church Negombo", status: "pending", sortOrder: 28 },
    { weddingId, time: "03:00 PM", title: "Choir setup / sounds check", location: "St Mary’s Church Negombo", status: "pending", sortOrder: 29 },
    { weddingId, time: "03:15 PM", title: "Both parties arrive to the church", location: "St Mary’s Church Negombo", status: "pending", sortOrder: 30 },
    { weddingId, time: "03:15 PM", title: "Ushering guests into the church", status: "pending", sortOrder: 31 },
    { weddingId, time: "03:15 PM", title: "Bride and priests to be ready", status: "pending", sortOrder: 32 },
    { weddingId, time: "03:20 PM", title: "Team Groom entrance to the church", status: "pending", sortOrder: 33 },
    { weddingId, time: "03:25 PM", title: "Bridesmaid entrance to the church", status: "pending", sortOrder: 34 },
    { weddingId, time: "03:30 PM", title: "Bride entrance to the church", status: "pending", sortOrder: 35 },
    { weddingId, time: "03:30 PM", title: "Nuptial mass starts", status: "pending", sortOrder: 36 },
    { weddingId, time: "04:00 PM", title: "Deliver snack packs", status: "pending", sortOrder: 37 },
    { weddingId, time: "04:00 PM", title: "Setup the band", status: "pending", sortOrder: 38 },
    { weddingId, time: "04:30 PM", title: "Registration at the church (keep pens ready)", status: "pending", sortOrder: 39 },
    { weddingId, time: "04:30 PM", title: "Car to be ready", status: "pending", sortOrder: 40 },
    { weddingId, time: "04:45 PM", title: "End of the mass", status: "pending", sortOrder: 41 },
    { weddingId, time: "04:50 PM", title: "Group photo outside the church", status: "pending", sortOrder: 42 },
    { weddingId, time: "04:50 PM", title: "Snacks at the church", status: "pending", sortOrder: 43 },
    { weddingId, time: "05:00 PM", title: "Setup cake structure", status: "pending", sortOrder: 44 },
    { weddingId, time: "05:30 PM", title: "Couple leave the church", description: "Put 2 water bottles to the car", status: "pending", sortOrder: 45 },
    { weddingId, time: "05:45 PM", title: "Hotel arrangements check", location: "Suriya Resort", description: "Entrance, welcome note, seating plan, oil lamp, settee back, head table, centre pieces, sounds/mics/podium", status: "pending", sortOrder: 46 },
    { weddingId, time: "06:00 PM", title: "Setup projector and screen (keep aside)", location: "Suriya Resort", status: "pending", sortOrder: 47 },
    { weddingId, time: "06:00 PM", title: "Couple arrival to the hotel", location: "Suriya Resort", status: "pending", sortOrder: 48 },
    { weddingId, time: "06:00 PM", title: "Dancing team arrive", location: "Suriya Resort", status: "pending", sortOrder: 49 },
    { weddingId, time: "06:10 PM", title: "Second shoot", status: "pending", sortOrder: 50 },
    { weddingId, time: "06:30 PM", title: "Ushering guests into the reception", status: "pending", sortOrder: 51 },
    { weddingId, time: "06:40 PM", title: "Shoot ends", status: "pending", sortOrder: 52 },
    { weddingId, time: "06:45 PM", title: "Touch up", status: "pending", sortOrder: 53 },
    { weddingId, time: "07:00 PM", title: "Hotel staff serve bites to tables", status: "pending", sortOrder: 54 },
    { weddingId, time: "07:00 PM", title: "Couple entrance", status: "pending", sortOrder: 55 },
    { weddingId, time: "07:05 PM", title: "Lighting the oil lamp", description: "Candle and matchbox", status: "pending", sortOrder: 56 },
    { weddingId, time: "07:10 PM", title: "Cutting the cake", description: "Knife", status: "pending", sortOrder: 57 },
    { weddingId, time: "07:10 PM", title: "Start serving champagne", status: "pending", sortOrder: 58 },
    { weddingId, time: "07:15 PM", title: "Couple sit at settee back", status: "pending", sortOrder: 59 },
    { weddingId, time: "07:15 PM", title: "Bride & immediate family pics at settee", status: "pending", sortOrder: 60 },
    { weddingId, time: "07:20 PM", title: "Welcome speech", status: "pending", sortOrder: 61 },
    { weddingId, time: "07:25 PM", title: "Second speech + video plays", status: "pending", sortOrder: 62 },
    { weddingId, time: "07:30 PM", title: "Toast", status: "pending", sortOrder: 63 },
    { weddingId, time: "07:30 PM", title: "First round of alcohol served (2 rounds + open bar)", status: "pending", sortOrder: 64 },
    { weddingId, time: "07:35 PM", title: "Father daughter dance", status: "pending", sortOrder: 65 },
    { weddingId, time: "07:40 PM", title: "First dance", status: "pending", sortOrder: 66 },
    { weddingId, time: "07:45 PM", title: "Thank you speech", status: "pending", sortOrder: 67 },
    { weddingId, time: "07:50 PM", title: "Band session starts", status: "pending", sortOrder: 68 },
    { weddingId, time: "07:50 PM", title: "Guest photos", status: "pending", sortOrder: 69 },
    { weddingId, time: "08:20 PM", title: "Check buffet arrangements", status: "pending", sortOrder: 70 },
    { weddingId, time: "08:30 PM", title: "Guest songs (4) – 2 guests", status: "pending", sortOrder: 71 },
    { weddingId, time: "08:45 PM", title: "Couple opening the buffet", status: "pending", sortOrder: 72 },
    { weddingId, time: "08:45 PM", title: "MUA getting ready for change", status: "pending", sortOrder: 73 },
    { weddingId, time: "09:00 PM", title: "Guests open the buffet", status: "pending", sortOrder: 74 },
    { weddingId, time: "09:00 PM", title: "Going away change", status: "pending", sortOrder: 75 },
    { weddingId, time: "09:30 PM", title: "Childhood video", status: "pending", sortOrder: 76 },
    { weddingId, time: "09:40 PM", title: "Pre-shoot pics / video (during band break)", status: "pending", sortOrder: 77 },
    { weddingId, time: "10:00 PM", title: "Couple entrance", status: "pending", sortOrder: 78 },
    { weddingId, time: "10:05 PM", title: "Champagne fountain", status: "pending", sortOrder: 79 },
    { weddingId, time: "10:10 PM", title: "Bride dance (before band session 2)", status: "pending", sortOrder: 80 },
    { weddingId, time: "10:20 PM", title: "Band session 2", status: "pending", sortOrder: 81 },
    { weddingId, time: "10:30 PM", title: "Couple on the dancing floor", status: "pending", sortOrder: 82 },
    { weddingId, time: "10:30 PM", title: "Guest photo session 2", status: "pending", sortOrder: 83 },
    { weddingId, time: "11:00 PM", title: "Guest songs (2)", status: "pending", sortOrder: 84 },
    { weddingId, time: "12:10 AM", title: "Vehicle check", status: "pending", sortOrder: 85 },
    { weddingId, time: "12:15 AM", title: "Worship parents", status: "pending", sortOrder: 86 },
    { weddingId, time: "12:20 AM", title: "Departure of couple from the hall", description: "Flower petals and sparkles", status: "pending", sortOrder: 87 },
    { weddingId, time: "12:25 AM", title: "Sparkle send off", status: "pending", sortOrder: 88 },
    { weddingId, time: "12:30 AM", title: "Going away", status: "pending", sortOrder: 89 },
    { weddingId, time: "12:35 AM", title: "Handover all leftover items", status: "pending", sortOrder: 90 }
  ]);

  // Inventory (all marked handed over to Suriya Resort)
  await InventoryItemModel.insertMany([
    {
      weddingId,
      itemName: "Cheese",
      quantity: 21,
      unit: "boxes (500g each)",
      handedOverTo: "Suriya Resort",
      status: "handed_over",
      notes: "1 box 500g",
      photoRequired: false,
      billRequired: false
    },
    {
      weddingId,
      itemName: "Cashew",
      quantity: 43,
      unit: "packets (200g each)",
      handedOverTo: "Suriya Resort",
      status: "handed_over",
      notes: "1 packet 200g",
      photoRequired: false,
      billRequired: false
    },
    {
      weddingId,
      itemName: "Mixture",
      quantity: 43,
      unit: "packets (250g each)",
      handedOverTo: "Suriya Resort",
      status: "handed_over",
      notes: "1 packet 250g",
      photoRequired: false,
      billRequired: false
    },
    {
      weddingId,
      itemName: "Grapes",
      quantity: 22,
      unit: "boxes (500g each)",
      handedOverTo: "Suriya Resort",
      status: "handed_over",
      notes: "1 box 500g",
      photoRequired: false,
      billRequired: false
    },
    {
      weddingId,
      itemName: "Apples",
      quantity: 86,
      unit: "apples",
      handedOverTo: "Suriya Resort",
      status: "handed_over",
      notes: "",
      photoRequired: false,
      billRequired: false
    },
    {
      weddingId,
      itemName: "Krisco",
      quantity: 122,
      unit: "boxes (170g each)",
      handedOverTo: "Suriya Resort",
      status: "handed_over",
      notes: "1 box 170g",
      photoRequired: false,
      billRequired: false
    },
    {
      weddingId,
      itemName: "Champagne",
      quantity: 39,
      unit: "bottles",
      handedOverTo: "Suriya Resort",
      status: "handed_over",
      notes: "Includes one for champagne fountain",
      photoRequired: false,
      billRequired: false
    }
  ]);

  // Media shot list (grouped categories for /shots)
  const shots: { category: string; title: string; description?: string; required?: boolean; notes?: string }[] = [
    // 1. Decorations
    { category: "Decorations", title: "Hotel decorations", required: true },
    { category: "Decorations", title: "Church decorations", required: true },
    { category: "Decorations", title: "Entrances both", required: true },
    { category: "Decorations", title: "Tables", required: true },
    { category: "Decorations", title: "Cake", required: true },
    { category: "Decorations", title: "Settee back", required: true },
    { category: "Decorations", title: "Poruwa", required: true },

    // 2. Couple Moments
    { category: "Couple Moments", title: "Couple getting ready (photos and videos)", required: true },
    { category: "Couple Moments", title: "First look (photos and videos)", required: true },
    { category: "Couple Moments", title: "Going away", required: true },

    // 3. Ceremony
    { category: "Ceremony", title: "Entering church", required: true },
    { category: "Ceremony", title: "Registration", required: true },
    { category: "Ceremony", title: "Poruwa / Church", required: true },
    { category: "Ceremony", title: "Oil lamp", required: true },

    // 4. Reception
    { category: "Reception", title: "Entering reception", required: true },
    { category: "Reception", title: "Champagne fountain", required: true },

    // 5. Speeches / Dances
    { category: "Speeches / Dances", title: "Welcome speech", required: true },
    { category: "Speeches / Dances", title: "Thanks giving speech", required: true },
    { category: "Speeches / Dances", title: "Dance", required: true },
    { category: "Speeches / Dances", title: "After friend’s speech, take one video", required: true },
    { category: "Speeches / Dances", title: "During father and daughter dance, take one video", required: true },
    { category: "Speeches / Dances", title: "4 guests singing song: meet them before item", required: true },

    // 6. Vendors
    { category: "Vendors", title: "Vendor videos", required: true },

    // 7. Critical Marketing Video
    {
      category: "Critical Marketing Video",
      title: "CRITICAL: 1 minute video of couple recommending us during ceremony",
      required: true,
      notes: "Must-not-miss"
    }
  ];

  await MediaShotModel.insertMany(
    shots.map((s, idx) => ({
      weddingId,
      category: s.category,
      title: s.title,
      description: s.description,
      required: s.required ?? true,
      status: "pending",
      notes: s.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  );

  // Reference images (file names correspond to the provided workspace files)
  await ReferenceImageModel.insertMany([
    {
      weddingId,
      area: "Cake",
      fileName: "cake.jpeg",
      expectedDetails: "4 layer blue cake, must match photo",
      description: "Cake reference image",
      checklistNotes: "Cake must match reference.",
      status: "not_checked",
      notes: ""
    },
    {
      weddingId,
      area: "Entrance",
      fileName: "church_deco_entrance.jpeg",
      expectedDetails: "Chosen design but without ground thing",
      description: "Church entrance decoration reference",
      status: "not_checked",
      notes: ""
    },
    {
      weddingId,
      area: "Church",
      fileName: "church_alter.jpeg",
      expectedDetails: "Match altar reference",
      description: "Church altar reference",
      status: "not_checked",
      notes: ""
    },
    {
      weddingId,
      area: "Church",
      fileName: "church.jpeg",
      expectedDetails: "Church aisle: 14 box stands",
      description: "Church aisle reference",
      status: "not_checked",
      notes: ""
    },
    {
      weddingId,
      area: "Entrance",
      fileName: "hotel_entrance.jpeg",
      expectedDetails: "Entrance without arch",
      description: "Hotel entrance reference",
      status: "not_checked",
      notes: ""
    },
    {
      weddingId,
      area: "Entrance",
      fileName: "door_hotel.jpeg",
      expectedDetails: "Entrance with arch; couple picture; seating arrangement table; welcome mirror",
      description: "Hotel door/entrance with arch reference",
      status: "not_checked",
      notes: ""
    },
    {
      weddingId,
      area: "SetteeBack",
      fileName: "settiback.jpeg",
      expectedDetails: "Match reference",
      description: "Settee back reference",
      status: "not_checked",
      notes: ""
    },
    {
      weddingId,
      area: "Table",
      fileName: "table_deco.jpeg",
      expectedDetails: "20% fresh flowers; leaves fully fresh",
      description: "Table decor reference",
      status: "not_checked",
      notes: ""
    },
    {
      weddingId,
      area: "MainTable",
      fileName: "main_table.jpeg",
      expectedDetails: "Match reference",
      description: "Main table reference",
      status: "not_checked",
      notes: ""
    }
  ]);

  // eslint-disable-next-line no-console
  console.log("Seed complete:", { weddingId: String(weddingId) });
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed:", err);
  process.exit(1);
});

