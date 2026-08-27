async function testLogins() {
  const accounts = [
    { username: 'sp', password: 'Sp@Garuda2026!' },
    { username: 'sdpo', password: 'Dsp@Garuda2026!' },
    { username: 'dsp', password: 'Dsp@Garuda2026!' },
    { username: 'admin', password: 'Admin@Garuda2026!' },
  ];

  for (const acc of accounts) {
    const res = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(acc)
    });

    const data = await res.json();
    console.log(`Login [${acc.username}] -> Status: ${res.status}, Success: ${data.success}, User: ${data.user?.full_name}, Role: ${data.user?.role}`);
  }
}

testLogins().catch(console.error);
