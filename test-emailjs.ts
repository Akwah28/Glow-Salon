import emailjs from '@emailjs/nodejs';

async function test() {
  try {
    const response = await emailjs.send(
      "service_mv3qd1m",
      "template_ktx4nxr",
      { name: "Test" },
      { publicKey: "u5Ghpxgeqbtndic3H" }
    );
    console.log("SUCCESS!", response);
  } catch (err) {
    console.log("Error status:", err.status);
    console.log("Error text:", err.text);
    console.log("Error object:", err);
  }
}
test();
