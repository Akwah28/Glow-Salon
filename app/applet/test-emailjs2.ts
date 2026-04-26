import emailjs from '@emailjs/nodejs';

async function test() {
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'http://localhost:3000',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      },
      body: JSON.stringify({
        service_id: "service_mv3qd1m",
        template_id: "template_ktx4nxr",
        template_params: { name: "Test" },
        user_id: "u5Ghpxgeqbtndic3H"
      })
    });
    
    if (!res.ok) {
        throw new Error(await res.text());
    }
    
    console.log("SUCCESS!", await res.text());
  } catch (err) {
    console.log("Error object:", err);
  }
}
test();
