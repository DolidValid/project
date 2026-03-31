---
marp: true
theme: default
paginate: true
header: 'Batch App Orchestration System'
footer: '© 2026 Designed and implemented by Brahamia Oualid | Professional ESB Batch Hub'
style: |
  section {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 40px;
    font-size: 24px;
    background: #fff;
  }
  h1 { 
    color: #cc0000; 
    font-size: 50px; 
    margin-top: 50px;
    text-align: center;
  }
  h2 { 
    color: #444; 
    font-size: 32px; 
    border-bottom: 2px solid #cc0000;
  }
  .logos {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    top: 40px;
    left: 40px;
    right: 40px;
  }
  .dcs-logo { height: 60px; }
  .ooredoo-logo { height: 120px; }
  .content-img {
    display: block;
    margin: 20px auto;
    max-height: 400px;
    max-width: 100%;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }
  .side-by-side {
    display: flex;
    gap: 15px;
    margin-top: 20px;
  }
  .side-by-side img {
    flex: 1;
    width: 48%;
    border-radius: 8px;
    border: 1px solid #ddd;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    max-height: 280px;
    object-fit: cover;
  }
  ul { font-size: 20px; color: #333; }
  .tech-grid {
    display: flex;
    gap: 20px;
  }
  .tech-col {
    flex: 1;
    background: #f9f9f9;
    padding: 15px;
    border-radius: 10px;
    border-top: 4px solid #cc0000;
  }
---

<!-- _class: center -->
<div class="logos">
  <img class="dcs-logo" src="logos/dcs_logo.jpg" />
  <img class="ooredoo-logo" src="logos/ooredoo_logo.png" />
</div>

# Batch App Presentation

## Enterprise Service Bus (ESB) Hub

### **Designed and implemented by Brahamia Oualid**
### Professional Bulk Transaction Management

---

## 🏗️ Technical Architecture Details

The system follows a modern service-oriented architecture (SOA).

<div class="tech-grid">
<div class="tech-col">

### **🎨 Frontend Implementation**
- **React 18 & Vite**: Fast HMR.
- **PrimeReact & Bootstrap**: UI.
- **Context API**: Global State.
- **React-Router**: Secure Routing.

</div>
<div class="tech-col">

### **⚙️ Backend Infrastructure**
- **Node.js & Express**: API layer.
- **Oracle Database**: Persistent Audit.
- **Node-Cron**: Background Throttling.
- **Axios**: SOAP/REST Client.

</div>
</div>

---

## 🚀 Active Module: Create Batch ✅

Automated subscriber onboarding with high-volume handling capacity.

- **File Engine**: Supports **.xlsx** and **.csv** bulk file injection.
- **Input logic**: Automatic MSISDN range validation and normalization.
- **ESB Trigger**: Asynchronous requests to ESB WebServices.
- **Audit**: Every transaction is logged with its unique Trace-ID.

---

## 🚀 Active Module: Set Contract Status ✅

Bulk management of subscriber lifecycles (Active, Suspend, etc.)

- **State Sync**: Real-time synchronization with HLR/HSS.
- **Flow Control**: **Pause/Resume/Cancel** functionality for job safety.
- **Throttling**: Background workers execute tasks without blocking UI.
- **Persistency**: Batch data stored securely in Oracle for auditing.

---

## 🔐 1. System Access & Security Gateway

Features JWT-based authentication for verified operator access.

<img class="content-img" src="screenshots/login.png" />

---

## 📥 2. Automated Lot Import console

Dynamic console for file upload and real-time operational status.

<img class="content-img" src="screenshots/import.png" />

---

## 📊 3. Full Transactional Audit logs

Granular monitoring of each MSISDN with detailed error code descriptions.

<img class="content-img" src="screenshots/result.png" />

---

## 📜 4. Global Search & Audit History

Full historical traceability of thousands of transactions via Oracle DB logs.

<div class="side-by-side">
  <img src="screenshots/history.png" />
  <img src="screenshots/search.png" />
</div>

---

## ✨ System Key Highlights

- **Efficiency**: Reduces manual labor by an estimated 95% for bulk tasks.
- **Security**: JWT tokens ensure all batches are attributed to a user.
- **Reliability**: Persistence layer ensures zero data loss on ESB errors.
- **Diagnostics**: Map specific ESB errors (e.g., 500, 404) to user-friendly tips.

### **DESIGNED AND IMPLEMENTED BY BRAHAMIA OUALID**
