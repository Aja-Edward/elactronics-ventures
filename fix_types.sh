# Fix equipment page
sed -i 's/const equipment = rows.map((r) => ({/const equipment = rows.map((r: (typeof rows)[number]) => ({/' "app/admin/(dashboard)/equipment/page.tsx"

# Fix hero page  
sed -i 's/const slides = rows.map((r) => ({/const slides = rows.map((r: (typeof rows)[number]) => ({/' "app/admin/(dashboard)/hero/page.tsx"

# Fix news page
sed -i 's/const posts = rows.map((r) => ({/const posts = rows.map((r: (typeof rows)[number]) => ({/' "app/admin/(dashboard)/news/page.tsx"

# Fix pages page
sed -i 's/const pages = rows.map((r) => ({/const pages = rows.map((r: (typeof rows)[number]) => ({/' "app/admin/(dashboard)/pages/page.tsx"

# Fix projects page
sed -i 's/const projects = rows.map((r) => ({/const projects = rows.map((r: (typeof rows)[number]) => ({/' "app/admin/(dashboard)/projects/page.tsx"

echo "Fixed all admin pages"
