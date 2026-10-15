// ==========================================
// SUPABASE CLIENT INITIALIZATION
// ==========================================
const SUPABASE_URL = "https://ajyhxlvqjkgovcrfsnig.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_wa_eoq6Z21iTyijZgWALkg_6DXwPCWw";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  const nodes = {
    sidebar: document.getElementById("sidebar"),
    sidebarToggle: document.getElementById("sidebarToggle"),
    navItems: document.querySelectorAll(".nav-list li"),
    dynamicTitle: document.getElementById("dynamicTitle"),
    contentView: document.getElementById("contentView"),
    globalActions: document.getElementById("globalActions"),
    addItemModal: document.getElementById("addItemModal"),
    openAddModalBtn: document.getElementById("openAddModalBtn"),
    openEditModalBtn: document.getElementById("openEditModalBtn"),
    triggerDeleteBtn: document.getElementById("triggerDeleteBtn"),
    triggerRecoverBtn: document.getElementById("triggerRecoverBtn"),
    closeModalBtn: document.getElementById("closeModalBtn"),
    cancelModalBtn: document.getElementById("cancelModalBtn"),
    addItemForm: document.getElementById("addItemForm"),
    modalCategoryScope: document.getElementById("modalCategoryScope"),
    formEditRowIndex: document.getElementById("formEditRowIndex"),
    deviceInput: document.getElementById("assetDevice"),
    deviceDropdown: document.getElementById("deviceDropdownOptions"),
    comboboxGroup: document.getElementById("groupDevice"),
    serialInput: document.getElementById("assetSerial"),
    serialDropdown: document.getElementById("serialDropdownOptions"),
    comboboxSerial: document.getElementById("groupSerial"),
    serialWrapper: document.getElementById("serialWrapper"),
    nameInput: document.getElementById("assetName"),
    modelInput: document.getElementById("assetModel"),
    logoutBtn: document.getElementById("logoutBtn"),
    summaryYearContainer: document.getElementById("summaryYearContainer"),
    summaryYearSelect: document.getElementById("summaryYearSelect"),
    formErrorAlert: document.getElementById("formErrorAlert"),
    saveAssetBtn: document.getElementById("saveAssetBtn"),
    groupStatus: document.getElementById("groupStatus"),
    confirmModal: document.getElementById("confirmModal"),
    confirmMessage: document.getElementById("confirmMessage"),
    closeConfirmBtn: document.getElementById("closeConfirmBtn"),
    cancelConfirmBtn: document.getElementById("cancelConfirmBtn"),
    okConfirmBtn: document.getElementById("okConfirmBtn"),
  };

  // --- FLOATING HOVER CARD ---
  const cellHoverCard = document.createElement("div");
  cellHoverCard.id = "cellHoverCard";
  document.body.appendChild(cellHoverCard);

  // --- CELLPHONE DETAILS MODAL ---
  const cellModalOverlay = document.createElement("div");
  cellModalOverlay.className = "modal-overlay";
  cellModalOverlay.id = "cellDetailsModal";
  cellModalOverlay.innerHTML = `
    <div class="modal-wide-bar horizontal-layout">
      <div class="modal-bar-header">
        <h2>Cellphone Details / Notes</h2>
        <button class="close-bar-btn" id="closeCellModalBtn">&times;</button>
      </div>
      <form id="cellDetailsForm">
        <div class="form-horizontal-layout">
          <div class="form-group">
            <label>MAC ADDRESS</label>
            <input type="text" id="cellMacInput" placeholder="">
          </div>
          <div class="form-group">
            <label>PHONE NUMBER</label>
            <input type="text" id="cellPhoneInput" placeholder="">
          </div>
          <div class="form-group">
            <label>PHONE IMEI 1</label>
            <input type="text" id="cellImeiInput" placeholder="">
          </div>
          <div class="form-group">
            <label>SAP FA ASSET</label>
            <input type="text" id="cellSapInput" placeholder="">
          </div>
        </div>
        <div class="center-bottom-actions-bar">
          <button type="button" class="cancel-bar-btn" id="cancelCellModalBtn">Cancel</button>
          <button type="submit" class="save-bar-btn" id="saveCellModalBtn">Save Details</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(cellModalOverlay);

  let editingCellRowIndex = null;

  const closeCellModal = () => {
    cellModalOverlay.classList.remove("show");
    editingCellRowIndex = null;
  };

  document.getElementById("closeCellModalBtn").addEventListener("click", closeCellModal);
  document.getElementById("cancelCellModalBtn").addEventListener("click", closeCellModal);
  cellModalOverlay.addEventListener("click", (e) => {
    if (e.target === cellModalOverlay) closeCellModal();
  });

  const cellDetailsForm = document.getElementById("cellDetailsForm");
  cellDetailsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (editingCellRowIndex !== null && db["Cellphone"][editingCellRowIndex]) {
      const record = db["Cellphone"][editingCellRowIndex];
      record.macAddress = document.getElementById("cellMacInput").value.trim();
      record.phoneNumber = document.getElementById("cellPhoneInput").value.trim();
      record.phoneImei1 = document.getElementById("cellImeiInput").value.trim();
      record.sapFaAsset = document.getElementById("cellSapInput").value.trim();
      
      await saveRecordToTable("Cellphone", record);
      buildTableGrid("Cellphone");
    }
    closeCellModal();
  });

  const statusOptions = [
    "Awol", "Damaged", "Defective", "Disposed", "Extra", "In Service",
    "Lost / Stolen", "Non-Operational", "Out of Service", "Reassigned",
    "Sold", "Standby", "Under Repair"
  ];

  let currentSelectedYear = "2026";
  if (nodes.summaryYearSelect) {
    const currentRealYear = new Date().getFullYear(); 
    nodes.summaryYearSelect.innerHTML = "";
    
    for (let y = currentRealYear; y >= 2019; y--) {
      const option = document.createElement("option");
      option.value = y;
      option.textContent = y;
      if (y === currentRealYear) option.selected = true;
      nodes.summaryYearSelect.appendChild(option);
    }
    currentSelectedYear = nodes.summaryYearSelect.value;
  }

  function formatPeso(val) {
    const cleanNum = parseFloat(String(val).replace(/[^\d.]/g, ""));
    if (isNaN(cleanNum)) return "—";
    return "₱" + cleanNum.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  const priceInput = document.getElementById("assetPrice");
  if (priceInput) {
    priceInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/[^0-9.]/g, "");
      const parts = val.split(".");
      if (parts.length > 2) {
        val = parts[0] + "." + parts.slice(1).join("");
      }
      e.target.value = val;
    });

    priceInput.addEventListener("keypress", (e) => {
      if (!/[0-9.]/.test(e.key)) {
        e.preventDefault();
      }
    });
  }

  const presentModal = () => {
    nodes.addItemModal.classList.add("show");
    if (nodes.formErrorAlert) nodes.formErrorAlert.style.display = "none";
    if (nodes.serialInput) nodes.serialInput.style.borderColor = "";

    const now = new Date();
    const dateInput = document.getElementById("assetDate");
    if (dateInput) {
      dateInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    const statusSelect = document.getElementById("assetStatus");
    if (statusSelect) statusSelect.value = "Extra";
  };

  const dismissModal = () => {
    nodes.addItemModal.classList.remove("show");
    if (nodes.addItemForm) {
      nodes.addItemForm.querySelectorAll("input:not([type=hidden]), select").forEach(el => {
        if (el.tagName === "SELECT") el.selectedIndex = 4;
        else if (el.type === "number") el.value = "1";
        else el.value = "";
      });
    }
    nodes.formEditRowIndex.value = "";
    if (nodes.formErrorAlert) nodes.formErrorAlert.style.display = "none";
    if (nodes.serialInput) nodes.serialInput.style.borderColor = "";
    closeComboboxMenu();
    closeSerialMenu();
  };

  if (nodes.closeModalBtn) nodes.closeModalBtn.addEventListener("click", dismissModal);
  if (nodes.cancelModalBtn) nodes.cancelModalBtn.addEventListener("click", dismissModal);
  if (nodes.addItemModal) {
    nodes.addItemModal.addEventListener("click", (e) => {
      if (e.target === nodes.addItemModal) dismissModal();
    });
  }

  const showConfirmModal = (messageText, onConfirm) => {
    if (!nodes.confirmModal) return;
    if (nodes.confirmMessage) nodes.confirmMessage.textContent = messageText;
    nodes.confirmModal.classList.add("show");
    
    const newOkBtn = nodes.okConfirmBtn.cloneNode(true);
    nodes.okConfirmBtn.parentNode.replaceChild(newOkBtn, nodes.okConfirmBtn);
    nodes.okConfirmBtn = newOkBtn;

    nodes.okConfirmBtn.addEventListener("click", () => {
      nodes.confirmModal.classList.remove("show");
      onConfirm();
    });
  };

  const hideConfirmModal = () => {
    if (nodes.confirmModal) nodes.confirmModal.classList.remove("show");
  };

  if (nodes.closeConfirmBtn) nodes.closeConfirmBtn.addEventListener("click", hideConfirmModal);
  if (nodes.cancelConfirmBtn) nodes.cancelConfirmBtn.addEventListener("click", hideConfirmModal);
  if (nodes.confirmModal) {
    nodes.confirmModal.addEventListener("click", (e) => {
      if (e.target === nodes.confirmModal) hideConfirmModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (nodes.addItemModal.classList.contains("show")) dismissModal();
      if (nodes.confirmModal && nodes.confirmModal.classList.contains("show")) hideConfirmModal();
      if (cellModalOverlay.classList.contains("show")) closeCellModal();
    }
  });

  let activeCategory = "Summary";
  let selectedIndex = null;
  let multiDeleteMode = false;
  let editMode = false;
  let multiSelectedIndices = new Set();

  if (nodes.summaryYearSelect) {
    nodes.summaryYearSelect.addEventListener("change", (e) => {
      currentSelectedYear = e.target.value;
      if (activeCategory === "Summary") buildTableGrid("Summary");
    });
  }

  const devicesList = [
    "Access Points", "Air Gun", "Bags", "Biometrics", "Cabinet",
    "Cable Jack", "CCTV Camera", "CCTV DVR", "CCTV Power Supply", "Cellphone",
    "Charger", "Charging Cord", "Connector", "Crimper", "Desktop",
    "Digital Multimeter", "Enclosure", "External HDD", "Firewall", "GPON ONU",
    "HDD", "HDMI Cable", "Hub", "I/O", "Ink", "Internal HDD", "IP Camera",
    "Keyboard/Mouse", "Lan Adapter", "Laptop", "Laptop Battery", "Monitor",
    "Mouse", "Mouse Pad", "Network Switch", "Panel", "POE Injector",
    "Power Supply", "Printer", "RAM", "Ribbon", "Router", "Server", "SSD",
    "Switch", "Tablet", "Telephone", "UPS", "UPS Battery", "USB Flashdrive",
    "USB Hub", "Vacuum", "Web Camera", "Wifi"
  ].sort((a, b) => a.localeCompare(b));

  const categoryGroupMap = {
    Accessories: [
      "Panel", "Modem", "Power Supply", "Hub", "Extender", "Connector",
      "Cable Jack", "Digital Multimeter", "Air Gun", "I/O", "Crimper",
      "POE Injector", "Vacuum", "Charger", "Charging Cord", "Lan Adapter",
      "Laptop Battery", "Cabinet", "HDMI Cable"
    ],
    CCTV: [
      "CCTV DVR", "CCTV Power Supply", "Web Camera", "IP Camera",
      "CCTV NVR", "CCTV Camera"
    ],
    Cellphone: ["Cellphone", "Tablet"],
    "Keyboard/Mouse": ["Mouse", "Keyboard/Mouse", "Mouse Pad"],
    "Network Devices": [
      "Firewall", "Switch", "GPON ONU", "Network Switch", "Router", "Wifi"
    ],
    Storage: [
      "Internal HDD", "USB Flashdrive", "External HDD", "External HD",
      "SSD", "RAM", "Enclosure", "USB Hub", "HDD"
    ],
  };

  function resolveTargetCategory(deviceTypeName) {
    if (!deviceTypeName) return null;
    const cleanName = deviceTypeName.trim().toLowerCase();
    for (const [groupName, items] of Object.entries(categoryGroupMap)) {
      if (items.some((item) => item.toLowerCase() === cleanName)) return groupName;
    }
    const exactMatch = devicesList.find((cat) => cat.toLowerCase() === cleanName);
    return exactMatch || cleanName;
  }

  let db = { Summary: [], "Stock In / Received": [], "Stock Out / Released": [] };
  devicesList.forEach((cat) => { if (!db[cat]) db[cat] = []; });
  Object.keys(categoryGroupMap).forEach((group) => { if (!db[group]) db[group] = []; });

  // --- SUPABASE RELATIONAL MAPPING FUNCTIONS ---
  function getTableName(category) {
    if (category === "Stock In / Received") return "stock_in";
    if (category === "Stock Out / Released") return "stock_out";
    return "inventory_items";
  }

  function mapItemToRow(category, item) {
    let base = {};

    if (category === "Stock In / Received") {
      base = {
        date_received: item.date && item.date !== "—" ? item.date : null,
        device_type: item.device && item.device !== "—" ? item.device : null,
        name: item.name && item.name !== "—" ? item.name : null,
        model: item.model && item.model !== "—" ? item.model : null,
        serial_number: item.serial && item.serial !== "—" ? item.serial : null,
        price: item.price && item.price !== "—" ? item.price : null,
      };
    } else if (category === "Stock Out / Released") {
      base = {
        date_released: item.date && item.date !== "—" ? item.date : null,
        device_type: item.device && item.device !== "—" ? item.device : null,
        name: item.name && item.name !== "—" ? item.name : null,
        model: item.model && item.model !== "—" ? item.model : null,
        serial_number: item.serial && item.serial !== "—" ? item.serial : null,
        deployed_to: item.deployed !== "" ? item.deployed : null,
        status: item.status || "Extra",
        oth: item.oth !== "" ? item.oth : null,
        erf: item.erf !== "" ? item.erf : null,
      };
    } else {
      base = {
        category_group: category,
        date_received: item.date && item.date !== "—" ? item.date : null,
        device_type: item.device && item.device !== "—" ? item.device : null,
        name: item.name && item.name !== "—" ? item.name : null,
        model: item.model && item.model !== "—" ? item.model : null,
        serial_number: item.serial && item.serial !== "—" ? item.serial : null,
        deployed_to: item.deployed !== "" ? item.deployed : null,
        status: item.status || "Extra",
        oth: item.oth !== "" ? item.oth : null,
        erf: item.erf !== "" ? item.erf : null,
        remarks: item.remarks !== "" ? item.remarks : null,
        mac_address: item.macAddress !== "" ? item.macAddress : null,
        phone_number: item.phoneNumber !== "" ? item.phoneNumber : null,
        phone_imei1: item.phoneImei1 !== "" ? item.phoneImei1 : null,
        sap_fa_asset: item.sapFaAsset !== "" ? item.sapFaAsset : null,
      };
    }

    if (item.supabaseId) {
      base.id = item.supabaseId;
    }

    return base;
  }

  function mapRowToItem(row) {
    return {
      supabaseId: row.id,
      date: row.date_received || row.date_released || row.date_in_out || "—",
      device: row.device_type || "—",
      name: row.name || "—",
      model: row.model || "—",
      serial: row.serial_number || "—",
      price: row.price || "—",
      deployed: row.deployed_to || "",
      status: row.status || "Extra",
      oth: row.oth || "",
      erf: row.erf || "",
      remarks: row.remarks || "",
      macAddress: row.mac_address || "",
      phoneNumber: row.phone_number || "",
      phoneImei1: row.phone_imei1 || "",
      sapFaAsset: row.sap_fa_asset || "",
    };
  }

  async function loadDatabaseFromSupabase() {
    try {
      const { data: stockInData } = await _supabase.from("stock_in").select("*");
      if (stockInData) {
        db["Stock In / Received"] = stockInData.map(mapRowToItem);
      }

      const { data: stockOutData } = await _supabase.from("stock_out").select("*");
      if (stockOutData) {
        db["Stock Out / Released"] = stockOutData.map(mapRowToItem);
      }

      const { data: itemsData } = await _supabase.from("inventory_items").select("*");
      if (itemsData) {
        devicesList.forEach((cat) => { db[cat] = []; });
        Object.keys(categoryGroupMap).forEach((group) => { db[group] = []; });

        itemsData.forEach((row) => {
          const cat = row.category_group;
          const mappedItem = mapRowToItem(row);
          if (cat) {
            if (!db[cat]) db[cat] = [];
            db[cat].push(mappedItem);
          }
        });
      }
    } catch (err) {
      console.warn("Could not connect to Supabase tables, checking local storage fallback", err);
      const local = localStorage.getItem("plaspack_inventory_db");
      if (local) db = JSON.parse(local);
    }

    devicesList.forEach((cat) => { if (!db[cat]) db[cat] = []; });
    Object.keys(categoryGroupMap).forEach((group) => { if (!db[group]) db[group] = []; });

    buildTableGrid(activeCategory);
  }

  async function saveRecordToTable(category, item) {
    const tableName = getTableName(category);
    const rowPayload = mapItemToRow(category, item);

    if (item.supabaseId) {
      const { error } = await _supabase
        .from(tableName)
        .update(rowPayload)
        .eq("id", item.supabaseId);

      if (error) console.error(`Error updating record in ${tableName}:`, error);
    } else {
      const { data, error } = await _supabase
        .from(tableName)
        .insert([rowPayload])
        .select();

      if (error) {
        console.error(`Error inserting record into ${tableName}:`, error);
      } else if (data && data[0] && data[0].id) {
        item.supabaseId = data[0].id;
      }
    }
    
    localStorage.setItem("plaspack_inventory_db", JSON.stringify(db));
  }

  async function deleteRecordFromTable(category, serialNumber) {
    const tableName = getTableName(category);
    if (!serialNumber || serialNumber === "—") return;

    const query = _supabase.from(tableName).delete();
    if (tableName === "inventory_items") {
      await query.eq("serial_number", serialNumber).eq("category_group", category);
    } else {
      await query.eq("serial_number", serialNumber);
    }
  }

  function subscribeToRealtimeSync() {
    _supabase
      .channel("public:all_inventory")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        () => {
          loadDatabaseFromSupabase();
        }
      )
      .subscribe();
  }

  function checkAndCreateDailySnapshot() {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastBackupDate = localStorage.getItem("plaspack_last_backup_date");

    if (lastBackupDate !== todayStr) {
      const currentDB = localStorage.getItem("plaspack_inventory_db");
      if (currentDB) {
        localStorage.setItem("plaspack_backup_yesterday", currentDB);
        localStorage.setItem("plaspack_last_backup_date", todayStr);
      }
    }
  }
  checkAndCreateDailySnapshot();

  function convertToShortDate(dateString) {
    if (!dateString || !dateString.includes("-")) return dateString;
    const parts = dateString.split("-");
    return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}/${parts[0].slice(-2)}`;
  }

  function convertToInputDate(shortDateString) {
    if (!shortDateString || !shortDateString.includes("/")) return shortDateString;
    const parts = shortDateString.split("/");
    return `20${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
  }

  function fillDropdownOptions(filterText = "") {
    if (!nodes.deviceDropdown) return;
    nodes.deviceDropdown.innerHTML = "";
    const cleanFilter = filterText.toLowerCase().trim();
    const matched = devicesList.filter((item) => item.toLowerCase().includes(cleanFilter));
    
    if (matched.length === 0) {
      const hint = document.createElement("div");
      hint.className = "no-results-hint";
      hint.textContent = "No matches found";
      nodes.deviceDropdown.appendChild(hint);
      return;
    }
    
    matched.forEach((choice) => {
      const row = document.createElement("div");
      row.textContent = choice;
      row.addEventListener("click", () => {
        nodes.deviceInput.value = choice;
        closeComboboxMenu();
      });
      nodes.deviceDropdown.appendChild(row);
    });
  }

  const openComboboxMenu = () => {
    if (nodes.comboboxGroup && nodes.deviceDropdown) {
      nodes.comboboxGroup.classList.add("open");
      nodes.deviceDropdown.style.display = "block";
    }
  };

  const closeComboboxMenu = () => {
    if (nodes.comboboxGroup && nodes.deviceDropdown) {
      nodes.comboboxGroup.classList.remove("open");
      nodes.deviceDropdown.style.display = "none";
    }
  };

  if (nodes.deviceInput) {
    nodes.deviceInput.addEventListener("focus", () => {
      fillDropdownOptions(nodes.deviceInput.value);
      openComboboxMenu();
    });
    nodes.deviceInput.addEventListener("input", (e) => {
      fillDropdownOptions(e.target.value);
      openComboboxMenu();
    });
  }

  function fillSerialDropdownOptions(filterText = "") {
    if (!nodes.serialDropdown || activeCategory === "Stock In / Received") {
      closeSerialMenu();
      return;
    }
    nodes.serialDropdown.innerHTML = "";

    const stockedOutSerials = new Set();
    if (db["Stock Out / Released"]) {
      db["Stock Out / Released"].forEach((item) => {
        if (item && item.serial) stockedOutSerials.add(item.serial);
      });
    }

    const selectedDevice = nodes.deviceInput ? nodes.deviceInput.value.trim().toLowerCase() : "";
    let availableSerials = [];
    
    if (db["Stock In / Received"]) {
      db["Stock In / Received"].forEach((item) => {
        if (item && item.serial && !stockedOutSerials.has(item.serial)) {
          if (!selectedDevice || (item.device && item.device.trim().toLowerCase() === selectedDevice)) {
            if (!availableSerials.includes(item.serial)) availableSerials.push(item.serial);
          }
        }
      });
    }

    if (selectedDevice) {
      const targetCat = resolveTargetCategory(selectedDevice);
      if (targetCat && db[targetCat]) {
        db[targetCat].forEach((item) => {
          if (item && item.serial && !stockedOutSerials.has(item.serial) && !availableSerials.includes(item.serial)) {
            availableSerials.push(item.serial);
          }
        });
      }
    }

    const cleanFilter = filterText.toLowerCase().trim();
    const matched = availableSerials.filter((serial) => serial.toLowerCase().includes(cleanFilter));

    if (matched.length === 0) {
      const hint = document.createElement("div");
      hint.className = "no-results-hint";
      hint.textContent = "No matching available serials found";
      nodes.serialDropdown.appendChild(hint);
      return;
    }

    matched.forEach((choice) => {
      const row = document.createElement("div");
      row.textContent = choice;
      row.addEventListener("click", () => {
        nodes.serialInput.value = choice;
        closeSerialMenu();

        let foundRecord = null;
        if (db["Stock In / Received"]) {
          foundRecord = db["Stock In / Received"].find(item => item && item.serial === choice);
        }

        if (!foundRecord) {
          for (const key of Object.keys(db)) {
            if (Array.isArray(db[key])) {
              const match = db[key].find(item => item && item.serial === choice);
              if (match) { foundRecord = match; break; }
            }
          }
        }

        if (foundRecord) {
          if (nodes.nameInput && foundRecord.name && foundRecord.name !== "—") nodes.nameInput.value = foundRecord.name;
          if (nodes.modelInput && foundRecord.model && foundRecord.model !== "—") nodes.modelInput.value = foundRecord.model;
          if (nodes.deviceInput && foundRecord.device && !nodes.deviceInput.value) nodes.deviceInput.value = foundRecord.device;
        }
      });
      nodes.serialDropdown.appendChild(row);
    });
  }

  const openSerialMenu = () => {
    if (activeCategory === "Stock In / Received") return;
    if (nodes.comboboxSerial && nodes.serialDropdown) {
      nodes.comboboxSerial.classList.add("open");
      nodes.serialDropdown.style.display = "block";
    }
  };

  const closeSerialMenu = () => {
    if (nodes.comboboxSerial && nodes.serialDropdown) {
      nodes.comboboxSerial.classList.remove("open");
      nodes.serialDropdown.style.display = "none";
    }
  };

  if (nodes.serialInput) {
    nodes.serialInput.addEventListener("focus", () => {
      if (activeCategory !== "Stock In / Received") {
        fillSerialDropdownOptions(nodes.serialInput.value);
        openSerialMenu();
      }
    });
    nodes.serialInput.addEventListener("input", (e) => {
      if (activeCategory !== "Stock In / Received") {
        fillSerialDropdownOptions(e.target.value);
        openSerialMenu();
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (nodes.comboboxGroup && !nodes.comboboxGroup.contains(e.target)) closeComboboxMenu();
    if (nodes.comboboxSerial && !nodes.comboboxSerial.contains(e.target)) closeSerialMenu();
  });

  if (nodes.sidebarToggle) {
    nodes.sidebarToggle.addEventListener("click", () => nodes.sidebar.classList.toggle("collapsed"));
  }

  function adaptFormLabelsAndFields(category) {
    const remainingFieldsWrapper = document.getElementById("remainingFieldsWrapper");
    const groupUnits = document.getElementById("groupUnits");
    const lblDate = document.getElementById("lblDate");
    const groupPrice = document.getElementById("groupPrice");

    [nodes.deviceInput, nodes.nameInput, nodes.modelInput].forEach((input) => {
      if (input) input.style.borderColor = "";
    });

    if (remainingFieldsWrapper) remainingFieldsWrapper.style.display = "flex";
    if (groupUnits) groupUnits.style.display = "flex";
    if (lblDate) lblDate.textContent = "Date In/Out";
    if (groupPrice) groupPrice.style.display = category === "Stock In / Received" ? "flex" : "none";

    if (category === "Stock In / Received") {
      if (remainingFieldsWrapper) remainingFieldsWrapper.style.display = "none";
      if (nodes.groupStatus) nodes.groupStatus.style.display = "none";
      if (lblDate) lblDate.textContent = "Date Received";
      if (nodes.comboboxSerial) nodes.comboboxSerial.classList.remove("searchable-combobox");
      
      const existingArrow = document.getElementById("serialArrow");
      if (existingArrow) existingArrow.remove();
    } else {
      if (nodes.groupStatus) nodes.groupStatus.style.display = "flex";
      if (nodes.comboboxSerial) nodes.comboboxSerial.classList.add("searchable-combobox");
      
      if (nodes.serialWrapper && !document.getElementById("serialArrow")) {
        const arrow = document.createElement("span");
        arrow.className = "combobox-arrow";
        arrow.id = "serialArrow";
        arrow.innerHTML = "&#9660;";
        nodes.serialWrapper.appendChild(arrow);
      }

      if (category === "Stock Out / Released") {
        if (groupUnits) groupUnits.style.display = "none";
        if (lblDate) lblDate.textContent = "Date Released";
      }
    }
  }

  function buildTableGrid(category) {
    activeCategory = category;
    selectedIndex = null;
    nodes.contentView.innerHTML = "";

    if (nodes.summaryYearContainer) {
      nodes.summaryYearContainer.style.display = category === "Summary" ? "flex" : "none";
    }

    const container = document.createElement("div");
    container.className = "table-responsive";
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    if (category === "Summary") {
      nodes.globalActions.classList.add("hide-modifiers");
      if (nodes.triggerRecoverBtn) nodes.triggerRecoverBtn.style.display = "flex";

      table.className = "data-table summary-table";

      const todayObj = new Date();
      const dateFormatted = todayObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      const prevYearLabel = parseInt(currentSelectedYear, 10) - 1;

      const monthNames = [
        "January", "February", "March", "April", 
        "May", "June", "July", "August", 
        "September", "October", "November", "December"
      ];

      const row1 = document.createElement("tr");
      row1.innerHTML = `
        <th rowspan="2" class="col-device-type" style="width: 160px; text-align: center;">Device Type</th>
        ${monthNames.map((m, i) => {
          const decClass = i === 11 ? " border-right-dec" : "";
          return `<th colspan="2" style="text-align: center;" class="${decClass}">${m}</th>`;
        }).join('')}
        <th colspan="3" class="border-right-year" style="text-align: center;">Year</th>
        <th class="col-2025-group border-right-2025" style="text-align: center;">${prevYearLabel}</th>
        <th colspan="3" class="border-right-today" style="text-align: center;">${dateFormatted}</th>
      `;
      thead.appendChild(row1);

      const row2 = document.createElement("tr");
      let subheadersHTML = "";
      for (let i = 0; i < 12; i++) {
        const relClass = i === 11 ? " border-right-dec" : "";
        subheadersHTML += `<th>Received</th><th class="${relClass}">Released</th>`;
      }
      subheadersHTML += `<th>Received</th><th>Released</th><th class="border-right-year">Rem Stock</th>`;
      subheadersHTML += `<th class="border-right-2025">Prev Stock</th>`;
      subheadersHTML += `<th>Received</th><th>Released</th><th class="border-right-today">Rem Stock</th>`;

      row2.innerHTML = subheadersHTML;
      thead.appendChild(row2);
      table.appendChild(thead);

      devicesList.forEach((deviceName, index) => {
        const tr = document.createElement("tr");
        tr.setAttribute("data-row-index", index);

        const monthlyReceived = new Array(12).fill(0);
        const monthlyReleased = new Array(12).fill(0);

        if (db["Stock In / Received"]) {
          db["Stock In / Received"].forEach((item) => {
            if (item && item.device && item.device.trim().toLowerCase() === deviceName.toLowerCase() && item.date) {
              const parts = item.date.split(" | ")[0].split("/");
              if (parts.length === 3) {
                const m = parseInt(parts[0], 10) - 1;
                if ("20" + parts[2] === currentSelectedYear && m >= 0 && m < 12) monthlyReceived[m]++;
              }
            }
          });
        }

        if (db["Stock Out / Released"]) {
          db["Stock Out / Released"].forEach((item) => {
            if (item && item.device && item.device.trim().toLowerCase() === deviceName.toLowerCase() && item.date) {
              const parts = item.date.split("/");
              if (parts.length === 3) {
                const m = parseInt(parts[0], 10) - 1;
                if ("20" + parts[2] === currentSelectedYear && m >= 0 && m < 12) monthlyReleased[m]++;
              }
            }
          });
        }

        let rowHTML = `<td class="col-device-type" style="font-weight: 600; color: var(--accent-cyan);">${deviceName}</td>`;
        let totalYearRec = 0;
        let totalYearRel = 0;

        for (let i = 0; i < 12; i++) {
          const recVal = monthlyReceived[i];
          const relVal = monthlyReleased[i];
          totalYearRec += recVal;
          totalYearRel += relVal;

          const relClass = i === 11 ? " border-right-dec" : "";
          rowHTML += `<td>${recVal > 0 ? recVal : "-"}</td><td class="${relClass}">${relVal > 0 ? relVal : "-"}</td>`;
        }

        const yearRemaining = totalYearRec - totalYearRel;
        rowHTML += `<td>${totalYearRec > 0 ? totalYearRec : "-"}</td><td>${totalYearRel > 0 ? totalYearRel : "-"}</td><td class="border-right-year">${yearRemaining !== 0 ? yearRemaining : "-"}</td>`;

        let prevStockCount = 0;
        const targetYearInt = parseInt(currentSelectedYear, 10);
        
        if (db["Stock In / Received"]) {
          db["Stock In / Received"].forEach((item) => {
            if (item && item.device && item.device.trim().toLowerCase() === deviceName.toLowerCase() && item.date) {
              const parts = item.date.split("/");
              if (parts.length === 3) {
                const itemYear = parseInt("20" + parts[2], 10);
                if (itemYear < targetYearInt) prevStockCount++;
              }
            }
          });
        }

        if (db["Stock Out / Released"]) {
          db["Stock Out / Released"].forEach((item) => {
            if (item && item.device && item.device.trim().toLowerCase() === deviceName.toLowerCase() && item.date) {
              const parts = item.date.split("/");
              if (parts.length === 3) {
                const itemYear = parseInt("20" + parts[2], 10);
                if (itemYear < targetYearInt) prevStockCount--;
              }
            }
          });
        }

        rowHTML += `<td class="border-right-2025">${prevStockCount !== 0 ? prevStockCount : "-"}</td>`;

        let todayRec = 0;
        let todayRel = 0;

        if (db["Stock In / Received"]) {
          db["Stock In / Received"].forEach((item) => {
            if (item && item.device && item.device.trim().toLowerCase() === deviceName.toLowerCase() && item.date) {
              const parts = item.date.split("/");
              if (parts.length === 3) {
                const itemDateObj = new Date(`20${parts[2]}`, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
                if (itemDateObj.toDateString() === todayObj.toDateString()) todayRec++;
              }
            }
          });
        }

        if (db["Stock Out / Released"]) {
          db["Stock Out / Released"].forEach((item) => {
            if (item && item.device && item.device.trim().toLowerCase() === deviceName.toLowerCase() && item.date) {
              const parts = item.date.split("/");
              if (parts.length === 3) {
                const itemDateObj = new Date(`20${parts[2]}`, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
                if (itemDateObj.toDateString() === todayObj.toDateString()) todayRel++;
              }
            }
          });
        }

        const todayRem = prevStockCount + totalYearRec - totalYearRel + todayRec - todayRel;
        rowHTML += `<td>${todayRec > 0 ? todayRec : "-"}</td><td>${todayRel > 0 ? todayRel : "-"}</td><td class="border-right-today">${todayRem !== 0 ? todayRem : "-"}</td>`;

        tr.innerHTML = rowHTML;
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      container.appendChild(table);
      nodes.contentView.appendChild(container);
      nodes.dynamicTitle.textContent = "Summary";
      return;
    } else {
      nodes.globalActions.classList.remove("hide-modifiers");
      if (nodes.triggerRecoverBtn) nodes.triggerRecoverBtn.style.display = "none";

      const addBtn = nodes.globalActions.querySelector(".action-add");
      if (addBtn) {
        if (category === "Stock In / Received") {
          addBtn.style.display = "flex";
          addBtn.textContent = "+";
        } else if (category === "Stock Out / Released") {
          addBtn.style.display = "flex";
          addBtn.textContent = "-";
        } else {
          addBtn.style.display = "none";
        }
      }

      table.className = "data-table eleven-cols";

      let headers = [];
      const records = (db[category] || []).filter(item => item !== null && item !== undefined);

      if (category === "Stock In / Received") {
        headers = ["DATE RECEIVED", "DEVICE TYPE", "NAME", "MODEL", "SERIAL NUMBER", "PRICE", "", "", "", ""];
      } else if (category === "Stock Out / Released") {
        headers = ["DATE RELEASED", "DEVICE TYPE", "NAME", "MODEL", "SERIAL NUMBER", "DEPLOYED TO", "STATUS", "OTH #", "ERF #", ""];
      } else {
        headers = ["DATE IN/OUT", "DEVICE TYPE", "NAME", "MODEL", "SERIAL NUMBER", "DEPLOYED TO", "STATUS", "OTH #", "ERF #", "REMARKS"];
      }

      const headerRow = document.createElement("tr");
      headers.forEach((text) => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      if (records.length > 0) {
        records.forEach((item, index) => {
          if (!item) return;
          const tr = document.createElement("tr");
          tr.setAttribute("data-row-index", index);

          if (multiDeleteMode && multiSelectedIndices.has(index)) {
            tr.classList.add("multi-selected-row");
          }

          const columnsMap = [
            item.date || "—",
            item.device || "—",
            item.name || "—",
            item.model || "—",
            item.serial || "—",
            category === "Stock In / Received" ? (item.price || "—") : (item.deployed || ""),
            category === "Stock In / Received" ? "" : (item.status || ""),
            item.oth || "",
            item.erf || "",
            item.remarks || ""
          ];

          columnsMap.forEach((val, colIndex) => {
            const td = document.createElement("td");
            const isStatusCol = (category !== "Stock In / Received" && headers[colIndex] === "STATUS");
            const isRemarksCol = (category !== "Stock In / Received" && category !== "Stock Out / Released" && headers[colIndex] === "REMARKS");
            
            if (isStatusCol) {
              const select = document.createElement("select");
              const getStatusClass = (statusVal) => "status-badge status-" + (statusVal ? statusVal.toLowerCase().replace(/[\s/]+/g, '-') : 'extra');
              
              select.className = "inline-status-select " + getStatusClass(val);
              select.style.cssText = "background: transparent; border: none; outline: none; cursor: pointer; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.3px; appearance: none; -webkit-appearance: none; padding-right: 16px; background-image: url(\"data:image/svg+xml;utf8,<svg fill='%238592a6' height='10' viewBox='0 0 24 24' width='10' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>\"); background-repeat: no-repeat; background-position: right center; width: 100%; text-align: center;";
              
              statusOptions.forEach(opt => {
                const option = document.createElement("option");
                option.value = opt;
                option.textContent = opt;
                option.style.cssText = "background-color: #0f1322; color: #fff;";
                if (opt === val) option.selected = true;
                select.appendChild(option);
              });

              select.addEventListener("change", async (e) => {
                e.stopPropagation();
                const newStatus = e.target.value;
                if (db[activeCategory][index]) {
                  db[activeCategory][index].status = newStatus;
                  await saveRecordToTable(activeCategory, db[activeCategory][index]);
                }
                select.className = "inline-status-select " + getStatusClass(newStatus);
              });

              select.addEventListener("click", (e) => { e.stopPropagation(); });
              td.appendChild(select);
            } else if (isRemarksCol) {
              td.style.position = "relative";
              td.style.overflow = "visible";

              const remarksWrapper = document.createElement("div");
              remarksWrapper.style.cssText = "display: flex; align-items: center; gap: 6px; width: 100%;";

              const textarea = document.createElement("textarea");
              const previewText = val || "";

              textarea.title = previewText;
              textarea.value = previewText;
              textarea.style.cssText = "background: transparent; border: none; outline: none; color: #cbd5e1; width: 100%; text-align: left; font-size: 0.82rem; font-weight: 500; resize: none; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; height: 18px; line-height: 18px; vertical-align: middle; cursor: text;";

              textarea.addEventListener("focus", () => {
                const cellRect = td.getBoundingClientRect();
                const currentItem = db[activeCategory][index] || {};
                let fullVal = currentItem.remarks || "";
                textarea.value = fullVal;
                
                textarea.style.position = "fixed";
                textarea.style.zIndex = "999999";
                textarea.style.background = "#0f1322";
                textarea.style.border = "1px solid var(--accent-cyan, #00e5ff)";
                textarea.style.borderRadius = "6px";
                textarea.style.padding = "6px 8px";
                textarea.style.boxShadow = "0 20px 50px rgba(0,0,0,0.95), 0 0 15px rgba(0, 229, 255, 0.2)";
                textarea.style.width = "365px";
                textarea.style.whiteSpace = "pre-wrap";
                textarea.style.textAlign = "left";
                
                const horizontalOffset = 3; 
                const verticalOffset = 5;
                const fieldWidth = 365;

                let leftPos = cellRect.left + horizontalOffset;
                if (leftPos + fieldWidth > window.innerWidth - 20) {
                  leftPos = cellRect.right - fieldWidth - horizontalOffset;
                }

                textarea.style.left = leftPos + "px";
                textarea.style.top = (cellRect.top + verticalOffset) + "px";
                textarea.style.right = "auto";
                
                textarea.style.height = "18px";
                if (textarea.value.includes("\n")) {
                  textarea.style.height = (textarea.scrollHeight + 4) + "px";
                }
              });

              textarea.addEventListener("blur", async () => {
                textarea.style.position = "static";
                textarea.style.zIndex = "auto";
                textarea.style.background = "transparent";
                textarea.style.border = "none";
                textarea.style.padding = "0";
                textarea.style.boxShadow = "none";
                textarea.style.width = "100%";
                textarea.style.minHeight = "18px";
                textarea.style.height = "18px";
                textarea.style.whiteSpace = "nowrap";
                textarea.style.textAlign = "left";
                textarea.style.left = "auto";
                textarea.style.top = "auto";
                
                if (db[activeCategory][index]) {
                  await saveRecordToTable(activeCategory, db[activeCategory][index]);
                }
                buildTableGrid(activeCategory);
              });

              textarea.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  textarea.blur();
                }
              });

              textarea.addEventListener("input", (e) => {
                const fullText = e.target.value;
                textarea.title = fullText;
                if (db[activeCategory][index]) {
                  db[activeCategory][index].remarks = fullText;
                }
                
                if (fullText.includes("\n")) {
                  textarea.style.height = "auto";
                  textarea.style.height = (textarea.scrollHeight + 4) + "px";
                } else {
                  textarea.style.height = "18px";
                }
              });

              textarea.addEventListener("click", (e) => { e.stopPropagation(); });
              remarksWrapper.appendChild(textarea);

              if (activeCategory === "Cellphone") {
                const noteBtn = document.createElement("button");
                noteBtn.type = "button";
                noteBtn.innerHTML = "🏷️";
                noteBtn.style.cssText = "background: var(--bg-hover, #1e2548); border: 1px solid var(--border-color, #232c4d); color: var(--text-main); border-radius: 4px; padding: 2px 6px; font-size: 0.75rem; cursor: pointer; flex-shrink: 0;";
                
                noteBtn.addEventListener("mouseenter", (e) => {
                  const currentItem = db["Cellphone"][index] || {};
                  const rows = [];
                  
                  if (currentItem.macAddress) rows.push(`<div class="hover-row"><span class="hover-label">MAC:</span><span class="hover-val">${currentItem.macAddress}</span></div>`);
                  if (currentItem.phoneNumber) rows.push(`<div class="hover-row"><span class="hover-label">PHONE:</span><span class="hover-val">${currentItem.phoneNumber}</span></div>`);
                  if (currentItem.phoneImei1) rows.push(`<div class="hover-row"><span class="hover-label">IMEI 1:</span><span class="hover-val">${currentItem.phoneImei1}</span></div>`);
                  if (currentItem.sapFaAsset) rows.push(`<div class="hover-row"><span class="hover-label">SAP FA:</span><span class="hover-val">${currentItem.sapFaAsset}</span></div>`);

                  if (rows.length > 0) {
                    cellHoverCard.innerHTML = `<div class="hover-title">CELLPHONE DETAILS</div><div class="hover-content">${rows.join('')}</div>`;
                    cellHoverCard.style.display = "block";
                    const cardWidth = cellHoverCard.offsetWidth || 180;
                    cellHoverCard.style.left = (e.clientX - cardWidth - 12) + "px";
                    cellHoverCard.style.top = (e.clientY + 6) + "px";
                  }
                });

                noteBtn.addEventListener("mouseleave", () => { cellHoverCard.style.display = "none"; });

                noteBtn.addEventListener("click", (e) => {
                  e.stopPropagation();
                  cellHoverCard.style.display = "none";
                  editingCellRowIndex = index;
                  const currentItem = db["Cellphone"][index] || {};
                  document.getElementById("cellMacInput").value = currentItem.macAddress || "";
                  document.getElementById("cellPhoneInput").value = currentItem.phoneNumber || "";
                  document.getElementById("cellImeiInput").value = currentItem.phoneImei1 || "";
                  document.getElementById("cellSapInput").value = currentItem.sapFaAsset || "";
                  cellModalOverlay.classList.add("show");
                });

                remarksWrapper.appendChild(noteBtn);
              }

              td.appendChild(remarksWrapper);
            } else {
              td.innerHTML = val === "" ? "&nbsp;" : val;
            }
            tr.appendChild(td);
          });

          tr.addEventListener("click", function () {
            const idx = parseInt(this.getAttribute("data-row-index"));
            
            if (editMode) {
              selectedIndex = idx;
              const record = db[activeCategory][selectedIndex];
              if (record) {
                nodes.modalCategoryScope.textContent = activeCategory;
                nodes.formEditRowIndex.value = selectedIndex;
                adaptFormLabelsAndFields(activeCategory);
                
                document.getElementById("assetDate").value = record.date !== "—" ? convertToInputDate(record.date.split(" | ")[0]) : "";
                nodes.deviceInput.value = record.device;
                document.getElementById("assetName").value = record.name;
                document.getElementById("assetModel").value = record.model;
                document.getElementById("assetSerial").value = record.serial;
                
                const priceInput = document.getElementById("assetPrice");
                if (priceInput) {
                  const rawPrice = record.price && record.price !== "—" ? record.price.replace(/[^\d.]/g, "") : "";
                  priceInput.value = rawPrice;
                }

                document.getElementById("assetUnits").value = 1;
                document.getElementById("assetDeployed").value = record.deployed || "";
                document.getElementById("assetStatus").value = record.status || "Extra";
                document.getElementById("assetOth").value = record.oth || "";
                document.getElementById("assetErf").value = record.erf || "";
                
                const remarksEl = document.getElementById("assetRemarks");
                if (remarksEl) remarksEl.value = record.remarks || "";
                
                presentModal();
              }
              return;
            }

            if (multiDeleteMode) {
              if (multiSelectedIndices.has(idx)) {
                multiSelectedIndices.delete(idx);
                this.classList.remove("multi-selected-row");
              } else {
                multiSelectedIndices.add(idx);
                this.classList.add("multi-selected-row");
              }
            } else {
              tbody.querySelectorAll("tr").forEach((r) => r.classList.remove("selected-row"));
              this.classList.add("selected-row");
              selectedIndex = idx;
            }
          });
          tbody.appendChild(tr);
        });
      }
      table.appendChild(tbody);
    }

    container.appendChild(table);
    nodes.contentView.appendChild(container);
  }

  nodes.navItems.forEach((item) => {
    item.addEventListener("click", function () {
      nodes.navItems.forEach((nav) => nav.classList.remove("active"));
      this.classList.add("active");
      multiDeleteMode = false;
      editMode = false;
      multiSelectedIndices.clear();
      if (nodes.triggerDeleteBtn) nodes.triggerDeleteBtn.classList.remove("active-delete-mode");
      if (nodes.openEditModalBtn) nodes.openEditModalBtn.classList.remove("active-edit-mode");
      const label = this.querySelector(".links-name").textContent.trim();
      nodes.dynamicTitle.textContent = label;
      buildTableGrid(label);
    });
  });

  if (nodes.openAddModalBtn) {
    nodes.openAddModalBtn.addEventListener("click", () => {
      nodes.modalCategoryScope.textContent = activeCategory;
      adaptFormLabelsAndFields(activeCategory);
      nodes.deviceInput.value = "";
      if (nodes.serialInput) nodes.serialInput.value = "";
      if (nodes.nameInput) nodes.nameInput.value = "";
      if (nodes.modelInput) nodes.modelInput.value = "";
      const priceInput = document.getElementById("assetPrice");
      if (priceInput) priceInput.value = "";
      presentModal();
    });
  }

  if (nodes.openEditModalBtn) {
    nodes.openEditModalBtn.addEventListener("click", () => {
      editMode = !editMode;
      if (editMode) {
        nodes.openEditModalBtn.classList.add("active-edit-mode");
        multiDeleteMode = false;
        multiSelectedIndices.clear();
        if (nodes.triggerDeleteBtn) nodes.triggerDeleteBtn.classList.remove("active-delete-mode");
      } else {
        nodes.openEditModalBtn.classList.remove("active-edit-mode");
      }
    });
  }

  if (nodes.triggerDeleteBtn) {
    nodes.triggerDeleteBtn.addEventListener("click", () => {
      if (!multiDeleteMode) {
        multiDeleteMode = true;
        editMode = false;
        if (nodes.openEditModalBtn) nodes.openEditModalBtn.classList.remove("active-edit-mode");
        multiSelectedIndices.clear();
        nodes.triggerDeleteBtn.classList.add("active-delete-mode");
        buildTableGrid(activeCategory);
        return;
      }

      if (multiSelectedIndices.size === 0 && selectedIndex === null) {
        multiDeleteMode = false;
        nodes.triggerDeleteBtn.classList.remove("active-delete-mode");
        buildTableGrid(activeCategory);
        return;
      }

      showConfirmModal("Are you sure you want to Permanently Delete this Item?", async () => {
        let indicesToDelete = Array.from(multiSelectedIndices).sort((a, b) => b - a);
        if (indicesToDelete.length === 0 && selectedIndex !== null) {
          indicesToDelete = [parseInt(selectedIndex)];
        }

        for (const idx of indicesToDelete) {
          const deletedItem = db[activeCategory][idx];
          if (deletedItem && deletedItem.serial) {
            await deleteRecordFromTable(activeCategory, deletedItem.serial);
          }
          db[activeCategory][idx] = null;
        }
        db[activeCategory] = db[activeCategory].filter(item => item !== null);

        multiDeleteMode = false;
        multiSelectedIndices.clear();
        nodes.triggerDeleteBtn.classList.remove("active-delete-mode");
        localStorage.setItem("plaspack_inventory_db", JSON.stringify(db));
        buildTableGrid(activeCategory);
      });
    });
  }

  if (nodes.triggerRecoverBtn) {
    nodes.triggerRecoverBtn.addEventListener("click", () => {
      const yesterdayBackup = localStorage.getItem("plaspack_backup_yesterday");
      if (!yesterdayBackup) {
        alert("No backup snapshot from yesterday was found yet.");
        return;
      }

      showConfirmModal("Are you sure you want to Restore Yesterday's Inventory?", () => {
        localStorage.setItem("plaspack_inventory_db", yesterdayBackup);
        db = JSON.parse(yesterdayBackup);
        buildTableGrid(activeCategory);
      });
    });
  }

  if (nodes.logoutBtn) {
    nodes.logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("plaspack_authenticated");
      sessionStorage.clear();
      window.location.href = "index.html";
    });
  }

  async function handleSaveAsset() {
    const inputDeviceType = nodes.deviceInput.value.trim();
    const rawDate = document.getElementById("assetDate").value;
    const formattedShortDate = convertToShortDate(rawDate);
    const serialNum = document.getElementById("assetSerial").value.trim();
    const unitsCount = parseInt(document.getElementById("assetUnits").value) || 1;
    const targetIndex = nodes.formEditRowIndex.value;
    const chosenStatus = activeCategory === "Stock In / Received" ? "" : document.getElementById("assetStatus").value;
    
    const rawPriceInput = document.getElementById("assetPrice") ? document.getElementById("assetPrice").value.trim() : "";
    const formattedPrice = rawPriceInput ? formatPeso(rawPriceInput) : "—";

    if (!inputDeviceType) {
      if (nodes.formErrorAlert) {
        nodes.formErrorAlert.textContent = "Error: Please select or enter a Device Type.";
        nodes.formErrorAlert.style.display = "block";
      }
      return;
    }
    if (!serialNum) {
      if (nodes.formErrorAlert) {
        nodes.formErrorAlert.textContent = "Error: Please enter a Serial Number.";
        nodes.formErrorAlert.style.display = "block";
      }
      if (nodes.serialInput) nodes.serialInput.style.borderColor = "#ff4b4b";
      return;
    }

    if (activeCategory === "Stock Out / Released" && targetIndex === "") {
      let serialExists = false;
      const targetCat = resolveTargetCategory(inputDeviceType);

      if (db["Stock In / Received"]) {
        serialExists = db["Stock In / Received"].some((item) => item && item.serial === serialNum);
      }
      if (!serialExists && targetCat && db[targetCat]) {
        serialExists = db[targetCat].some((item) => item && item.serial === serialNum);
      }

      if (!serialExists) {
        if (nodes.formErrorAlert) {
          nodes.formErrorAlert.textContent = `Error: Serial number "${serialNum}" does not exist in stock! You cannot stock out an item that has not been received.`;
          nodes.formErrorAlert.style.display = "block";
        }
        if (nodes.serialInput) nodes.serialInput.style.borderColor = "#ff4b4b";
        return;
      }
    }

    if (nodes.formErrorAlert) nodes.formErrorAlert.style.display = "none";
    if (nodes.serialInput) nodes.serialInput.style.borderColor = "";

    const remarksEl = document.getElementById("assetRemarks");
    const remarksVal = remarksEl ? remarksEl.value.trim() : "";

    if (targetIndex !== "") {
      const existingRecord = db[activeCategory][targetIndex] || {};
      const formattedRow = {
        supabaseId: existingRecord.supabaseId,
        date: formattedShortDate,
        device: inputDeviceType,
        name: document.getElementById("assetName").value.trim() || "—",
        model: document.getElementById("assetModel").value.trim() || "—",
        serial: serialNum,
        price: formattedPrice,
        deployed: activeCategory !== "Stock In / Received" ? document.getElementById("assetDeployed").value.trim() || "—" : "",
        status: chosenStatus,
        oth: activeCategory !== "Stock In / Received" ? document.getElementById("assetOth").value.trim() || "—" : "",
        erf: activeCategory !== "Stock In / Received" ? (document.getElementById("assetErf").value.trim() || "—") : "",
        remarks: remarksVal,
        macAddress: existingRecord.macAddress || "",
        phoneNumber: existingRecord.phoneNumber || "",
        phoneImei1: existingRecord.phoneImei1 || "",
        sapFaAsset: existingRecord.sapFaAsset || ""
      };
      db[activeCategory][targetIndex] = formattedRow;
      await saveRecordToTable(activeCategory, formattedRow);
    } else {
      for (let i = 0; i < unitsCount; i++) {
        const formattedRow = {
          date: formattedShortDate,
          device: inputDeviceType,
          name: document.getElementById("assetName").value.trim() || "—",
          model: document.getElementById("assetModel").value.trim() || "—",
          serial: unitsCount > 1 ? serialNum + "-" + (i + 1) : serialNum,
          price: formattedPrice,
          deployed: "",
          status: chosenStatus,
          oth: "",
          erf: "",
          remarks: remarksVal,
          macAddress: "",
          phoneNumber: "",
          phoneImei1: "",
          sapFaAsset: ""
        };

        if (activeCategory !== "Stock In / Received") {
          formattedRow.deployed = document.getElementById("assetDeployed").value.trim() || "—";
          formattedRow.status = chosenStatus;
          formattedRow.oth = document.getElementById("assetOth").value.trim() || "—";
          formattedRow.erf = document.getElementById("assetErf").value.trim() === "" ? "—" : document.getElementById("assetErf").value.trim();
        }

        if (activeCategory === "Stock Out / Released") {
          db["Stock Out / Released"].push(formattedRow);
          await saveRecordToTable("Stock Out / Released", formattedRow);

          const targetCat = resolveTargetCategory(inputDeviceType);
          if (targetCat && db[targetCat]) {
            const matchedItem = db[targetCat].find((item) => item && item.serial === formattedRow.serial);
            if (matchedItem) {
              matchedItem.date = matchedItem.date.includes("|") ? matchedItem.date : matchedItem.date + " | " + formattedShortDate;
              matchedItem.deployed = formattedRow.deployed;
              matchedItem.status = chosenStatus;
              matchedItem.oth = formattedRow.oth;
              matchedItem.erf = formattedRow.erf;
              matchedItem.remarks = formattedRow.remarks;
              if (rawPriceInput) matchedItem.price = formattedPrice;
              await saveRecordToTable(targetCat, matchedItem);
            }
          }
        } else if (activeCategory === "Stock In / Received") {
          if (!db["Stock In / Received"]) db["Stock In / Received"] = [];
          db["Stock In / Received"].push(formattedRow);
          await saveRecordToTable("Stock In / Received", formattedRow);

          const targetCat = resolveTargetCategory(inputDeviceType);
          if (targetCat) {
            if (!db[targetCat]) db[targetCat] = [];
            const categoryCopyRow = { ...formattedRow, device: inputDeviceType, status: "Extra" };
            db[targetCat].push(categoryCopyRow);
            await saveRecordToTable(targetCat, categoryCopyRow);
          }
        } else {
          if (!db[activeCategory]) db[activeCategory] = [];
          db[activeCategory].push(formattedRow);
          await saveRecordToTable(activeCategory, formattedRow);
        }
      }
    }

    dismissModal();
    buildTableGrid(activeCategory);
  }

  if (nodes.addItemForm) {
    nodes.addItemForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSaveAsset();
    }); 
  }

  if (nodes.saveAssetBtn) {
    nodes.saveAssetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleSaveAsset();
    });
  }

  // --- INITIALIZE LOAD AND REALTIME SYNC ---
  await loadDatabaseFromSupabase();
  subscribeToRealtimeSync();
});
