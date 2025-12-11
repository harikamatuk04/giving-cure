import React, { useState, useEffect } from "react";
import {
  getInventory,
  addInventory,
  deleteInventory,
  updateInventory,
  getRequests,
  addRequest,
  deleteRequest,
  updateRequest,
} from "../api/api";

import { ITEM_OPTIONS } from "../data/items";
import { HOSPITALS, getCityByHospital } from "../data/hospitals";

// ---------- UI COMPONENTS ----------
function Card({ title, children }) {
  return (
    <div className="rounded-2xl border p-5 bg-white shadow">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border p-4 bg-white text-center shadow-sm">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" className="text-red-500" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}


// ---------- MAIN DASHBOARD ----------
export default function Dashboard() {
  const [inventories, setInventories] = useState([]);
  const [requests, setRequests] = useState([]);

  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editRequest, setEditRequest] = useState(null);

  const [newInventory, setNewInventory] = useState({
    org: "",
    city: "",
    item: "",
    qty: "",
    expiry: "",
  });

  const [newRequest, setNewRequest] = useState({
    org: "",
    city: "",
    item: "",
    qty: "",
    urgency: "",
  });

  // Grouping and sorting state
  const [groupBy, setGroupBy] = useState("hospital"); // "hospital", "city", "item"
  const [sortByExpiry, setSortByExpiry] = useState(false);

  // Handle hospital selection - auto-populate city
  const handleHospitalChange = (hospitalName, isInventory = true) => {
    const city = getCityByHospital(hospitalName);
    if (isInventory) {
      setNewInventory({ ...newInventory, org: hospitalName, city });
    } else {
      setNewRequest({ ...newRequest, org: hospitalName, city });
    }
  };

  // --------- LOAD DATA ----------
  const loadData = async () => {
    const inv = await getInventory();
    const req = await getRequests();
    setInventories(inv.data);
    setRequests(req.data);
  };

  useEffect(() => { loadData(); }, []);

  // --------- VALIDATION HELPERS ----------
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  const validateQuantity = (qty) => {
    const numQty = Number(qty);
    return !isNaN(numQty) && numQty > 0;
  };

  const validateExpiryDate = (expiry) => {
    if (!expiry) return false;
    const expiryDate = new Date(expiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    return expiryDate >= today;
  };

  // --------- ADD NEW INVENTORY ----------
  const handleAddInventory = async (e) => {
    e.preventDefault();
    
    // Validate quantity
    if (!validateQuantity(newInventory.qty)) {
      alert("Quantity must be a positive number greater than 0.");
      return;
    }

    // Validate expiry date
    if (!validateExpiryDate(newInventory.expiry)) {
      alert("Expiry date cannot be in the past. Please select today or a future date.");
      return;
    }

    try {
      const response = await addInventory(newInventory);
      setShowAddInventory(false);
      setNewInventory({ org: "", city: "", item: "", qty: "", expiry: "" });
      loadData();
    } catch (error) {
      console.error("Error adding inventory:", error);
      const errorMessage = error.response?.data?.error || error.message || "Unknown error";
      if (errorMessage.includes("MongoDB") || errorMessage.includes("buffering")) {
        alert("Database connection error. Please ensure MongoDB is running.");
      } else {
        alert(`Failed to add inventory: ${errorMessage}`);
      }
    }
  };

  // --------- ADD NEW REQUEST ----------
  const handleAddRequest = async (e) => {
    e.preventDefault();
    
    // Validate quantity
    if (!validateQuantity(newRequest.qty)) {
      alert("Quantity must be a positive number greater than 0.");
      return;
    }

    try {
      const response = await addRequest(newRequest);
      setShowAddRequest(false);
      setNewRequest({ org: "", city: "", item: "", qty: "", urgency: "" });
      loadData();
    } catch (error) {
      console.error("Error adding request:", error);
      const errorMessage = error.response?.data?.error || error.message || "Unknown error";
      if (errorMessage.includes("MongoDB") || errorMessage.includes("buffering")) {
        alert("Database connection error. Please ensure MongoDB is running.");
      } else {
        alert(`Failed to add request: ${errorMessage}`);
      }
    }
  };

  // --------- DELETE ----------
  const handleDeleteInventory = async (id) => {
    if (!window.confirm("Delete this inventory?")) return;
    await deleteInventory(id);
    loadData();
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Delete this request?")) return;
    await deleteRequest(id);
    loadData();
  };

  // --------- UPDATE ----------
  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    
    // Validate quantity
    if (!validateQuantity(editItem.qty)) {
      alert("Quantity must be a positive number greater than 0.");
      return;
    }

    // Validate expiry date
    if (!validateExpiryDate(editItem.expiry)) {
      alert("Expiry date cannot be in the past. Please select today or a future date.");
      return;
    }

    await updateInventory(editItem._id, editItem);
    setEditItem(null);
    loadData();
  };

  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    
    // Validate quantity
    if (!validateQuantity(editRequest.qty)) {
      alert("Quantity must be a positive number greater than 0.");
      return;
    }

    await updateRequest(editRequest._id, editRequest);
    setEditRequest(null);
    loadData();
  };

  // --------- GROUPING AND SORTING LOGIC ----------
  const getProcessedInventories = () => {
    let processed = [...inventories];

    // Sort by expiry if enabled
    if (sortByExpiry) {
      processed.sort((a, b) => {
        const dateA = new Date(a.expiry);
        const dateB = new Date(b.expiry);
        return dateA - dateB; // Ascending order (earliest expiry first)
      });
    }

    return processed;
  };

  const getGroupedInventories = () => {
    const processed = getProcessedInventories();

    const grouped = {};
    processed.forEach((item) => {
      let key;
      if (groupBy === "hospital") {
        key = item.org;
      } else if (groupBy === "city") {
        key = item.city;
      } else if (groupBy === "item") {
        key = item.item;
      } else {
        key = item.org; // Default to hospital if somehow invalid
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    // Sort group keys alphabetically
    const sortedKeys = Object.keys(grouped).sort();
    const sortedGroups = {};
    sortedKeys.forEach((key) => {
      sortedGroups[key] = grouped[key];
    });

    return sortedGroups;
  };

  // --------- UI ----------
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">

      {/* TOP BUTTONS */}
      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl"
          onClick={() => setShowAddInventory(true)}
        >
          + Add Inventory
        </button>

        <button
          className="px-4 py-2 bg-green-600 text-white rounded-xl"
          onClick={() => setShowAddRequest(true)}
        >
          + Add Request
        </button>
      </div>

      {/* OVERVIEW */}
      <Card title="Overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat label="Donor Listings" value={inventories.length} />
          <Stat label="Open Requests" value={requests.length} />
          <Stat label="Potential Matches" value={Math.min(inventories.length, requests.length)} />
        </div>
      </Card>

      {/* INVENTORY TABLE */}
      <Card title="Inventory">
        {/* Grouping and Sorting Controls */}
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Group by:</label>
            <select
              className="border p-2 rounded-lg text-sm"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <option value="hospital">Hospital</option>
              <option value="city">City</option>
              <option value="item">Item</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by expiry:</label>
            <input
              type="checkbox"
              checked={sortByExpiry}
              onChange={(e) => setSortByExpiry(e.target.checked)}
              className="w-4 h-4"
            />
          </div>
        </div>

        {/* Grouped Inventory Display */}
        {Object.entries(getGroupedInventories()).map(([groupKey, groupItems]) => (
          <div key={groupKey} className="mb-6">
            <h4 className="text-md font-semibold mb-2 text-indigo-700">
              {groupBy === "hospital" && "🏥 "}
              {groupBy === "city" && "📍 "}
              {groupBy === "item" && "📦 "}
              {groupKey} ({groupItems.length} {groupItems.length === 1 ? "item" : "items"})
            </h4>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-center">Hospital</th>
                  <th className="p-2 text-center">City</th>
                  <th className="p-2 text-center">Item</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-center">Expiry</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupItems.map((i) => (
                  <tr key={i._id} className="border-b">
                    <td className="p-2 text-center">{i.org}</td>
                    <td className="p-2 text-center">{i.city}</td>
                    <td className="p-2 text-center">{i.item}</td>
                    <td className="p-2 text-center">{i.qty}</td>
                    <td className="p-2 text-center">{i.expiry}</td>
                    <td className="p-2 text-center">
                      <div className="flex gap-3 justify-center">
                        <button className="text-blue-600" onClick={() => setEditItem(i)}>Edit</button>
                        <button className="text-red-600" onClick={() => handleDeleteInventory(i._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </Card>

      {/* REQUEST TABLE */}
      <Card title="Requests">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Hospital</th>
              <th className="p-2 text-left">City</th>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-left">Qty</th>
              <th className="p-2 text-left">Urgency</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id} className="border-b">
                <td className="p-2">{r.org}</td>
                <td className="p-2">{r.city}</td>
                <td className="p-2">{r.item}</td>
                <td className="p-2">{r.qty}</td>
                <td className="p-2">{r.urgency}</td>
                <td className="p-2 flex gap-3">
                  <button className="text-blue-600" onClick={() => setEditRequest(r)}>Edit</button>
                  <button className="text-red-600" onClick={() => handleDeleteRequest(r._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* ---------- MODALS ---------- */}

      {/* ADD INVENTORY */}
      {showAddInventory && (
        <Modal title="Add Inventory" onClose={() => setShowAddInventory(false)}>
          <form onSubmit={handleAddInventory} className="space-y-3">
            
            <select className="border p-2 w-full" required
              value={newInventory.org}
              onChange={(e) => handleHospitalChange(e.target.value, true)}
            >
              <option value="">Select Hospital</option>
              {HOSPITALS.map((hospital) => (
                <option key={hospital.name} value={hospital.name}>{hospital.name}</option>
              ))}
            </select>

            <select className="border p-2 w-full" required
              value={newInventory.item}
              onChange={(e) => setNewInventory({ ...newInventory, item: e.target.value })}
            >
              <option value="">Select Item</option>
              {ITEM_OPTIONS.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>

            <input type="number" className="border p-2 w-full" required placeholder="Quantity" min="1"
              value={newInventory.qty}
              onChange={(e) => setNewInventory({ ...newInventory, qty: e.target.value })}
            />

            <input type="date" className="border p-2 w-full" required min={getTodayDate()}
              value={newInventory.expiry}
              onChange={(e) => setNewInventory({ ...newInventory, expiry: e.target.value })}
            />

            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Submit</button>
          </form>
        </Modal>
      )}

      {/* ADD REQUEST */}
      {showAddRequest && (
        <Modal title="Add Request" onClose={() => setShowAddRequest(false)}>
          <form onSubmit={handleAddRequest} className="space-y-3">

            <select className="border p-2 w-full" required
              value={newRequest.org}
              onChange={(e) => handleHospitalChange(e.target.value, false)}
            >
              <option value="">Select Hospital</option>
              {HOSPITALS.map((hospital) => (
                <option key={hospital.name} value={hospital.name}>{hospital.name}</option>
              ))}
            </select>

            <select className="border p-2 w-full" required
              value={newRequest.item}
              onChange={(e) => setNewRequest({ ...newRequest, item: e.target.value })}
            >
              <option value="">Select Item</option>
              {ITEM_OPTIONS.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>

            <input type="number" className="border p-2 w-full" required placeholder="Quantity" min="1"
              value={newRequest.qty}
              onChange={(e) => setNewRequest({ ...newRequest, qty: e.target.value })}
            />

            <select className="border p-2 w-full" required
              value={newRequest.urgency}
              onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
            >
              <option value="">Urgency</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Submit</button>
          </form>
        </Modal>
      )}

      {/* EDIT INVENTORY */}
      {editItem && (
        <Modal title="Edit Inventory" onClose={() => setEditItem(null)}>
          <form onSubmit={handleUpdateInventory} className="space-y-3">

            <select className="border p-2 w-full" required
              value={editItem.org}
              onChange={(e) => {
                const city = getCityByHospital(e.target.value);
                setEditItem({ ...editItem, org: e.target.value, city });
              }}
            >
              <option value="">Select Hospital</option>
              {HOSPITALS.map((hospital) => (
                <option key={hospital.name} value={hospital.name}>{hospital.name}</option>
              ))}
            </select>

            <input 
              type="text" 
              className="border p-2 w-full bg-gray-100" 
              readOnly
              placeholder="City (auto-populated)"
              value={editItem.city}
            />

            <select className="border p-2 w-full" required
              value={editItem.item}
              onChange={(e) => setEditItem({ ...editItem, item: e.target.value })}
            >
              {ITEM_OPTIONS.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>

            <input type="number" className="border p-2 w-full" required min="1"
              value={editItem.qty}
              onChange={(e) => setEditItem({ ...editItem, qty: e.target.value })}
            />

            <input type="date" className="border p-2 w-full" required min={getTodayDate()}
              value={editItem.expiry}
              onChange={(e) => setEditItem({ ...editItem, expiry: e.target.value })}
            />

            <button className="w-full bg-blue-600 text-white py-2 rounded">
              Save Changes
            </button>

          </form>
        </Modal>
      )}

      {/* EDIT REQUEST */}
      {editRequest && (
        <Modal title="Edit Request" onClose={() => setEditRequest(null)}>
          <form onSubmit={handleUpdateRequest} className="space-y-3">

            <select className="border p-2 w-full" required
              value={editRequest.org}
              onChange={(e) => {
                const city = getCityByHospital(e.target.value);
                setEditRequest({ ...editRequest, org: e.target.value, city });
              }}
            >
              <option value="">Select Hospital</option>
              {HOSPITALS.map((hospital) => (
                <option key={hospital.name} value={hospital.name}>{hospital.name}</option>
              ))}
            </select>

            <input 
              type="text" 
              className="border p-2 w-full bg-gray-100" 
              readOnly
              placeholder="City (auto-populated)"
              value={editRequest.city}
            />

            <select className="border p-2 w-full" required
              value={editRequest.item}
              onChange={(e) => setEditRequest({ ...editRequest, item: e.target.value })}
            >
              {ITEM_OPTIONS.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>

            <input type="number" className="border p-2 w-full" required min="1"
              value={editRequest.qty}
              onChange={(e) => setEditRequest({ ...editRequest, qty: e.target.value })}
            />

            <select className="border p-2 w-full" required
              value={editRequest.urgency}
              onChange={(e) => setEditRequest({ ...editRequest, urgency: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <button className="w-full bg-blue-600 text-white py-2 rounded">
              Save Changes
            </button>

          </form>
        </Modal>
      )}

    </div>
  );
}
