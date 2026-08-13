async function test() {
  const res = await fetch('http://localhost:3000/admin/login');
  const html = await res.text();
  console.log('HTML length:', html.length);
  const stylesheets = html.match(/<link[^>]+rel="stylesheet"[^>]*>/g);
  console.log('Stylesheets:', stylesheets);
}
test();
