import axios from 'axios';

const testLogins = async () => {
  const users = [
    { email: "supervisor@minesight.com", password: "Admin@123" },
    { email: "apex.contractor@minesight.com", password: "Demo@123" },
    { email: "northwest.contractor@minesight.com", password: "Demo@123" },
    { email: "eastern.contractor@minesight.com", password: "Demo@123" }
  ];

  for (const user of users) {
    try {
      const res = await axios.post("http://127.0.0.1:5001/api/v1/auth/login", user);
      console.log(`✅ ${user.email} - Success`);
    } catch (error: any) {
      console.error(`❌ ${user.email} - Failed:`, error.response?.data?.error?.message || error.message);
    }
  }
}

testLogins();
