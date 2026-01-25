const dns = require('dns');
const { promisify } = require('util');

const resolveSrv = promisify(dns.resolveSrv);
const resolve4 = promisify(dns.resolve4);

async function testDNS() {
  const hostname = '_mongodb._tcp.cluster0.iayxw9v.mongodb.net';
  
  console.log('🔍 Testing DNS Resolution...');
  console.log(`🎯 Target: ${hostname}`);
  console.log(`💻 Current DNS Servers: ${JSON.stringify(dns.getServers())}`);

  try {
    console.log('\n1️⃣ Testing System DNS (SRV Record)...');
    const addresses = await resolveSrv(hostname);
    console.log('✅ Success! Found records:', addresses);
  } catch (error) {
    console.error('❌ Failed (System DNS):', error.code);
  }

  try {
    console.log('\n2️⃣ Testing Google DNS (8.8.8.8)...');
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    const addresses = await resolveSrv(hostname);
    console.log('✅ Success with Google DNS! Found records:', addresses);
    
    if (addresses.length > 0) {
        console.log('\n💡 RECOMMENDATION: Change your computer\'s DNS to 8.8.8.8');
    }
  } catch (error) {
    console.error('❌ Failed (Google DNS):', error.code);
    console.log('⚠️ Your network might be blocking DNS queries entirely.');
  }
}

testDNS();
