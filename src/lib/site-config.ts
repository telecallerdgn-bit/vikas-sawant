export const SITE = {
  brand: "Vikas Sawants Academy",
  tagline: "Aapka sapna hamara mission",
  // Footer ke logo ke neeche ka chhota description
  aboutText:
    "We understand that every student has unique needs and abilities, that's why our curriculum is designed to adapt to your needs and help you grow!",
  hours: "", // jaise "Mon - Sat: 9:00 - 18:00". Khali ho to header mein nahi dikhega
  phones: [
    { label: "Admission", number: "+91 816 909 9028" },
    { label: "Helpline", number: "+91 865 222 1988" },
    { label: "Business", number: "+91 970 214 6136" },
  ],
  email: "info@vikassawantsacademy.com",
  address: "702/5 Shiv Amrut Dham CHS, Near Yogidham Complex, Kalyan Murbad Road, Kalyan - Thane, Maharashtra.",
  social: {
    facebook: "https://www.facebook.com/vikassawantsacademy/",
    instagram: "https://www.instagram.com/vikassawantsacademy4bankexam",
    linkedin: "https://www.linkedin.com/in/vikas-sawant-395663201",
    youtube: "https://www.youtube.com/@VikasSawantsAcademy",
  },
  hero: {
    slides: [
      {
        title: "Discover a new",
        accent: "way of learning",
        text: "Live classes, recorded lessons and study material delivered to your home.",
        image: "/hero/slide-1.jpg",
        cta: { label: "Explore courses", href: "/courses" },
        cta2: { label: "Create account", href: "/student/register" },
      },
      {
        title: "Your bank exam preparation,",
        accent: "all in one place",
        text: "Learn from experienced faculty with daily practice and doubt support.",
        image: "/hero/slide-2.jpg",
        cta: { label: "Find courses", href: "/courses" },
      },
      {
        title: "Study material delivered",
        accent: "to your door",
        text: "Choose a study material mode and we send the books straight to your address.",
        image: "/hero/slide-3.jpg",
        cta: { label: "Explore courses", href: "/courses" },
      },
    ],
  },
  about: {
    image: "/about/about-1.jpg", // bada photo (portrait, 800x1000 achha rahega)
    image2: "/about/about-2.jpg", // chhota photo stat card ke andar (optional)
  },
  howItWorks: {
    image: "/about/about-2.jpg", // portrait photo, 800x1000 achha rahega
  },
  // Home page ke "Explore by district" section ke liye. image khali chhodo to gradient dikhega.
  districts: [
    { name: "Jalna", slug: "jalna", centres: 2, image: "" },
    { name: "Mumbai", slug: "mumbai", centres: 1, image: "" },
    { name: "Nashik", slug: "nashik", centres: 1, image: "" },
    { name: "Pune", slug: "pune", centres: 1, image: "" },
    { name: "Thane", slug: "thane", centres: 1, image: "" },
  ],
};