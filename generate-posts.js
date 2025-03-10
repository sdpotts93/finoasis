const fs = require("fs");
const path = require("path");
const marked = require("marked");
const matter = require("gray-matter");
const slugify = require("slugify");

// Paths
const CONTENT_DIR = path.join(__dirname, "/content/blog");
const BLOG_DIR = path.join(__dirname, "/blog");
const TEMPLATE_PATH = path.join(__dirname, "/admin/blog-template.html");

// Load HTML Template
const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");

// Function to replace placeholders in the template
function replacePlaceholders(template, data) {

  let backgroundImage = `https://finoasis.mx/.netlify/images?url=${data.thumbnail}?&fit=cover&w=1920&h=1100&fm=webp`;
  let backgroundUrl = `https://finoasis.mx/.netlify/images?url=${data.thumbnail}?&fit=cover&w=125&h=125&fm=webp`;
  let metaImage = `https://finoasis.mx/.netlify/images?url=${data.thumbnail}?&fit=cover&w=1200&h=630&fm=webp`;

  return template
    .replace(/{{ backgroundImage }}/g, ` style="background-image:url(${backgroundImage})" `)
    .replace(/{{ backgroundUrl }}/g, backgroundUrl || "")
    .replace(/{{ meta_title }}/g, data.seo?.metaTitle || data.title)
    .replace(/{{ meta_description }}/g, data.seo?.metaDescription || data.description)
    .replace(/{{ meta_image }}/g, metaImage || "https://finoasis.mx/images/og-image.png")
    .replace(/{{ theme }}/g, data.theme || "")
    .replace(/{{ title }}/g, data.title || "Untitled Post")
    .replace(/{{ author }}/g, data.author || "Anonymous")
    .replace(/{{ creation_date }}/g, formatDate(data.date) || new Date().toISOString().split("T")[0])
    .replace(/{{ description_first_letter }}/g, data.description ? data.description.charAt(0) : "")
    .replace(/{{ description_content }}/g, data.description ? data.description.slice(1) : "")
    .replace(/{{ content }}/g, marked.parse(data.content || ""));
}

// Function to generate an ASCII-safe filename
function generateSafeFilename(title) {
  return slugify(title, { lower: true, strict: true }) + ".html";
}

function formatDate (rawDate) {
  const date = new Date(rawDate);
  const day = date.getDate();
  const year = date.getFullYear();

  // Get the month name in Spanish
  const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date)

  return `${day} de ${month} del ${year}`
}

// Process all Markdown files
fs.readdirSync(CONTENT_DIR).forEach((file) => {
  if (file.endsWith(".md")) {
    const filePath = path.join(CONTENT_DIR, file);
    const markdownContent = fs.readFileSync(filePath, "utf-8");

    // Extract frontmatter & content
    const { data, content } = matter(markdownContent);
    data.content = content; // Add markdown body as `content`

    // Generate safe filename from the post title
    const safeFilename = generateSafeFilename(data.title || "untitled-post");

    // Generate final HTML
    const finalHtml = replacePlaceholders(template, data);

    // Save file as HTML inside /blog/
    const outputFilename = path.join(BLOG_DIR, safeFilename);
    fs.writeFileSync(outputFilename, finalHtml);

    console.log(`✅ Generated: ${outputFilename}`);
  }
});

console.log("✅ All blog posts generated!");