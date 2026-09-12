const testLogins = async () => {
  const users = [
    { email: "supervisor@minesight.com", password: "Admin@123" },
    { email: "apex.contractor@minesight.com", password: "Demo@123" },
    { email: "northwest.contractor@minesight.com", password: "Demo@123" },
    { email: "eastern.contractor@minesight.com", password: "Demo@123" }
  ];

  for (const user of users) {
    try {
      const res = await fetch("http://127.0.0.1:5001/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`✅ ${user.email} - Success`);
      } else {
        console.error(`❌ ${user.email} - Failed:`, data.error.message);
      }
    } catch (error) {
      console.error(`❌ ${user.email} - Failed:`, error.message);
    }
  }
}

testLogins();
