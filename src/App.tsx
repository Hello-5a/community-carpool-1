import React, { useEffect, useState } from "react";

// Community Carpool - Single-file React component
// Tailwind CSS assumed available in the project
// Default export is the main app component so it can be previewed in the canvas.

export default function CommunityCarpoolApp() {
  const [vehicles, setVehicles] = useState(() => {
    try {
      const raw = localStorage.getItem("carpool_vehicles");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [filterDest, setFilterDest] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [applyTarget, setApplyTarget] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    localStorage.setItem("carpool_vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

  function addOrUpdateVehicle(vehicle) {
    if (vehicle.id) {
      setVehicles((v) => v.map((x) => (x.id === vehicle.id ? vehicle : x)));
    } else {
      vehicle.id = Date.now().toString();
      vehicle.ownerId = vehicle.ownerId || "owner-" + vehicle.id;
      vehicle.applicants = [];
      vehicle.passengers = [];
      setVehicles((v) => [vehicle, ...v]);
    }
    setShowForm(false);
    setEditingVehicle(null);
  }

  function removeVehicle(id) {
    if (!confirm("Remove this vehicle?")) return;
    setVehicles((v) => v.filter((x) => x.id !== id));
  }

  function applyForSeat(vehicleId, applicant) {
    setVehicles((v) =>
      v.map((veh) => {
        if (veh.id !== vehicleId) return veh;
        // avoid duplicate applicants by flat+name
        const exists = (veh.applicants || []).some(
          (a) => a.name === applicant.name && a.flat === applicant.flat
        );
        if (exists) return veh;
        return { ...veh, applicants: [...(veh.applicants || []), applicant] };
      })
    );
    setApplyTarget(null);
  }

  function approveApplicant(vehicleId, index) {
    setVehicles((v) =>
      v.map((veh) => {
        if (veh.id !== vehicleId) return veh;
        const applicants = [...(veh.applicants || [])];
        const applicant = applicants.splice(index, 1)[0];
        const seatsLeft = (veh.seats || 0) - 1;
        if (seatsLeft < 0) return veh; // cannot approve
        return {
          ...veh,
          seats: seatsLeft,
          applicants,
          passengers: [...(veh.passengers || []), applicant],
        };
      })
    );
  }

  function declineApplicant(vehicleId, index) {
    setVehicles((v) =>
      v.map((veh) => {
        if (veh.id !== vehicleId) return veh;
        const applicants = [...(veh.applicants || [])];
        applicants.splice(index, 1);
        return { ...veh, applicants };
      })
    );
  }

  const visible = vehicles.filter((veh) => {
    if (
      filterDest &&
      !veh.destination.toLowerCase().includes(filterDest.toLowerCase())
    )
      return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        veh.make?.toLowerCase()?.includes(q) ||
        veh.model?.toLowerCase()?.includes(q) ||
        veh.destination?.toLowerCase()?.includes(q) ||
        veh.ownerName?.toLowerCase()?.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Community Carpool</h1>
          <div className="flex gap-2">
            <input
              placeholder="Search by owner, car, or destination..."
              className="px-3 py-2 border rounded-md"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-sky-600 text-white rounded-md"
            >
              Register Vehicle
            </button>
          </div>
        </header>

        <section className="mb-4 flex gap-3 items-center">
          <label className="text-sm">Filter destination:</label>
          <input
            className="px-3 py-2 border rounded-md"
            placeholder="Type part of destination"
            value={filterDest}
            onChange={(e) => setFilterDest(e.target.value)}
          />
          <div className="text-sm text-neutral-600 ml-auto">
            {visible.length} vehicles available
          </div>
        </section>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Available rides</h2>
            <div className="space-y-3">
              {visible.length === 0 && (
                <div className="p-4 bg-white rounded shadow-sm text-sm">
                  No vehicles found. Try registering one!
                </div>
              )}
              {visible.map((veh) => (
                <VehicleCard
                  key={veh.id}
                  vehicle={veh}
                  onApply={() => setApplyTarget(veh)}
                  onEdit={() => {
                    setEditingVehicle(veh);
                    setShowForm(true);
                  }}
                  onDelete={() => removeVehicle(veh.id)}
                />
              ))}
            </div>
          </div>

          <aside>
            <h2 className="text-lg font-semibold mb-2">Owner dashboard</h2>
            <p className="text-sm text-neutral-600 mb-3">
              Manage your registered vehicles and approve applicants.
            </p>
            <div className="space-y-3">
              {vehicles.length === 0 && (
                <div className="p-3 bg-white rounded shadow-sm text-sm">
                  No vehicles registered yet.
                </div>
              )}
              {vehicles.map((veh) => (
                <div key={veh.id} className="p-3 bg-white rounded shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {veh.make} {veh.model} → {veh.destination}
                      </div>
                      <div className="text-xs text-neutral-600">
                        Owner: {veh.ownerName} • Seats left: {veh.seats}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingVehicle(veh);
                          setShowForm(true);
                        }}
                        className="text-xs px-2 py-1 border rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeVehicle(veh.id)}
                        className="text-xs px-2 py-1 border rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm font-semibold">
                      Applicants ({(veh.applicants || []).length})
                    </div>
                    {(veh.applicants || []).length === 0 && (
                      <div className="text-xs text-neutral-600">
                        No applicants
                      </div>
                    )}
                    <ul className="mt-2 space-y-2">
                      {(veh.applicants || []).map((a, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center"
                        >
                          <div className="text-sm">
                            {a.name} — Flat {a.flat}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveApplicant(veh.id, idx)}
                              className="text-xs px-2 py-1 bg-green-600 text-white rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => declineApplicant(veh.id, idx)}
                              className="text-xs px-2 py-1 border rounded"
                            >
                              Decline
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 text-sm">
                      <div className="font-semibold">
                        Passengers ({(veh.passengers || []).length})
                      </div>
                      {(veh.passengers || []).length === 0 && (
                        <div className="text-xs text-neutral-600">
                          No passengers yet
                        </div>
                      )}
                      <ul className="mt-2 text-xs space-y-1">
                        {(veh.passengers || []).map((p, i) => (
                          <li key={i}>
                            {p.name} — Flat {p.flat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </main>

        {showForm && (
          <Modal
            onClose={() => {
              setShowForm(false);
              setEditingVehicle(null);
            }}
          >
            <VehicleForm
              initial={editingVehicle}
              onSubmit={addOrUpdateVehicle}
              onCancel={() => setShowForm(false)}
            />
          </Modal>
        )}

        {applyTarget && (
          <Modal onClose={() => setApplyTarget(null)}>
            <ApplyForm
              vehicle={applyTarget}
              onSubmit={(app) => applyForSeat(applyTarget.id, app)}
              onCancel={() => setApplyTarget(null)}
            />
          </Modal>
        )}
      </div>
    </div>
  );
}

function VehicleCard({ vehicle, onApply, onEdit, onDelete }) {
  return (
    <div className="bg-white p-4 rounded shadow-sm flex justify-between items-start">
      <div>
        <div className="font-semibold">
          {vehicle.make} {vehicle.model}
        </div>
        <div className="text-sm text-neutral-600">
          Destination: {vehicle.destination}
        </div>
        <div className="text-sm text-neutral-600">
          Owner: {vehicle.ownerName} • Seats left: {vehicle.seats}
        </div>
        <div className="text-xs text-neutral-500 mt-2">
          Notes: {vehicle.notes || "—"}
        </div>
      </div>
      <div className="flex flex-col gap-2 ml-4">
        <button
          onClick={onApply}
          className="px-3 py-1 bg-sky-600 text-white rounded"
        >
          Apply
        </button>
        <button onClick={onEdit} className="px-3 py-1 border rounded">
          Edit
        </button>
        <button onClick={onDelete} className="px-3 py-1 border rounded">
          Delete
        </button>
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 w-full max-w-xl bg-white rounded-lg p-4 shadow-lg">
        {children}
      </div>
    </div>
  );
}

function VehicleForm({ initial, onSubmit, onCancel }) {
  const [make, setMake] = useState(initial?.make || "");
  const [model, setModel] = useState(initial?.model || "");
  const [destination, setDestination] = useState(initial?.destination || "");
  const [seats, setSeats] = useState(initial?.seats ?? 3);
  const [ownerName, setOwnerName] = useState(initial?.ownerName || "");
  const [ownerFlat, setOwnerFlat] = useState(initial?.ownerFlat || "");
  const [notes, setNotes] = useState(initial?.notes || "");

  function handleSubmit(e) {
    e.preventDefault();
    if (!ownerName || !ownerFlat) {
      alert("Please enter your full name and flat no.");
      return;
    }
    const vehicle = {
      id: initial?.id,
      make,
      model,
      destination,
      seats: Number(seats),
      ownerName,
      ownerFlat,
      notes,
      applicants: initial?.applicants || [],
      passengers: initial?.passengers || [],
    };
    onSubmit(vehicle);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-lg font-semibold">
        {initial ? "Edit vehicle" : "Register a vehicle"}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={make}
          onChange={(e) => setMake(e.target.value)}
          placeholder="Make (e.g. Toyota)"
          className="px-3 py-2 border rounded"
        />
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Model (e.g. Innova)"
          className="px-3 py-2 border rounded"
        />
      </div>
      <input
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="Destination (e.g. MRT / Downtown)"
        className="w-full px-3 py-2 border rounded"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          type="number"
          min={0}
          className="px-3 py-2 border rounded"
        />
        <input
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Your full name"
          className="px-3 py-2 border rounded"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={ownerFlat}
          onChange={(e) => setOwnerFlat(e.target.value)}
          placeholder="Your flat no."
          className="px-3 py-2 border rounded"
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="px-3 py-2 border rounded"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 border rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-2 bg-sky-600 text-white rounded"
        >
          Save
        </button>
      </div>
    </form>
  );
}

function ApplyForm({ vehicle, onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [flat, setFlat] = useState("");

  function handle(e) {
    e.preventDefault();
    if (!name || !flat) {
      alert("Please enter your full name and flat no.");
      return;
    }
    onSubmit({ name, flat, appliedAt: new Date().toISOString() });
  }

  return (
    <form onSubmit={handle} className="space-y-3">
      <h3 className="text-lg font-semibold">
        Apply to join: {vehicle.make} {vehicle.model} → {vehicle.destination}
      </h3>
      <div className="text-sm text-neutral-600">
        Seats left: {vehicle.seats}
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your full name"
        className="w-full px-3 py-2 border rounded"
      />
      <input
        value={flat}
        onChange={(e) => setFlat(e.target.value)}
        placeholder="Your flat no."
        className="w-full px-3 py-2 border rounded"
      />
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 border rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-2 bg-sky-600 text-white rounded"
        >
          Apply
        </button>
      </div>
    </form>
  );
}
