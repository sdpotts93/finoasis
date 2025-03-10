const fs = require("fs");
const path = require("path");
const marked = require("marked");
const matter = require("gray-matter");

// Paths
const CONTENT_DIR = path.join(__dirname, "content");
const BLOG_DIR = path.join(__dirname, "blog");
const TEMPLATE_PATH = path.join(__dirname, "admin/blog-template.html");

// Load HTML Template
const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");

// Function to replace placeholders in the template
function replacePlaceholders(template, data) {
  return template
    .replace(/{{ backgroundImage }}/g, `style="background-image:url(${data.backgroundUrl})"`)
    .replace(/{{ backgroundUrl }}/g, data.backgroundUrl || "")
    .replace(/{{ theme }}/g, data.theme || "")
    .replace(/{{ title }}/g, data.title || "Untitled Post")
    .replace(/{{ author }}/g, data.author || "Anonymous")
    .replace(/{{ creation_date }}/g, data.date || new Date().toISOString().split("T")[0])
    .replace(/{{ description_first_letter }}/g, data.description ? data.description.charAt(0) : "")
    .replace(/{{ description_content }}/g, data.description ? data.description.slice(1) : "")
    .replace(/{{ content }}/g, marked.parse(data.content || ""));
}

// Process all Markdown files
fs.readdirSync(CONTENT_DIR).forEach((file) => {
  if (file.endsWith(".md")) {
    const filePath = path.join(CONTENT_DIR, file);
    const markdownContent = fs.readFileSync(filePath, "utf-8");

    // Extract frontmatter & content
    const { data, content } = matter(markdownContent);
    data.content = content; // Add markdown body as `content`

    // Generate final HTML
    const finalHtml = replacePlaceholders(template, data);

    // Save file as HTML inside /blog/
    const outputFilename = path.join(BLOG_DIR, file.replace(".md", ".html"));
    fs.writeFileSync(outputFilename, finalHtml);

    console.log(`✅ Generated: ${outputFilename}`);
  }
});

console.log("✅ All blog posts generated!");