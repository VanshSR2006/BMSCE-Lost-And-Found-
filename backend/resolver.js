const fs = require('fs');
const dns = require('dns');

dns.setServers(['8.8.8.8']);
dns.resolveSrv('_mongodb._tcp.cluster0.j8tdoke.mongodb.net', (err, addrs) => {
  if(err) { console.error(err); return; }
  dns.resolveTxt('cluster0.j8tdoke.mongodb.net', (e, txts) => {
    const hosts = addrs.map(a => a.name + ':' + a.port).join(',');
    const txtStr = txts?.[0]?.join('') || ''; // Usually contains authSource=admin&replicaSet=...
    const uri = 'mongodb://admin:Vansh%40100106@' + hosts + '/lostfound?ssl=true&' + txtStr + '&appName=Cluster0';
    
    let env = fs.readFileSync('.env', 'utf8');
    env = env.replace(/MONGO_URI=.*/, 'MONGO_URI="' + uri + '"');
    fs.writeFileSync('.env', env);
    console.log('Successfully updated .env with bypass URI:\\n', uri);
  });
});
