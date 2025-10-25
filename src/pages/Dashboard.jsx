import React, { useState, useMemo } from "react";

// helpers
const uid = () => Math.random().toString(36).slice(2, 9);
const todayISO = () => new Date().toISOString().slice(0, 10);

function Card({ title, children }) {
  return (
    <div className="rounded-3xl border border-gray-200 shadow-sm p-5 bg-white">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border p-4 bg-white text-center">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  );
}

function Table({ cols, rows }) {
  return (
    <div className="overflow-auto rounded-2xl border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {cols.map((c) => (
              <th key={c} className="text-left font-semibold p-3 text-gray-700">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="odd:bg-white even:bg-gray-50">
              {cols.map((c) => (
                <td key={c} className="p-3">
                  {r[c]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  const [inventories, setInventories] = useState([
    { id: uid(), org: "Northwestern Memorial", city: "Chicago, IL", item: "N95 Masks", qty: 1200, expiry: "2026-01-01" },
    { id: uid(), org: "Rush University Medical Center", city: "Chicago, IL", item: "IV Sets", qty: 200, expiry: "2025-12-01" },
    { id: uid(), org: "UI Health", city: "Chicago, IL", item: "Gloves", qty: 5000, expiry: "2027-06-01" },
  ]);

  const [requests, setRequests] = useState([
    { id: uid(), org: "Carle Hospital", city: "Urbana, IL", item: "N95 Masks", qty: 800, urgency: "High" },
    { id: uid(), org: "OSF Heart of Mary", city: "Urbana, IL", item: "IV Sets", qty: 50, urgency: "Normal" },
  ]);

  // show/hide forms
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showRequestItem, setShowRequestItem] = useState(false);

  // form input states
  const [newItem, setNewItem] = useState({ item: "", qty: "", expiry: todayISO() });
  const [newRequest, setNewRequest] = useState({ item: "", qty: "", urgency: "" });

  // match data for table
  const matches = useMemo(
    () =>
      inventories.slice(0, 2).map((i, idx) => ({
        id: uid(),
        Item: i.item,
        Qty: requests[idx]?.qty ?? 0,
        FromOrg: i.org,
        FromCity: i.city,
        ToOrg: requests[idx]?.org ?? "-",
        ToCity: requests[idx]?.city ?? "-",
        Status: "Proposed",
      })),
    [inventories, requests]
  );

  // handle adding new inventory
  const handleAddInventory = () => {
    setInventories([
      ...inventories,
      {
        id: uid(),
        org: "Your Hospital",
        city: "Chicago, IL",
        item: newItem.item,
        qty: newItem.qty,
        expiry: newItem.expiry,
      },
    ]);
    setNewItem({ item: "", qty: "", expiry: todayISO() });
    setShowAddInventory(false);
  };

  // handle adding new request
  const handleAddRequest = () => {
    setRequests([
      ...requests,
      {
        id: uid(),
        org: "Your Hospital",
        city: "Chicago, IL",
        item: newRequest.item,
        qty: newRequest.qty,
        urgency: newRequest.urgency,
      },
    ]);
    setNewRequest({ item: "", qty: "", urgency: "" });
    setShowRequestItem(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Top Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => setShowAddInventory(!showAddInventory)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          + Add Inventory
        </button>
        <button
          onClick={() => setShowRequestItem(!showRequestItem)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Request Item
        </button>
      </div>

      {/* Add Inventory Form */}
      {showAddInventory && (
        <Card title="Add Inventory Item">
          <div className="grid md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Item Name"
              value={newItem.item}
              onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
              className="border rounded-lg p-2"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.qty}
              onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
              className="border rounded-lg p-2"
            />
            <input
              type="date"
              value={newItem.expiry}
              onChange={(e) => setNewItem({ ...newItem, expiry: e.target.value })}
              className="border rounded-lg p-2"
            />
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleAddInventory}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Submit
            </button>
          </div>
        </Card>
      )}

      {/* Request Item Form */}
      {showRequestItem && (
        <Card title="Request Item">
          <div className="grid md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Item Name"
              value={newRequest.item}
              onChange={(e) => setNewRequest({ ...newRequest, item: e.target.value })}
              className="border rounded-lg p-2"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newRequest.qty}
              onChange={(e) => setNewRequest({ ...newRequest, qty: e.target.value })}
              className="border rounded-lg p-2"
            />
            <select
              value={newRequest.urgency}
              onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
              className="border rounded-lg p-2"
            >
              <option value="">Select Urgency</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleAddRequest}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Submit
            </button>
          </div>
        </Card>
      )}

      {/* Overview */}
      <Card title="Overview">
        <div className="grid md:grid-cols-3 gap-4">
          <Stat label="Donor Listings" value={inventories.length} />
          <Stat label="Open Requests" value={requests.length} />
          <Stat label="Proposed Matches" value={matches.length} />
        </div>
      </Card>

      {/* Inventory Table */}
      <Card title="All Inventory">
        <Table
          cols={["Org", "City", "Item", "Qty", "Expiry"]}
          rows={inventories.map((i) => ({
            id: i.id,
            Org: i.org,
            City: i.city,
            Item: i.item,
            Qty: i.qty,
            Expiry: i.expiry,
          }))}
        />
      </Card>

      {/* Requests Table */}
      <Card title="All Requests">
        <Table
          cols={["Org", "City", "Item", "Qty", "Urgency"]}
          rows={requests.map((r) => ({
            id: r.id,
            Org: r.org,
            City: r.city,
            Item: r.item,
            Qty: r.qty,
            Urgency: r.urgency,
          }))}
        />
      </Card>

      {/* Matches Table */}
      <Card title="Matches (Proposed)">
        <Table
          cols={["Item", "Qty", "FromOrg", "FromCity", "ToOrg", "ToCity", "Status"]}
          rows={matches}
        />
      </Card>
    </div>
  );
}
