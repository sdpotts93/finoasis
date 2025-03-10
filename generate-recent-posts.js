const fs = require("fs");
const path = require("path");
const matter = require("gray-matter"); // Parses front matter
const slugify = require("slugify");

const blogDir = path.join(__dirname, "content/blog"); // Path to blog folder
const outputFile = path.join(__dirname, "recent-posts.html"); // Output file

// Read the first 3 blog posts
const getRecentPosts = () => {
  const files = fs.readdirSync(blogDir)
    .filter(file => file.endsWith(".md")) // Only .md files
    .sort((a, b) => fs.statSync(path.join(blogDir, b)).mtime - fs.statSync(path.join(blogDir, a)).mtime) // Sort by date
    .slice(0, 3); // Get first 3 files

  return files.map(file => {
    const filePath = path.join(blogDir, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent); // Extract front matter
    const safeFilename = generateSafeFilename(data.title || "untitled-post");
    const description = data.description.substring(0, 50);

    return {
      title: data.title || "Sin título",
      author: data.author || "Autor desconocido",
      date: formatDate(data.date),
      slug: safeFilename, // URL slug from filename
      image: data.thumbnail || "/images/default.jpg",
      description: description || "Descripción no disponible."
    };
  });
};

function formatDate(rawDate) {
  const date = new Date(rawDate);
  const day = date.getDate();
  const year = date.getFullYear();

  // Get the month name in Spanish
  const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date)

  return `${day} de ${month} del ${year}`
}

function generateSafeFilename(title) {
  return slugify(title, { lower: true, strict: true });
}
// Generate HTML
const generateHTML = (posts) => {
  return posts.map(post => `
        <li class="grid-item">
            <div class="card border-0 border-radius-4px box-shadow-quadruple-large">
                <div class="blog-image">
                    <a aria-label="${post.title}" href="/blog/${post.slug}" class="d-block">
                        <img height="460" width="600" loading="lazy" src="/.netlify/images?url=${post.image}&fit=cover&w=600&h=460&fm=webp" alt="${post.title}" data-no-retina="">
                    </a>
                </div>
                <div class="card-body p-13 md-p-11">
                    <a href="/blog/${post.slug}" class="card-title mb-15px alt-font fw-600 fs-20 text-dark-gray d-inline-block">${post.title}</a>
                    <p>${post.description}</p>
                    <div class="author d-flex justify-content-center align-items-center position-relative overflow-hidden fs-16">
                        <div class="me-auto">
                            <span class="blog-date d-inline-block">${post.date}</span>
                            <div class="d-inline-block author-name">Por <a href="#" class="text-dark-gray text-decoration-line-bottom fw-600">${post.author}</a></div>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    `).join("\n");
};

// Execute script
const posts = getRecentPosts();
const htmlOutput = generateHTML(posts);

// Save to file
fs.writeFileSync(outputFile, htmlOutput, "utf-8");
console.log(`✅ Recent posts generated in: ${outputFile}`);