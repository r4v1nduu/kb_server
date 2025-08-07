## KB Server Setup Guide

### Initial Setup (Without Backup DB)

1. Create the network: `docker-compose -f docker-compose.network.yml up -d`
2. Create Primary Database: `docker-compose -f docker-compose.db.yml up -d`
3. Initialize Replica Set: `chmod +x init-replica.sh; ./init-replica.sh`
4. Create Indexing Database: `docker-compose -f docker-compose.es.yml up -d`
5. Start Worker: `docker-compose -f docker-compose.worker.yml up -d`

**To Check the Connectivity:**

Add Data:

```
sudo docker exec kb_mongodb mongosh emaildb --eval "
  db.emails.insertMany([{
    product: 'Outlook Sync',
    customer: 'jane.smith@example.com',
    subject: 'Your account is ready',
    body: 'Your Outlook synchronization has been successfully configured.',
    date: new Date()
  }])
"
```

Check on Elasticsearch:

```
curl "http://localhost:9200/emaildb-email/_search?pretty"
curl "http://localhost:9200/emaildb-email/_count"
```

### Configure Backup DB

1. Create Backup Database (On Backup Server): `docker-compose -f docker-compose.backup.yml up -d`
2. Re-Initialize Replica Set (On Primary Server): `chmod +x init-replica-backup.sh; ./init-replica-backup.sh`

&nbsp;

### Local Access URLs

**MongoDB**

- Host: `localhost:27017`
- Connection String: `mongodb://localhost:27017/emaildb?replicaSet=rs0`

**Elasticsearch**

- Host: `localhost:9200`
- URL: `http://localhost:9200`

&nbsp;

---

&nbsp;

Reset Replica Set for Local Test:

```
docker exec kb_mongodb mongosh --eval "
try {
  const status = rs.status();
  const currentHost = status.members[0].name;
  if (currentHost === 'kb_mongodb:27017') {
    const config = rs.conf();
    config.members[0].host = 'localhost:27017';
    config.version = config.version + 1;
    const result = rs.reconfig(config, {force: true});
    if (result.ok === 1) {
      console.log('[GOOD]: Done');
    } else {
      console.log('[BAD]:', result);
    }
    } else if (currentHost === 'localhost:27017') {
      console.log('[GOOD]: Already configured');
    }
  else {
    console.log('[WARN]:', currentHost);
  }
} catch(e) {
    console.log('[BAD]:', e.message);
}
"
```

Check Replica Status:

```
docker exec kb_mongodb mongosh --eval "
try {
  const status = rs.status();
  console.log('Replica Set:', status.set);
  console.log('Primary:', status.members.find(m => m.stateStr === 'PRIMARY')?.name || 'None');
  console.log('Members:', status.members.length);
} catch(e) {
  console.log('[INFO] Error checking status:', e.message);
}
"
```
